const express = require('express');
const router = express.Router();
const { createClient } = require('@supabase/supabase-js');

const supabase = createClient(process.env.SUPABASE_URL, process.env.SUPABASE_SERVICE_ROLE_KEY);

// POST /api/offers - Create a custom offer
router.post('/', async (req, res) => {
    try {
        const { conversation_id, client_id, expert_id, title, description, price, delivery_days } = req.body;

        // 1. Insert Offer
        const { data: offer, error: offerError } = await supabase
            .from('offers')
            .insert([{
                conversation_id,
                client_id,
                expert_id,
                title,
                description,
                price,
                delivery_days,
                status: 'sent'
            }])
            .select()
            .single();

        if (offerError) throw offerError;

        // 2. Insert Offer Message into Chat
        const { error: msgError } = await supabase
            .from('messages')
            .insert([{
                conversation_id,
                sender_id: null, // System message or Admin id
                sender_role: 'admin',
                content: JSON.stringify({ offer_id: offer.id, title, price }),
                type: 'offer'
            }]);

        if (msgError) throw msgError;

        res.status(201).json({ message: 'Offer created successfully', offer });

    } catch (error) {
        console.error('[API Error] /api/offers POST:', error);
        res.status(500).json({ error: 'Internal Server Error' });
    }
});

module.exports = router;
