/* ============================================
   CONTACT API — Validation + Direct Contact Info
   No external webhook required
   ============================================ */

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

    return res.status(200).json({
        success: true,
        message: 'Thanks for reaching out! For a direct response, email ahmedghouri818@gmail.com or WhatsApp 03137817044.'
    });
};
