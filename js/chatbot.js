/* ============================================
   CHATBOT JavaScript
   Backend API Integration
   ============================================ */

const Chatbot = (() => {
    // ========== CONFIGURATION ==========
    const API_BASE_URL = 'https://my-portfolio-full-ay64.onrender.com';
    const CHAT_API = `${API_BASE_URL}/api/chat`;
    const PORTFOLIO_DATA_URL = 'data/portfolio-data.json';
    const DEBUG = true;

    const GREETING_MESSAGE = "Hello! Welcome to Muhammad Ahmed's portfolio.\n\nI'm here to help you with information about services, projects, and how to get in touch.\n\nHow can I assist you today?";

    // ========== DOM ELEMENTS ==========
    let toggleBtn, windowEl, messagesContainer, inputField, sendBtn, closeBtn;
    let quickRepliesContainer, typingIndicator, welcomeScreen;

    // ========== STATE ==========
    let isOpen = false;
    let isTyping = false;
    let portfolioData = null;

    // ========== SVG ICONS ==========
    const ICONS = {
        chat: `<svg viewBox="0 0 24 24"><path d="M20 2H4c-1.1 0-2 .9-2 2v18l4-4h14c1.1 0 2-.9 2-2V4c0-1.1-.9-2-2-2zm0 14H6l-2 2V4h16v12z"/></svg>`,
        close: `<svg viewBox="0 0 24 24"><path d="M19 6.41L17.59 5 12 10.59 6.41 5 5 6.41 10.59 12 5 17.59 6.41 19 12 13.41 17.59 19 19 17.59 13.41 12z"/></svg>`,
        send: `<svg viewBox="0 0 24 24"><path d="M2.01 21L23 12 2.01 3 2 10l15 2-15 2z"/></svg>`,
        botAvatar: `<img src="assets/images/2nd.png" alt="Ahmed" class="msg-avatar-img">`,
        user: `<svg viewBox="0 0 24 24"><path d="M12 12c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm0 2c-2.67 0-8 1.34-8 4v2h16v-2c0-2.66-5.33-4-8-4z"/></svg>`
    };

    // ========== FETCH PORTFOLIO DATA ==========
    async function fetchPortfolioData() {
        try {
            const response = await fetch(PORTFOLIO_DATA_URL);
            if (!response.ok) throw new Error('Failed to fetch');
            portfolioData = await response.json();
            if (DEBUG) console.log('Portfolio data loaded');
            return portfolioData;
        } catch (error) {
            console.error('Error fetching portfolio data:', error);
            return null;
        }
    }

    // ========== INITIALIZE ==========
    async function init() {
        toggleBtn = document.querySelector('.chatbot-toggle');
        windowEl = document.querySelector('.chatbot-window');
        messagesContainer = document.querySelector('.chatbot-messages');
        inputField = document.querySelector('.chatbot-input input');
        sendBtn = document.querySelector('.chatbot-send');
        closeBtn = document.querySelector('.chatbot-close');
        quickRepliesContainer = document.querySelector('.quick-replies');
        typingIndicator = document.querySelector('.typing-indicator');
        welcomeScreen = document.getElementById('chatbotWelcome');

        if (!toggleBtn || !windowEl) return;

        await fetchPortfolioData();

        toggleBtn.addEventListener('click', toggleChat);
        closeBtn.addEventListener('click', toggleChat);
        sendBtn.addEventListener('click', sendMessage);
        inputField.addEventListener('keydown', (e) => {
            if (e.key === 'Enter' && !e.shiftKey) {
                e.preventDefault();
                sendMessage();
            }
        });

        document.querySelectorAll('.quick-reply-btn').forEach(btn => {
            btn.addEventListener('click', () => {
                const value = btn.getAttribute('data-value');
                inputField.value = value;
                sendMessage();
            });
        });

        // Suggestion buttons click handlers
        document.querySelectorAll('.suggestion-btn').forEach(btn => {
            btn.addEventListener('click', () => {
                const value = btn.getAttribute('data-value');
                inputField.value = value;
                sendMessage();
            });
        });
    }

    // ========== TOGGLE CHAT ==========
    function toggleChat() {
        isOpen = !isOpen;
        toggleBtn.classList.toggle('active', isOpen);
        windowEl.classList.toggle('open', isOpen);
        if (isOpen) inputField.focus();
    }

    // ========== HIDE WELCOME SCREEN ==========
    function hideWelcome() {
        if (welcomeScreen) {
            welcomeScreen.classList.add('hidden');
        }
    }

    // ========== ADD MESSAGE ==========
    function addMessage(text, sender) {
        const messageDiv = document.createElement('div');
        messageDiv.className = `chat-message ${sender}`;

        const avatarIcon = sender === 'bot' ? ICONS.botAvatar : ICONS.user;
        const time = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });

        let formattedText = text
            .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
            .replace(/\n/g, '<br>');

        messageDiv.innerHTML = `
            <div class="message-avatar">${avatarIcon}</div>
            <div class="message-content">
                <div class="message-bubble">${formattedText}</div>
                <span class="message-time">${time}</span>
            </div>
        `;

        messagesContainer.appendChild(messageDiv);
        scrollToBottom();
    }

    function addBotMessage(text) {
        addMessage(text, 'bot');
    }

    function addUserMessage(text) {
        addMessage(text, 'user');
    }

    // ========== TYPING INDICATOR ==========
    function showTyping() {
        isTyping = true;
        typingIndicator.classList.add('show');
        scrollToBottom();
        sendBtn.disabled = true;
        inputField.disabled = true;
        inputField.placeholder = 'AI is typing...';
    }

    function hideTyping() {
        isTyping = false;
        typingIndicator.classList.remove('show');
        sendBtn.disabled = false;
        inputField.disabled = false;
        inputField.placeholder = 'Type your message...';
        inputField.focus();
    }

    function scrollToBottom() {
        messagesContainer.scrollTop = messagesContainer.scrollHeight;
    }

    // ========== SEND MESSAGE ==========
    async function sendMessage() {
        const text = inputField.value.trim();
        if (!text || isTyping) return;

        hideWelcome();
        addUserMessage(text);
        inputField.value = '';
        showTyping();

        try {
            const response = await callBackendAPI(text);
            hideTyping();
            addBotMessage(response);
        } catch (error) {
            hideTyping();
            console.error('Chatbot error:', error);
            addBotMessage("I'm having trouble connecting right now. Please try again or use the contact form on the website.");
        }
    }

    // ========== CALL BACKEND API ==========
    async function callBackendAPI(message) {
        if (DEBUG) console.log('Calling backend API:', message);

        try {
            const response = await fetch(CHAT_API, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    message: message,
                    source: 'portfolio_chatbot'
                })
            });

            if (DEBUG) console.log('Backend response status:', response.status);

            if (!response.ok) {
                throw new Error(`Backend returned ${response.status}`);
            }

            const data = await response.json();
            if (DEBUG) console.log('Backend response:', data);

            // If backend returns AI response
            if (data.reply) {
                return data.reply;
            }

            // If backend needs fallback
            if (data.fallback) {
                return getDynamicResponse(message);
            }

            // If backend returns error
            if (data.error) {
                console.error('Backend error:', data.error);
                return getDynamicResponse(message);
            }

            // Unknown response format
            return JSON.stringify(data);

        } catch (error) {
            console.error('API call failed:', error);
            if (DEBUG) console.log('Falling back to local responses');
            return getDynamicResponse(message);
        }
    }

    // ========== DYNAMIC RESPONSES (Local Fallback) ==========
    function getDynamicResponse(message) {
        const lower = message.toLowerCase();

        if (!portfolioData) {
            return "I'm currently updating my information. Please use the contact form on the website or try again later.";
        }

        // SERVICES
        if (lower.includes('service') || lower.includes('what do you do') || lower.includes('offer')) {
            return formatServices();
        }

        // CONTACT
        if (lower.includes('contact') || lower.includes('reach') || lower.includes('email') || lower.includes('phone')) {
            return formatContact();
        }

        // PORTFOLIO
        if (lower.includes('portfolio') || lower.includes('project') || lower.includes('work')) {
            return formatProjects();
        }

        // EXPERIENCE
        if (lower.includes('experience') || lower.includes('resume') || lower.includes('career')) {
            return formatExperience();
        }

        // SKILLS
        if (lower.includes('skill') || lower.includes('technology') || lower.includes('tech stack')) {
            return formatSkills();
        }

        // PRICING
        if (lower.includes('price') || lower.includes('cost') || lower.includes('rate')) {
            return formatPricing();
        }

        // AVAILABILITY
        if (lower.includes('available') || lower.includes('freelance') || lower.includes('hire')) {
            return formatAvailability();
        }

        // ABOUT
        if (lower.includes('about') || lower.includes('who') || lower.includes('ahmed')) {
            return formatAbout();
        }

        // GREETING
        if (lower.includes('hello') || lower.includes('hi') || lower.includes('hey')) {
            return "Hello! How can I help you today?";
        }

        // THANKS
        if (lower.includes('thank') || lower.includes('thanks')) {
            return "You're welcome! Let me know if you need anything else.";
        }

        // HELP
        if (lower.includes('help')) {
            return "I can help you with:\n\n- **Services** - What Ahmed offers\n- **Contact** - Get in touch\n- **Portfolio** - View projects\n- **Experience** - Work history\n- **Pricing** - Project quotes\n\nJust type your question.";
        }

        return "Thanks for your message! I can help you with services, portfolio, contact info, and more. What would you like to know?";
    }

    // ========== RESPONSE FORMATTERS ==========

    function formatServices() {
        const services = portfolioData.services;
        let response = "**Our Services**\n\n";

        services.forEach((service, i) => {
            response += `**${i + 1}. ${service.title}**\n${service.description.split('—')[0].trim()}\n\n`;
        });

        response += "Would you like to know more about any specific service?";
        return response;
    }

    function formatContact() {
        const { personal, social } = portfolioData;
        return `**Get In Touch**\n\n**Email:** ${personal.email}\n**Phone:** ${personal.phone}\n**Location:** ${personal.location}\n\n**Social Media:**\n- **LinkedIn Profile:** linkedin.com/in/muhammad-ahmed-b7b321274\n- **GitHub Profile:** github.com/ahmedautomation\n- **WhatsApp:** +92 313-7817044`;
    }

    function formatProjects() {
        const projects = portfolioData.projects;
        let response = "**Our Portfolio**\n\n";

        const cats = { web: 'Web Development', pos: 'POS Systems', ai: 'AI Workflows' };

        Object.keys(cats).forEach(cat => {
            const items = projects.filter(p => p.category === cat);
            if (items.length > 0) {
                response += `**${cats[cat]}:**\n`;
                items.forEach(p => {
                    response += `- **${p.title}** (${p.year})\n`;
                });
                response += '\n';
            }
        });

        response += "Scroll up to the Portfolio section for more details.";
        return response;
    }

    function formatExperience() {
        const exp = portfolioData.experience;
        let response = "**Work Experience**\n\n";

        exp.forEach(e => {
            response += `**${e.title}**\n${e.company} | ${e.period}\n\n`;
        });

        return response;
    }

    function formatSkills() {
        const s = portfolioData.skills;
        return `**Technical Skills**\n\n**Frontend:** ${s.frontend.join(', ')}\n\n**Backend:** ${s.backend.join(', ')}\n\n**Database:** ${s.database.join(', ')}\n\n**AI/Automation:** ${s.aiAutomation.join(', ')}\n\n**Tools:** ${s.tools.join(', ')}`;
    }

    function formatPricing() {
        return `**Pricing Information**\n\nPricing depends on project scope and requirements. Ahmed offers competitive rates for:\n\n- Small projects\n- Medium-scale applications\n- Enterprise solutions\n\nFor an accurate quote, please contact:\n**Email:** ${portfolioData.personal.email}\n**WhatsApp:** ${portfolioData.personal.whatsapp}`;
    }

    function formatAvailability() {
        const p = portfolioData.personal;
        return `**Availability**\n\nAhmed is currently available for freelance projects.\n\n**Current Role:** ${p.currentRole} at ${p.currentCompany}\n\nTo discuss your project, please reach out:\n**Email:** ${p.email}\n**WhatsApp:** ${p.whatsapp}`;
    }

    function formatAbout() {
        const p = portfolioData.personal;
        return `**About Muhammad Ahmed**\n\n**Title:** ${p.title}\n**Location:** ${p.location}\n**Current Role:** ${p.currentRole} at ${p.currentCompany}\n\nAhmed specializes in AI automation, full-stack web development, and POS systems. He's passionate about building smart solutions that help businesses grow.`;
    }

    // ========== PUBLIC API ==========
    return {
        init,
        open: () => { if (!isOpen) toggleChat(); },
        close: () => { if (isOpen) toggleChat(); },
        sendMessage: (text) => {
            inputField.value = text;
            sendMessage();
        },
        refreshData: fetchPortfolioData
    };
})();

document.addEventListener('DOMContentLoaded', () => {
    Chatbot.init();
});
