import { supabase } from '../lib/supabase';
import { addDaysToDateString, getTodayISODate } from './dateUtils';

export async function seedDemoDataForUser(userId: string): Promise<void> {
  const today = getTodayISODate();

  const demoApplications = [
    {
      user_id: userId,
      company_name: 'TCS',
      job_role: 'Senior React Developer',
      job_url: 'https://careers.tcs.com/jobs/react-dev',
      location: 'Ahmedabad, India',
      work_mode: 'Hybrid' as const,
      source: 'LinkedIn' as const,
      applied_date: addDaysToDateString(today, -3),
      status: 'Applied' as const,
      recruiter_name: 'Priya Sharma',
      recruiter_email: 'priya.recruiter@example.com',
      expected_ctc: 1800000,
      notes: 'Applied through LinkedIn Easy Apply. Hiring manager looks active.',
      followup: {
        sequence_number: 1,
        due_date: today,
        method: null,
        result: null,
        notes: null,
        completed_at: null,
        reminder_sent: false,
        reminder_sent_at: null,
      },
    },
    {
      user_id: userId,
      company_name: 'Infosys',
      job_role: 'Full Stack Engineer (React/Node)',
      job_url: 'https://infosys.com/careers/fs-eng',
      location: 'Bangalore, India',
      work_mode: 'Remote' as const,
      source: 'Naukri' as const,
      applied_date: addDaysToDateString(today, -8),
      status: 'HR Contact' as const,
      recruiter_name: 'Rajesh Kumar',
      recruiter_email: 'rajesh.talent@example.com',
      expected_ctc: 2200000,
      notes: 'Recruiter reached out on Naukri. Sent portfolio.',
      completedFollowup: {
        sequence_number: 1,
        due_date: addDaysToDateString(today, -5),
        method: 'LinkedIn' as const,
        result: 'No Response' as const,
        notes: 'Sent message on LinkedIn to recruiter.',
        completed_at: new Date(Date.now() - 5 * 86400000).toISOString(),
        reminder_sent: true,
        reminder_sent_at: new Date(Date.now() - 5 * 86400000).toISOString(),
      },
      followup: {
        sequence_number: 2,
        due_date: addDaysToDateString(today, -1),
        method: null,
        result: null,
        notes: null,
        completed_at: null,
        reminder_sent: false,
        reminder_sent_at: null,
      },
    },
    {
      user_id: userId,
      company_name: 'Razorpay',
      job_role: 'Frontend Platform Engineer',
      job_url: 'https://razorpay.com/jobs/platform-frontend',
      location: 'Bangalore, India',
      work_mode: 'Remote' as const,
      source: 'Company Website' as const,
      applied_date: addDaysToDateString(today, -14),
      status: 'Interview' as const,
      recruiter_name: 'Ananya Roy',
      recruiter_email: 'ananya.talent@example.com',
      expected_ctc: 3200000,
      notes: 'Technical round scheduled for next Tuesday at 3 PM.',
      completedFollowup: {
        sequence_number: 1,
        due_date: addDaysToDateString(today, -11),
        method: 'Email' as const,
        result: 'Response Received' as const,
        notes: 'Recruiter replied and scheduled interview round.',
        completed_at: new Date(Date.now() - 11 * 86400000).toISOString(),
        reminder_sent: true,
        reminder_sent_at: new Date(Date.now() - 11 * 86400000).toISOString(),
      },
    },
    {
      user_id: userId,
      company_name: 'Accenture',
      job_role: 'Lead React Architect',
      job_url: 'https://accenture.com/careers/react-lead',
      location: 'Pune, India',
      work_mode: 'Hybrid' as const,
      source: 'Referral' as const,
      applied_date: addDaysToDateString(today, -25),
      status: 'Selected' as const,
      recruiter_name: 'Vikas Mehta',
      recruiter_email: 'vikas.recruiter@example.com',
      expected_ctc: 2800000,
      notes: 'Offer letter received. Great compensation package.',
      completedFollowup: {
        sequence_number: 1,
        due_date: addDaysToDateString(today, -22),
        method: 'Email' as const,
        result: 'Response Received' as const,
        notes: 'Recruiter confirmed offer stage.',
        completed_at: new Date(Date.now() - 22 * 86400000).toISOString(),
        reminder_sent: true,
        reminder_sent_at: new Date(Date.now() - 22 * 86400000).toISOString(),
      },
    },
    {
      user_id: userId,
      company_name: 'Tech Mahindra',
      job_role: 'UI Developer',
      job_url: 'https://careers.techmahindra.com/ui-dev',
      location: 'Hyderabad, India',
      work_mode: 'On-site' as const,
      source: 'Other' as const,
      applied_date: addDaysToDateString(today, -30),
      status: 'Rejected' as const,
      recruiter_name: 'Sunil Joshi',
      recruiter_email: 'sunil.hiring@example.com',
      expected_ctc: 1400000,
      notes: 'Position closed internally.',
    },
  ];

  for (const item of demoApplications) {
    const { followup, completedFollowup, ...appData } = item as any;

    const { data: insertedApp, error: appError } = await (supabase.from('applications') as any)
      .insert(appData)
      .select()
      .single();

    if (appError || !insertedApp) {
      console.error('Error inserting demo application:', appError);
      continue;
    }

    if (completedFollowup) {
      await (supabase.from('followups') as any).insert({
        ...completedFollowup,
        application_id: insertedApp.id,
        user_id: userId,
      });
    }

    if (followup) {
      await (supabase.from('followups') as any).insert({
        ...followup,
        application_id: insertedApp.id,
        user_id: userId,
      });
    }
  }
}
