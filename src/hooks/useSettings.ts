import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase, isSupabaseConfigured } from '../lib/supabase';
import { useAuth } from '../context/AuthContext';
import { FollowupSettings, UpdateSettingsDTO } from '../types/settings';
import { UpdateProfileDTO } from '../types/profile';
import { DEFAULT_SETTINGS } from '../constants/defaults';

export const SETTINGS_QUERY_KEY = ['settings'];
export const PROFILE_QUERY_KEY = ['profile'];

export function useSettings() {
  const { user, refreshProfile } = useAuth();
  const queryClient = useQueryClient();

  const settingsQuery = useQuery({
    queryKey: [...SETTINGS_QUERY_KEY, user?.id],
    queryFn: async (): Promise<FollowupSettings> => {
      if (!isSupabaseConfigured || !user) {
        return {
          id: 'default',
          user_id: user?.id || 'mock',
          ...DEFAULT_SETTINGS,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
        };
      }

      const { data, error } = await (supabase.from('settings') as any)
        .select('*')
        .eq('user_id', user.id)
        .maybeSingle();

      if (error) throw error;

      if (!data) {
        const newSettings = {
          user_id: user.id,
          ...DEFAULT_SETTINGS,
          reminder_email: user.email || null,
        };
        const { data: inserted, error: insertErr } = await (supabase.from('settings') as any)
          .insert(newSettings)
          .select()
          .single();

        if (insertErr) throw insertErr;
        return inserted as FollowupSettings;
      }

      return data as FollowupSettings;
    },
    enabled: !!user,
  });

  const updateSettingsMutation = useMutation({
    mutationFn: async (payload: UpdateSettingsDTO) => {
      if (!user) throw new Error('User not authenticated');

      const { data, error } = await (supabase.from('settings') as any)
        .upsert({
          user_id: user.id,
          ...payload,
        })
        .select()
        .single();

      if (error) throw error;
      return data as FollowupSettings;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: SETTINGS_QUERY_KEY });
    },
  });

  const updateProfileMutation = useMutation({
    mutationFn: async (payload: UpdateProfileDTO) => {
      if (!user) throw new Error('User not authenticated');

      const { data, error } = await (supabase.from('profiles') as any)
        .update(payload)
        .eq('id', user.id)
        .select()
        .single();

      if (error) throw error;
      await refreshProfile();
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: PROFILE_QUERY_KEY });
    },
  });

  return {
    settings: settingsQuery.data || {
      id: 'default',
      user_id: user?.id || 'mock',
      ...DEFAULT_SETTINGS,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    },
    isLoading: settingsQuery.isLoading,
    isError: settingsQuery.isError,
    error: settingsQuery.error,
    updateSettings: updateSettingsMutation.mutateAsync,
    isUpdatingSettings: updateSettingsMutation.isPending,
    updateProfile: updateProfileMutation.mutateAsync,
    isUpdatingProfile: updateProfileMutation.isPending,
  };
}
