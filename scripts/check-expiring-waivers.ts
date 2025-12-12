/**
 * Check which members have waivers expiring in 30 days
 *
 * This script queries the database to see which members would receive
 * reminder emails if the cron job ran today.
 *
 * Usage:
 *   npx tsx scripts/check-expiring-waivers.ts
 */

import { createServerSupabaseClient } from '../lib/supabase';

async function checkExpiringWaivers() {
  console.log('🔍 Checking for waivers expiring in 30 days...\n');

  const supabase = createServerSupabaseClient();

  // Same logic as cron job
  const threeHundredThirtyFiveDaysAgo = new Date();
  threeHundredThirtyFiveDaysAgo.setDate(threeHundredThirtyFiveDaysAgo.getDate() - 335);

  const threeHundredThirtySixDaysAgo = new Date();
  threeHundredThirtySixDaysAgo.setDate(threeHundredThirtySixDaysAgo.getDate() - 336);

  console.log('📅 Looking for waivers signed between:');
  console.log(`   ${threeHundredThirtySixDaysAgo.toLocaleDateString()} (336 days ago)`);
  console.log(`   ${threeHundredThirtyFiveDaysAgo.toLocaleDateString()} (335 days ago)`);
  console.log('');

  // Get waivers
  const { data: waivers, error: waiversError } = await supabase
    .from('waivers')
    .select(`
      id,
      member_id,
      signed_at,
      signer_name,
      signer_email
    `)
    .gte('signed_at', threeHundredThirtySixDaysAgo.toISOString())
    .lte('signed_at', threeHundredThirtyFiveDaysAgo.toISOString())
    .order('signed_at', { ascending: false });

  if (waiversError) {
    console.error('❌ Error:', waiversError);
    return;
  }

  if (!waivers || waivers.length === 0) {
    console.log('✅ No waivers expiring in 30 days');
    console.log('');
    console.log('💡 To test the system:');
    console.log('   1. Use scripts/test-waiver-reminder.ts to send a test email');
    console.log('   2. Or manually trigger: GET /api/cron/waiver-reminders');
    return;
  }

  console.log(`📋 Found ${waivers.length} waivers expiring soon\n`);

  // Group by member
  const memberWaiverMap = new Map<string, typeof waivers[0]>();
  for (const waiver of waivers) {
    const existing = memberWaiverMap.get(waiver.member_id);
    if (!existing || new Date(waiver.signed_at) > new Date(existing.signed_at)) {
      memberWaiverMap.set(waiver.member_id, waiver);
    }
  }

  const uniqueWaivers = Array.from(memberWaiverMap.values());
  console.log(`👥 ${uniqueWaivers.length} unique members\n`);

  // Get member details
  const memberIds = uniqueWaivers.map(w => w.member_id);
  const { data: members, error: membersError } = await supabase
    .from('members')
    .select('id, first_name, last_name, email, status')
    .in('id', memberIds);

  if (membersError) {
    console.error('❌ Error:', membersError);
    return;
  }

  // Show results
  console.log('MEMBERS WHO WILL RECEIVE REMINDERS:');
  console.log('─'.repeat(80));

  let activeCount = 0;
  let inactiveCount = 0;

  for (const member of members || []) {
    const waiver = uniqueWaivers.find(w => w.member_id === member.id);
    if (!waiver) continue;

    const signedDate = new Date(waiver.signed_at);
    const expiresDate = new Date(signedDate);
    expiresDate.setFullYear(expiresDate.getFullYear() + 1);

    const daysUntil = Math.ceil(
      (expiresDate.getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24)
    );

    const isActive = member.status === 'active';
    const statusEmoji = isActive ? '✅' : '⚠️';

    if (isActive) {
      activeCount++;
    } else {
      inactiveCount++;
    }

    console.log(`${statusEmoji} ${member.first_name} ${member.last_name}`);
    console.log(`   Email: ${member.email}`);
    console.log(`   Status: ${member.status}`);
    console.log(`   Signed: ${signedDate.toLocaleDateString()}`);
    console.log(`   Expires: ${expiresDate.toLocaleDateString()} (${daysUntil} days)`);
    console.log('');
  }

  console.log('─'.repeat(80));
  console.log(`\n📊 SUMMARY:`);
  console.log(`   Total waivers expiring: ${waivers.length}`);
  console.log(`   Unique members: ${uniqueWaivers.length}`);
  console.log(`   Active members (will receive email): ${activeCount}`);
  console.log(`   Inactive members (will NOT receive email): ${inactiveCount}`);
  console.log('');

  if (activeCount === 0) {
    console.log('💡 No active members will receive emails.');
    console.log('   All members with expiring waivers are inactive.');
  } else {
    console.log(`✅ ${activeCount} email(s) will be sent when cron job runs.`);
  }

  console.log('');
  console.log('🔧 NEXT STEPS:');
  console.log('   1. Review the list above');
  console.log('   2. Test email delivery: npx tsx scripts/test-waiver-reminder.ts');
  console.log('   3. Manual trigger: GET /api/cron/waiver-reminders');
  console.log('   4. Deploy to enable automatic daily reminders');
}

checkExpiringWaivers();
