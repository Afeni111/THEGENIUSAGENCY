const express = require('express');
const router = express.Router();
const { sendAdminEmail, templates } = require('../js/email-service');

// POST /api/notifications/notify-admin
router.post('/notify-admin', async (req, res) => {
    const { type, data } = req.body;

    if (!templates[type]) {
        return res.status(400).json({ error: 'Invalid notification type' });
    }

    try {
        const { subject, text, html } = templates[type](data);
        await sendAdminEmail(subject, text, html);
        res.status(200).json({ message: 'Notification sent' });
    } catch (error) {
        console.error('[API Error] Admin Notification:', error);
        res.status(500).json({ error: 'Failed to send notification' });
    }
});

module.exports = router;
