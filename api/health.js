module.exports = (req, res) => {
    res.setHeader('Access-Control-Allow-Origin', '*');

    res.status(200).json({
        status: 'ok',
        timestamp: new Date().toISOString(),
        environment: process.env.NODE_ENV || 'development',
        ai: {
            provider: 'gemini',
            configured: !!process.env.GEMINI_API_KEY,
            model: process.env.GEMINI_MODEL || 'gemini-3.5-flash-lite'
        }
    });
};
