import { format } from 'date-fns';

export interface EmailReminderParams {
  userName: string;
  companyName: string;
  jobRole: string;
  sequenceNumber: number;
  dueDate: string;
  recruiterName?: string | null;
  recruiterEmail?: string | null;
  jobUrl?: string | null;
}

export function generateFollowupReminderEmail(params: EmailReminderParams): {
  subject: string;
  html: string;
  text: string;
} {
  const {
    userName,
    companyName,
    jobRole,
    sequenceNumber,
    dueDate,
    recruiterName,
    recruiterEmail,
    jobUrl,
  } = params;

  const subject = `🔔 CareerPulse Reminder: Follow-up #${sequenceNumber} Due for ${companyName} (${jobRole})`;

  const formattedDate = format(new Date(dueDate), 'MMMM dd, yyyy');

  const suggestedTemplate = recruiterName
    ? `Hi ${recruiterName},\n\nI hope you're having a great week! I'm following up on my application for the ${jobRole} position at ${companyName}. I'm very interested in this opportunity and would love to hear about the next steps in the hiring process.\n\nBest regards,\n${userName}`
    : `Hi Hiring Team,\n\nI hope you're having a great week! I'm following up on my application for the ${jobRole} position at ${companyName}. I remain very excited about this role and wanted to check if there are any updates regarding my application.\n\nBest regards,\n${userName}`;

  const html = `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="utf-8">
  <style>
    body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; line-height: 1.6; color: #1e293b; background-color: #f8fafc; margin: 0; padding: 20px; }
    .container { max-width: 600px; margin: 0 auto; background: #ffffff; border-radius: 12px; border: 1px solid #e2e8f0; overflow: hidden; }
    .header { background: #2563eb; color: #ffffff; padding: 24px; text-align: center; }
    .header h1 { margin: 0; font-size: 22px; font-weight: 700; }
    .content { padding: 24px; }
    .card { background: #f1f5f9; border-radius: 8px; padding: 16px; margin: 16px 0; border-left: 4px solid #2563eb; }
    .template-box { background: #ffffff; border: 1px solid #cbd5e1; border-radius: 6px; padding: 12px; font-family: monospace; font-size: 13px; color: #334155; white-space: pre-wrap; margin-top: 8px; }
    .footer { text-align: center; font-size: 12px; color: #64748b; padding: 16px; border-top: 1px solid #f1f5f9; }
    .btn { display: inline-block; background: #2563eb; color: #ffffff !important; padding: 10px 20px; border-radius: 6px; text-decoration: none; font-weight: 600; margin-top: 12px; }
  </style>
</head>
<body>
  <div class="container">
    <div class="header">
      <h1>CareerPulse Follow-up Reminder</h1>
    </div>
    <div class="content">
      <p>Hi <strong>${userName}</strong>,</p>
      <p>This is a reminder to send <strong>Follow-up #${sequenceNumber}</strong> for your job application:</p>

      <div class="card">
        <h2 style="margin-top: 0; font-size: 18px; color: #0f172a;">${companyName} — ${jobRole}</h2>
        <p style="margin: 4px 0;"><strong>Due Date:</strong> ${formattedDate}</p>
        ${recruiterName ? `<p style="margin: 4px 0;"><strong>Recruiter:</strong> ${recruiterName}</p>` : ''}
        ${recruiterEmail ? `<p style="margin: 4px 0;"><strong>Email:</strong> <a href="mailto:${recruiterEmail}">${recruiterEmail}</a></p>` : ''}
        ${jobUrl ? `<p style="margin: 4px 0;"><strong>Job Link:</strong> <a href="${jobUrl}" target="_blank">View Posting</a></p>` : ''}
      </div>

      <p><strong>Suggested outreach message template:</strong></p>
      <div class="template-box">${suggestedTemplate}</div>

      <p style="margin-top: 24px;">Once you've reached out, make sure to record your follow-up in CareerPulse to automatically schedule the next date:</p>
      <p style="text-align: center;">
        <a href="https://jobflow-jayesh.netlify.app/followups" class="btn">Open CareerPulse &amp; Log Result</a>
      </p>
    </div>
    <div class="footer">
      <p>Sent by CareerPulse • Automated Personal Job Application Tracker</p>
      <p>You received this email because follow-up reminders are enabled in your settings.</p>
    </div>
  </div>
</body>
</html>
  `;

  const text = `
Hi ${userName},

This is a reminder to send Follow-up #${sequenceNumber} for your job application:

Company: ${companyName}
Role: ${jobRole}
Due Date: ${formattedDate}
${recruiterName ? `Recruiter: ${recruiterName}\n` : ''}${recruiterEmail ? `Email: ${recruiterEmail}\n` : ''}
Suggested Message Template:
----------------------------------------
${suggestedTemplate}
----------------------------------------

Once you have followed up, open CareerPulse to record your result:
https://jobflow-jayesh.netlify.app/followups

--
CareerPulse • Automated Personal Job Application Tracker
  `.trim();

  return { subject, html, text };
}
