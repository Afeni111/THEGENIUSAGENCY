// ── Supabase Setup ──────────────────────────────────────────
const SUPABASE_URL = 'https://tjxyxasorunhrtvstwpa.supabase.co';
const SUPABASE_ANON_KEY = 'sb_publishable_d3YtyYkTynAVyTEVIN19dQ_-4wZkGHV';

let supabaseClient = null;
try {
    if (typeof window.supabase !== 'undefined' && window.supabase.createClient) {
        supabaseClient = window.supabase.createClient(SUPABASE_URL, SUPABASE_ANON_KEY);
    } else {
        throw new Error("Supabase library not loaded correctly.");
    }
} catch(e) {
    console.error('Supabase init failed:', e);
}

// ── DOM Elements & Event Listeners (wait for DOM) ────────────
document.addEventListener('DOMContentLoaded', () => {
const authForm = document.getElementById('auth-form');
const authTitle = document.getElementById('auth-title');
const authSubtitle = document.getElementById('auth-subtitle');
const nameGroup = document.getElementById('name-group');
const authName = document.getElementById('auth-name');
const authEmail = document.getElementById('auth-email');
const authPassword = document.getElementById('auth-password');
const authSubmit = document.getElementById('auth-submit');
const authPrompt = document.getElementById('auth-prompt');
const authToggle = document.getElementById('auth-toggle');

let isLoginMode = true;

let isRedirecting = false;
async function getDetectedCountry() {
    try {
        const res = await fetch('https://ipapi.co/json/');
        const data = await res.json();
        return data.country_name || 'Unknown';
    } catch (e) {
        console.warn('Country detection failed:', e);
        return 'Unknown';
    }
}

// ── Role-based redirect helper ──────────────────────────────
async function redirectByRole(userId) {
    if (isRedirecting) return;
    isRedirecting = true;
    console.log('Redirecting user:', userId);
    try {
        const { data: profile, error } = await supabaseClient.from('profiles').select('role, country').eq('id', userId).single();
        
        // If profile exists but country is missing, try to update it once
        if (profile && !profile.country) {
            const detected = await getDetectedCountry();
            if (detected && detected !== 'Unknown') {
                await supabaseClient.from('profiles').update({ country: detected }).eq('id', userId);
            }
        }

        if (error) {
            console.error('Error fetching profile:', error);
            // Default to client if no profile exists yet
            window.location.replace('client/dashboard.html');
            return;
        }
        
        const role = profile?.role || 'client';
        console.log('User role detected:', role);
        
        const routes = {
            admin: 'admin/dashboard.html',
            client: 'client/dashboard.html',
            expert: 'expert/dashboard.html'
        };
        
        const target = routes[role] || 'client/dashboard.html';
        console.log('Redirecting to:', target);
        window.location.replace(target);
    } catch (err) {
        console.error('Redirect failed:', err);
        window.location.replace('client/dashboard.html');
    }
}

// ── Check if already logged in + handle OAuth callback ──────
if (supabaseClient) {
    // Check initial session on page load
    supabaseClient.auth.getSession().then(async ({ data: { session } }) => {
        if (session) {
            await redirectByRole(session.user.id);
        } else {
            // No session, fade in the login form
            const wrapper = document.getElementById('login-form-wrapper');
            if(wrapper) wrapper.style.opacity = '1';
        }
    });

    supabaseClient.auth.onAuthStateChange(async (event, session) => {
        if (event === 'SIGNED_IN' && session) {
            await redirectByRole(session.user.id);
        }
    });
}

// ── Toggle Login ↔ Sign Up ──────────────────────────────────
if (authToggle) {
    authToggle.addEventListener('click', () => {
        isLoginMode = !isLoginMode;

        if (isLoginMode) {
            authTitle.textContent = 'Welcome Back';
            authSubtitle.textContent = 'Login to access your projects.';
            nameGroup.style.display = 'none';
            authSubmit.textContent = 'Login';
            authPrompt.textContent = "Don't have an account?";
            authToggle.textContent = 'Sign up here';
            authName.removeAttribute('required');
        } else {
            authTitle.textContent = 'Create Account';
            authSubtitle.textContent = 'Join to start your project.';
            nameGroup.style.display = 'block';
            authSubmit.textContent = 'Sign Up';
            authPrompt.textContent = 'Already have an account?';
            authToggle.textContent = 'Login here';
            authName.setAttribute('required', 'true');
        }
    });
}

// ── Google OAuth ───────────────────────────────────────────
const googleBtn = document.querySelector('.btn-google');
if (googleBtn) {
    googleBtn.addEventListener('click', async () => {
        if (!supabaseClient) return alert('Auth service not available.');
        
        console.log('Initiating Google Login...');
        // Show loading state
        const originalContent = googleBtn.innerHTML;
        googleBtn.disabled = true;
        googleBtn.innerHTML = '<span style="opacity:0.7">Connecting...</span>';

        const redirectTo = window.location.origin + window.location.pathname;
        console.log('Redirecting to Google, will return to:', redirectTo);
        
        const { error } = await supabaseClient.auth.signInWithOAuth({
            provider: 'google',
            options: { 
                redirectTo,
                queryParams: {
                    access_type: 'offline',
                    prompt: 'consent',
                }
            }
        });
        
        if (error) {
            console.error('OAuth Error:', error);
            alert('Google sign-in failed: ' + error.message);
            googleBtn.disabled = false;
            googleBtn.innerHTML = originalContent;
        }
    });
}

// ── Debug: Check URL for error parameters ──────────────────
const params = new URLSearchParams(window.location.search);
if (params.has('error_description')) {
    const errorMsg = params.get('error_description');
    alert('Auth Error: ' + errorMsg);
    
    // Clear the error from URL so it doesn't pop up again on reload
    const newUrl = window.location.pathname;
    window.history.replaceState({}, document.title, newUrl);
}

// Force check for hash (sometimes session is in hash but getSession is slow)
if (window.location.hash && window.location.hash.includes('access_token')) {
    console.log('Detected session in URL hash, waiting for Supabase...');
}

// ── Form Submit ─────────────────────────────────────────────
if (authForm) {
    authForm.addEventListener('submit', async (e) => {
        e.preventDefault();

        if (!supabaseClient) {
            alert('Auth service not available. Check your Supabase key.');
            return;
        }

        const email = authEmail.value.trim();
        const password = authPassword.value;
        const name = authName.value.trim();

        authSubmit.disabled = true;
        authSubmit.textContent = 'Please wait...';
        authSubmit.style.opacity = '0.7';

        try {
            let userId = null;

            if (isLoginMode) {
                // ── LOGIN ──
                console.log('Attempting login for:', email);
                const { data, error } = await supabaseClient.auth.signInWithPassword({ email, password });
                if (error) {
                    console.error('Login error:', error);
                    throw error;
                }
                userId = data.user.id;
                console.log('Login success! User ID:', userId);

            } else {
                // ── SIGN UP ──
                console.log('Attempting signup for:', email);
                const { data, error } = await supabaseClient.auth.signUp({
                    email,
                    password,
                    options: { data: { name } }
                });
                if (error) {
                    console.error('Signup error:', error);
                    throw error;
                }
                userId = data.user?.id;
                console.log('Signup success! User ID:', userId);

                // Insert into profiles table so role is assigned immediately
                if (userId) {
                    const country = await getDetectedCountry();
                    const { error: dbError } = await supabaseClient.from('profiles').insert([
                        { id: userId, full_name: name, email, role: 'client', country: country }
                    ]);
                    if (dbError) console.warn('Could not insert to profiles table:', dbError.message);

                    // Notify Admin via Email
                    fetch('/api/notifications/notify-admin', {
                        method: 'POST',
                        headers: { 'Content-Type': 'application/json' },
                        body: JSON.stringify({
                            type: 'new_signup',
                            data: {
                                id: userId,
                                full_name: name,
                                email: email,
                                role: 'client'
                            }
                        })
                    }).catch(err => console.error('Admin notification failed:', err));
                }

                // If no session after signup, email confirmation is required
                const { data: { session: newSession } } = await supabaseClient.auth.getSession();
                if (!newSession) {
                    authSubmit.textContent = '✓ Account created!';
                    authSubmit.style.background = '#00c853';
                    authSubmit.disabled = true;
                    alert('✅ Account created! Please check your email and click the confirmation link, then come back to log in.');
                    // Reset to login mode
                    isLoginMode = true;
                    authTitle.textContent = 'Welcome Back';
                    authSubtitle.textContent = 'Sign in to access your client dashboard.';
                    nameGroup.style.display = 'none';
                    authSubmit.textContent = 'Sign In →';
                    authSubmit.style.background = '';
                    authSubmit.disabled = false;
                    authSubmit.style.opacity = '1';
                    authPrompt.textContent = "Don't have an account?";
                    authToggle.textContent = 'Create Account';
                    authName.removeAttribute('required');
                    return;
                }
            }

            // ── Handle any pending project brief ──
            const pendingBrief = localStorage.getItem('pending_brief');
            if (pendingBrief && userId) {
                try {
                    const briefData = JSON.parse(pendingBrief);
                    const res = await fetch('/api/briefs', {
                        method: 'POST',
                        headers: { 'Content-Type': 'application/json' },
                        body: JSON.stringify({
                            client_id: userId,
                            expert_id: briefData.expert_id,
                            title: briefData.title,
                            description: briefData.description,
                            budget: briefData.budget
                        })
                    });
                    if (res.ok) {
                        localStorage.removeItem('pending_brief');
                        console.log('Pending brief submitted.');
                    }
                } catch (briefErr) {
                    console.warn('Pending brief failed (backend may be offline):', briefErr.message);
                }
            }

            // ── Success: Role-based redirect ──
            authSubmit.textContent = '✓ Success! Redirecting...';
            authSubmit.style.background = '#00c853';
            setTimeout(() => redirectByRole(userId), 800);

        } catch (err) {
            console.error('Auth failed:', err);
            alert('❌ ' + (err.message || 'Authentication failed. Check your credentials.'));
            authSubmit.disabled = false;
            authSubmit.textContent = isLoginMode ? 'Login' : 'Sign Up';
            authSubmit.style.opacity = '1';
        }
    });
}
});
