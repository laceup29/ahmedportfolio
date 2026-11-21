/* ============================================
   PORTFOLIO BACKEND SERVER
   Node.js + Express
   ============================================ */

require('dotenv').config();
const express = require('express');
const cors = require('cors');
const path = require('path');

const app = express();
const PORT = process.env.PORT || 3000;

// ========== MIDDLEWARE ==========
const corsOptions = {
    origin: [
        'https://my-portfolio-full-ay64.onrender.com',
        'https://my-portfolio-alpha-ivory-28.vercel.app',
        'https://ahmedportfolio.site',
        'https://www.ahmedportfolio.site',
        'http://localhost:3000',
        'http://localhost:5173'
    ],
    credentials: true
};
app.use(cors(corsOptions));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Serve static frontend files
app.use(express.static(path.join(__dirname, '..')));

// ========== ENVIRONMENT VARIABLES ==========
const N8N_WEBHOOK_URL = process.env.N8N_WEBHOOK_URL;
const CONTACT_WEBHOOK_URL = process.env.CONTACT_WEBHOOK_URL;
const PORTFOLIO_DATA_URL = process.env.PORTFOLIO_DATA_URL || '../data/portfolio-data.json';
const CONTACT_EMAIL = process.env.CONTACT_EMAIL;
const SMTP_HOST = process.env.SMTP_HOST;
const SMTP_PORT = process.env.SMTP_PORT;
const SMTP_USER = process.env.SMTP_USER;
const SMTP_PASS = process.env.SMTP_PASS;

// ========== LOG STARTUP ==========
console.log('========================================');
console.log('Portfolio Backend Server');
console.log('========================================');
console.log(`Port: ${PORT}`);
console.log(`n8n Webhook: ${N8N_WEBHOOK_URL ? 'Configured' : 'NOT SET'}`);
console.log(`Email: ${CONTACT_EMAIL ? 'Configured' : 'NOT SET'}`);
console.log('========================================');

// ========== API ROUTES ==========

// Health check
app.get('/api/health', (req, res) => {
    res.json({
        status: 'ok',
        timestamp: new Date().toISOString(),
        environment: process.env.NODE_ENV || 'development',
        webhook: N8N_WEBHOOK_URL ? 'configured' : 'not configured'
    });
});

// Get config (for frontend)
app.get('/api/config', (req, res) => {
    res.json({
        botName: 'Muhammad Ahmed AI Assistant',
        websiteUrl: process.env.WEBSITE_URL || 'http://localhost:3000',
        debug: process.env.DEBUG === 'true'
    });
});

// Chatbot API - Send message to n8n
app.post('/api/chat', async (req, res) => {
    const { message, source } = req.body;

    console.log(`\n[CHAT] New message: "${message}"`);

    if (!message || message.trim() === '') {
        return res.status(400).json({ error: 'Message is required' });
    }

    // If n8n webhook is not configured, return error
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
            // Response is not JSON, return as text
            return res.json({ 
                reply: rawText || 'Empty response from AI',
                source: 'n8n'
            });
        }

        // Check for placeholder/default response
        if (data.myField === 'value' || (Object.keys(data).length === 1 && data.myField)) {
            console.log('[CHAT] Placeholder response detected');
            return res.json({
                reply: null,
                fallback: true,
                message: 'AI workflow not configured properly'
            });
        }

        // Try different response formats
        const responseKeys = ['reply', 'message', 'response', 'output', 'text', 'answer', 'content'];
        
        for (let key of responseKeys) {
            if (data[key] && typeof data[key] === 'string') {
                console.log(`[CHAT] Found response in key: ${key}`);
                return res.json({ reply: data[key], source: 'n8n' });
            }
        }

        // Check nested data
        if (data.data) {
            for (let key of responseKeys) {
                if (data.data[key] && typeof data.data[key] === 'string') {
                    return res.json({ reply: data.data[key], source: 'n8n' });
                }
            }
        }

        // Check for any string value
        const keys = Object.keys(data);
        for (let key of keys) {
            if (typeof data[key] === 'string' && data[key].length > 2) {
                return res.json({ reply: data[key], source: 'n8n' });
            }
        }

        // Return raw response
        return res.json({ 
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
});

// Contact form API - Forward to n8n webhook
app.post('/api/contact', async (req, res) => {
    const { name, email, subject, message } = req.body;

    console.log(`\n[CONTACT] New message from: ${name} (${email})`);

    if (!name || !email || !message) {
        return res.status(400).json({ error: 'Name, email, and message are required' });
    }

    // If n8n webhook is not configured, just log and return
    if (!CONTACT_WEBHOOK_URL) {
        console.log('[CONTACT] n8n webhook not configured. Message received:');
        console.log(`  Name: ${name}`);
        console.log(`  Email: ${email}`);
        console.log(`  Subject: ${subject}`);
        console.log(`  Message: ${message}`);
        return res.json({
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

        let data;
        try {
            data = JSON.parse(rawText);
        } catch (e) {
            // Response is not JSON, but request succeeded
            data = { raw: rawText };
        }

        console.log(`[CONTACT] n8n response:`, data);

        return res.json({
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
});

// ========== CATCH ALL - Serve Frontend ==========
app.get('*', (req, res) => {
    res.sendFile(path.join(__dirname, '..', 'index.html'));
});

// ========== START SERVER ==========
app.listen(PORT, () => {
    console.log(`\nServer running on http://localhost:${PORT}`);
    console.log(`Environment: ${process.env.NODE_ENV || 'development'}\n`);
});
