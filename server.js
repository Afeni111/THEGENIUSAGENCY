require('dotenv').config();
const express = require('express');
const cors = require('cors');
const path = require('path');
const { createClient } = require('@supabase/supabase-js');

const app = express();
const DEFAULT_PORT = Number(process.env.PORT) || 3000;

// Initialize Supabase Client
const supabaseUrl = process.env.SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
const supabase = createClient(supabaseUrl, supabaseKey);

// Middleware
app.use(cors());
app.use(express.json());

// Serve Static Files (no caching so changes appear immediately)
app.use(express.static(__dirname, {
    etag: false,
    lastModified: false,
    setHeaders: (res, filePath) => {
        res.set('Cache-Control', 'no-store, no-cache, must-revalidate');
        res.set('Pragma', 'no-cache');
        res.set('Expires', '0');
    }
}));

// Routes
const briefsRouter = require('./routes/briefs');
const offersRouter = require('./routes/offers');
const paystackRouter = require('./routes/paystack');
const projectsRouter = require('./routes/projects');
const notificationsRouter = require('./routes/notifications');

app.use('/api/briefs', briefsRouter);
app.use('/api/offers', offersRouter);
app.use('/api/paystack', paystackRouter);
app.use('/api/projects', projectsRouter);
app.use('/api/notifications', notificationsRouter);

// Health Check
app.get('/api/health', (req, res) => {
    res.json({ status: 'active', message: 'Genius Agency API is running.' });
});

// Root Route - Fallback to index.html (only for non-file, non-api paths)
const fs = require('fs');
app.get('*path', (req, res) => {
    if (req.path.startsWith('/api')) return;
    const filePath = path.join(__dirname, req.path);
    if (fs.existsSync(filePath) && fs.statSync(filePath).isFile()) {
        return res.sendFile(filePath);
    }
    res.sendFile(path.join(__dirname, 'index.html'));
});

// Start Server (auto-pick a free port if 3000 is taken)
function startServer(port, attemptsLeft = 10) {
    const server = app.listen(port, () => {
        console.log(`[SERVER] Running on http://localhost:${port}`);
    });

    server.on('error', (err) => {
        if (err && err.code === 'EADDRINUSE' && attemptsLeft > 0) {
            const nextPort = port + 1;
            console.warn(`[SERVER] Port ${port} is in use. Trying ${nextPort}...`);
            startServer(nextPort, attemptsLeft - 1);
            return;
        }

        console.error('[SERVER] Failed to start server:', err);
        process.exit(1);
    });
}

// Export for Vercel
module.exports = app;

// Start Server (only if not running as a Vercel function)
if (require.main === module) {
    startServer(DEFAULT_PORT);
}
