import { NextRequest, NextResponse } from 'next/server';
import { createServerSupabaseClient } from '@/lib/supabase';
import { cancelSubscriptionAtPeriodEnd } from '@/lib/stripe';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { memberId, reason } = body;

    console.log('Cancel membership request received:', { memberId, reason });

    if (!memberId) {
      return NextResponse.json(
        { error: 'Member ID is required' },
        { status: 400 }
      );
    }

    const supabase = createServerSupabaseClient();

    // Get member info including Stripe subscription
    const { data: member, error: memberError } = await supabase
      .from('members')
      .select('id, first_name, last_name, email, stripe_subscription_id, status')
      .eq('id', memberId)
      .single();

    if (memberError || !member) {
      console.error('Member not found:', { memberId, memberError });
      return NextResponse.json({ error: 'Member not found' }, { status: 404 });
    }

    console.log('Member found:', { id: member.id, email: member.email, status: member.status, stripe_subscription_id: member.stripe_subscription_id });

    // Cancel Stripe subscription at period end (if they have one)
    let stripeResult = null;
    if (member.stripe_subscription_id) {
      try {
        stripeResult = await cancelSubscriptionAtPeriodEnd(member.stripe_subscription_id);
      } catch (stripeError) {
        console.error('Stripe cancellation error:', stripeError);
        // Continue even if Stripe fails - we'll update our records
      }
    }

    // Update member status in database
    // Note: Using 'cancelled' status since database constraint only allows: active, inactive, cancelled
    // Only updating fields that exist in the schema
    console.log('Attempting database update for member:', memberId);

    const { data: updateResult, error: updateError } = await supabase
      .from('members')
      .update({
        status: 'cancelled',
        updated_at: new Date().toISOString(),
      })
      .eq('id', memberId)
      .select();

    if (updateError) {
      console.error('Database update error:', {
        code: updateError.code,
        message: updateError.message,
        details: updateError.details,
        hint: updateError.hint
      });
      return NextResponse.json(
        { error: `Failed to process cancellation: ${updateError.message}` },
        { status: 500 }
      );
    }

    console.log('Database update successful:', updateResult);

    // Get the cancellation date (end of billing period)
    let cancelAt = null;
    if (stripeResult && stripeResult.current_period_end) {
      cancelAt = new Date(stripeResult.current_period_end * 1000).toISOString();
    }

    return NextResponse.json({
      success: true,
      message: 'Your membership has been scheduled for cancellation',
      cancelAt,
      note: 'You will continue to have access until the end of your current billing period.',
    });
  } catch (error) {
    console.error('Unhandled cancellation error:', {
      name: error instanceof Error ? error.name : 'Unknown',
      message: error instanceof Error ? error.message : String(error),
      stack: error instanceof Error ? error.stack : undefined
    });
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Failed to cancel membership' },
      { status: 500 }
    );
  }
}
