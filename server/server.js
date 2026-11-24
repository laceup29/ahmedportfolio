/* ============================================
   PORTFOLIO BACKEND SERVER (Local Development)
   Node.js + Express
   For Vercel, api/ folder handles requests
   ============================================ */

require('dotenv').config();
const express = require('express');
const cors = require('cors');
const path = require('path');

const app = express();
const PORT = process.env.PORT || 3000;

// ========== MIDDLEWARE ==========
// origin: true reflects any origin (Vercel frontend + local dev)
const corsOptions = {
    origin: true,
    credentials: true
};
app.use(cors(corsOptions));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Serve static frontend files
app.use(express.static(path.join(__dirname, '..')));

// ========== LOG STARTUP ==========
console.log('========================================');
console.log('Portfolio Backend Server');
console.log('========================================');
console.log(`Port: ${PORT}`);
console.log(`Gemini: ${process.env.GEMINI_API_KEY ? 'Configured' : 'NOT SET'}`);
console.log('========================================');

// ========== API ROUTES ==========
// Uses same handlers as Vercel serverless functions
const chatHandler = require('../api/chat');
const contactHandler = require('../api/contact');
const healthHandler = require('../api/health');
const configHandler = require('../api/config');

app.get('/api/health', healthHandler);
app.get('/api/config', configHandler);
app.post('/api/chat', chatHandler);
app.post('/api/contact', contactHandler);

// ========== CATCH ALL - Serve Frontend ==========
app.get('*', (req, res) => {
    res.sendFile(path.join(__dirname, '..', 'index.html'));
});

// ========== START SERVER ==========
app.listen(PORT, () => {
    console.log(`\nServer running on http://localhost:${PORT}`);
    console.log(`Environment: ${process.env.NODE_ENV || 'development'}\n`);
});
