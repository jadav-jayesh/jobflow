import nodemailer from 'nodemailer';

export default async (req: Request) => {
  if (req.method !== 'POST') {
    return new Response(JSON.stringify({ error: 'Method not allowed' }), {
      status: 405,
      headers: { 'Content-Type': 'application/json' },
    });
  }

  try {
    const { to, userName } = await req.json();

    if (!to) {
      return new Response(
        JSON.stringify({ error: 'Missing destination email address (to)' }),
        { status: 400, headers: { 'Content-Type': 'application/json' } }
      );
    }

    const smtpHost = process.env.SMTP_HOST;
    const smtpPort = parseInt(process.env.SMTP_PORT || '587', 10);
    const smtpUser = process.env.SMTP_USER;
    const smtpPass = process.env.SMTP_PASSWORD;
    const smtpFrom = process.env.SMTP_FROM || 'CareerPulse Reminders <no-reply@careerpulse.app>';

    if (!smtpHost || !smtpUser || !smtpPass) {
      return new Response(
        JSON.stringify({
          error:
            'SMTP environment variables are not configured in Netlify (SMTP_HOST, SMTP_PORT, SMTP_USER, SMTP_PASSWORD).',
        }),
        { status: 400, headers: { 'Content-Type': 'application/json' } }
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

    const testSubject = '✅ CareerPulse Test Reminder Notification';
    const testHtml = `
      <div style="font-family: sans-serif; max-width: 500px; margin: 0 auto; padding: 20px; border: 1px solid #e2e8f0; border-radius: 8px;">
        <h2 style="color: #2563eb;">CareerPulse Email Setup Verified!</h2>
        <p>Hi ${userName || 'User'},</p>
        <p>This is a test notification confirming that your SMTP server and email reminder configuration are working properly.</p>
        <p>When job application follow-ups are due, you will receive reminders here.</p>
        <hr style="border: none; border-top: 1px solid #f1f5f9; margin: 20px 0;" />
        <p style="font-size: 12px; color: #64748b;">CareerPulse • Automated Personal Job Application Tracker</p>
      </div>
    `;

    await transporter.sendMail({
      from: smtpFrom,
      to,
      subject: testSubject,
      text: `CareerPulse Email Setup Verified! Hi ${userName || 'User'}, your SMTP configuration is functioning properly.`,
      html: testHtml,
    });

    return new Response(
      JSON.stringify({ message: `Test email successfully dispatched to ${to}` }),
      { status: 200, headers: { 'Content-Type': 'application/json' } }
    );
  } catch (err: any) {
    console.error('[CareerPulse Test Email] Error sending test message:', err);
    return new Response(
      JSON.stringify({ error: err.message || 'Failed to send test email' }),
      { status: 500, headers: { 'Content-Type': 'application/json' } }
    );
  }
};
