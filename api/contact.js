/* ============================================
   CONTACT API — Validation + SMTP Emails
   Sends: 1) Admin notification, 2) User auto-reply
   Configure via .env: SMTP_HOST/PORT/USER/PASS, ADMIN_EMAIL
   ============================================ */

const nodemailer = require('nodemailer');

// ---------- Helpers ----------
function escapeHtml(str) {
    return String(str)
        .replace(/&/g, '&amp;')
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;')
        .replace(/"/g, '&quot;')
        .replace(/'/g, '&#39;');
}

// Strip newlines to prevent email header injection
function headerSafe(str) {
    return String(str).replace(/[\r\n]+/g, ' ').trim();
}

function getTransporter() {
    const user = process.env.SMTP_USER;
    const pass = process.env.SMTP_PASS;
    if (!user || !pass) return null;

    const port = Number(process.env.SMTP_PORT) || 587;
    return nodemailer.createTransport({
        host: process.env.SMTP_HOST || 'smtp.gmail.com',
        port: port,
        secure: port === 465,
        auth: { user: user, pass: pass },
        pool: true,
        connectionTimeout: 15000,
        greetingTimeout: 10000
    });
}

// ---------- Handler ----------
module.exports = async (req, res) => {
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

    if (req.method === 'OPTIONS') {
        return res.status(200).end();
    }

    if (req.method !== 'POST') {
        return res.status(405).json({ error: 'Method not allowed' });
    }

    const { name, email, subject, message } = req.body || {};

    console.log(`\n[CONTACT] New message from: ${name} (${email})`);

    if (!name || !email || !message) {
        return res.status(400).json({ error: 'Name, email, and message are required' });
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(String(email))) {
        return res.status(400).json({ error: 'Valid email is required' });
    }

    console.log(`[CONTACT] Subject: ${subject || '(none)'}`);
    console.log(`[CONTACT] Message: ${String(message).substring(0, 200)}`);

    const transporter = getTransporter();
    const smtpUser = process.env.SMTP_USER;
    const adminEmail = process.env.ADMIN_EMAIL || smtpUser;

    // SMTP not configured yet — return direct contact info (previous behavior)
    if (!transporter) {
        console.log('[CONTACT] SMTP not configured — skipping emails');
        return res.status(200).json({
            success: true,
            message: 'Thanks for reaching out! For a direct response, email ahmedghouri818@gmail.com or WhatsApp 03137817044.'
        });
    }

    const safeName = escapeHtml(headerSafe(name));
    const safeEmail = escapeHtml(headerSafe(email));
    const safeSubject = escapeHtml(headerSafe(subject || '(no subject)'));
    const safeMessage = escapeHtml(String(message));
    const plainSubject = headerSafe(subject || '(no subject)');

    const adminMail = {
        from: `"Portfolio Website" <${smtpUser}>`,
        to: adminEmail,
        replyTo: `${headerSafe(name)} <${headerSafe(email)}>`,
        subject: `New Contact Query: ${plainSubject}`,
        html: `
            <div style="font-family:Arial,Helvetica,sans-serif;max-width:600px;margin:0 auto;color:#333">
                <h2 style="color:#ff6b00;border-bottom:2px solid #ff6b00;padding-bottom:10px;margin-bottom:16px">New Contact Query</h2>
                <table style="width:100%;border-collapse:collapse;font-size:14px">
                    <tr><td style="padding:6px 0;font-weight:bold;width:90px">Name:</td><td>${safeName}</td></tr>
                    <tr><td style="padding:6px 0;font-weight:bold">Email:</td><td>${safeEmail}</td></tr>
                    <tr><td style="padding:6px 0;font-weight:bold">Subject:</td><td>${safeSubject}</td></tr>
                </table>
                <div style="background:#f7f7f7;border:1px solid #eee;border-radius:8px;padding:16px;margin-top:14px;font-size:14px;line-height:1.6;white-space:pre-wrap">${safeMessage}</div>
                <p style="color:#888;font-size:12px;margin-top:16px">Reply directly to this email to respond to ${safeName}.</p>
            </div>`
    };

    const userMail = {
        from: `"Muhammad Ahmed" <${smtpUser}>`,
        to: headerSafe(email),
        subject: 'Thanks for reaching out — I will get back to you soon',
        html: `
            <div style="font-family:Arial,Helvetica,sans-serif;max-width:600px;margin:0 auto;color:#333">
                <h2 style="color:#ff6b00;margin-bottom:16px">Hi ${safeName},</h2>
                <p style="font-size:14px;line-height:1.7">Thanks for reaching out! I have received your message regarding <strong>${safeSubject}</strong>.</p>
                <p style="font-size:14px;line-height:1.7">I will review it and get back to you within 24 hours.</p>
                <div style="background:#f7f7f7;border:1px solid #eee;border-radius:8px;padding:14px 16px;margin-top:12px;font-size:14px;line-height:1.8">
                    <strong>In a hurry? Reach me directly:</strong><br>
                    Email: ahmedghouri818@gmail.com<br>
                    WhatsApp: +92 313-7817044
                </div>
                <p style="font-size:14px;margin-top:18px">Best regards,<br><strong>Muhammad Ahmed</strong></p>
            </div>`
    };

    try {
        const results = await Promise.allSettled([
            transporter.sendMail(adminMail),
            transporter.sendMail(userMail)
        ]);

        if (results[0].status === 'rejected') {
            throw results[0].reason;
        }
        if (results[1].status === 'rejected') {
            console.warn('[CONTACT] User auto-reply failed:', results[1].reason.message);
        }

        console.log('[CONTACT] Emails sent — admin notification + user auto-reply');

        return res.status(200).json({
            success: true,
            message: 'Thanks! Your message has been sent successfully — a confirmation email is on its way to your inbox. I will get back to you soon.'
        });

    } catch (error) {
        console.error('[CONTACT] Email send failed:', error.message);
        return res.status(500).json({
            error: 'Failed to send email. Please try again or email ahmedghouri818@gmail.com directly.'
        });
    }
};
