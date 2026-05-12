const express = require('express');
const router = express.Router();
const axios = require('axios');
const crypto = require('crypto');
const { createClient } = require('@supabase/supabase-js');

const supabase = createClient(process.env.SUPABASE_URL, process.env.SUPABASE_SERVICE_ROLE_KEY);
const PAYSTACK_SECRET_KEY = process.env.PAYSTACK_SECRET_KEY;

// POST /api/paystack/initialize - Generate Checkout Link
router.post('/initialize', async (req, res) => {
    try {
        const { email, amount, offer_id, client_id } = req.body; // amount is in pure units (e.g. 100 for $100)

        // Paystack amount is in kobo/cents. If using USD, it's in cents.
        const amountInCents = amount * 100;

        const response = await axios.post('https://api.paystack.co/transaction/initialize', {
            email: email,
            amount: amountInCents,
            currency: 'USD',
            metadata: {
                offer_id: offer_id,
                client_id: client_id
            }
        }, {
            headers: {
                Authorization: `Bearer ${PAYSTACK_SECRET_KEY}`,
                'Content-Type': 'application/json'
            }
        });

        // Store pending payment in our DB
        await supabase.from('payments').insert([{
            client_id,
            offer_id,
            amount,
            currency: 'USD',
            status: 'pending',
            reference: response.data.data.reference
        }]);

        res.status(200).json({ authorization_url: response.data.data.authorization_url });

    } catch (error) {
        console.error('[API Error] Paystack Initialization:', error.response?.data || error.message);
        res.status(500).json({ error: 'Failed to initialize payment' });
    }
});

// POST /api/paystack/webhook - Handle Paystack Callback
router.post('/webhook', express.raw({ type: 'application/json' }), async (req, res) => {
    try {
        // Validate Webhook Signature
        const hash = crypto.createHmac('sha512', PAYSTACK_SECRET_KEY).update(JSON.stringify(req.body)).digest('hex');
        if (hash !== req.headers['x-paystack-signature']) {
            return res.status(400).send('Invalid signature');
        }

        const event = req.body;

        if (event.event === 'charge.success') {
            const reference = event.data.reference;
            const offer_id = event.data.metadata.offer_id;
            const client_id = event.data.metadata.client_id;

            // 1. Mark Payment Success
            const { data: payment } = await supabase
                .from('payments')
                .update({ status: 'success' })
                .eq('reference', reference)
                .select().single();

            // 2. Mark Offer Paid
            const { data: offer } = await supabase
                .from('offers')
                .update({ status: 'paid' })
                .eq('id', offer_id)
                .select().single();

            // 3. Create active Project
            await supabase.from('projects').insert([{
                client_id,
                expert_id: offer.expert_id,
                offer_id,
                payment_id: payment.id,
                status: 'in_progress'
            }]);

            // 4. Send System Message to Chat
            await supabase.from('messages').insert([{
                conversation_id: offer.conversation_id,
                sender_id: null,
                sender_role: 'system',
                content: `Payment received for "${offer.title}". The project is now IN PROGRESS!`,
                type: 'system'
            }]);
        }

        res.sendStatus(200);

    } catch (error) {
        console.error('[API Error] Paystack Webhook:', error);
        res.status(500).send('Webhook Error');
    }
});

module.exports = router;
