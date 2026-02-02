const express = require('express');
const router = express.Router();
const multer = require('multer');
const pb = require('../services/pocketbase');
const fs = require('fs');

// Configure Multer for memory storage (we'll upload buffer to PocketBase)
// OR usage of temporary file if PocketBase requires it. 
// PocketBase JS SDK handles FormData construction from File objects or Blobs. 
// In Node.js, we can pass a Blob or File from 'formdata-node' or strict buffer with name.
// Simplest: Use multer to get the file, then re-construct FormData for PocketBase.

const upload = multer({ storage: multer.memoryStorage() });

router.post('/save', upload.single('image'), async (req, res) => {
    try {
        const {
            user,
            pair,
            direction,
            timeframe,
            entry_price,
            tp_price,
            sl_price,
            status,
            analysis_note
        } = req.body;

        const imageFile = req.file;

        if (!user || !pair || !direction || !entry_price) {
            return res.status(400).json({ error: 'Missing required fields' });
        }

        // Prepare data for PocketBase
        const formData = new FormData();
        formData.append('user', user);
        formData.append('pair', pair);
        formData.append('direction', direction);
        formData.append('timeframe', timeframe);
        formData.append('entry_price', entry_price);
        formData.append('tp_price', tp_price);
        formData.append('sl_price', sl_price);
        formData.append('status', status || 'PENDING');
        formData.append('analysis_note', analysis_note || '');

        if (imageFile) {
            // In Node environment, PocketBase SDK needs a Blob/File compatible object.
            // Using the buffer directly with filename options usually works or we convert.
            // For latest PB SDK in Node:
            const blob = new Blob([imageFile.buffer]);
            formData.append('chart_image', blob, imageFile.originalname);
        }

        // Save to PocketBase
        // Note: 'signals' collection must exist in PB
        const record = await pb.collection('signals').create(formData);

        res.status(200).json({ success: true, record });

    } catch (error) {
        console.error('Error saving signal:', error);
        res.status(500).json({ error: error.message || 'Failed to save signal' });
    }
});

module.exports = router;
