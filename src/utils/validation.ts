import { z } from 'zod';

export const applicationSchema = z.object({
  company_name: z.string().min(1, 'Company name is required').max(100, 'Max 100 characters'),
  job_role: z.string().min(1, 'Job role is required').max(100, 'Max 100 characters'),
  applied_date: z
    .string()
    .min(10, 'Applied date is required')
    .regex(/^\d{4}-\d{2}-\d{2}$/, 'Invalid date format (YYYY-MM-DD)'),
  job_url: z
    .string()
    .url('Invalid URL format')
    .optional()
    .or(z.literal(''))
    .nullable(),
  location: z.string().max(100).optional().or(z.literal('')).nullable(),
  work_mode: z.enum(['Remote', 'Hybrid', 'On-site']).optional().nullable(),
  source: z
    .enum(['LinkedIn', 'Naukri', 'Company Website', 'Referral', 'Recruiter', 'Email', 'Other'])
    .optional()
    .nullable(),
  status: z.enum(['Applied', 'HR Contact', 'Interview', 'Selected', 'Rejected', 'Withdrawn']),
  recruiter_name: z.string().max(100).optional().or(z.literal('')).nullable(),
  recruiter_email: z
    .string()
    .email('Invalid email address')
    .optional()
    .or(z.literal(''))
    .nullable(),
  expected_ctc: z.number().positive('Expected CTC must be positive').nullable().optional(),
  notes: z.string().max(2000, 'Max 2000 characters').optional().or(z.literal('')).nullable(),
});

export type ApplicationFormData = z.infer<typeof applicationSchema>;

export const followupLogSchema = z.object({
  method: z.enum(['LinkedIn', 'Email', 'Phone', 'Other'], {
    required_error: 'Select follow-up method',
  }),
  result: z.enum(
    ['No Response', 'Response Received', 'Not Interested', 'Recruiter Asked to Wait', 'Other'],
    {
      required_error: 'Select follow-up result',
    }
  ),
  notes: z.string().max(1000, 'Max 1000 characters').optional().or(z.literal('')).nullable(),
});

export type FollowupLogFormData = z.infer<typeof followupLogSchema>;

export const settingsSchema = z.object({
  first_followup_days: z.number().int().min(1, 'Min 1 day').max(60, 'Max 60 days'),
  second_followup_days: z.number().int().min(1, 'Min 1 day').max(60, 'Max 60 days'),
  third_followup_days: z.number().int().min(1, 'Min 1 day').max(60, 'Max 60 days'),
  max_followups: z.number().int().min(1, 'Min 1 follow-up').max(10, 'Max 10 follow-ups'),
  reminder_enabled: z.boolean(),
  reminder_time: z.string().regex(/^([01]\d|2[0-3]):([0-5]\d)$/, 'Format must be HH:MM'),
  reminder_email: z
    .string()
    .email('Invalid reminder email')
    .optional()
    .or(z.literal(''))
    .nullable(),
});

export type SettingsFormData = z.infer<typeof settingsSchema>;

export const loginSchema = z.object({
  email: z.string().min(1, 'Email is required').email('Invalid email address'),
  password: z.string().min(6, 'Password must be at least 6 characters'),
});

export type LoginFormData = z.infer<typeof loginSchema>;

export const registerSchema = z
  .object({
    full_name: z.string().min(1, 'Full name is required').max(100),
    email: z.string().min(1, 'Email is required').email('Invalid email address'),
    password: z.string().min(6, 'Password must be at least 6 characters'),
    confirmPassword: z.string().min(6, 'Please confirm your password'),
    timezone: z.string(),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: "Passwords don't match",
    path: ['confirmPassword'],
  });

export type RegisterFormData = z.infer<typeof registerSchema>;
