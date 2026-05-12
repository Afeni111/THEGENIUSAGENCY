/**
 * Genius AI Support Engine
 * Intelligent, Agency-Specific Support Agent
 * (c) 2026 The Genius Agency
 */

class GeniusAI {
    constructor() {
        this.knowledgeBase = {
            services: {
                keywords: ['service', 'offer', 'build', 'create', 'develop', 'design', 'web', 'app', 'software'],
                response: "We specialize in premium Web Development, Mobile App Development, UI/UX Design, and Custom Software Solutions. Every project is handled by an assigned expert in that specific field."
            },
            pricing: {
                keywords: ['price', 'cost', 'how much', 'fee', 'charge', 'rate', 'payment'],
                response: "We provide custom offers based on your specific project requirements. Once you start a consultation, our experts will evaluate your needs and send a detailed proposal with transparent pricing."
            },
            process: {
                keywords: ['how it works', 'process', 'steps', 'workflow', 'get started'],
                response: "Our process is simple: 1. Start a Consultation. 2. Receive a Custom Offer. 3. Secure Payment. 4. Expert assigned & Project begins. We focus on transparency and quality at every step."
            },
            timelines: {
                keywords: ['how long', 'time', 'duration', 'fast', 'deadline', 'delivery'],
                response: "Delivery times vary by project complexity. Small web projects typically take 1-2 weeks, while complex applications may take 4-8 weeks. Your custom offer will include a specific delivery timeframe."
            },
            experts: {
                keywords: ['who', 'team', 'expert', 'assigned', 'professional'],
                response: "Our team consists of hand-picked experts with years of experience. When you accept an offer, we assign a dedicated expert to your project who will be your primary contact throughout the build."
            },
            contact: {
                keywords: ['talk', 'human', 'person', 'support', 'help', 'email', 'phone', 'contact'],
                response: "I'm here for quick answers! If you need to speak with a human expert, just type 'human' or 'contact support' and I'll route you to our team immediately."
            }
        };

        this.handoffTrigger = ['human', 'person', 'expert', 'talk to someone', 'contact support', 'agent'];
        this.isHandoff = false;
        
        this.init();
    }

    init() {
        this.renderWidget();
        this.setupEventListeners();
    }

    renderWidget() {
        const widgetHTML = `
            <div id="genius-ai-widget">
                <button class="ai-launcher" id="ai-launcher">
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"></path></svg>
                </button>
                <div class="ai-window" id="ai-window">
                    <div class="ai-header" style="justify-content: space-between;">
                        <div style="display: flex; align-items: center; gap: 12px;">
                            <div style="width:10px;height:10px;background:#22c55e;border-radius:50%;box-shadow:0 0 10px #22c55e;"></div>
                            <div class="ai-header-info">
                                <h3>GeniusAI Agent</h3>
                                <p>Instant Support Online</p>
                            </div>
                        </div>
                        <button id="ai-close" style="background:none; border:none; color:var(--ai-muted); cursor:pointer; font-size:1.2rem; padding:5px;">&times;</button>
                    </div>
                    <div class="ai-messages" id="ai-messages">
                        <div class="ai-msg bot">Hello! I'm GeniusAI. How can I help you with your project today?</div>
                    </div>
                    <div class="ai-input-area">
                        <div class="ai-input-wrap">
                            <input type="text" id="ai-input" placeholder="Ask about services, pricing..." autocomplete="off">
                            <button class="ai-send-btn" id="ai-send">
                                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#000" stroke-width="3" stroke-linecap="round" stroke-linejoin="round"><line x1="22" y1="2" x2="11" y2="13"></line><polygon points="22 2 15 22 11 13 2 9 22 2"></polygon></svg>
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        `;
        document.body.insertAdjacentHTML('beforeend', widgetHTML);
    }

    setupEventListeners() {
        const launcher = document.getElementById('ai-launcher');
        const windowEl = document.getElementById('ai-window');
        const closeBtn = document.getElementById('ai-close');
        const sendBtn = document.getElementById('ai-send');
        const input = document.getElementById('ai-input');

        launcher.onclick = () => windowEl.classList.toggle('active');
        
        closeBtn.onclick = (e) => {
            e.stopPropagation();
            windowEl.classList.remove('active');
        };

        sendBtn.onclick = () => this.handleUserMessage();

        input.onkeypress = (e) => {
            if (e.key === 'Enter') this.handleUserMessage();
        };
    }

    async handleUserMessage() {
        const input = document.getElementById('ai-input');
        const text = input.value.trim();
        if (!text) return;

        this.addMessage(text, 'user');
        input.value = '';

        // Show typing indicator
        const typing = this.showTyping();
        
        // Artificial delay for realism
        await new Promise(r => setTimeout(r, 1000 + Math.random() * 1000));
        
        typing.remove();
        const response = this.generateResponse(text);
        this.addMessage(response, 'bot');
    }

    generateResponse(input) {
        const text = input.toLowerCase();

        // Check for handoff
        if (this.handoffTrigger.some(t => text.includes(t))) {
            return "I've notified our expert team! You can start a consultation through our platform to chat with them directly. Would you like me to take you to the contact page?";
        }

        // Check knowledge base
        for (const key in this.knowledgeBase) {
            const entry = this.knowledgeBase[key];
            if (entry.keywords.some(k => text.includes(k))) {
                return entry.response;
            }
        }

        return "That's a great question! For specific technical details or custom requests, I recommend speaking with one of our human experts. Just type 'expert' to be routed, or ask me about our services and pricing.";
    }

    addMessage(text, side) {
        const container = document.getElementById('ai-messages');
        const msg = document.createElement('div');
        msg.className = `ai-msg ${side}`;
        msg.textContent = text;
        container.appendChild(msg);
        container.scrollTop = container.scrollHeight;
    }

    showTyping() {
        const container = document.getElementById('ai-messages');
        const typing = document.createElement('div');
        typing.className = 'ai-typing';
        typing.innerHTML = '<span></span><span></span><span></span>';
        container.appendChild(typing);
        container.scrollTop = container.scrollHeight;
        return typing;
    }
}

// Initialize when DOM is ready
document.addEventListener('DOMContentLoaded', () => {
    window.geniusAI = new GeniusAI();
});
