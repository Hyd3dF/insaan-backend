const PocketBase = require('pocketbase/cjs');

// Initialize PocketBase
const pb = new PocketBase(process.env.POCKETBASE_URL || 'http://pocketbase-v4okssck4c0s4ccowkoowccs.91.99.182.76.sslip.io');

// Authenticate as superuser/admin (PB v0.23+ uses _superusers collection)
// This is executed asynchronously; subsequent calls will use the auth state
pb.collection('_superusers').authWithPassword(
    process.env.POCKETBASE_ADMIN_EMAIL,
    process.env.POCKETBASE_ADMIN_PASSWORD
).then(() => {
    console.log('Logged in as PocketBase Superuser/Admin');
}).catch(err => {
    console.error('Failed to log in as PocketBase Admin:', err.message);
});

module.exports = pb;
