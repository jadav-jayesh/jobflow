export interface FollowupSettings {
  id: string;
  user_id: string;
  first_followup_days: number;
  second_followup_days: number;
  third_followup_days: number;
  max_followups: number;
  reminder_enabled: boolean;
  reminder_time: string; // '09:00'
  reminder_email: string | null;
  created_at: string;
  updated_at: string;
}

export type UpdateSettingsDTO = Partial<
  Omit<FollowupSettings, 'id' | 'user_id' | 'created_at' | 'updated_at'>
>;
