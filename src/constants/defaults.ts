import { FollowupSettings } from '../types/settings';

export const DEFAULT_SETTINGS: Omit<FollowupSettings, 'id' | 'user_id' | 'created_at' | 'updated_at'> = {
  first_followup_days: 3,
  second_followup_days: 4,
  third_followup_days: 7,
  max_followups: 3,
  reminder_enabled: true,
  reminder_time: '09:00',
  reminder_email: null,
};

export const COMMON_TIMEZONES = [
  'UTC',
  'Asia/Kolkata',
  'America/New_York',
  'America/Chicago',
  'America/Denver',
  'America/Los_Angeles',
  'Europe/London',
  'Europe/Berlin',
  'Europe/Paris',
  'Asia/Singapore',
  'Asia/Tokyo',
  'Asia/Dubai',
  'Australia/Sydney',
];
