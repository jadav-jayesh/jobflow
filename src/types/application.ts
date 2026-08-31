export type ApplicationStatus =
  | 'Applied'
  | 'HR Contact'
  | 'Interview'
  | 'Selected'
  | 'Rejected'
  | 'Withdrawn';

export type ApplicationSource =
  | 'LinkedIn'
  | 'Naukri'
  | 'Company Website'
  | 'Referral'
  | 'Recruiter'
  | 'Email'
  | 'Other';

export type WorkMode = 'Remote' | 'Hybrid' | 'On-site';

export interface Application {
  id: string;
  user_id: string;
  company_name: string;
  job_role: string;
  job_url: string | null;
  location: string | null;
  work_mode: WorkMode | null;
  source: ApplicationSource | null;
  applied_date: string; // ISO date 'YYYY-MM-DD'
  status: ApplicationStatus;
  recruiter_name: string | null;
  recruiter_email: string | null;
  expected_ctc: number | null;
  notes: string | null;
  created_at: string;
  updated_at: string;
}

export interface ApplicationWithFollowups extends Application {
  followups?: import('./followup').Followup[];
  nextFollowup?: import('./followup').Followup | null;
}

export interface CreateApplicationDTO {
  company_name: string;
  job_role: string;
  applied_date: string;
  job_url?: string | null;
  location?: string | null;
  work_mode?: WorkMode | null;
  source?: ApplicationSource | null;
  status?: ApplicationStatus;
  recruiter_name?: string | null;
  recruiter_email?: string | null;
  expected_ctc?: number | null;
  notes?: string | null;
}

export type UpdateApplicationDTO = Partial<CreateApplicationDTO>;
