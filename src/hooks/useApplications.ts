import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase, isSupabaseConfigured } from '../lib/supabase';
import { useAuth } from '../context/AuthContext';
import {
  Application,
  ApplicationWithFollowups,
  CreateApplicationDTO,
  UpdateApplicationDTO,
} from '../types/application';
import { Followup } from '../types/followup';
import {
  calculateNextFollowupDate,
  getNextPendingFollowup,
} from '../utils/followupEngine';
import { isApplicationActive } from '../constants/statuses';
import { useSettings } from './useSettings';

export const APPLICATIONS_QUERY_KEY = ['applications'];

export function useApplications() {
  const { user } = useAuth();
  const { settings } = useSettings();
  const queryClient = useQueryClient();

  const applicationsQuery = useQuery({
    queryKey: [...APPLICATIONS_QUERY_KEY, user?.id],
    queryFn: async (): Promise<ApplicationWithFollowups[]> => {
      if (!isSupabaseConfigured || !user) return [];

      const { data, error } = await (supabase.from('applications') as any)
        .select(`
          *,
          followups:followups(*)
        `)
        .eq('user_id', user.id)
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
    },
    enabled: !!user,
  });

  const createApplicationMutation = useMutation({
    mutationFn: async (dto: CreateApplicationDTO) => {
      if (!user) throw new Error('User not authenticated');

      const status = dto.status || 'Applied';
      const { data: newApp, error: appError } = await (supabase.from('applications') as any)
        .insert({
          ...dto,
          status,
          user_id: user.id,
        })
        .select()
        .single();

      if (appError || !newApp) {
        throw new Error(appError?.message || 'Failed to create application');
      }

      if (isApplicationActive(status)) {
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
    applications: applicationsQuery.data || [],
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
