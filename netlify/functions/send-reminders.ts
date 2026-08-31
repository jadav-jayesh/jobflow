import type { Config } from '@netlify/functions';
import nodemailer from 'nodemailer';
import { createClient } from '@supabase/supabase-js';
import { generateFollowupReminderEmail } from '../../src/utils/emailTemplates';

const supabaseUrl = process.env.VITE_SUPABASE_URL || '';
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY || '';

export default async (req: Request) => {
  console.log('[CareerPulse Cron] Starting scheduled follow-up reminder job...');

  if (!supabaseUrl || !supabaseServiceKey) {
    console.error('[CareerPulse Cron] Missing Supabase server credentials.');
    return new Response(JSON.stringify({ error: 'Supabase credentials missing' }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' },
    });
  }

  const supabase = createClient(supabaseUrl, supabaseServiceKey, {
    auth: { persistSession: false },
  });

  const smtpHost = process.env.SMTP_HOST;
  const smtpPort = parseInt(process.env.SMTP_PORT || '587', 10);
  const smtpUser = process.env.SMTP_USER;
  const smtpPass = process.env.SMTP_PASSWORD;
  const smtpFrom = process.env.SMTP_FROM || 'CareerPulse Reminders <no-reply@careerpulse.app>';

  if (!smtpHost || !smtpUser || !smtpPass) {
    console.warn('[CareerPulse Cron] SMTP environment variables not configured. Skipping email dispatch.');
    return new Response(
      JSON.stringify({ message: 'SMTP not configured on server. Follow-ups checked but no emails sent.' }),
      { status: 200, headers: { 'Content-Type': 'application/json' } }
    );
  }

  const transporter = nodemailer.createTransport({
    host: smtpHost,
    port: smtpPort,
    secure: smtpPort === 465,
    auth: {
      user: smtpUser,
      pass: smtpPass,
    },
  });

  try {
    const todayUTC = new Date().toISOString().split('T')[0];

    const { data: dueFollowups, error: queryError } = await supabase
      .from('followups')
      .select(`
        id,
        sequence_number,
        due_date,
        user_id,
        applications (
          id,
          company_name,
          job_role,
          status,
          recruiter_name,
          recruiter_email,
          job_url
        ),
        profiles:user_id (
          full_name,
          email,
          timezone
        ),
        settings:user_id (
          reminder_enabled,
          reminder_email,
          reminder_time
        )
      `)
      .is('completed_at', null)
      .eq('reminder_sent', false)
      .lte('due_date', todayUTC);

    if (queryError) {
      throw queryError;
    }

    if (!dueFollowups || dueFollowups.length === 0) {
      console.log('[CareerPulse Cron] No pending due follow-ups require email reminders today.');
      return new Response(
        JSON.stringify({ message: 'No due reminders found today', count: 0 }),
        { status: 200, headers: { 'Content-Type': 'application/json' } }
      );
    }

    console.log(`[CareerPulse Cron] Found ${dueFollowups.length} follow-ups eligible for reminder.`);

    let sentCount = 0;
    const sentIds: string[] = [];

    for (const item of dueFollowups as any[]) {
      const app = item.applications;
      const profile = item.profiles;
      const settings = item.settings;

      if (!settings?.reminder_enabled) {
        continue;
      }

      if (app?.status && ['Selected', 'Rejected', 'Withdrawn'].includes(app.status)) {
        continue;
      }

      const recipientEmail = settings?.reminder_email || profile?.email;
      if (!recipientEmail) {
        continue;
      }

      const userName = profile?.full_name || recipientEmail.split('@')[0] || 'User';

      const emailContent = generateFollowupReminderEmail({
        userName,
        companyName: app?.company_name || 'Target Company',
        jobRole: app?.job_role || 'Job Role',
        sequenceNumber: item.sequence_number,
        dueDate: item.due_date,
        recruiterName: app?.recruiter_name,
        recruiterEmail: app?.recruiter_email,
        jobUrl: app?.job_url,
      });

      try {
        await transporter.sendMail({
          from: smtpFrom,
          to: recipientEmail,
          subject: emailContent.subject,
          text: emailContent.text,
          html: emailContent.html,
        });

        sentIds.push(item.id);
        sentCount++;
      } catch (sendErr) {
        console.error(`[CareerPulse Cron] Failed sending email for follow-up ${item.id}:`, sendErr);
      }
    }

    if (sentIds.length > 0) {
      await supabase
        .from('followups')
        .update({
          reminder_sent: true,
          reminder_sent_at: new Date().toISOString(),
        })
        .in('id', sentIds);
    }

    console.log(`[CareerPulse Cron] Successfully sent ${sentCount} follow-up reminders.`);

    return new Response(
      JSON.stringify({
        message: `Successfully processed reminders. Sent ${sentCount} emails.`,
        sentCount,
      }),
      { status: 200, headers: { 'Content-Type': 'application/json' } }
    );
  } catch (err: any) {
    console.error('[CareerPulse Cron] Error processing scheduled reminders:', err);
    return new Response(
      JSON.stringify({ error: err.message || 'Internal Server Error' }),
      { status: 500, headers: { 'Content-Type': 'application/json' } }
    );
  }
};

export const config: Config = {
  schedule: '0 9 * * *',
};
