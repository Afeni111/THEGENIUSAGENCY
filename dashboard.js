const SUPABASE_URL = 'https://tjxyxasorunhrtvstwpa.supabase.co';
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InRqeHl4YXNvcnVuaHJ0dnN0d3BhIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzcwNzU3NTQsImV4cCI6MjA5MjY1MTc1NH0.YEZPhnJmFAk4IDxd-6LlhKAZfGTkODfGr1FJteA99vo';

const supabase = window.supabase.createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

let currentUser = null;
let currentConversationId = null;

// DOM Elements
const convList = document.getElementById('conversation-list');
const messagesList = document.getElementById('messages-list');
const msgInput = document.getElementById('message-input');
const sendBtn = document.getElementById('send-msg-btn');
const activeChatTitle = document.getElementById('active-chat-title');
const activeChatStatus = document.getElementById('active-chat-status');

const adminOfferBtn = document.getElementById('admin-offer-btn');
const adminDeliverBtn = document.getElementById('admin-deliver-btn');
const clientRevisionBtn = document.getElementById('client-revision-btn');
const clientCompleteBtn = document.getElementById('client-complete-btn');

let activeProjectId = null;

// Init
async function initDashboard() {
    const { data: { session } } = await supabase.auth.getSession();
    
    if (!session) {
        // Redirect to a login page or show a login modal
        alert('Authentication required. Redirecting to login...');
        // For Phase 3, we'll temporarily mock a login or block here
        return;
    }

    currentUser = session.user;
    loadConversations();
    setupRealtimeSubscription();
}

async function loadConversations() {
    convList.innerHTML = '<div style="padding: 20px; color:#666;">Loading...</div>';
    
    // Fetch conversations where user is client or assigned_agent
    const { data, error } = await supabase
        .from('conversations')
        .select(`
            id,
            status,
            project_briefs(title)
        `)
        .order('created_at', { ascending: false });

    if (error) {
        console.error(error);
        convList.innerHTML = '<div style="padding: 20px; color:red;">Failed to load.</div>';
        return;
    }

    if (!data.length) {
        convList.innerHTML = '<div style="padding: 20px; color:#666;">No active projects.</div>';
        return;
    }

    convList.innerHTML = data.map(conv => `
        <div class="conv-item" onclick="selectConversation('${conv.id}', '${conv.project_briefs?.[0]?.title || 'Untitled Project'}')">
            <div class="conv-title">${conv.project_briefs?.[0]?.title || 'Untitled Project'}</div>
            <div class="conv-preview">Status: ${conv.status}</div>
        </div>
    `).join('');
}

async function selectConversation(id, title) {
    currentConversationId = id;
    activeChatTitle.textContent = title;
    
    // Hide all action buttons initially
    [adminOfferBtn, adminDeliverBtn, clientRevisionBtn, clientCompleteBtn].forEach(b => { if(b) b.style.display = 'none'; });
    
    messagesList.innerHTML = '<div style="margin: auto; color: #666;">Loading messages...</div>';
    
    // Fetch related Project to determine status for UI buttons
    const { data: projectData } = await supabase
        .from('projects')
        .select('*')
        .eq('client_id', currentUser.id) // Naive for Phase 5 demo. Admins would query by conversation link.
        .order('created_at', { ascending: false })
        .limit(1);

    const project = projectData?.[0];
    if (project) {
        activeProjectId = project.id;
        activeChatStatus.innerHTML = `Project Status: <span style="color: var(--primary-yellow)">${project.status.toUpperCase()}</span>`;
        
        // Show buttons based on role and status
        if (currentUser.role === 'admin') {
            if (project.status === 'in_progress' || project.status === 'revision') {
                adminDeliverBtn.style.display = 'inline-block';
            }
        } else {
            if (project.status === 'delivered') {
                clientRevisionBtn.style.display = 'inline-block';
                clientCompleteBtn.style.display = 'inline-block';
            }
        }
    } else {
        activeProjectId = null;
        activeChatStatus.innerHTML = `Project Status: <span style="color: var(--primary-yellow)">Pending / Negotiating</span>`;
        if (currentUser.role === 'admin') {
            adminOfferBtn.style.display = 'inline-block';
        }
    }

    const { data, error } = await supabase
        .from('messages')
        .select('*')
        .eq('conversation_id', id)
        .order('created_at', { ascending: true });

    if (error) {
        console.error(error);
        return;
    }

    renderMessages(data);
}

function renderMessages(msgs) {
    if (!msgs.length) {
        messagesList.innerHTML = '<div style="margin: auto; color: #666;">Say hello to start the project!</div>';
        return;
    }

    messagesList.innerHTML = msgs.map(msg => {
        const isMe = msg.sender_id === currentUser?.id;
        const className = isMe ? 'agency' : 'client'; // Simplified logic
        
        if (msg.type === 'offer' || msg.type === 'system') {
            let offerData = {};
            try { offerData = JSON.parse(msg.content); } catch (e) {}
            
            if (msg.type === 'system') {
                return `<div class="msg" style="align-self: center; background: rgba(255,255,255,0.05); color: #aaa; text-align: center; border-radius: 8px; width: 100%;">${msg.content}</div>`;
            }
            
            // Offer Block
            return `
                <div class="offer-block">
                    <h4 class="offer-title">Custom Offer: ${offerData.title || 'Project'}</h4>
                    <div class="offer-price">$${offerData.price || '0.00'}</div>
                    ${currentUser.role !== 'admin' ? `<button class="btn btn-primary" onclick="payOffer('${offerData.offer_id}', ${offerData.price})" style="padding: 10px 20px; font-weight: 600; width: 100%; background: linear-gradient(90deg, #F5C542, #D4AF37, #B8962E); color: #000; border: none; cursor: pointer;">Accept & Pay</button>` : '<div style="color: #aaa; font-size: 0.85rem;">Waiting for client payment...</div>'}
                </div>
            `;
        }

        return `
            <div class="msg ${className}">
                ${msg.content}
                <span class="msg-time">${new Date(msg.created_at).toLocaleTimeString()}</span>
            </div>
        `;
    }).join('');
    
    messagesList.scrollTop = messagesList.scrollHeight;
}

