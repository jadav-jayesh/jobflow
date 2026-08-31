import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase, isSupabaseConfigured } from '../lib/supabase';
import { useAuth } from '../context/AuthContext';
import { FollowupWithApplication, LogFollowupDTO } from '../types/followup';
import { ApplicationStatus } from '../types/application';
import {
  shouldCreateNextFollowup,
  buildNextFollowupPayload,
} from '../utils/followupEngine';
import { useSettings } from './useSettings';
import { APPLICATIONS_QUERY_KEY } from './useApplications';

export const FOLLOWUPS_QUERY_KEY = ['followups'];

export function useFollowups() {
  const { user } = useAuth();
  const { settings } = useSettings();
  const queryClient = useQueryClient();

  const followupsQuery = useQuery({
    queryKey: [...FOLLOWUPS_QUERY_KEY, user?.id],
    queryFn: async (): Promise<FollowupWithApplication[]> => {
      if (!isSupabaseConfigured || !user) return [];

      const { data, error } = await (supabase.from('followups') as any)
        .select(`
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
        `)
        .eq('user_id', user.id)
        .order('due_date', { ascending: true });

      if (error) throw error;
      return (data || []) as FollowupWithApplication[];
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
    followups: followupsQuery.data || [],
    isLoading: followupsQuery.isLoading,
    isError: followupsQuery.isError,
    error: followupsQuery.error,
    logFollowup: logFollowupMutation.mutateAsync,
    isLogging: logFollowupMutation.isPending,
    refetch: followupsQuery.refetch,
  };
}
