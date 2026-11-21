/* ============================================
   CHATBOT CONFIGURATION
   Change these values as needed
   ============================================ */

const CONFIG = {
    // Backend API URL (empty = same origin, works on Vercel/Render)
    BACKEND_URL: '',
    
    // n8n Webhook URL - Production
    N8N_WEBHOOK_URL: 'https://n8n.srv1146250.hstgr.cloud/webhook/my_portfolio',
    
    // Portfolio Data URL
    PORTFOLIO_DATA_URL: 'data/portfolio-data.json',
    
    // Website URL
    WEBSITE_URL: '',
    
    // Debug Mode - Set to true to see console logs
    DEBUG: true,
    
    // Bot Name
    BOT_NAME: 'Muhammad Ahmed AI Assistant',
    
    // Greeting Message
    GREETING_MESSAGE: "Hello! Welcome to Muhammad Ahmed's portfolio.\n\nI'm here to help you with information about services, projects, and how to get in touch.\n\nHow can I assist you today?",
    
    // n8n Response Format Keys (in order of priority)
    RESPONSE_KEYS: ['reply', 'message', 'response', 'output', 'text', 'answer', 'content']
};

// Export for use in other files
if (typeof module !== 'undefined' && module.exports) {
    module.exports = CONFIG;
}