// Send Message
sendBtn.addEventListener('click', async () => {
    if (!currentConversationId || !msgInput.value.trim()) return;

    const text = msgInput.value.trim();
    msgInput.value = '';

    const { error } = await supabase
        .from('messages')
        .insert([{
            conversation_id: currentConversationId,
            sender_id: currentUser.id,
            sender_role: 'admin', // Hardcoded temporarily
            content: text,
            type: 'text'
        }]);

    if (error) {
        alert('Failed to send message');
    }
});

// Realtime
function setupRealtimeSubscription() {
    supabase
        .channel('public:messages')
        .on('postgres_changes', { event: 'INSERT', schema: 'public', table: 'messages' }, payload => {
            if (payload.new.conversation_id === currentConversationId) {
                // Append new message
                const msg = payload.new;
                const isMe = msg.sender_id === currentUser?.id;
                const className = isMe ? 'agency' : 'client';
                if (msg.type === 'offer' || msg.type === 'system') {
                    // Quick reload of all messages to render the block correctly
                    selectConversation(currentConversationId, activeChatTitle.textContent);
                    return;
                }

                const msgHtml = `
                    <div class="msg ${className}">
                        ${msg.content}
                        <span class="msg-time">${new Date(msg.created_at).toLocaleTimeString()}</span>
                    </div>
                `;
                messagesList.insertAdjacentHTML('beforeend', msgHtml);
                messagesList.scrollTop = messagesList.scrollHeight;
            }
        })
        .subscribe();
}

async function logout() {
    await supabase.auth.signOut();
    window.location.reload();
}

// ==========================================
// PHASE 4: OFFERS & PAYSTACK
// ==========================================
const adminOfferBtn = document.getElementById('admin-offer-btn');
const offerModal = document.getElementById('offer-modal');
const closeOfferBtn = document.getElementById('close-offer-btn');
const offerForm = document.getElementById('offer-form');

if (adminOfferBtn) {
    adminOfferBtn.addEventListener('click', () => offerModal.style.display = 'flex');
    closeOfferBtn.addEventListener('click', () => offerModal.style.display = 'none');
    
    offerForm.addEventListener('submit', async (e) => {
        e.preventDefault();
        
        const btn = offerForm.querySelector('button');
        btn.disabled = true;
        btn.textContent = 'Sending...';

        try {
            const res = await fetch('/api/offers', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    conversation_id: currentConversationId,
                    client_id: currentUser.id, // In a real app, grab from conversation logic
                    title: document.getElementById('offer-title').value,
                    description: document.getElementById('offer-desc').value,
                    price: document.getElementById('offer-price').value,
                    delivery_days: document.getElementById('offer-days').value
                })
            });

            if (res.ok) {
                offerModal.style.display = 'none';
                offerForm.reset();
            } else {
                alert('Failed to send offer');
            }
        } catch (err) {
            alert('Error connecting to backend');
        } finally {
            btn.disabled = false;
            btn.textContent = 'Generate & Send Offer';
        }
    });
}

// Paystack Checkout Initialization
async function payOffer(offerId, amount) {
    try {
        const res = await fetch('/api/paystack/initialize', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                email: currentUser.email,
                amount: amount,
                offer_id: offerId,
                client_id: currentUser.id
            })
        });

        const data = await res.json();
        
        if (data.authorization_url) {
            // Redirect to Paystack Checkout popup
            window.open(data.authorization_url, '_blank', 'width=600,height=800');
        } else {
            alert('Failed to initialize Paystack checkout.');
        }

    } catch (err) {
        alert('Payment Error: Ensure the Node.js backend is running.');
    }
}

// ==========================================
// PHASE 5: DELIVERY & REVISIONS
// ==========================================

async function handleProjectAction(endpoint) {
    if (!activeProjectId || !currentConversationId) return;
    try {
        const res = await fetch(`/api/projects/${endpoint}`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                project_id: activeProjectId,
                conversation_id: currentConversationId
            })
        });
        if (res.ok) {
            selectConversation(currentConversationId, activeChatTitle.textContent);
        } else {
            alert('Action failed');
        }
    } catch (err) {
        alert('Server connection error.');
    }
}

if (adminDeliverBtn) adminDeliverBtn.addEventListener('click', () => handleProjectAction('deliver'));
if (clientRevisionBtn) clientRevisionBtn.addEventListener('click', () => handleProjectAction('revision'));
if (clientCompleteBtn) clientCompleteBtn.addEventListener('click', () => handleProjectAction('complete'));

// Start
initDashboard();
