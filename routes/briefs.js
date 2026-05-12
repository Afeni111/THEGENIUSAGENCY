const express = require('express');
const router = express.Router();
const { createClient } = require('@supabase/supabase-js');

const supabase = createClient(process.env.SUPABASE_URL, process.env.SUPABASE_SERVICE_ROLE_KEY);

// POST /api/briefs - Submit a new project brief
router.post('/', async (req, res) => {
    try {
        const { client_id, expert_id, title, description, budget } = req.body;

        if (!client_id || !title || !description) {
            return res.status(400).json({ error: 'Missing required fields: client_id, title, description' });
        }

        // Insert into Supabase
        const { data, error } = await supabase
            .from('project_briefs')
            .insert([{ client_id, expert_id, title, description, budget }])
            .select()
            .single();

        if (error) throw error;

        // Optionally, create the Conversation automatically
        const { data: convData, error: convError } = await supabase
            .from('conversations')
            .insert([{ client_id, expert_id }])
            .select()
            .single();

        if (convError) throw convError;

        res.status(201).json({ 
            message: 'Project brief submitted successfully',
            brief: data,
            conversation: convData
        });

    } catch (error) {
        console.error('[API Error] /api/briefs POST:', error);
        res.status(500).json({ error: 'Internal Server Error' });
    }
});

module.exports = router;
