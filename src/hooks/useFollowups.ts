import { useQuery, useMutation, useQueryClient, keepPreviousData } from '@tanstack/react-query';
import { supabase, isSupabaseConfigured } from '../lib/supabase';
import { useAuth } from '../context/AuthContext';
import { FollowupWithApplication, LogFollowupDTO } from '../types/followup';
import { ApplicationStatus } from '../types/application';
import {
  shouldCreateNextFollowup,
  buildNextFollowupPayload,
} from '../utils/followupEngine';
import { getTodayISODate } from '../utils/dateUtils';
import { useSettings } from './useSettings';
import { APPLICATIONS_QUERY_KEY } from './useApplications';

export const FOLLOWUPS_QUERY_KEY = ['followups'];

export type FollowupTabValue = 'all' | 'today' | 'overdue' | 'upcoming' | 'completed';

export interface UseFollowupsParams {
  page?: number;
  pageSize?: number;
  tab?: FollowupTabValue;
}

export function useFollowups(params?: UseFollowupsParams) {
  const { user, profile } = useAuth();
  const { settings } = useSettings();
  const queryClient = useQueryClient();

  const page = params?.page ?? 0;
  const pageSize = params?.pageSize ?? 10;
  const tab = params?.tab ?? 'all';

  const todayDate = getTodayISODate(profile?.timezone);

  const followupsQuery = useQuery({
    queryKey: [...FOLLOWUPS_QUERY_KEY, user?.id, page, pageSize, tab, todayDate],
    placeholderData: keepPreviousData,
    queryFn: async (): Promise<{
      followups: FollowupWithApplication[];
      totalCount: number;
      counts: {
        all: number;
        today: number;
        overdue: number;
        upcoming: number;
        completed: number;
      };
    }> => {
      if (!isSupabaseConfigured || !user) {
        return {
          followups: [],
          totalCount: 0,
          counts: { all: 0, today: 0, overdue: 0, upcoming: 0, completed: 0 },
        };
      }

      // 1. Fetch total counts across tabs in parallel
      const [allRes, todayRes, overdueRes, upcomingRes, completedRes] = await Promise.all([
        (supabase.from('followups') as any)
          .select('id', { count: 'exact', head: true })
          .eq('user_id', user.id),
        (supabase.from('followups') as any)
          .select('id', { count: 'exact', head: true })
          .eq('user_id', user.id)
          .is('completed_at', null)
          .eq('due_date', todayDate),
        (supabase.from('followups') as any)
          .select('id', { count: 'exact', head: true })
          .eq('user_id', user.id)
          .is('completed_at', null)
          .lt('due_date', todayDate),
        (supabase.from('followups') as any)
          .select('id', { count: 'exact', head: true })
          .eq('user_id', user.id)
          .is('completed_at', null)
          .gt('due_date', todayDate),
        (supabase.from('followups') as any)
          .select('id', { count: 'exact', head: true })
          .eq('user_id', user.id)
          .not('completed_at', 'is', null),
      ]);

      const counts = {
        all: allRes.count ?? 0,
        today: todayRes.count ?? 0,
        overdue: overdueRes.count ?? 0,
        upcoming: upcomingRes.count ?? 0,
        completed: completedRes.count ?? 0,
      };

      // 2. Fetch paginated records for selected tab
      let query = (supabase.from('followups') as any)
        .select(
          `
            *,
            applications (
              id,
              company_name,
              job_role,
              status,
              job_url,
              recruiter_name,
              recruiter_email
            )
          `,
          { count: 'exact' }
        )
        .eq('user_id', user.id);

      if (tab === 'today') {
        query = query.is('completed_at', null).eq('due_date', todayDate);
      } else if (tab === 'overdue') {
        query = query.is('completed_at', null).lt('due_date', todayDate);
      } else if (tab === 'upcoming') {
        query = query.is('completed_at', null).gt('due_date', todayDate);
      } else if (tab === 'completed') {
        query = query.not('completed_at', 'is', null);
      }

      const from = page * pageSize;
      const to = from + pageSize - 1;

      const orderDirection = tab === 'completed' ? false : true;
      query = query.order('due_date', { ascending: orderDirection }).range(from, to);

      const { data, error, count } = await query;

      if (error) throw error;

      return {
        followups: (data || []) as FollowupWithApplication[],
        totalCount: count ?? 0,
        counts,
      };
    },
    enabled: !!user,
  });

  const logFollowupMutation = useMutation({
    mutationFn: async ({
      followupId,
      applicationId,
      sequenceNumber,
      dueDate,
      applicationStatus,
      dto,
    }: {
      followupId: string;
      applicationId: string;
      sequenceNumber: number;
      dueDate: string;
      applicationStatus: ApplicationStatus;
      dto: LogFollowupDTO;
    }) => {
      if (!user) throw new Error('User not authenticated');

      // 1. Mark current follow-up completed
      const { data: updatedFollowup, error: updateError } = await (supabase.from('followups') as any)
        .update({
          method: dto.method,
          result: dto.result,
          notes: dto.notes || null,
          completed_at: new Date().toISOString(),
        })
        .eq('id', followupId)
        .eq('user_id', user.id)
        .select()
        .single();

      if (updateError || !updatedFollowup) {
        throw new Error(updateError?.message || 'Failed to log follow-up');
      }

      // 2. Evaluate if automatic next follow-up should be generated
      const shouldCreate = shouldCreateNextFollowup(
        sequenceNumber,
        dto.result,
        applicationStatus,
        settings
      );

      if (shouldCreate) {
        const nextPayload = buildNextFollowupPayload(
          applicationId,
          user.id,
          sequenceNumber,
          dueDate,
          settings
        );

        if (nextPayload) {
          const { error: nextError } = await (supabase.from('followups') as any)
            .insert(nextPayload);

          if (nextError) {
            console.error('Error auto-creating next follow-up:', nextError);
          }
        }
      }

      return updatedFollowup;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: FOLLOWUPS_QUERY_KEY });
      queryClient.invalidateQueries({ queryKey: APPLICATIONS_QUERY_KEY });
      queryClient.invalidateQueries({ queryKey: ['dashboard-stats'] });
    },
  });

  return {
    followups: followupsQuery.data?.followups || [],
    totalCount: followupsQuery.data?.totalCount || 0,
    counts: followupsQuery.data?.counts || { all: 0, today: 0, overdue: 0, upcoming: 0, completed: 0 },
    isLoading: followupsQuery.isLoading,
    isFetching: followupsQuery.isFetching,
    isError: followupsQuery.isError,
    error: followupsQuery.error,
    logFollowup: logFollowupMutation.mutateAsync,
    isLogging: logFollowupMutation.isPending,
    refetch: followupsQuery.refetch,
  };
}
