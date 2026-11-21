module.exports = async (req, res) => {
    // CORS
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

    if (req.method === 'OPTIONS') {
        return res.status(200).end();
    }

    if (req.method !== 'POST') {
        return res.status(405).json({ error: 'Method not allowed' });
    }

    const CONTACT_WEBHOOK_URL = process.env.CONTACT_WEBHOOK_URL;
    const { name, email, subject, message } = req.body || {};

    console.log(`\n[CONTACT] New message from: ${name} (${email})`);

    if (!name || !email || !message) {
        return res.status(400).json({ error: 'Name, email, and message are required' });
    }

    if (!CONTACT_WEBHOOK_URL) {
        console.log('[CONTACT] n8n webhook not configured. Message received:');
        console.log(`  Name: ${name}`);
        console.log(`  Email: ${email}`);
        console.log(`  Subject: ${subject}`);
        console.log(`  Message: ${message}`);
        return res.status(200).json({
            success: true,
            message: 'Message received! (Webhook not configured yet)'
        });
    }

    try {
        console.log(`[CONTACT] Forwarding to n8n: ${CONTACT_WEBHOOK_URL}`);

        const response = await fetch(CONTACT_WEBHOOK_URL, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                name: name,
                email: email,
                subject: subject,
                message: message,
                timestamp: new Date().toISOString(),
                source: 'portfolio_contact_form'
            })
        });

        console.log(`[CONTACT] n8n response status: ${response.status}`);

        if (!response.ok) {
            const errorText = await response.text();
            console.error(`[CONTACT] n8n error response: ${errorText}`);
            throw new Error(`n8n webhook failed with status ${response.status}`);
        }

        const rawText = await response.text();
        console.log(`[CONTACT] n8n raw response: ${rawText.substring(0, 200)}`);

        return res.status(200).json({
            success: true,
            message: 'Message sent successfully!'
        });

    } catch (error) {
        console.error('[CONTACT] Error forwarding to n8n:', error.message);
        return res.status(500).json({
            success: false,
            error: 'Failed to send message',
            message: error.message
        });
    }
};
