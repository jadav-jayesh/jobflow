export interface FollowupEmailContext {
  userName: string;
  companyName: string;
  jobRole: string;
  appliedDate: string;
  sequenceNumber: number;
  method?: string | null;
  jobUrl?: string | null;
  recruiterName?: string | null;
  recruiterEmail?: string | null;
  appUrl?: string;
}

export function generateFollowupReminderEmail(ctx: FollowupEmailContext): {
  subject: string;
  text: string;
  html: string;
} {
  const subject = `🔔 Job Follow-up Reminder — ${ctx.companyName}`;
  const greeting = ctx.recruiterName ? `Dear ${ctx.recruiterName}` : 'Hi';
  const appLink = ctx.appUrl || 'https://jobflow.netlify.app';

  const suggestedMessage = `${greeting},

I wanted to follow up regarding my application for the ${ctx.jobRole} position. I'm still very interested in the opportunity with ${ctx.companyName} and would be happy to provide any additional information if required.

Thank you,
${ctx.userName}`;

  const text = `Hi ${ctx.userName},

You have a job follow-up due today.

Company: ${ctx.companyName}
Role: ${ctx.jobRole}
Applied: ${ctx.appliedDate}
Follow-up: #${ctx.sequenceNumber}
Preferred Method: ${ctx.method || 'LinkedIn / Email'}
${ctx.jobUrl ? `Job URL: ${ctx.jobUrl}` : ''}
${ctx.recruiterName ? `Recruiter: ${ctx.recruiterName}` : ''}
${ctx.recruiterEmail ? `Recruiter Email: ${ctx.recruiterEmail}` : ''}

Suggested message:
----------------------------------------
${suggestedMessage}
----------------------------------------

Open JobFlow to log your follow-up:
${appLink}

--
JobFlow — Personal Job Application Tracker
`;

  const html = `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <style>
    body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; line-height: 1.6; color: #1e293b; background-color: #f8fafc; margin: 0; padding: 24px; }
    .card { background-color: #ffffff; border-radius: 10px; max-width: 580px; margin: 0 auto; padding: 32px; border: 1px solid #e2e8f0; box-shadow: 0 4px 6px -1px rgba(0,0,0,0.05); }
    .header { border-bottom: 2px solid #3b82f6; padding-bottom: 16px; margin-bottom: 24px; }
    .header h2 { margin: 0; color: #1e293b; font-size: 20px; }
    .badge { display: inline-block; background-color: #eff6ff; color: #2563eb; font-weight: 600; font-size: 12px; padding: 4px 10px; border-radius: 9999px; margin-bottom: 12px; }
    .info-table { width: 100%; border-collapse: collapse; margin-bottom: 24px; }
    .info-table td { padding: 8px 0; font-size: 14px; }
    .info-table td.label { color: #64748b; width: 140px; font-weight: 500; }
    .info-table td.value { color: #0f172a; font-weight: 600; }
    .template-box { background-color: #f1f5f9; border-left: 4px solid #3b82f6; border-radius: 6px; padding: 16px; margin-bottom: 24px; font-size: 14px; white-space: pre-line; color: #334155; }
    .btn { display: inline-block; background-color: #2563eb; color: #ffffff !important; font-weight: 600; text-decoration: none; padding: 12px 24px; border-radius: 6px; font-size: 14px; text-align: center; }
    .footer { text-align: center; margin-top: 24px; font-size: 12px; color: #94a3b8; }
  </style>
</head>
<body>
  <div class="card">
    <div class="header">
      <span class="badge">Follow-up #${ctx.sequenceNumber} Due Today</span>
      <h2>🔔 ${ctx.companyName} — ${ctx.jobRole}</h2>
    </div>

    <p style="margin-top:0;">Hi <strong>${ctx.userName}</strong>,</p>
    <p>You have a scheduled follow-up due today for your application at <strong>${ctx.companyName}</strong>.</p>

    <table class="info-table">
      <tr>
        <td class="label">Company:</td>
        <td class="value">${ctx.companyName}</td>
      </tr>
      <tr>
        <td class="label">Role:</td>
        <td class="value">${ctx.jobRole}</td>
      </tr>
      <tr>
        <td class="label">Applied Date:</td>
        <td class="value">${ctx.appliedDate}</td>
      </tr>
      <tr>
        <td class="label">Follow-up:</td>
        <td class="value">#${ctx.sequenceNumber}</td>
      </tr>
      ${ctx.recruiterName ? `<tr><td class="label">Recruiter:</td><td class="value">${ctx.recruiterName}</td></tr>` : ''}
      ${ctx.recruiterEmail ? `<tr><td class="label">Recruiter Email:</td><td class="value"><a href="mailto:${ctx.recruiterEmail}">${ctx.recruiterEmail}</a></td></tr>` : ''}
      ${ctx.jobUrl ? `<tr><td class="label">Job Link:</td><td class="value"><a href="${ctx.jobUrl}" target="_blank">View Posting</a></td></tr>` : ''}
    </table>

    <p style="font-weight: 600; margin-bottom: 8px; font-size: 14px;">Suggested Outreach Template:</p>
    <div class="template-box">${suggestedMessage}</div>

    <div style="text-align: center; margin-top: 28px; margin-bottom: 12px;">
      <a href="${appLink}" class="btn" target="_blank">Open JobFlow &amp; Record Result</a>
    </div>

    <div class="footer">
      Sent by JobFlow personal productivity tracker.
    </div>
  </div>
</body>
</html>
`;

  return { subject, text, html };
}
