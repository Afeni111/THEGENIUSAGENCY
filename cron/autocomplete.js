require('dotenv').config();
const { createClient } = require('@supabase/supabase-js');

const supabaseUrl = process.env.SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
const supabase = createClient(supabaseUrl, supabaseKey);

async function runAutoCompleteCheck() {
    console.log('[CRON] Starting 48-hour auto-complete check...');

    try {
        // Calculate the timestamp 48 hours ago
        const fortyEightHoursAgo = new Date(Date.now() - 48 * 60 * 60 * 1000).toISOString();

        // Find all projects that are 'delivered' and the delivery time was > 48 hours ago
        const { data: projects, error } = await supabase
            .from('projects')
            .select('id, client_id, offer_id, delivered_at')
            .eq('status', 'delivered')
            .lt('delivered_at', fortyEightHoursAgo);

        if (error) throw error;

        if (!projects || projects.length === 0) {
            console.log('[CRON] No projects ready for auto-complete.');
            return;
        }

        console.log(`[CRON] Found ${projects.length} projects to auto-complete.`);

        for (const project of projects) {
            // Update the project to 'completed' and 'auto_completed = true'
            const { error: updateError } = await supabase
                .from('projects')
                .update({ 
                    status: 'completed',
                    auto_completed: true
                })
                .eq('id', project.id);

            if (updateError) {
                console.error(`[CRON] Failed to update project ${project.id}:`, updateError);
                continue;
            }

            // Find the associated conversation to drop a system message
            const { data: offer } = await supabase.from('offers').select('conversation_id').eq('id', project.offer_id).single();
            
            if (offer && offer.conversation_id) {
                await supabase.from('messages').insert([{
                    conversation_id: offer.conversation_id,
                    sender_id: null,
                    sender_role: 'system',
                    content: 'This project has automatically been marked as COMPLETED because 48 hours have passed since delivery. Thank you!',
                    type: 'system'
                }]);
            }

            console.log(`[CRON] Successfully auto-completed project ${project.id}.`);
        }

    } catch (error) {
        console.error('[CRON] Error running auto-complete check:', error);
    }
}

// In a real production environment, you would use a package like 'node-cron' or a service like Heroku Scheduler / Vercel Cron.
// For testing locally, we can just invoke it.
if (require.main === module) {
    runAutoCompleteCheck().then(() => process.exit(0));
}

module.exports = runAutoCompleteCheck;
