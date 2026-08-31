import { describe, it, expect } from 'vitest';
import {
  calculateNextFollowupDate,
  getFollowupState,
  shouldCreateNextFollowup,
  buildNextFollowupPayload,
} from '../src/utils/followupEngine';
import { addDaysToDateString } from '../src/utils/dateUtils';

describe('Follow-up Engine Acceptance Tests', () => {
  const defaultSettings = {
    first_followup_days: 3,
    second_followup_days: 4,
    third_followup_days: 7,
    max_followups: 3,
    reminder_enabled: true,
    reminder_time: '09:00',
    reminder_email: 'user@example.com',
  };

  // Test 1: Created with Applied 2026-08-31 -> Follow-up #1 is 2026-09-03
  it('Test 1: should calculate Follow-up #1 correctly (3 days after application)', () => {
    const appliedDate = '2026-08-31';
    const followup1Date = calculateNextFollowupDate(appliedDate, 1, defaultSettings);
    expect(followup1Date).toBe('2026-09-03');
  });

  // Test 2: Complete Follow-up #1 with 'No Response' -> Follow-up #2 is 2026-09-07
  it('Test 2: should calculate Follow-up #2 correctly (4 days after Follow-up #1)', () => {
    const followup1Date = '2026-09-03';
    const followup2Date = calculateNextFollowupDate(followup1Date, 2, defaultSettings);
    expect(followup2Date).toBe('2026-09-07');

    const shouldCreate = shouldCreateNextFollowup(1, 'No Response', 'Applied', defaultSettings);
    expect(shouldCreate).toBe(true);

    const payload = buildNextFollowupPayload('app-1', 'user-1', 1, followup1Date, defaultSettings);
    expect(payload).toEqual({
      application_id: 'app-1',
      user_id: 'user-1',
      sequence_number: 2,
      due_date: '2026-09-07',
      reminder_sent: false,
    });
  });

  // Test 3: Complete Follow-up #2 with 'No Response' -> Follow-up #3 is 2026-09-14
  it('Test 3: should calculate Follow-up #3 correctly (7 days after Follow-up #2)', () => {
    const followup2Date = '2026-09-07';
    const followup3Date = calculateNextFollowupDate(followup2Date, 3, defaultSettings);
    expect(followup3Date).toBe('2026-09-14');

    const shouldCreate = shouldCreateNextFollowup(2, 'No Response', 'Applied', defaultSettings);
    expect(shouldCreate).toBe(true);
  });

  // Test 4: Complete Follow-up #3 with 'No Response' -> No Follow-up #4 (max reached)
  it('Test 4: should NOT create Follow-up #4 when max followups (3) is reached', () => {
    const followup3Date = '2026-09-14';
    const followup4Date = calculateNextFollowupDate(followup3Date, 4, defaultSettings);
    expect(followup4Date).toBeNull();

    const shouldCreate = shouldCreateNextFollowup(3, 'No Response', 'Applied', defaultSettings);
    expect(shouldCreate).toBe(false);

    const payload = buildNextFollowupPayload('app-1', 'user-1', 3, followup3Date, defaultSettings);
    expect(payload).toBeNull();
  });

  // Test 5: Complete any follow-up with 'Response Received' -> No new automatic follow-up
  it('Test 5: should NOT create next follow-up when result is Response Received', () => {
    const shouldCreate = shouldCreateNextFollowup(1, 'Response Received', 'Applied', defaultSettings);
    expect(shouldCreate).toBe(false);

    const shouldCreateSeq2 = shouldCreateNextFollowup(2, 'Response Received', 'Interview', defaultSettings);
    expect(shouldCreateSeq2).toBe(false);
  });

  // Test 6: Inactive statuses (Rejected, Selected, Withdrawn) -> No future automatic follow-up
  it('Test 6: should NOT create next follow-up when application status is inactive', () => {
    expect(shouldCreateNextFollowup(1, 'No Response', 'Rejected', defaultSettings)).toBe(false);
    expect(shouldCreateNextFollowup(1, 'No Response', 'Selected', defaultSettings)).toBe(false);
    expect(shouldCreateNextFollowup(1, 'No Response', 'Withdrawn', defaultSettings)).toBe(false);
  });

  // Dynamic states check
  it('should compute dynamic states (Upcoming, Today, Overdue, Completed, Not Required)', () => {
    const completed = { due_date: '2026-08-01', completed_at: '2026-08-01T10:00:00Z' };
    expect(getFollowupState(completed, 'Applied')).toBe('Completed');

    const inactiveAppFollowup = { due_date: '2026-09-10', completed_at: null };
    expect(getFollowupState(inactiveAppFollowup, 'Rejected')).toBe('Not Required');

    // Future date -> Upcoming
    const futureDate = addDaysToDateString(new Date().toISOString().slice(0, 10), 5);
    expect(getFollowupState({ due_date: futureDate, completed_at: null }, 'Applied')).toBe('Upcoming');

    // Past date -> Overdue
    const pastDate = addDaysToDateString(new Date().toISOString().slice(0, 10), -5);
    expect(getFollowupState({ due_date: pastDate, completed_at: null }, 'Applied')).toBe('Overdue');
  });
});
