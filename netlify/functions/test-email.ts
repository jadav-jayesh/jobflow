import type { Handler, HandlerEvent, HandlerContext } from '@netlify/functions';
import nodemailer from 'nodemailer';

const smtpHost = process.env.SMTP_HOST;
const smtpPort = parseInt(process.env.SMTP_PORT || '587', 10);
const smtpUser = process.env.SMTP_USER;
const smtpPass = process.env.SMTP_PASSWORD;
const smtpFrom = process.env.SMTP_FROM || 'JobFlow <reminders@jobflow.app>';

export const handler: Handler = async (event: HandlerEvent, _context: HandlerContext) => {
  if (event.httpMethod !== 'POST') {
    return { statusCode: 405, body: JSON.stringify({ error: 'Method not allowed' }) };
  }

  try {
    const { to, userName } = JSON.parse(event.body || '{}');

    if (!to) {
      return { statusCode: 400, body: JSON.stringify({ error: 'Recipient email is required.' }) };
    }

    if (!smtpHost || !smtpUser || !smtpPass) {
      return {
        statusCode: 400,
        body: JSON.stringify({
          error:
            'SMTP credentials (SMTP_HOST, SMTP_USER, SMTP_PASSWORD) are not configured in Netlify environment variables.',
        }),
      };
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

    // Verify SMTP connection
    await transporter.verify();

    // Send Test Email
    const info = await transporter.sendMail({
      from: smtpFrom,
      to,
      subject: '✅ JobFlow — Email Reminders Verification',
      text: `Hi ${userName || 'there'},\n\nThis is a test email confirming that your JobFlow email reminders are correctly configured.\n\nYou will receive timely reminders when your job application follow-ups are due.\n\nHappy job hunting!\n— The JobFlow Team`,
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 560px; margin: 0 auto; padding: 24px; border: 1px solid #e2e8f0; border-radius: 8px;">
          <h2 style="color: #16a34a; margin-top: 0;">✅ Reminders Verified</h2>
          <p>Hi <strong>${userName || 'there'}</strong>,</p>
          <p>This confirms that your <strong>JobFlow</strong> automated email reminders are properly connected and working.</p>
          <p>Whenever a job application follow-up becomes due, you will receive a daily morning reminder with the recruiter's contact information and a ready-to-use outreach message template.</p>
          <div style="background-color: #f0fdf4; border: 1px solid #bbf7d0; color: #166534; padding: 12px; border-radius: 6px; margin: 16px 0; font-size: 14px;">
            ✓ SMTP Delivery Connected Successfully
          </div>
          <p style="color: #94a3b8; font-size: 12px; margin-top: 24px;">JobFlow — Personal Job Application Tracker</p>
        </div>
      `,
    });

    return {
      statusCode: 200,
      body: JSON.stringify({
        message: `Test email successfully sent to ${to}`,
        messageId: info.messageId,
      }),
    };
  } catch (err: any) {
    console.error('Test email sending failed:', err);
    return {
      statusCode: 500,
      body: JSON.stringify({
        error: `SMTP Error: ${err.message || 'Failed to send test email'}`,
      }),
    };
  }
};
