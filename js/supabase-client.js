/* ================================================================
   THE GENIUS AGENCY — SUPABASE CLIENT & AUTH HELPERS
   ================================================================ */

const SUPABASE_URL = 'https://tjxyxasorunhrtvstwpa.supabase.co';
const SUPABASE_ANON_KEY = 'sb_publishable_d3YtyYkTynAVyTEVIN19dQ_-4wZkGHV';

const _supabase = supabase.createClient(SUPABASE_URL, SUPABASE_ANON_KEY, {
  realtime: { params: { eventsPerSecond: 20 } }
});

/* ── AUTH ────────────────────────────────────────────────────── */

async function signUp(email, password, fullName) {
  const { data, error } = await _supabase.auth.signUp({
    email, password,
    options: { data: { full_name: fullName, role: 'client' } }
  });
  return { data, error };
}

async function signIn(email, password) {
  const { data, error } = await _supabase.auth.signInWithPassword({ email, password });
  return { data, error };
}

async function signOut() {
  await _supabase.auth.signOut();
  window.location.href = '/login.html';
}

async function getSession() {
  const { data } = await _supabase.auth.getSession();
  return data.session;
}

async function getUser() {
  const { data } = await _supabase.auth.getUser();
  return data.user;
}

async function getProfile(userId) {
  const { data, error } = await _supabase
    .from('profiles')
    .select('*')
    .eq('id', userId)
    .single();
  return { data, error };
}

async function getCurrentProfile() {
  const user = await getUser();
  if (!user) return null;
  const { data } = await getProfile(user.id);
  return data;
}

/* ── ROUTE GUARDS ────────────────────────────────────────────── */

async function requireAuth(redirectTo = '/login.html') {
  const session = await getSession();
  if (!session) { window.location.href = redirectTo; return null; }
  return session;
}

async function requireRole(requiredRole, redirectTo = '/login.html') {
  const session = await requireAuth(redirectTo);
  if (!session) return null;
  const profile = await getCurrentProfile();
  if (!profile || profile.role !== requiredRole) {
    window.location.href = redirectTo;
    return null;
  }
  return profile;
}

async function requireAdmin() { return requireRole('admin', '/login.html'); }
async function requireClient() { return requireRole('client', '/login.html'); }
async function requireExpert() { return requireRole('expert', '/login.html'); }

/* Redirect logged-in users to their dashboard */
async function redirectIfLoggedIn() {
  const session = await getSession();
  if (!session) return;
  const profile = await getCurrentProfile();
  if (!profile) return;
  const routes = {
    admin: '/admin/dashboard.html',
    client: '/client/dashboard.html',
    expert: '/expert/dashboard.html'
  };
  window.location.href = routes[profile.role] || '/login.html';
}

/* ── CONVERSATIONS ───────────────────────────────────────────── */

async function getOrCreateConversation(clientId) {
  const { data: existing } = await _supabase
    .from('conversations')
    .select('*')
    .eq('client_id', clientId)
    .eq('is_archived', false)
    .order('updated_at', { ascending: false })
    .limit(1)
    .single();
  if (existing) return existing;

  const { data: project } = await _supabase
    .from('projects')
    .insert({ client_id: clientId, status: 'new_lead' })
    .select().single();

  const { data: convo } = await _supabase
    .from('conversations')
    .insert({ client_id: clientId, project_id: project?.id, status: 'new_lead' })
    .select().single();
  return convo;
}

async function getAllConversations() {
  const { data, error } = await _supabase
    .from('conversations')
    .select(`*, profiles!conversations_client_id_fkey(full_name, email, avatar_url)`)
    .order('updated_at', { ascending: false });
  return { data, error };
}

async function getConversation(id) {
  const { data, error } = await _supabase
    .from('conversations')
    .select(`*, profiles!conversations_client_id_fkey(full_name, email, avatar_url)`)
    .eq('id', id)
    .single();
  return { data, error };
}

async function updateConversationStatus(id, status) {
  const { data, error } = await _supabase
    .from('conversations')
    .update({ status })
    .eq('id', id)
    .select().single();
  return { data, error };
}

/* ── MESSAGES ────────────────────────────────────────────────── */

async function getMessages(conversationId) {
  const { data, error } = await _supabase
    .from('messages')
    .select(`*, profiles!messages_sender_id_fkey(full_name, avatar_url, role)`)
    .eq('conversation_id', conversationId)
    .order('created_at', { ascending: true });
  return { data, error };
}

async function sendMessage(conversationId, senderId, senderRole, content, messageType = 'normal', metadata = null) {
  const { data, error } = await _supabase
    .from('messages')
    .insert({
      conversation_id: conversationId,
      sender_id: senderId,
      sender_role: senderRole,
      content,
      message_type: messageType,
      metadata
    })
    .select().single();
  return { data, error };
}

async function markMessagesRead(conversationId, readerRole) {
  const field = `unread_${readerRole}`;
  await _supabase.from('conversations').update({ [field]: 0 }).eq('id', conversationId);
  await _supabase.from('messages')
    .update({ is_read: true })
    .eq('conversation_id', conversationId)
    .neq('sender_role', readerRole);
}

/* ── OFFERS ──────────────────────────────────────────────────── */

