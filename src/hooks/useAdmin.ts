import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase, isSupabaseConfigured } from '../lib/supabase';
import { useAuth } from '../context/AuthContext';
import { Profile, UserRole } from '../types/profile';
import { ApplicationWithFollowups } from '../types/application';
import { Followup } from '../types/followup';
import { getNextPendingFollowup } from '../utils/followupEngine';

export interface UserWithStats extends Profile {
  totalApplications: number;
  activeApplications: number;
  totalFollowups: number;
  pendingFollowups: number;
  completedFollowups: number;
  statusBreakdown: Record<string, number>;
  lastActivityAt: string | null;
}

export interface AdminPlatformStats {
  totalUsers: number;
  totalApplications: number;
  totalFollowups: number;
  completedFollowups: number;
  activeInterviews: number;
  offersReceived: number;
}

export function useAdmin() {
  const { user, profile } = useAuth();
  const queryClient = useQueryClient();
  const isAdmin = profile?.role === 'admin';

  // 1. Fetch All Users and Aggregated Activity Stats
  const adminUsersQuery = useQuery({
    queryKey: ['admin', 'users', user?.id],
    queryFn: async (): Promise<{
      users: UserWithStats[];
      stats: AdminPlatformStats;
    }> => {
      if (!isSupabaseConfigured || !user || !isAdmin) {
        return {
          users: [],
          stats: {
            totalUsers: 0,
            totalApplications: 0,
            totalFollowups: 0,
            completedFollowups: 0,
            activeInterviews: 0,
            offersReceived: 0,
          },
        };
      }

      // Fetch all profiles
      const { data: profiles, error: profileErr } = await (supabase.from('profiles') as any)
        .select('*')
        .order('created_at', { ascending: false });

      if (profileErr) throw profileErr;

      // Fetch all applications
      const { data: allApps, error: appsErr } = await (supabase.from('applications') as any)
        .select('id, user_id, status, created_at, updated_at');

      if (appsErr) throw appsErr;

      // Fetch all follow-ups
      const { data: allFollowups, error: followupsErr } = await (supabase.from('followups') as any)
        .select('id, user_id, completed_at, due_date, created_at');

      if (followupsErr) throw followupsErr;

      const appsList = allApps || [];
      const followupsList = allFollowups || [];

      // Compute per-user stats
      const usersWithStats: UserWithStats[] = (profiles || []).map((p: any) => {
        const userApps = appsList.filter((a: any) => a.user_id === p.id);
        const userFollowups = followupsList.filter((f: any) => f.user_id === p.id);

        const statusBreakdown: Record<string, number> = {
          Applied: 0,
          'HR Contact': 0,
          Interview: 0,
          Selected: 0,
          Rejected: 0,
          Withdrawn: 0,
        };

        userApps.forEach((a: any) => {
          if (statusBreakdown[a.status] !== undefined) {
            statusBreakdown[a.status]++;
          }
        });

        const activeApps = userApps.filter((a: any) =>
          ['Applied', 'HR Contact', 'Interview'].includes(a.status)
        ).length;

        const completedFollowups = userFollowups.filter((f: any) => Boolean(f.completed_at)).length;
        const pendingFollowups = userFollowups.length - completedFollowups;

        // Find last activity
        const appDates = userApps.map((a: any) => new Date(a.updated_at || a.created_at).getTime());
        const followupDates = userFollowups.map((f: any) =>
          new Date(f.completed_at || f.created_at).getTime()
        );
        const allTimestamps = [...appDates, ...followupDates];
        const maxTimestamp = allTimestamps.length > 0 ? Math.max(...allTimestamps) : null;
        const lastActivityAt = maxTimestamp ? new Date(maxTimestamp).toISOString() : p.created_at;

        return {
          id: p.id,
          full_name: p.full_name,
          email: p.email,
          timezone: p.timezone,
          role: (p.role as UserRole) || 'user',
          created_at: p.created_at,
          updated_at: p.updated_at,
          totalApplications: userApps.length,
          activeApplications: activeApps,
          totalFollowups: userFollowups.length,
          pendingFollowups,
          completedFollowups,
          statusBreakdown,
          lastActivityAt,
        };
      });

      // Compute Platform Stats
      const totalUsers = usersWithStats.length;
      const totalApplications = appsList.length;
      const totalFollowups = followupsList.length;
      const totalCompletedFollowups = followupsList.filter((f: any) => Boolean(f.completed_at)).length;
      const activeInterviews = appsList.filter((a: any) => a.status === 'Interview').length;
      const offersReceived = appsList.filter((a: any) => a.status === 'Selected').length;

      return {
        users: usersWithStats,
        stats: {
          totalUsers,
          totalApplications,
          totalFollowups,
          completedFollowups: totalCompletedFollowups,
          activeInterviews,
          offersReceived,
        },
      };
    },
    enabled: !!user && isAdmin,
  });

  // 2. Fetch specific User details (Applications & Followups)
  const fetchUserActivity = async (targetUserId: string): Promise<ApplicationWithFollowups[]> => {
    if (!isAdmin) return [];

    const { data, error } = await (supabase.from('applications') as any)
      .select(
        `
          *,
          followups:followups(*)
        `
      )
      .eq('user_id', targetUserId)
      .order('created_at', { ascending: false });

    if (error) throw error;

    return (data || []).map((app: any) => {
      const followups: Followup[] = (app.followups || []).sort(
        (a: Followup, b: Followup) => a.sequence_number - b.sequence_number
      );
      const nextFollowup = getNextPendingFollowup(followups);

      return {
        ...app,
        followups,
        nextFollowup,
      };
    });
  };

  // 3. Update User Role
  const updateRoleMutation = useMutation({
    mutationFn: async ({ userId, newRole }: { userId: string; newRole: UserRole }) => {
      if (!isAdmin) throw new Error('Unauthorized');

      const { data, error } = await (supabase.from('profiles') as any)
        .update({ role: newRole })
        .eq('id', userId)
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin'] });
    },
  });

  return {
    isAdmin,
    users: adminUsersQuery.data?.users || [],
    stats: adminUsersQuery.data?.stats || {
      totalUsers: 0,
      totalApplications: 0,
      totalFollowups: 0,
      completedFollowups: 0,
      activeInterviews: 0,
      offersReceived: 0,
    },
    isLoading: adminUsersQuery.isLoading,
    isFetching: adminUsersQuery.isFetching,
    refetch: adminUsersQuery.refetch,
    fetchUserActivity,
    updateUserRole: updateRoleMutation.mutateAsync,
    isUpdatingRole: updateRoleMutation.isPending,
  };
}
