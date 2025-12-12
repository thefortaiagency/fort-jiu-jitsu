// Test script to send welcome email
// Run with: npx tsx scripts/test-welcome-email.ts

import * as dotenv from 'dotenv';
dotenv.config({ path: '.env.local' });

import { sendWelcomeEmail } from '../lib/email';

async function main() {
  console.log('Sending test welcome email...');

  try {
    await sendWelcomeEmail({
      firstName: 'Andy',
      lastName: 'Berlin',
      email: 'aoberlin@fortwrestling.com',
      membershipType: 'adult',
      isMinor: false,
    });
    console.log('✅ Welcome email sent successfully!');
  } catch (error) {
    console.error('❌ Failed to send email:', error);
    process.exit(1);
  }
}

main();
