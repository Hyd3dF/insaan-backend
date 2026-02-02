require('dotenv').config();
const express = require('express');
const cors = require('cors');
const cron = require('node-cron');
const signalsRouter = require('./routes/signals');
const notificationsRouter = require('./routes/notifications');
const tracker = require('./cron/tracker');

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Routes
app.use('/api/signals', signalsRouter);
app.use('/api', notificationsRouter); // Mounts at /api/send

// Health check endpoint
app.get('/health', (req, res) => {
    res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

// Start Server
app.listen(PORT, async () => {
    console.log('======================================');
    console.log(`Signal Tracker Backend`);
    console.log(`Server running on port ${PORT}`);
    console.log(`PocketBase: ${process.env.POCKETBASE_URL}`);
    console.log('======================================');

    // Test Finnhub API connection on startup
    await tracker.testFinnhubConnection();

    console.log('');
    console.log('Cron job scheduled: checking signals every minute');
    console.log('======================================\n');
});

// Start Cron Job (Runs every 1 minute)
// Checks for PENDING signals and updates them
cron.schedule('* * * * *', () => {
    tracker.checkSignals();
});
