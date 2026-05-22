const { sendAdminEmail, templates } = require('../../js/email-service');

module.exports = async (req, res) => {
    // Enable CORS
    res.setHeader('Access-Control-Allow-Credentials', true);
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'GET,OPTIONS,PATCH,DELETE,POST,PUT');
    res.setHeader(
        'Access-Control-Allow-Headers',
        'X-CSRF-Token, X-Requested-With, Accept, Accept-Version, Content-Length, Content-MD5, Content-Type, Date, X-Api-Version'
    );

    if (req.method === 'OPTIONS') {
        res.status(200).end();
        return;
    }

    if (req.method !== 'POST') {
        return res.status(405).json({ error: 'Method Not Allowed' });
    }

    const { type, data } = req.body;

    if (!templates[type]) {
        console.error('[API Error] Invalid notification type:', type);
        return res.status(400).json({ error: 'Invalid notification type' });
    }

    try {
        console.log(`[API] Processing notification: ${type}`);
        const { subject, text, html } = templates[type](data);
        const info = await sendAdminEmail(subject, text, html);
        
        if (info) {
            console.log('[API] Email sent successfully:', info.messageId);
            res.status(200).json({ message: 'Notification sent', id: info.messageId });
        } else {
            throw new Error('Email service returned no info');
        }
    } catch (error) {
        console.error('[API Error] Admin Notification:', error);
        res.status(500).json({ 
            error: 'Failed to send notification', 
            details: error.message,
            config_check: {
                has_user: !!process.env.SMTP_USER,
                has_pass: !!process.env.SMTP_PASS,
                admin: process.env.ADMIN_EMAIL
            }
        });
    }
};