async function createOffer(conversationId, projectId, createdBy, offerData) {
  const { data, error } = await _supabase
    .from('offers')
    .insert({ conversation_id: conversationId, project_id: projectId, created_by: createdBy, ...offerData })
    .select().single();
  if (data) {
    await sendMessage(conversationId, createdBy, 'admin', JSON.stringify(offerData), 'offer', offerData);
    await updateConversationStatus(conversationId, 'offer_sent');
  }
  return { data, error };
}

async function updateOfferStatus(offerId, status) {
  const { data, error } = await _supabase
    .from('offers')
    .update({ status })
    .eq('id', offerId)
    .select().single();
  return { data, error };
}

/* ── PROJECTS ────────────────────────────────────────────────── */

async function getProjects(filters = {}) {
  let query = _supabase.from('projects').select(`
    *, 
    profiles!projects_client_id_fkey(full_name, email),
    experts(name, image_url)
  `).order('updated_at', { ascending: false });
  if (filters.client_id) query = query.eq('client_id', filters.client_id);
  if (filters.status) query = query.eq('status', filters.status);
  const { data, error } = await query;
  return { data, error };
}

async function updateProject(id, updates) {
  const { data, error } = await _supabase
    .from('projects').update(updates).eq('id', id).select().single();
  return { data, error };
}

async function assignExpert(projectId, conversationId, expertId) {
  await _supabase.from('projects').update({ expert_id: expertId }).eq('id', projectId);
  await _supabase.from('conversations').update({ expert_id: expertId }).eq('id', conversationId);
}

/* ── NOTIFICATIONS ───────────────────────────────────────────── */

async function sendNotification(userId, title, body, type, referenceId = null, referenceType = null) {
  await _supabase.from('notifications').insert({
    user_id: userId, title, body, type, reference_id: referenceId, reference_type: referenceType
  });
}

async function getNotifications(userId) {
  const { data } = await _supabase
    .from('notifications')
    .select('*')
    .eq('user_id', userId)
    .order('created_at', { ascending: false })
    .limit(50);
  return data || [];
}

async function markNotificationRead(id) {
  await _supabase.from('notifications').update({ is_read: true }).eq('id', id);
}

async function markAllNotificationsRead(userId) {
  await _supabase.from('notifications').update({ is_read: true }).eq('user_id', userId);
}

/* ── ACTIVITY LOG ────────────────────────────────────────────── */

async function logActivity(actorId, actorRole, action, referenceId = null, referenceType = null, metadata = null) {
  await _supabase.from('activity_logs').insert({
    actor_id: actorId, actor_role: actorRole, action,
    reference_id: referenceId, reference_type: referenceType, metadata
  });
}

/* ── FILE UPLOAD ─────────────────────────────────────────────── */

async function uploadFile(bucket, path, file) {
  const { data, error } = await _supabase.storage.from(bucket).upload(path, file, { upsert: true });
  if (error) return { url: null, error };
  const { data: urlData } = _supabase.storage.from(bucket).getPublicUrl(path);
  return { url: urlData.publicUrl, error: null };
}

async function uploadMessageFile(file, conversationId) {
  const ext = file.name.split('.').pop();
  const path = `${conversationId}/${Date.now()}.${ext}`;
  return uploadFile('messages', path, file);
}

/* ── TYPING INDICATOR ────────────────────────────────────────── */

async function setTyping(conversationId, userId, isTyping) {
  await _supabase.from('typing_indicators').upsert({
    conversation_id: conversationId, user_id: userId, is_typing: isTyping, updated_at: new Date().toISOString()
  });
}

/* ── HELPERS ─────────────────────────────────────────────────── */

function formatTime(ts) {
  if (!ts) return '';
  const d = new Date(ts);
  const now = new Date();
  const diff = now - d;
  if (diff < 60000) return 'Just now';
  if (diff < 3600000) return `${Math.floor(diff / 60000)}m ago`;
  if (diff < 86400000) return d.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  return d.toLocaleDateString([], { month: 'short', day: 'numeric' });
}

function formatCurrency(amount, currency = 'USD') {
  return new Intl.NumberFormat('en-US', { style: 'currency', currency }).format(amount);
}

function getStatusColor(status) {
  const colors = {
    new_lead: '#3b82f6', discussing: '#8b5cf6', offer_sent: '#f59e0b',
    payment_pending: '#ef4444', in_progress: '#10b981', under_review: '#f97316',
    delivered: '#06b6d4', revision: '#ec4899', completed: '#22c55e',
    auto_completed: '#84cc16', cancelled: '#6b7280', refunded: '#f87171'
  };
  return colors[status] || '#888';
}

function getStatusLabel(status) {
  const labels = {
    new_lead: 'New Lead', discussing: 'Discussing', offer_sent: 'Offer Sent',
    payment_pending: 'Payment Pending', in_progress: 'In Progress',
    under_review: 'Under Review', delivered: 'Delivered', revision: 'Revision',
    completed: 'Completed', auto_completed: 'Auto Completed',
    cancelled: 'Cancelled', refunded: 'Refunded'
  };
  return labels[status] || status;
}

function avatarFallback(name = '') {
  return name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2);
}
