/* ============================================
   CHATBOT CONFIGURATION
   ============================================ */

const CONFIG = {
    // Backend API URL (Render deployment)
    BACKEND_URL: 'https://YOUR-SERVICE.onrender.com',

    // Website URL
    WEBSITE_URL: '',

    // Portfolio Data URL
    PORTFOLIO_DATA_URL: 'data/portfolio-data.json',

    // Debug Mode
    DEBUG: false,

    // Bot Name
    BOT_NAME: 'Muhammad Ahmed AI Assistant',

    // Greeting Message
    GREETING_MESSAGE: "Hello! Welcome to Muhammad Ahmed's portfolio.\n\nI'm here to help you with information about his skills, projects, services, and how to get in touch.\n\nHow can I assist you today?"
};

// Export for use in other files
if (typeof module !== 'undefined' && module.exports) {
    module.exports = CONFIG;
}
