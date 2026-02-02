const PocketBase = require('pocketbase/cjs');

// Initialize PocketBase
const pb = new PocketBase(process.env.POCKETBASE_URL || 'http://pocketbase-v4okssck4c0s4ccowkoowccs.91.99.182.76.sslip.io');

module.exports = pb;
