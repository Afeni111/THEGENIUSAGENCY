/* ================================================================
   THE GENIUS AGENCY — NOTIFICATIONS SYSTEM
   ================================================================ */

class NotificationManager {
  constructor(userId) {
    this.userId = userId;
    this.channel = null;
    this.badge = null;
    this.panel = null;
    this.unreadCount = 0;
  }

  init(badgeEl, panelEl) {
    this.badge = badgeEl;
    this.panel = panelEl;
    this.loadNotifications();
    this.subscribeRealtime();
  }

  async loadNotifications() {
    const notifications = await getNotifications(this.userId);
    this.unreadCount = notifications.filter(n => !n.is_read).length;
    this.updateBadge();
    if (this.panel) this.renderPanel(notifications);
  }

  subscribeRealtime() {
    this.channel = _supabase
      .channel(`notifications:${this.userId}`)
      .on('postgres_changes', {
        event: 'INSERT', schema: 'public', table: 'notifications',
        filter: `user_id=eq.${this.userId}`
      }, (payload) => {
        this.unreadCount++;
        this.updateBadge();
        this.showToast(payload.new);
        this.loadNotifications();
      })
      .subscribe();
  }

  unsubscribe() {
    if (this.channel) _supabase.removeChannel(this.channel);
  }

  updateBadge() {
    if (!this.badge) return;
    this.badge.textContent = this.unreadCount > 99 ? '99+' : this.unreadCount;
    this.badge.style.display = this.unreadCount > 0 ? 'flex' : 'none';
  }

  renderPanel(notifications) {
    if (!this.panel) return;
    if (!notifications.length) {
      this.panel.innerHTML = `<div class="notif-empty">No notifications yet</div>`;
      return;
    }
    this.panel.innerHTML = notifications.map(n => `
      <div class="notif-item ${n.is_read ? 'notif-read' : 'notif-unread'}" onclick="notifManager.markRead('${n.id}', this)">
        <div class="notif-icon">${this.getIcon(n.type)}</div>
        <div class="notif-body">
          <div class="notif-title">${n.title}</div>
          <div class="notif-text">${n.body}</div>
          <div class="notif-time">${formatTime(n.created_at)}</div>
        </div>
        ${!n.is_read ? '<div class="notif-dot"></div>' : ''}
      </div>
    `).join('');
  }

  getIcon(type) {
    const icons = {
      new_message: '💬', offer_sent: '📋', payment: '💳',
      delivery: '📦', revision: '🔄', completed: '✅',
      new_lead: '🌟', assigned: '👤', review: '⭐'
    };
    return icons[type] || '🔔';
  }

  async markRead(id, el) {
    await markNotificationRead(id);
    el?.classList.replace('notif-unread', 'notif-read');
    el?.querySelector('.notif-dot')?.remove();
    if (this.unreadCount > 0) {
      this.unreadCount--;
      this.updateBadge();
    }
  }

  async markAllRead() {
    await markAllNotificationsRead(this.userId);
    this.unreadCount = 0;
    this.updateBadge();
    this.panel?.querySelectorAll('.notif-unread').forEach(el => {
      el.classList.replace('notif-unread', 'notif-read');
      el.querySelector('.notif-dot')?.remove();
    });
  }

  showToast(notification) {
    const toast = document.createElement('div');
    toast.className = 'notif-toast';
    toast.innerHTML = `
      <div class="notif-toast-icon">${this.getIcon(notification.type)}</div>
      <div>
        <div class="notif-toast-title">${notification.title}</div>
        <div class="notif-toast-body">${notification.body}</div>
      </div>
      <button class="notif-toast-close" onclick="this.parentElement.remove()">×</button>
    `;
    document.body.appendChild(toast);
    setTimeout(() => toast.classList.add('show'), 10);
    setTimeout(() => { toast.classList.remove('show'); setTimeout(() => toast.remove(), 400); }, 4000);
  }
}

/* ── NOTIFICATION CSS ────────────────────────────────────────── */
const NOTIF_CSS = `
.notif-badge {
  position:absolute; top:-6px; right:-6px;
  background:#ef4444; color:#fff;
  font-size:0.6rem; font-weight:800;
  min-width:18px; height:18px; border-radius:9px;
  display:flex; align-items:center; justify-content:center;
  padding:0 4px; pointer-events:none;
}
.notif-panel {
  position:absolute; top:calc(100% + 12px); right:0;
  width:340px; max-height:420px; overflow-y:auto;
  background:#111; border:1px solid rgba(255,255,255,0.08);
  border-radius:14px; box-shadow:0 20px 60px rgba(0,0,0,0.6);
  z-index:9999;
}
.notif-panel::-webkit-scrollbar { width:3px; }
.notif-panel::-webkit-scrollbar-thumb { background:rgba(255,255,255,0.1); }
.notif-panel-header {
  padding:14px 16px; border-bottom:1px solid rgba(255,255,255,0.06);
  display:flex; justify-content:space-between; align-items:center;
  font-size:0.8rem; font-weight:700; color:#fff;
}
.notif-mark-all { font-size:0.72rem; color:#F5C542; cursor:pointer; background:none; border:none; }
.notif-item {
  display:flex; align-items:flex-start; gap:12px;
  padding:12px 16px; cursor:pointer; transition:background 0.2s;
  border-bottom:1px solid rgba(255,255,255,0.03); position:relative;
}
.notif-item:hover { background:rgba(255,255,255,0.03); }
.notif-unread { background:rgba(212,175,55,0.04); }
.notif-icon { font-size:1.2rem; flex-shrink:0; margin-top:2px; }
.notif-body { flex:1; min-width:0; }
.notif-title { font-size:0.8rem; font-weight:600; color:#fff; margin-bottom:2px; }
.notif-text { font-size:0.75rem; color:#888; line-height:1.4; }
.notif-time { font-size:0.65rem; color:#555; margin-top:4px; }
.notif-dot {
  width:8px; height:8px; background:#F5C542; border-radius:50%;
  flex-shrink:0; margin-top:6px;
}
.notif-empty { padding:30px; text-align:center; color:#555; font-size:0.85rem; }
.notif-toast {
  position:fixed; bottom:80px; right:24px; z-index:99999;
  background:#1a1a1a; border:1px solid rgba(212,175,55,0.3);
  border-radius:12px; padding:14px 16px;
  display:flex; align-items:center; gap:12px;
  max-width:320px; box-shadow:0 10px 40px rgba(0,0,0,0.5);
  transform:translateX(110%); transition:transform 0.35s cubic-bezier(0.4,0,0.2,1);
}
.notif-toast.show { transform:translateX(0); }
.notif-toast-icon { font-size:1.4rem; flex-shrink:0; }
.notif-toast-title { font-size:0.82rem; font-weight:700; color:#fff; margin-bottom:2px; }
.notif-toast-body { font-size:0.75rem; color:#888; }
.notif-toast-close {
  background:none; border:none; color:#555; font-size:1.2rem;
  cursor:pointer; margin-left:auto; flex-shrink:0; line-height:1;
}
`;

function injectNotifCSS() {
  if (document.getElementById('notif-css')) return;
  const s = document.createElement('style');
  s.id = 'notif-css';
  s.textContent = NOTIF_CSS;
  document.head.appendChild(s);
}

let notifManager = null;

async function initNotifications(userId) {
  injectNotifCSS();
  const badge = document.getElementById('notif-badge');
  const panel = document.getElementById('notif-panel');
  notifManager = new NotificationManager(userId);
  notifManager.init(badge, panel);
}
