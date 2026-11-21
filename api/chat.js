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

    const N8N_WEBHOOK_URL = process.env.N8N_WEBHOOK_URL;
    const { message, source } = req.body || {};

    console.log(`\n[CHAT] New message: "${message}"`);

    if (!message || message.trim() === '') {
        return res.status(400).json({ error: 'Message is required' });
    }

    if (!N8N_WEBHOOK_URL) {
        console.log('[CHAT] n8n webhook not configured');
        return res.status(503).json({
            error: 'AI service not configured',
            fallback: true
        });
    }

    try {
        console.log(`[CHAT] Forwarding to n8n: ${N8N_WEBHOOK_URL}`);

        const response = await fetch(N8N_WEBHOOK_URL, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                message: message,
                timestamp: new Date().toISOString(),
                source: source || 'portfolio_chatbot'
            })
        });

        console.log(`[CHAT] n8n response status: ${response.status}`);

        if (!response.ok) {
            throw new Error(`n8n webhook failed with status ${response.status}`);
        }

        const rawText = await response.text();
        console.log(`[CHAT] Raw response: ${rawText.substring(0, 200)}`);

        let data;
        try {
            data = JSON.parse(rawText);
        } catch (e) {
            return res.status(200).json({
                reply: rawText || 'Empty response from AI',
                source: 'n8n'
            });
        }

        if (data.myField === 'value' || (Object.keys(data).length === 1 && data.myField)) {
            console.log('[CHAT] Placeholder response detected');
            return res.status(200).json({
                reply: null,
                fallback: true,
                message: 'AI workflow not configured properly'
            });
        }

        const responseKeys = ['reply', 'message', 'response', 'output', 'text', 'answer', 'content'];

        for (let key of responseKeys) {
            if (data[key] && typeof data[key] === 'string') {
                console.log(`[CHAT] Found response in key: ${key}`);
                return res.status(200).json({ reply: data[key], source: 'n8n' });
            }
        }

        if (data.data) {
            for (let key of responseKeys) {
                if (data.data[key] && typeof data.data[key] === 'string') {
                    return res.status(200).json({ reply: data.data[key], source: 'n8n' });
                }
            }
        }

        const keys = Object.keys(data);
        for (let key of keys) {
            if (typeof data[key] === 'string' && data[key].length > 2) {
                return res.status(200).json({ reply: data[key], source: 'n8n' });
            }
        }

        return res.status(200).json({
            reply: JSON.stringify(data, null, 2),
            source: 'n8n_raw'
        });

    } catch (error) {
        console.error('[CHAT] Error:', error.message);
        return res.status(500).json({
            error: 'Failed to get AI response',
            message: error.message,
            fallback: true
        });
    }
};
