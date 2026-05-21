const nodemailer = require('nodemailer');

const transporter = nodemailer.createTransport({
    host: process.env.SMTP_HOST,
    port: process.env.SMTP_PORT,
    secure: process.env.SMTP_PORT == 465, // true for 465, false for other ports
    auth: {
        user: process.env.SMTP_USER,
        pass: process.env.SMTP_PASS,
    },
});

const ADMIN_EMAIL = process.env.ADMIN_EMAIL || 'admin@thegeniusagency.co';

const sendAdminEmail = async (subject, text, html) => {
    try {
        const info = await transporter.sendMail({
            from: `"The Genius Agency" <${process.env.SMTP_USER}>`,
            to: ADMIN_EMAIL,
            subject: subject,
            text: text,
            html: html,
        });
        console.log('[EMAIL] Admin notification sent:', info.messageId);
        return info;
    } catch (error) {
        console.error('[EMAIL ERROR] Failed to send admin email:', error);
    }
};

const templates = {
    new_signup: (user) => ({
        subject: `🚀 New Expert/Client Sign-up: ${user.full_name}`,
        text: `A new user has signed up.\n\nName: ${user.full_name}\nEmail: ${user.email}\nRole: ${user.role}\nID: ${user.id}`,
        html: `
            <div style="font-family: sans-serif; padding: 20px; border: 1px solid #eee; border-radius: 10px;">
                <h2 style="color: #F5C542;">New User Registration</h2>
                <p><strong>Name:</strong> ${user.full_name}</p>
                <p><strong>Email:</strong> ${user.email}</p>
                <p><strong>Role:</strong> <span style="text-transform: capitalize;">${user.role}</span></p>
                <p><strong>User ID:</strong> ${user.id}</p>
                <hr style="border: 0; border-top: 1px solid #eee; margin: 20px 0;">
                <a href="https://thegeniusagency.co/admin/dashboard.html" style="background: #F5C542; color: #000; padding: 10px 20px; text-decoration: none; border-radius: 5px; font-weight: bold;">View in Dashboard</a>
            </div>
        `
    }),
    offer_accepted: (data) => ({
        subject: `💰 Offer Accepted & Paid: $${data.amount}`,
        text: `A client has accepted and paid for an offer.\n\nProject: ${data.project_title}\nAmount: $${data.amount}\nOffer ID: ${data.offer_id}`,
        html: `
            <div style="font-family: sans-serif; padding: 20px; border: 1px solid #eee; border-radius: 10px;">
                <h2 style="color: #22c55e;">Payment Received!</h2>
                <p>A client has just accepted and paid for an offer.</p>
                <div style="background: #f9f9f9; padding: 15px; border-radius: 8px; margin: 20px 0;">
                    <p style="margin: 5px 0;"><strong>Project:</strong> ${data.project_title}</p>
                    <p style="margin: 5px 0;"><strong>Amount:</strong> <span style="font-size: 1.2rem; color: #22c55e; font-weight: bold;">$${data.amount}</span></p>
                    <p style="margin: 5px 0;"><strong>Offer ID:</strong> ${data.offer_id}</p>
                </div>
                <a href="https://thegeniusagency.co/admin/orders.html" style="background: #22c55e; color: #fff; padding: 10px 20px; text-decoration: none; border-radius: 5px; font-weight: bold;">Manage Order</a>
            </div>
        `
    }),
    new_message: (data) => ({
        subject: `💬 New Client Message: ${data.client_name}`,
        text: `${data.client_name} sent a new message in conversation ${data.conversation_id}:\n\n"${data.content}"`,
        html: `
            <div style="font-family: sans-serif; padding: 20px; border: 1px solid #eee; border-radius: 10px;">
                <h2 style="color: #3b82f6;">New Message</h2>
                <p><strong>From:</strong> ${data.client_name}</p>
                <div style="background: #f0f7ff; padding: 15px; border-radius: 8px; margin: 15px 0; border-left: 4px solid #3b82f6;">
                    <p style="margin: 0; font-style: italic;">"${data.content}"</p>
                </div>
                <a href="https://thegeniusagency.co/admin/chat.html?cid=${data.conversation_id}" style="background: #3b82f6; color: #fff; padding: 10px 20px; text-decoration: none; border-radius: 5px; font-weight: bold;">Reply to Client</a>
            </div>
        `
    }),
    revision_requested: (data) => ({
        subject: `↩️ Revision Requested: ${data.project_title}`,
        text: `A client has requested a revision for project: ${data.project_title}.\n\nReason: ${data.reason}`,
        html: `
            <div style="font-family: sans-serif; padding: 20px; border: 1px solid #eee; border-radius: 10px;">
                <h2 style="color: #f97316;">Revision Requested</h2>
                <p>A revision was requested for <strong>${data.project_title}</strong>.</p>
                <div style="background: #fff7ed; padding: 15px; border-radius: 8px; margin: 15px 0; border-left: 4px solid #f97316;">
                    <p style="margin: 0;"><strong>Reason:</strong> ${data.reason}</p>
                </div>
                <a href="https://thegeniusagency.co/admin/projects.html" style="background: #f97316; color: #fff; padding: 10px 20px; text-decoration: none; border-radius: 5px; font-weight: bold;">View Project</a>
            </div>
        `
    }),
    deadline_reminder: (data) => ({
        subject: `⚠️ Upcoming Deadline (20h): ${data.project_title}`,
        text: `Project "${data.project_title}" is due in less than 20 hours.\n\nExpert: ${data.expert_name}\nClient: ${data.client_name}`,
        html: `
            <div style="font-family: sans-serif; padding: 20px; border: 1px solid #eee; border-radius: 10px;">
                <h2 style="color: #ef4444;">Deadline Warning</h2>
                <p>Project <strong>${data.project_title}</strong> is due in less than 20 hours!</p>
                <p><strong>Expert:</strong> ${data.expert_name}</p>
                <p><strong>Client:</strong> ${data.client_name}</p>
                <hr style="border: 0; border-top: 1px solid #eee; margin: 20px 0;">
                <a href="https://thegeniusagency.co/admin/projects.html" style="background: #ef4444; color: #fff; padding: 10px 20px; text-decoration: none; border-radius: 50px; font-weight: bold;">Check Status Now</a>
            </div>
        `
    })
};

module.exports = { sendAdminEmail, templates };
