import type { Handler, HandlerEvent, HandlerContext } from '@netlify/functions';
import { createClient } from '@supabase/supabase-js';
import nodemailer from 'nodemailer';

// Environment variables
const supabaseUrl = process.env.SUPABASE_URL || process.env.VITE_SUPABASE_URL || '';
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY || '';

const smtpHost = process.env.SMTP_HOST;
const smtpPort = parseInt(process.env.SMTP_PORT || '587', 10);
const smtpUser = process.env.SMTP_USER;
const smtpPass = process.env.SMTP_PASSWORD;
const smtpFrom = process.env.SMTP_FROM || 'JobFlow <reminders@jobflow.app>';

export const handler: Handler = async (event: HandlerEvent, _context: HandlerContext) => {
  console.log('Starting JobFlow scheduled follow-up reminder job...');

  if (!supabaseUrl || !supabaseServiceKey) {
    console.error('Supabase URL or Service Role Key missing in environment.');
    return {
      statusCode: 500,
      body: JSON.stringify({ error: 'Database service configuration missing.' }),
    };
  }

  const supabase = createClient(supabaseUrl, supabaseServiceKey, {
    auth: { persistSession: false },
  });

  // Create SMTP transporter if configured
  let transporter: nodemailer.Transporter | null = null;
  if (smtpHost && smtpUser && smtpPass) {
    transporter = nodemailer.createTransport({
      host: smtpHost,
      port: smtpPort,
      secure: smtpPort === 465,
      auth: {
        user: smtpUser,
        pass: smtpPass,
      },
    });
  } else {
    console.warn('SMTP credentials not configured. Reminders will be logged but not delivered.');
  }

  try {
    const today = new Date().toISOString().slice(0, 10);

    // Query pending follow-ups due on or before today where reminder has not been sent
    const { data: followups, error: fetchError } = await supabase
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
          applied_date,
          status,
          job_url,
          recruiter_name,
          recruiter_email
        )
      `)
      .is('completed_at', null)
      .eq('reminder_sent', false)
      .lte('due_date', today);

    if (fetchError) {
      console.error('Error fetching due followups:', fetchError);
      return { statusCode: 500, body: JSON.stringify({ error: fetchError.message }) };
    }

    if (!followups || followups.length === 0) {
      console.log('No follow-up reminders due at this time.');
      return {
        statusCode: 200,
        body: JSON.stringify({ message: 'No pending reminders due today.', processed: 0 }),
      };
    }

    let sentCount = 0;
    let failedCount = 0;

    for (const item of followups) {
      const app = item.applications as any;
      if (!app) continue;

      // Filter active applications only
      const activeStatuses = ['Applied', 'HR Contact', 'Interview'];
      if (!activeStatuses.includes(app.status)) {
        continue;
      }

      // Fetch user's settings and profile
      const { data: settings } = await supabase
        .from('settings')
        .select('*')
        .eq('user_id', item.user_id)
        .maybeSingle();

      if (settings && !settings.reminder_enabled) {
        console.log(`User ${item.user_id} has disabled reminders. Skipping.`);
        continue;
      }

      const { data: profile } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', item.user_id)
        .maybeSingle();

      const recipientEmail = settings?.reminder_email || profile?.email;
      const userName = profile?.full_name || 'JobFlow User';

      if (!recipientEmail) {
        console.warn(`No recipient email found for user ${item.user_id}. Skipping.`);
        continue;
      }

      const greeting = app.recruiter_name ? `Dear ${app.recruiter_name}` : 'Hi';
      const suggestedMessage = `${greeting},\n\nI wanted to follow up regarding my application for the ${app.job_role} position at ${app.company_name}. I remain very enthusiastic about this opportunity and would welcome the chance to discuss how my background fits your team.\n\nThank you,\n${userName}`;

      const subject = `🔔 Job Follow-up Reminder — ${app.company_name}`;
      const textBody = `Hi ${userName},\n\nYou have a job follow-up due today.\n\nCompany: ${app.company_name}\nRole: ${app.job_role}\nApplied: ${app.applied_date}\nFollow-up: #${item.sequence_number}\n${app.job_url ? `Job Posting: ${app.job_url}\n` : ''}${app.recruiter_name ? `Recruiter: ${app.recruiter_name}\n` : ''}\n\nSuggested outreach message:\n----------------------------------------\n${suggestedMessage}\n----------------------------------------\n\nLog your follow-up in JobFlow to track history.\n`;

      const htmlBody = `
        <div style="font-family: Arial, sans-serif; max-width: 560px; margin: 0 auto; padding: 24px; border: 1px solid #e2e8f0; border-radius: 8px;">
          <h2 style="color: #1e293b; margin-top: 0;">🔔 Job Follow-up Due Today</h2>
          <p>Hi <strong>${userName}</strong>,</p>
          <p>You have a scheduled follow-up due today for your application with <strong>${app.company_name}</strong>.</p>
          
          <table style="width: 100%; margin: 16px 0; border-collapse: collapse;">
            <tr><td style="padding: 6px 0; color: #64748b;">Company:</td><td style="font-weight: bold;">${app.company_name}</td></tr>
            <tr><td style="padding: 6px 0; color: #64748b;">Role:</td><td style="font-weight: bold;">${app.job_role}</td></tr>
            <tr><td style="padding: 6px 0; color: #64748b;">Applied:</td><td>${app.applied_date}</td></tr>
            <tr><td style="padding: 6px 0; color: #64748b;">Follow-up:</td><td>#${item.sequence_number}</td></tr>
            ${app.recruiter_name ? `<tr><td style="padding: 6px 0; color: #64748b;">Recruiter:</td><td>${app.recruiter_name}</td></tr>` : ''}
          </table>

          <p style="font-weight: bold; margin-bottom: 6px;">Suggested Message:</p>
          <div style="background: #f8fafc; border-left: 4px solid #2563eb; padding: 12px; font-size: 14px; white-space: pre-line; margin-bottom: 20px;">
            ${suggestedMessage}
          </div>

          <p style="color: #94a3b8; font-size: 12px; border-top: 1px solid #e2e8f0; pt: 12px;">
            JobFlow — Personal Job Application Tracker
          </p>
        </div>
      `;

      try {
        if (transporter) {
          await transporter.sendMail({
            from: smtpFrom,
            to: recipientEmail,
            subject,
            text: textBody,
            html: htmlBody,
          });
        } else {
          console.log(`[DRY-RUN EMAIL] To: ${recipientEmail} | Subject: ${subject}`);
        }

        // Mark reminder_sent = true only after successful dispatch
        await supabase
          .from('followups')
          .update({
            reminder_sent: true,
            reminder_sent_at: new Date().toISOString(),
          })
          .eq('id', item.id);

        sentCount++;
      } catch (sendErr) {
        console.error(`Failed to send email reminder for follow-up ${item.id}:`, sendErr);
        // Do NOT mark reminder_sent = true to allow safe retry
        failedCount++;
      }
    }

    return {
      statusCode: 200,
      body: JSON.stringify({
        message: 'Reminder process completed.',
        sent: sentCount,
        failed: failedCount,
      }),
    };
  } catch (err: any) {
    console.error('Fatal scheduler error:', err);
    return { statusCode: 500, body: JSON.stringify({ error: err.message }) };
  }
};
