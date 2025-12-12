import { NextRequest, NextResponse } from 'next/server';
import { createServerSupabaseClient } from '@/lib/supabase';
import { sendWaiverExpirationReminder } from '@/lib/email';

/**
 * Waiver Expiration Reminder Cron Job
 *
 * This route sends email reminders to members whose waivers will expire in 30 days.
 * Can be triggered by Vercel Cron or manually via GET request.
 *
 * Usage:
 * - Vercel Cron: Add to vercel.json
 * - Manual: GET /api/cron/waiver-reminders
 */

export async function GET(request: NextRequest) {
  try {
    console.log('🔔 Waiver expiration reminder cron job started at', new Date().toISOString());

    const supabase = createServerSupabaseClient();

    // Calculate date 30 days from now
    const thirtyDaysFromNow = new Date();
    thirtyDaysFromNow.setDate(thirtyDaysFromNow.getDate() + 30);

    // Calculate date 31 days from now (to get waivers expiring exactly 30 days from now)
    const thirtyOneDaysFromNow = new Date();
    thirtyOneDaysFromNow.setDate(thirtyOneDaysFromNow.getDate() + 31);

    // Get all waivers signed exactly 335-336 days ago (365 - 30 = 335, 365 - 29 = 336)
    // This means they expire in 29-30 days
    const oneYearAgo = new Date();
    oneYearAgo.setFullYear(oneYearAgo.getFullYear() - 1);

    const threeHundredThirtyFiveDaysAgo = new Date();
    threeHundredThirtyFiveDaysAgo.setDate(threeHundredThirtyFiveDaysAgo.getDate() - 335);

    const threeHundredThirtySixDaysAgo = new Date();
    threeHundredThirtySixDaysAgo.setDate(threeHundredThirtySixDaysAgo.getDate() - 336);

    console.log('📅 Looking for waivers signed between:');
    console.log('  -', threeHundredThirtySixDaysAgo.toISOString(), '(336 days ago)');
    console.log('  -', threeHundredThirtyFiveDaysAgo.toISOString(), '(335 days ago)');

    // Get all waivers signed in this date range
    const { data: expiringWaivers, error: waiversError } = await supabase
      .from('waivers')
      .select(`
        id,
        member_id,
        signed_at,
        signer_name,
        signer_email,
        waiver_type
      `)
      .gte('signed_at', threeHundredThirtySixDaysAgo.toISOString())
      .lte('signed_at', threeHundredThirtyFiveDaysAgo.toISOString())
      .order('signed_at', { ascending: false });

    if (waiversError) {
      console.error('❌ Error fetching waivers:', waiversError);
      return NextResponse.json(
        { error: 'Failed to fetch waivers', details: waiversError.message },
        { status: 500 }
      );
    }

    if (!expiringWaivers || expiringWaivers.length === 0) {
      console.log('✅ No waivers expiring in 30 days');
      return NextResponse.json({
        success: true,
        message: 'No waivers expiring in 30 days',
        emailsSent: 0,
        waivers: []
      });
    }

    console.log(`📋 Found ${expiringWaivers.length} waivers expiring in ~30 days`);

    // Group waivers by member_id to get only the most recent waiver per member
    const memberWaiverMap = new Map<string, typeof expiringWaivers[0]>();

    for (const waiver of expiringWaivers) {
      const existing = memberWaiverMap.get(waiver.member_id);
      if (!existing || new Date(waiver.signed_at) > new Date(existing.signed_at)) {
        memberWaiverMap.set(waiver.member_id, waiver);
      }
    }

    const uniqueWaivers = Array.from(memberWaiverMap.values());
    console.log(`👥 ${uniqueWaivers.length} unique members need reminders`);

    // Get member details for each waiver
    const memberIds = uniqueWaivers.map(w => w.member_id);
    const { data: members, error: membersError } = await supabase
      .from('members')
      .select('id, first_name, last_name, email, status')
      .in('id', memberIds);

    if (membersError) {
      console.error('❌ Error fetching members:', membersError);
      return NextResponse.json(
        { error: 'Failed to fetch member details', details: membersError.message },
        { status: 500 }
      );
    }

    // Filter to only active members
    const activeMembers = members?.filter(m => m.status === 'active') || [];
    console.log(`✅ ${activeMembers.length} active members to email`);

    // Send reminder emails
    const results = [];
    let successCount = 0;
    let failureCount = 0;

    for (const member of activeMembers) {
      const waiver = uniqueWaivers.find(w => w.member_id === member.id);
      if (!waiver) continue;

      const signedDate = new Date(waiver.signed_at);
      const expiresDate = new Date(signedDate);
      expiresDate.setFullYear(expiresDate.getFullYear() + 1);

      const daysUntilExpiration = Math.ceil(
        (expiresDate.getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24)
      );

      try {
        console.log(`📧 Sending reminder to ${member.first_name} ${member.last_name} (${member.email})`);
        console.log(`   Waiver expires in ${daysUntilExpiration} days on ${expiresDate.toLocaleDateString()}`);

        await sendWaiverExpirationReminder({
          firstName: member.first_name,
          lastName: member.last_name,
          email: member.email,
          expiresAt: expiresDate.toISOString(),
          daysUntilExpiration,
        });

        successCount++;
        results.push({
          memberId: member.id,
          memberName: `${member.first_name} ${member.last_name}`,
          email: member.email,
          expiresAt: expiresDate.toISOString(),
          daysUntilExpiration,
          status: 'sent'
        });

        // Rate limit: wait 2 seconds between emails to avoid hitting Resend limits
        if (activeMembers.indexOf(member) < activeMembers.length - 1) {
          await new Promise(resolve => setTimeout(resolve, 2000));
        }
      } catch (error) {
        console.error(`❌ Failed to send email to ${member.email}:`, error);
        failureCount++;
        results.push({
          memberId: member.id,
          memberName: `${member.first_name} ${member.last_name}`,
          email: member.email,
          expiresAt: expiresDate.toISOString(),
          daysUntilExpiration,
          status: 'failed',
          error: error instanceof Error ? error.message : 'Unknown error'
        });
      }
    }

    console.log('✅ Waiver reminder cron job completed');
    console.log(`   Sent: ${successCount}`);
    console.log(`   Failed: ${failureCount}`);

    return NextResponse.json({
      success: true,
      message: `Sent ${successCount} waiver expiration reminders`,
      emailsSent: successCount,
      emailsFailed: failureCount,
      totalWaivers: expiringWaivers.length,
      uniqueMembers: uniqueWaivers.length,
      activeMembers: activeMembers.length,
      results,
    });

  } catch (error) {
    console.error('❌ Waiver reminder cron job error:', error);
    return NextResponse.json(
      {
        error: 'Cron job failed',
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
}
