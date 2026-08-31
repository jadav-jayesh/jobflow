import { FollowupSettings } from '../types/settings';
import { Followup, FollowupState, FollowupResult } from '../types/followup';
import { ApplicationStatus } from '../types/application';
import { isApplicationActive } from '../constants/statuses';
import { addDaysToDateString, getTodayISODate } from './dateUtils';
import { DEFAULT_SETTINGS } from '../constants/defaults';

/**
 * Calculate due date for a specific sequence number
 */
export function calculateNextFollowupDate(
  baseDate: string,
  sequenceNumber: number,
  settings: Partial<FollowupSettings> = DEFAULT_SETTINGS
): string | null {
  const maxFollowups = settings.max_followups ?? DEFAULT_SETTINGS.max_followups;

  if (sequenceNumber > maxFollowups) {
    return null;
  }

  let daysToAdd = 3;
  if (sequenceNumber === 1) {
    daysToAdd = settings.first_followup_days ?? DEFAULT_SETTINGS.first_followup_days;
  } else if (sequenceNumber === 2) {
    daysToAdd = settings.second_followup_days ?? DEFAULT_SETTINGS.second_followup_days;
  } else if (sequenceNumber === 3) {
    daysToAdd = settings.third_followup_days ?? DEFAULT_SETTINGS.third_followup_days;
  } else {
    // For sequence > 3 if max_followups is increased by user in settings
    daysToAdd = settings.third_followup_days ?? DEFAULT_SETTINGS.third_followup_days;
  }

  return addDaysToDateString(baseDate, daysToAdd);
}

/**
 * Compute the dynamic state of a follow-up (Upcoming, Today, Overdue, Completed, Not Required)
 */
export function getFollowupState(
  followup: { due_date: string; completed_at?: string | null },
  applicationStatus?: ApplicationStatus,
  timezone?: string
): FollowupState {
  if (followup.completed_at) {
    return 'Completed';
  }

  if (applicationStatus && !isApplicationActive(applicationStatus)) {
    return 'Not Required';
  }

  const today = getTodayISODate(timezone);
  const dueDate = followup.due_date;

  if (dueDate < today) {
    return 'Overdue';
  } else if (dueDate === today) {
    return 'Today';
  } else {
    return 'Upcoming';
  }
}

/**
 * Find the current pending (active/next) follow-up from a list of follow-ups
 */
export function getNextPendingFollowup(followups?: Followup[]): Followup | null {
  if (!followups || followups.length === 0) return null;

  // Filter uncompleted followups and sort by sequence_number ascending
  const pending = followups
    .filter((f) => !f.completed_at)
    .sort((a, b) => a.sequence_number - b.sequence_number);

  return pending[0] || null;
}

/**
 * Determine if a next follow-up should be automatically created after completing a follow-up
 */
export function shouldCreateNextFollowup(
  currentSequence: number,
  result: FollowupResult,
  applicationStatus: ApplicationStatus,
  settings: Partial<FollowupSettings> = DEFAULT_SETTINGS
): boolean {
  // 1. Must be active application
  if (!isApplicationActive(applicationStatus)) {
    return false;
  }

  // 2. Only 'No Response' triggers automatic next follow-up
  if (result !== 'No Response') {
    return false;
  }

  // 3. Must not exceed maximum follow-ups
  const maxFollowups = settings.max_followups ?? DEFAULT_SETTINGS.max_followups;
  if (currentSequence >= maxFollowups) {
    return false;
  }

  return true;
}

/**
 * Generate the payload for a new follow-up
 */
export function buildNextFollowupPayload(
  applicationId: string,
  userId: string,
  currentSequence: number,
  currentDueDate: string,
  settings: Partial<FollowupSettings> = DEFAULT_SETTINGS
): {
  application_id: string;
  user_id: string;
  sequence_number: number;
  due_date: string;
  reminder_sent: boolean;
} | null {
  const nextSeq = currentSequence + 1;
  const nextDueDate = calculateNextFollowupDate(currentDueDate, nextSeq, settings);

  if (!nextDueDate) return null;

  return {
    application_id: applicationId,
    user_id: userId,
    sequence_number: nextSeq,
    due_date: nextDueDate,
    reminder_sent: false,
  };
}
