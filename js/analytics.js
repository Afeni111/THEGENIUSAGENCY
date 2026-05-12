(function() {
    const SB_URL = 'https://tjxyxasorunhrtvstwpa.supabase.co';
    const SB_KEY = 'sb_publishable_d3YtyYkTynAVyTEVIN19dQ_-4wZkGHV';
    
    // Simple session-based visitor ID
    let visitorId = sessionStorage.getItem('genius_visitor_id');
    if (!visitorId) {
        visitorId = 'v_' + Math.random().toString(36).substring(2, 15);
        sessionStorage.setItem('genius_visitor_id', visitorId);
    }

    async function trackVisit() {
        if (typeof supabase === 'undefined') return;
        
        // Avoid tracking admin or internal views if possible, 
        // but for now, we track everything and filter in the dashboard if needed.
        const sb = supabase.createClient(SB_URL, SB_KEY);
        
        try {
            await sb.from('site_analytics').insert({
                visitor_id: visitorId,
                path: window.location.pathname,
                user_agent: navigator.userAgent
            });
        } catch (e) {
            console.warn('Analytics failed', e);
        }
    }

    // Debounce to prevent multiple hits on rapid navigation or reload
    let tracked = false;
    if (!tracked) {
        tracked = true;
        // Wait a bit for Supabase to be ready if it's being loaded via script tag
        if (typeof supabase !== 'undefined') {
            trackVisit();
        } else {
            window.addEventListener('DOMContentLoaded', trackVisit);
        }
    }
})();
