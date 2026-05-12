/* ================================================================
   THE GENIUS AGENCY — REALTIME CHAT ENGINE
   ================================================================ */

class ChatEngine {
  constructor(conversationId, currentUser, onMessage, onTyping, onStatusChange) {
    this.conversationId = conversationId;
    this.currentUser = currentUser;
    this.onMessage = onMessage;
    this.onTyping = onTyping;
    this.onStatusChange = onStatusChange;
    this.channel = null;
    this.typingTimer = null;
    this.isTyping = false;
  }

  subscribe() {
    this.channel = _supabase
      .channel(`chat:${this.conversationId}`)
      .on('postgres_changes', {
        event: 'INSERT', schema: 'public', table: 'messages',
        filter: `conversation_id=eq.${this.conversationId}`
      }, async (payload) => {
        const msg = payload.new;
        const { data: profile } = await getProfile(msg.sender_id);
        if (this.onMessage) this.onMessage({ ...msg, profiles: profile });
      })
      .on('postgres_changes', {
        event: 'UPDATE', schema: 'public', table: 'typing_indicators',
        filter: `conversation_id=eq.${this.conversationId}`
      }, (payload) => {
        if (payload.new.user_id !== this.currentUser.id && this.onTyping) {
          this.onTyping(payload.new);
        }
      })
      .on('postgres_changes', {
        event: 'UPDATE', schema: 'public', table: 'conversations',
        filter: `id=eq.${this.conversationId}`
      }, (payload) => {
        if (this.onStatusChange) this.onStatusChange(payload.new);
      })
      .subscribe();
  }

  unsubscribe() {
    if (this.channel) _supabase.removeChannel(this.channel);
  }

  handleTypingInput() {
    if (!this.isTyping) {
      this.isTyping = true;
      setTyping(this.conversationId, this.currentUser.id, true);
    }
    clearTimeout(this.typingTimer);
    this.typingTimer = setTimeout(() => {
      this.isTyping = false;
      setTyping(this.conversationId, this.currentUser.id, false);
    }, 2000);
  }

  async send(content, type = 'normal', metadata = null) {
    this.isTyping = false;
    clearTimeout(this.typingTimer);
    setTyping(this.conversationId, this.currentUser.id, false);
    return sendMessage(this.conversationId, this.currentUser.id, this.currentUser.role, content, type, metadata);
  }

  async sendFile(file) {
    const { url, error } = await uploadMessageFile(file, this.conversationId);
    if (error || !url) return { error };
    const ext = file.name.split('.').pop().toLowerCase();
    const imageExts = ['jpg','jpeg','png','gif','webp'];
    const videoExts = ['mp4','mov','avi','webm'];
    const audioExts = ['mp3','wav','ogg','m4a'];
    let mtype = 'normal';
    if (imageExts.includes(ext)) mtype = 'normal';
    const content = `[FILE:${file.name}]`;
    const { data, error: msgErr } = await this.send(content, mtype, { file_url: url, file_name: file.name, file_type: ext });
    if (data) {
      await _supabase.from('attachments').insert({
        message_id: data.id,
        file_url: url,
        file_name: file.name,
        file_size: file.size,
        file_type: imageExts.includes(ext) ? 'image' : videoExts.includes(ext) ? 'video' : audioExts.includes(ext) ? 'audio' : ext === 'pdf' ? 'pdf' : 'document'
      });
    }
    return { data, error: msgErr };
  }
}

/* ── RENDER HELPERS ──────────────────────────────────────────── */

