import { FollowupMethod, FollowupResult, FollowupState } from '../types/followup';

export const FOLLOWUP_METHODS: { value: FollowupMethod; label: string }[] = [
  { value: 'LinkedIn', label: 'LinkedIn' },
  { value: 'Email', label: 'Email' },
  { value: 'Phone', label: 'Phone' },
  { value: 'Other', label: 'Other' },
];

export const FOLLOWUP_RESULTS: {
  value: FollowupResult;
  label: string;
  createsNext: boolean;
}[] = [
  { value: 'No Response', label: 'No Response', createsNext: true },
  { value: 'Response Received', label: 'Response Received', createsNext: false },
  { value: 'Not Interested', label: 'Not Interested', createsNext: false },
  { value: 'Recruiter Asked to Wait', label: 'Recruiter Asked to Wait', createsNext: false },
  { value: 'Other', label: 'Other', createsNext: false },
];

export const FOLLOWUP_STATES: {
  value: FollowupState;
  label: string;
  icon: string;
  color: 'success' | 'warning' | 'error' | 'default' | 'info';
}[] = [
  { value: 'Upcoming', label: 'Upcoming', icon: '🟢', color: 'info' },
  { value: 'Today', label: 'Today', icon: '🟡', color: 'warning' },
  { value: 'Overdue', label: 'Overdue', icon: '🔴', color: 'error' },
  { value: 'Completed', label: 'Completed', icon: '✓', color: 'success' },
  { value: 'Not Required', label: 'Not Required', icon: '—', color: 'default' },
];
