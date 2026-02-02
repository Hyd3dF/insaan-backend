const express = require('express');
const router = express.Router();
const pb = require('../services/pocketbase');
const axios = require('axios');

router.post('/send', async (req, res) => {
    try {
        const { title, body } = req.body;

        if (!title || !body) {
            return res.status(400).json({ error: 'Missing title or body' });
        }

        const authHeader = req.headers.authorization;
        // Basic check - in production you might want to verify a specific secret
        if (!authHeader || !authHeader.startsWith('Bearer ')) {
            return res.status(401).json({ error: 'Unauthorized' });
        }

        console.log(`Received notification request: ${title} - ${body}`);

        // 1. Save to PocketBase 'messages' collection (for Dashboard visibility)
        try {
            await pb.collection('messages').create({
                title: title,
                body: body,
                status: 'sent',
                target: 'all',
                date: new Date().toISOString()
            });
            console.log('Message saved to PocketBase');
        } catch (dbError) {
            console.error('Failed to save message to DB:', dbError.message);
            // Continue execution to try sending the push even if DB fails? 
            // Better to fail partly or just log. We proceed.
        }

        // 2. Fetch all users with valid push tokens
        let pushTokens = [];
        try {
            // Fetch users who have a push_token and notifications enabled
            // We'll fetch all and filter or use a specific filter if PB supports checking for non-empty
            const users = await pb.collection('users').getFullList({
                filter: 'push_token != "" && is_notification_active = true'
            });

            pushTokens = users.map(u => u.push_token).filter(t => t);
            console.log(`Found ${pushTokens.length} active recipients.`);

        } catch (userError) {
            console.error('Failed to fetch users:', userError);
            return res.status(500).json({
                error: 'Failed to retrieve recipients',
                details: userError.message,
                data: userError.response?.data
            });
        }

        if (pushTokens.length === 0) {
            return res.status(200).json({ success: true, message: 'Message saved, but no active tokens found.' });
        }

        // 3. Send to Expo Push API
        // detailed logic: https://docs.expo.dev/push-notifications/sending-notifications/
        const messages = pushTokens.map(token => ({
            to: token,
            sound: 'default',
            title: title,
            body: body,
            data: { someData: 'goes here' },
        }));

        // Expo recommends batching, but for simplicity we'll send in one large array (axios might hit body limits if huge)
        // For production, chunking is recommended.

        try {
            let receiptIds = [];
            // Chunking to be safe (max 100 per request recommended by Expo)
            const CHUNK_SIZE = 100;
            for (let i = 0; i < messages.length; i += CHUNK_SIZE) {
                const chunk = messages.slice(i, i + CHUNK_SIZE);
                const expoRes = await axios.post('https://exp.host/--/api/v2/push/send', chunk, {
                    headers: {
                        'Accept': 'application/json',
                        'Content-Type': 'application/json',
                    }
                });
                // Collect receipts/status if needed
                console.log(`Expo Batch ${i / CHUNK_SIZE + 1} status:`, expoRes.status);
            }

            res.status(200).json({ success: true, recipientCount: pushTokens.length });

        } catch (expoError) {
            console.error('Expo API error:', expoError.response ? expoError.response.data : expoError.message);
            res.status(500).json({ error: 'Failed to send to Push Network' });
        }

    } catch (error) {
        console.error('Notification Handler Error:', error);
        res.status(500).json({ error: 'Internal Server Error' });
    }
});

module.exports = router;
