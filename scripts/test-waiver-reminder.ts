/**
 * Test script for waiver expiration reminder system
 *
 * This script helps test the waiver reminder email without waiting for the cron job.
 * It sends a test email to verify the template and delivery work correctly.
 *
 * Usage:
 *   npx tsx scripts/test-waiver-reminder.ts
 */

import { sendWaiverExpirationReminder } from '../lib/email';

async function testWaiverReminder() {
  console.log('🧪 Testing waiver expiration reminder email...\n');

  // Test data - replace with real email for testing
  const testData = {
    firstName: 'Test',
    lastName: 'Member',
    email: 'aoberlin@thefortaiagency.ai', // CHANGE THIS to your test email
    expiresAt: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(), // 30 days from now
    daysUntilExpiration: 30,
  };

  console.log('📧 Sending test email to:', testData.email);
  console.log('📅 Waiver expires:', new Date(testData.expiresAt).toLocaleDateString());
  console.log('⏰ Days until expiration:', testData.daysUntilExpiration);
  console.log('');

  try {
    const result = await sendWaiverExpirationReminder(testData);

    if (result) {
      console.log('✅ Test email sent successfully!');
      console.log('📬 Check your inbox at:', testData.email);
      console.log('');
      console.log('Things to verify:');
      console.log('  1. Email subject is correct');
      console.log('  2. Header logo displays');
      console.log('  3. Expiration date is formatted properly');
      console.log('  4. CTA button links to /member/renew-waiver');
      console.log('  5. Footer includes contact information');
      console.log('  6. Email looks professional on desktop and mobile');
    }
  } catch (error) {
    console.error('❌ Test failed:', error);
    console.log('');
    console.log('Troubleshooting:');
    console.log('  1. Check RESEND_API_KEY in .env.local');
    console.log('  2. Verify RESEND_FROM_EMAIL domain is verified in Resend');
    console.log('  3. Make sure test email address is valid');
    process.exit(1);
  }
}

// Run the test
testWaiverReminder();
