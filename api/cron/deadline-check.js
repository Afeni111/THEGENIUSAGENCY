const { createClient } = require('@supabase/supabase-js');
const { sendAdminEmail, templates } = require('../js/email-service');

const sb = createClient(process.env.SUPABASE_URL, process.env.SUPABASE_SERVICE_ROLE_KEY);

module.exports = async (req, res) => {
    // Basic auth check for Vercel Cron
    const authHeader = req.headers.authorization;
    if (process.env.CRON_SECRET && authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
        return res.status(401).json({ error: 'Unauthorized' });
    }

    try {
        const now = new Date();
        const twentyHoursLater = new Date(now.getTime() + 20 * 60 * 60 * 1000);

        // Fetch projects due in less than 20 hours that haven't been notified
        const { data: projects, error } = await sb
            .from('projects')
            .select('*, profiles!projects_client_id_fkey(full_name), experts(name)')
            .eq('status', 'in_progress')
            .eq('deadline_notified', false)
            .lte('deadline', twentyHoursLater.toISOString())
            .gt('deadline', now.toISOString());

        if (error) throw error;

        console.log(`[CRON] Found ${projects?.length || 0} projects approaching deadline.`);

        for (const project of projects) {
            const { subject, text, html } = templates.deadline_reminder({
                project_title: project.title,
                expert_name: project.experts?.name || 'Unassigned',
                client_name: project.profiles?.full_name || 'Unknown'
            });

            await sendAdminEmail(subject, text, html);

            // Mark as notified
            await sb.from('projects').update({ deadline_notified: true }).eq('id', project.id);
        }

        res.status(200).json({ message: `Processed ${projects?.length || 0} reminders` });
    } catch (error) {
        console.error('[CRON ERROR] Deadline Check:', error);
        res.status(500).json({ error: 'Internal Server Error' });
    }
};
