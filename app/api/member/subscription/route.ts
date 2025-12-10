import { NextRequest, NextResponse } from 'next/server';
import { createServerSupabaseClient } from '@/lib/supabase';
import { stripe } from '@/lib/stripe';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const memberId = searchParams.get('memberId');

    if (!memberId) {
      return NextResponse.json(
        { error: 'Member ID is required' },
        { status: 400 }
      );
    }

    const supabase = createServerSupabaseClient();

    // Get member's Stripe subscription ID
    const { data: member, error: memberError } = await supabase
      .from('members')
      .select('stripe_subscription_id, stripe_customer_id')
      .eq('id', memberId)
      .single();

    if (memberError || !member) {
      return NextResponse.json({ error: 'Member not found' }, { status: 404 });
    }

    if (!member.stripe_subscription_id) {
      return NextResponse.json({
        hasSubscription: false,
        message: 'No active subscription found',
      });
    }

    // Fetch subscription details from Stripe
    const subscription = await stripe.subscriptions.retrieve(
      member.stripe_subscription_id
    );

    // Calculate renewal info
    const currentPeriodEnd = new Date(subscription.current_period_end * 1000);
    const currentPeriodStart = new Date(subscription.current_period_start * 1000);
    const cancelAt = subscription.cancel_at ? new Date(subscription.cancel_at * 1000) : null;
    const cancelAtPeriodEnd = subscription.cancel_at_period_end;

    // Get price info
    const priceItem = subscription.items.data[0];
    const amount = priceItem?.price?.unit_amount || 0;
    const interval = priceItem?.price?.recurring?.interval || 'month';

    // Check trial status
    const trialEnd = subscription.trial_end ? new Date(subscription.trial_end * 1000) : null;
    const isInTrial = trialEnd && trialEnd > new Date();

    return NextResponse.json({
      hasSubscription: true,
      subscription: {
        id: subscription.id,
        status: subscription.status,
        currentPeriodStart: currentPeriodStart.toISOString(),
        currentPeriodEnd: currentPeriodEnd.toISOString(),
        nextBillingDate: currentPeriodEnd.toISOString(),
        cancelAtPeriodEnd,
        cancelAt: cancelAt?.toISOString() || null,
        amount: amount / 100, // Convert from cents
        interval,
        isInTrial,
        trialEnd: trialEnd?.toISOString() || null,
      },
    });
  } catch (error) {
    console.error('Subscription fetch error:', error);
    return NextResponse.json(
      { error: 'Failed to fetch subscription details' },
      { status: 500 }
    );
  }
}
