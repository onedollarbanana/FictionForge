/**
 * Generate VAPID keys for web push notifications.
 * 
 * Usage:
 *   npx web-push generate-vapid-keys
 *   OR
 *   node scripts/generate-vapid-keys.js
 * 
 * Add the output to your .env.local file:
 *   NEXT_PUBLIC_VAPID_PUBLIC_KEY=...
 *   VAPID_PRIVATE_KEY=...
 */

try {
  const webpush = require('web-push');
  const keys = webpush.generateVAPIDKeys();
  console.log('\n# Web Push VAPID Keys');
  console.log('# Add these to your .env.local and Vercel environment variables\n');
  console.log('NEXT_PUBLIC_VAPID_PUBLIC_KEY=' + keys.publicKey);
  console.log('VAPID_PRIVATE_KEY=' + keys.privateKey);
  console.log();
} catch (e) {
  console.error('Error: web-push package not found. Run: npm install web-push');
  process.exit(1);
}