function renderMessage(msg, currentUserId) {
  const isSelf = msg.sender_id === currentUserId;
  const name = msg.profiles?.full_name || 'User';
  const avatar = msg.profiles?.avatar_url;
  const time = formatTime(msg.created_at);
  const isSystem = msg.message_type === 'system';
  const isOffer = msg.message_type === 'offer';
  const isDelivery = msg.message_type === 'delivery';

  if (isSystem) {
    return `<div class="msg-system">
      <span class="msg-system-dot"></span>
      <span>${msg.content}</span>
      <span class="msg-system-time">${time}</span>
    </div>`;
  }

  if (isOffer) {
    let offerData = {};
    try { offerData = typeof msg.metadata === 'string' ? JSON.parse(msg.metadata) : (msg.metadata || {}); } catch(e) {}
    return `<div class="msg-offer-card">
      <div class="msg-offer-header">
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M12 2L2 7l10 5 10-5-10-5z"/><path d="M2 17l10 5 10-5M2 12l10 5 10-5"/></svg>
        Custom Offer
      </div>
      <div class="msg-offer-amount">${formatCurrency(offerData.amount || 0)}</div>
      <div class="msg-offer-details">
        <span>📅 ${offerData.delivery_days || '?'} days delivery</span>
        <span>🔄 ${offerData.revisions || 1} revision(s)</span>
      </div>
      ${offerData.description ? `<p class="msg-offer-desc">${offerData.description}</p>` : ''}
      ${!isSelf ? `<button class="msg-offer-btn" onclick="acceptOffer('${msg.metadata?.offer_id || ''}')">Accept & Pay</button>` : '<span class="msg-offer-sent">Offer Sent</span>'}
      <span class="msg-time">${time}</span>
    </div>`;
  }

  if (isDelivery) {
    let d = {};
    try { d = typeof msg.metadata === 'string' ? JSON.parse(msg.metadata) : (msg.metadata || {}); } catch(e) {}
    return `<div class="msg-delivery-card">
      <div class="msg-delivery-header">
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="20 6 9 17 4 12"/></svg>
        Delivery Ready
      </div>
      <p>${msg.content}</p>
      ${d.file_url ? `<a href="${d.file_url}" class="msg-delivery-download" target="_blank">⬇ Download Files</a>` : ''}
      ${!isSelf ? `
        <div class="msg-delivery-actions">
          <button class="btn-accept-delivery" onclick="acceptDelivery('${d.delivery_id || ''}')">✓ Accept Delivery</button>
          <button class="btn-request-revision" onclick="requestRevision('${d.delivery_id || ''}')">↩ Request Revision</button>
        </div>` : ''}
      <span class="msg-time">${time}</span>
    </div>`;
  }

  const hasFile = msg.metadata?.file_url;
  const fileExt = hasFile ? msg.metadata.file_name?.split('.').pop()?.toLowerCase() : '';
  const imageExts = ['jpg','jpeg','png','gif','webp'];

  return `<div class="msg-row ${isSelf ? 'msg-self' : 'msg-other'}">
    ${!isSelf ? `<div class="msg-avatar">${avatar ? `<img src="${avatar}" alt="">` : `<span>${avatarFallback(name)}</span>`}</div>` : ''}
    <div class="msg-bubble-wrap">
      ${!isSelf ? `<span class="msg-name">${name} <span class="msg-role-tag">${msg.sender_role}</span></span>` : ''}
      <div class="msg-bubble ${isSelf ? 'bubble-self' : 'bubble-other'}">
        ${hasFile && imageExts.includes(fileExt)
          ? `<img src="${msg.metadata.file_url}" class="msg-image" onclick="window.open('${msg.metadata.file_url}','_blank')">`
          : hasFile
          ? `<a href="${msg.metadata.file_url}" class="msg-file-link" target="_blank">📎 ${msg.metadata.file_name || 'File'}</a>`
          : `<p>${msg.content}</p>`
        }
      </div>
      <span class="msg-time">${time} ${isSelf && msg.is_read ? '✓✓' : isSelf ? '✓' : ''}</span>
    </div>
  </div>`;
}

function renderTypingIndicator(name) {
  return `<div class="msg-row msg-other msg-typing" id="typing-indicator">
    <div class="msg-avatar"><span>${avatarFallback(name)}</span></div>
    <div class="msg-bubble-wrap">
      <div class="msg-bubble bubble-other">
        <div class="typing-dots"><span></span><span></span><span></span></div>
      </div>
    </div>
  </div>`;
}

