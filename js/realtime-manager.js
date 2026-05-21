/**
 * THE GENIUS AGENCY — REALTIME MANAGER
 * Centralizes Supabase realtime subscriptions and dispatches events for UI updates.
 */

class RealtimeManager {
    constructor(supabaseClient) {
        this.sb = supabaseClient;
        this.channels = {};
        this.callbacks = new Map();
    }

    /**
     * Subscribe to a table and event type
     * @param {string} table - Table name
     * @param {string} event - INSERT, UPDATE, DELETE, or *
     * @param {Function} callback - Function to run on change
     * @param {string} filter - Optional Supabase filter (e.g. 'user_id=eq.123')
     */
    subscribe(table, event, callback, filter = null) {
        const key = `${table}:${event}:${filter || 'all'}`;
        
        if (!this.callbacks.has(key)) {
            this.callbacks.set(key, new Set());
        }
        this.callbacks.get(key).add(callback);

        if (!this.channels[key]) {
            const channel = this.sb.channel(`rt:${key}`);
            const options = { event, schema: 'public', table };
            if (filter) options.filter = filter;

            channel.on('postgres_changes', options, (payload) => {
                this.callbacks.get(key).forEach(cb => cb(payload));
            }).subscribe();

            this.channels[key] = channel;
        }

        return () => this.unsubscribe(key, callback);
    }

    unsubscribe(key, callback) {
        const callbacks = this.callbacks.get(key);
        if (callbacks) {
            callbacks.delete(callback);
            if (callbacks.size === 0) {
                this.sb.removeChannel(this.channels[key]);
                delete this.channels[key];
                this.callbacks.delete(key);
            }
        }
    }

    /**
     * Helper to show a browser notification if permitted
     */
    async notify(title, options = {}) {
        if (!("Notification" in window)) return;
        
        if (Notification.permission === "granted") {
            new Notification(title, options);
        } else if (Notification.permission !== "denied") {
            const permission = await Notification.requestPermission();
            if (permission === "granted") {
                new Notification(title, options);
            }
        }
    }
}

// Global instance if sb is available
window.initRealtimeManager = (supabaseClient) => {
    window.rtm = new RealtimeManager(supabaseClient);
    console.log('RealtimeManager initialized');
};
