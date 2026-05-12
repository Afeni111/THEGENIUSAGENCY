const express = require('express');
const router = express.Router();
const { createClient } = require('@supabase/supabase-js');

const supabase = createClient(process.env.SUPABASE_URL, process.env.SUPABASE_SERVICE_ROLE_KEY);

// POST /api/projects/deliver - Admin marks a project as delivered
router.post('/deliver', async (req, res) => {
    try {
        const { project_id, conversation_id } = req.body;

        const { data: project, error } = await supabase
            .from('projects')
            .update({ 
                status: 'delivered',
                delivered_at: new Date().toISOString()
            })
            .eq('id', project_id)
            .select()
            .single();

        if (error) throw error;

        // Send system message
        await supabase.from('messages').insert([{
            conversation_id,
            sender_id: null,
            sender_role: 'system',
            content: 'The final project files have been delivered. You have 48 hours to request a revision before the project auto-completes.',
            type: 'system'
        }]);

        res.status(200).json({ message: 'Project delivered successfully', project });
    } catch (error) {
        console.error('[API Error] /api/projects/deliver:', error);
        res.status(500).json({ error: 'Internal Server Error' });
    }
});

// POST /api/projects/revision - Client requests a revision
router.post('/revision', async (req, res) => {
    try {
        const { project_id, conversation_id } = req.body;

        const { data: project, error } = await supabase
            .from('projects')
            .update({ 
                status: 'revision',
                delivered_at: null // Reset timer
            })
            .eq('id', project_id)
            .select()
            .single();

        if (error) throw error;

        await supabase.from('messages').insert([{
            conversation_id,
            sender_id: null,
            sender_role: 'system',
            content: 'Client has requested a revision. The project is back IN PROGRESS.',
            type: 'system'
        }]);

        res.status(200).json({ message: 'Revision requested', project });
    } catch (error) {
        console.error('[API Error] /api/projects/revision:', error);
        res.status(500).json({ error: 'Internal Server Error' });
    }
});

// POST /api/projects/complete - Client manually marks as complete
router.post('/complete', async (req, res) => {
    try {
        const { project_id, conversation_id } = req.body;

        const { data: project, error } = await supabase
            .from('projects')
            .update({ status: 'completed' })
            .eq('id', project_id)
            .select()
            .single();

        if (error) throw error;

        await supabase.from('messages').insert([{
            conversation_id,
            sender_id: null,
            sender_role: 'system',
            content: 'Project has been manually approved and COMPLETED by the client. Thank you!',
            type: 'system'
        }]);

        res.status(200).json({ message: 'Project completed', project });
    } catch (error) {
        console.error('[API Error] /api/projects/complete:', error);
        res.status(500).json({ error: 'Internal Server Error' });
    }
});

module.exports = router;