/* ── SHARED CHAT CSS ─────────────────────────────────────────── */
const CHAT_CSS = `
.chat-area { display:flex; flex-direction:column; height:100%; background:#0a0a0a; }
.chat-messages { flex:1; overflow-y:auto; padding:20px 16px; display:flex; flex-direction:column; gap:12px; }
.chat-messages::-webkit-scrollbar { width:4px; }
.chat-messages::-webkit-scrollbar-thumb { background:rgba(255,255,255,0.1); border-radius:4px; }
.msg-row { display:flex; align-items:flex-end; gap:10px; }
.msg-self { flex-direction:row-reverse; }
.msg-avatar { width:34px; height:34px; border-radius:50%; background:#1a1a1a; border:1px solid rgba(212,175,55,0.3); display:flex; align-items:center; justify-content:center; font-size:0.75rem; font-weight:700; color:#F5C542; flex-shrink:0; overflow:hidden; }
.msg-avatar img { width:100%; height:100%; object-fit:cover; }
.msg-bubble-wrap { display:flex; flex-direction:column; max-width:70%; }
.msg-self .msg-bubble-wrap { align-items:flex-end; }
.msg-name { font-size:0.7rem; color:#888; margin-bottom:4px; }
.msg-role-tag { background:rgba(212,175,55,0.15); color:#F5C542; padding:1px 6px; border-radius:3px; font-size:0.6rem; margin-left:4px; }
.msg-bubble { padding:10px 14px; border-radius:12px; font-size:0.88rem; line-height:1.5; word-break:break-word; }
.msg-bubble p { margin:0; }
.bubble-other { background:#1a1a1a; border:1px solid rgba(255,255,255,0.06); color:#e0e0e0; border-radius:4px 12px 12px 12px; }
.bubble-self { background:linear-gradient(135deg,#b8950e,#F5C542); color:#000; font-weight:500; border-radius:12px 4px 12px 12px; }
.msg-time { font-size:0.62rem; color:#555; margin-top:4px; }
.msg-self .msg-time { text-align:right; }
.msg-image { max-width:220px; border-radius:8px; cursor:pointer; display:block; }
.msg-file-link { color:#F5C542; text-decoration:none; font-size:0.85rem; display:flex; align-items:center; gap:6px; }
.msg-system { display:flex; align-items:center; justify-content:center; gap:8px; padding:6px 12px; background:rgba(255,255,255,0.03); border-radius:20px; font-size:0.72rem; color:#888; margin:4px auto; }
.msg-system-dot { width:6px; height:6px; background:#F5C542; border-radius:50%; flex-shrink:0; }
.msg-system-time { color:#555; }
.msg-offer-card { background:#111; border:1px solid rgba(212,175,55,0.4); border-radius:12px; padding:18px; max-width:320px; }
.msg-offer-header { display:flex; align-items:center; gap:8px; font-size:0.75rem; font-weight:700; color:#F5C542; letter-spacing:1px; margin-bottom:12px; }
.msg-offer-amount { font-size:1.8rem; font-weight:800; color:#fff; margin-bottom:10px; }
.msg-offer-details { display:flex; gap:16px; font-size:0.78rem; color:#888; margin-bottom:10px; }
.msg-offer-desc { font-size:0.82rem; color:#aaa; margin:0 0 14px; line-height:1.5; }
.msg-offer-btn { width:100%; padding:12px; background:#F5C542; color:#000; border:none; border-radius:8px; font-weight:700; font-size:0.9rem; cursor:pointer; transition:all 0.2s; }
.msg-offer-btn:hover { background:#d4af37; }
.msg-offer-sent { font-size:0.78rem; color:#888; }
.msg-delivery-card { background:#111; border:1px solid rgba(34,197,94,0.3); border-radius:12px; padding:18px; max-width:320px; }
.msg-delivery-header { display:flex; align-items:center; gap:8px; font-size:0.75rem; font-weight:700; color:#22c55e; letter-spacing:1px; margin-bottom:10px; }
.msg-delivery-download { display:inline-flex; align-items:center; gap:6px; background:rgba(34,197,94,0.1); color:#22c55e; padding:8px 14px; border-radius:6px; text-decoration:none; font-size:0.82rem; font-weight:600; margin:10px 0; }
.msg-delivery-actions { display:flex; gap:10px; margin-top:12px; }
.btn-accept-delivery { flex:1; padding:10px; background:#22c55e; color:#000; border:none; border-radius:8px; font-weight:700; font-size:0.82rem; cursor:pointer; }
.btn-request-revision { flex:1; padding:10px; background:transparent; border:1px solid #f97316; color:#f97316; border-radius:8px; font-weight:600; font-size:0.82rem; cursor:pointer; }
.typing-dots { display:flex; gap:4px; padding:4px 0; }
.typing-dots span { width:7px; height:7px; background:#555; border-radius:50%; animation:typingBounce 1.2s infinite; }
.typing-dots span:nth-child(2) { animation-delay:.2s; }
.typing-dots span:nth-child(3) { animation-delay:.4s; }
@keyframes typingBounce { 0%,60%,100%{transform:translateY(0)} 30%{transform:translateY(-6px)} }
.chat-input-area { padding:16px; border-top:1px solid rgba(255,255,255,0.06); background:#111; display:flex; align-items:flex-end; gap:10px; }
.chat-input-wrap { flex:1; background:#1a1a1a; border:1px solid rgba(255,255,255,0.08); border-radius:12px; display:flex; align-items:flex-end; padding:10px 14px; gap:10px; transition:border-color 0.2s; }
.chat-input-wrap:focus-within { border-color:rgba(212,175,55,0.4); }
.chat-input { flex:1; background:none; border:none; outline:none; color:#fff; font-size:0.9rem; resize:none; max-height:120px; min-height:22px; line-height:1.5; font-family:inherit; }
.chat-input::placeholder { color:#555; }
.chat-attach-btn, .chat-send-btn { width:38px; height:38px; border-radius:50%; border:none; cursor:pointer; display:flex; align-items:center; justify-content:center; transition:all 0.2s; flex-shrink:0; }
.chat-attach-btn { background:rgba(255,255,255,0.06); color:#888; }
.chat-attach-btn:hover { background:rgba(255,255,255,0.1); color:#fff; }
.chat-send-btn { background:#F5C542; color:#000; }
.chat-send-btn:hover { background:#d4af37; transform:scale(1.05); }
.chat-send-btn:disabled { opacity:0.4; cursor:not-allowed; transform:none; }
`;

function injectChatCSS() {
  if (document.getElementById('chat-engine-css')) return;
  const style = document.createElement('style');
  style.id = 'chat-engine-css';
  style.textContent = CHAT_CSS;
  document.head.appendChild(style);
}
