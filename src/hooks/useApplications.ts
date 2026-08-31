import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase, isSupabaseConfigured } from '../lib/supabase';
import { useAuth } from '../context/AuthContext';
import {
  Application,
  ApplicationWithFollowups,
  CreateApplicationDTO,
  UpdateApplicationDTO,
  ApplicationStatus,
  ApplicationSource,
} from '../types/application';
import { Followup, FollowupState } from '../types/followup';
import {
  calculateNextFollowupDate,
  getNextPendingFollowup,
  getFollowupState,
} from '../utils/followupEngine';
import { isApplicationActive } from '../constants/statuses';
import { useSettings } from './useSettings';

export const APPLICATIONS_QUERY_KEY = ['applications'];

export interface UseApplicationsParams {
  page?: number;
  pageSize?: number;
  search?: string;
  status?: ApplicationStatus | 'All';
  source?: ApplicationSource | 'All';
  followupState?: FollowupState | 'All';
}

export function useApplications(params?: UseApplicationsParams) {
  const { user, profile } = useAuth();
  const { settings } = useSettings();
  const queryClient = useQueryClient();

  const page = params?.page ?? 0;
  const pageSize = params?.pageSize ?? 10;
  const search = params?.search?.trim();
  const status = params?.status;
  const source = params?.source;
  const followupState = params?.followupState;

  const applicationsQuery = useQuery({
    queryKey: [
      ...APPLICATIONS_QUERY_KEY,
      user?.id,
      page,
      pageSize,
      search,
      status,
      source,
      followupState,
    ],
    queryFn: async (): Promise<{
      applications: ApplicationWithFollowups[];
      totalCount: number;
    }> => {
      if (!isSupabaseConfigured || !user) {
        return { applications: [], totalCount: 0 };
      }

      let query = (supabase.from('applications') as any)
        .select(
          `
            *,
            followups:followups(*)
          `,
          { count: 'exact' }
        )
        .eq('user_id', user.id);

      // 1. Backend Search (Company name, Job role, Location)
      if (search) {
        query = query.or(
          `company_name.ilike.%${search}%,job_role.ilike.%${search}%,location.ilike.%${search}%`
        );
      }

      // 2. Backend Status Filter
      if (status && status !== 'All') {
        query = query.eq('status', status);
      }

      // 3. Backend Source Filter
      if (source && source !== 'All') {
        query = query.eq('source', source);
      }

      // 4. Backend Pagination (LIMIT / OFFSET)
      const from = page * pageSize;
      const to = from + pageSize - 1;
      query = query.order('created_at', { ascending: false }).range(from, to);

      const { data, error, count } = await query;

      if (error) throw error;

      let mappedApps: ApplicationWithFollowups[] = (data || []).map((app: any) => {
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

      // Client-side Follow-up dynamic state filter if specified
      if (followupState && followupState !== 'All') {
        mappedApps = mappedApps.filter((app) => {
          const nextFollowup = app.nextFollowup;
          if (!nextFollowup) {
            return followupState === 'Completed';
          }
          const st = getFollowupState(nextFollowup, app.status, profile?.timezone);
          return st === followupState;
        });
      }

      return {
        applications: mappedApps,
        totalCount: count ?? mappedApps.length,
      };
    },
    enabled: !!user,
  });

  const createApplicationMutation = useMutation({
    mutationFn: async (dto: CreateApplicationDTO) => {
      if (!user) throw new Error('User not authenticated');

      const appStatus = dto.status || 'Applied';
      const { data: newApp, error: appError } = await (supabase.from('applications') as any)
        .insert({
          ...dto,
          status: appStatus,
          user_id: user.id,
        })
        .select()
        .single();

      if (appError || !newApp) {
        throw new Error(appError?.message || 'Failed to create application');
      }

      if (isApplicationActive(appStatus)) {
        const followup1DueDate = calculateNextFollowupDate(
          newApp.applied_date,
          1,
          settings
        );

        if (followup1DueDate) {
          const { error: followupError } = await (supabase.from('followups') as any).insert({
            application_id: newApp.id,
            user_id: user.id,
            sequence_number: 1,
            due_date: followup1DueDate,
            reminder_sent: false,
          });

          if (followupError) {
            console.error('Error creating automatic Follow-up #1:', followupError);
          }
        }
      }

      return newApp as Application;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: APPLICATIONS_QUERY_KEY });
      queryClient.invalidateQueries({ queryKey: ['followups'] });
      queryClient.invalidateQueries({ queryKey: ['dashboard-stats'] });
    },
  });

  const updateApplicationMutation = useMutation({
    mutationFn: async ({
      id,
      dto,
      originalAppliedDate,
    }: {
      id: string;
      dto: UpdateApplicationDTO;
      originalAppliedDate?: string;
    }) => {
      if (!user) throw new Error('User not authenticated');

      const { data: updatedApp, error: updateError } = await (supabase.from('applications') as any)
        .update(dto)
        .eq('id', id)
        .eq('user_id', user.id)
        .select()
        .single();

      if (updateError || !updatedApp) {
        throw new Error(updateError?.message || 'Failed to update application');
      }

      if (dto.applied_date && originalAppliedDate && dto.applied_date !== originalAppliedDate) {
        const { data: pendingFollowups } = await (supabase.from('followups') as any)
          .select('*')
          .eq('application_id', id)
          .eq('sequence_number', 1)
          .is('completed_at', null);

        if (pendingFollowups && pendingFollowups.length > 0) {
          const newDueDate = calculateNextFollowupDate(dto.applied_date, 1, settings);
          if (newDueDate) {
            await (supabase.from('followups') as any)
              .update({ due_date: newDueDate, reminder_sent: false })
              .eq('id', pendingFollowups[0].id);
          }
        }
      }

      return updatedApp as Application;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: APPLICATIONS_QUERY_KEY });
      queryClient.invalidateQueries({ queryKey: ['followups'] });
      queryClient.invalidateQueries({ queryKey: ['dashboard-stats'] });
    },
  });

  const deleteApplicationMutation = useMutation({
    mutationFn: async (id: string) => {
      if (!user) throw new Error('User not authenticated');

      const { error } = await (supabase.from('applications') as any)
        .delete()
        .eq('id', id)
        .eq('user_id', user.id);

      if (error) throw error;
      return id;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: APPLICATIONS_QUERY_KEY });
      queryClient.invalidateQueries({ queryKey: ['followups'] });
      queryClient.invalidateQueries({ queryKey: ['dashboard-stats'] });
    },
  });

  return {
    applications: applicationsQuery.data?.applications || [],
    totalCount: applicationsQuery.data?.totalCount || 0,
    isLoading: applicationsQuery.isLoading,
    isError: applicationsQuery.isError,
    error: applicationsQuery.error,
    createApplication: createApplicationMutation.mutateAsync,
    isCreating: createApplicationMutation.isPending,
    updateApplication: updateApplicationMutation.mutateAsync,
    isUpdating: updateApplicationMutation.isPending,
    deleteApplication: deleteApplicationMutation.mutateAsync,
    isDeleting: deleteApplicationMutation.isPending,
    refetch: applicationsQuery.refetch,
  };
}
