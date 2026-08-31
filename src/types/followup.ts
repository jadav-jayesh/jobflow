export type FollowupMethod = 'LinkedIn' | 'Email' | 'Phone' | 'Other';

export type FollowupResult =
  | 'No Response'
  | 'Response Received'
  | 'Not Interested'
  | 'Recruiter Asked to Wait'
  | 'Other';

export type FollowupState =
  | 'Upcoming'
  | 'Today'
  | 'Overdue'
  | 'Completed'
  | 'Not Required';

export interface Followup {
  id: string;
  application_id: string;
  user_id: string;
  sequence_number: number;
  due_date: string; // ISO date 'YYYY-MM-DD'
  method: FollowupMethod | null;
  result: FollowupResult | null;
  notes: string | null;
  completed_at: string | null; // ISO timestamp
  reminder_sent: boolean;
  reminder_sent_at: string | null;
  created_at: string;
  updated_at: string;
}

export interface FollowupWithApplication extends Followup {
  applications?: {
    id: string;
    company_name: string;
    job_role: string;
    status: string;
    job_url: string | null;
    recruiter_name: string | null;
    recruiter_email: string | null;
  } | null;
}

export interface LogFollowupDTO {
  method: FollowupMethod;
  result: FollowupResult;
  notes?: string | null;
}
