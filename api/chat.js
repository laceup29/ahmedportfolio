/* ============================================
   CHAT API — Gemini-powered Knowledge Assistant
   Uses data/knowledge.json + Section 22 rules
   ============================================ */

const knowledge = require('../data/knowledge.json');

const GEMINI_MODELS = [
    process.env.GEMINI_MODEL || 'gemini-3.5-flash-lite',
    'gemini-3.5-flash'
];

const GEMINI_TIMEOUT_MS = 15000;

// ---------- Build system prompt (once, cached) ----------
let cachedSystemText = null;
function buildSystemPrompt() {
    if (cachedSystemText) return cachedSystemText;

    const kbSections = knowledge.sections
        .map(s => `### ${s.id}. ${s.title}\n${s.content}`)
        .join('\n\n');

    cachedSystemText = [
        knowledge.systemInstructions,
        '',
        '========== AUTHORIZED KNOWLEDGE BASE ==========',
        '',
        `Profile: ${knowledge.meta.name} — ${knowledge.meta.title}`,
        `Location: ${knowledge.meta.location} | Email: ${knowledge.meta.email} | Phone/WhatsApp: ${knowledge.meta.phone}`,
        '',
        kbSections,
        '',
        '========== END OF KNOWLEDGE BASE ==========',
        '',
        'Always answer strictly from the knowledge base above. If something is not in the knowledge base, say it has not been provided. Never invent details.'
    ].join('\n');

    return cachedSystemText;
}

// ---------- Call Gemini with model fallback ----------
async function callGemini(apiKey, contents) {
    const systemText = buildSystemPrompt();
    let lastError = null;

    for (const model of GEMINI_MODELS) {
        const url = `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${apiKey}`;
        const body = {
            systemInstruction: { parts: [{ text: systemText }] },
            contents: contents,
            generationConfig: {
                temperature: 0.6,
                maxOutputTokens: 768,
                topP: 0.95
            }
        };

        try {
            const controller = new AbortController();
            const timer = setTimeout(() => controller.abort(), GEMINI_TIMEOUT_MS);

            const response = await fetch(url, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(body),
                signal: controller.signal
            });
            clearTimeout(timer);

            if (!response.ok) {
                const errText = await response.text();
                console.error(`[CHAT] ${model} HTTP ${response.status}: ${errText.substring(0, 300)}`);
                lastError = new Error(`${model} returned ${response.status}`);
                continue;
            }

            const data = await response.json();
            const candidate = data.candidates && data.candidates[0];

            if (!candidate || !candidate.content || !candidate.content.parts) {
                console.error(`[CHAT] ${model} empty candidate:`, JSON.stringify(data).substring(0, 300));
                lastError = new Error(`${model} returned empty response`);
                continue;
            }

            const text = candidate.content.parts
                .map(p => p.text || '')
                .join('')
                .trim();

            if (!text) {
                lastError = new Error(`${model} returned empty text`);
                continue;
            }

            console.log(`[CHAT] OK via ${model} (${text.length} chars)`);
            return { reply: text, model };

        } catch (err) {
            console.error(`[CHAT] ${model} error:`, err.message);
            lastError = err;
        }
    }

    throw lastError || new Error('All Gemini models failed');
}

// ---------- Build conversation contents ----------
function buildContents(message, history) {
    const contents = [];

    // Prior conversation (optional)
    if (Array.isArray(history)) {
        for (const turn of history.slice(-10)) {
            if (!turn || !turn.role || !turn.content) continue;
            if (turn.role !== 'user' && turn.role !== 'assistant') continue;
            contents.push({
                role: turn.role,
                parts: [{ text: String(turn.content).substring(0, 2000) }]
            });
        }
    }

    // Current user message
    contents.push({
        role: 'user',
        parts: [{ text: String(message).substring(0, 4000) }]
    });

    // Gemini requires last content to be 'user'
    if (contents[contents.length - 1].role !== 'user') {
        contents.push({ role: 'user', parts: [{ text: String(message).substring(0, 4000) }] });
    }

    return contents;
}

// ---------- Vercel serverless handler ----------
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

    const { message, history } = req.body || {};

    if (!message || !String(message).trim()) {
        return res.status(400).json({ error: 'Message is required' });
    }

    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) {
        console.error('[CHAT] GEMINI_API_KEY not set');
        return res.status(503).json({
            error: 'AI service not configured',
            fallback: true
        });
    }

    console.log(`[CHAT] "${String(message).substring(0, 120)}"`);

    try {
        const contents = buildContents(message, history);
        const result = await callGemini(apiKey, contents);

        return res.status(200).json({
            reply: result.reply,
            source: 'gemini',
            model: result.model
        });

    } catch (error) {
        console.error('[CHAT] Fatal:', error.message);
        return res.status(500).json({
            error: 'Failed to get AI response',
            message: error.message,
            fallback: true
        });
    }
};
