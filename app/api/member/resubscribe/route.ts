import { NextRequest, NextResponse } from 'next/server';
import Stripe from 'stripe';
import { createServerSupabaseClient } from '@/lib/supabase';

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY || '');

const STRIPE_PRICES: Record<string, { priceInCents: number; name: string; description: string }> = {
  'kids-bjj': {
    priceInCents: 7500,
    name: 'Kids Gi Classes',
    description: 'Brazilian Jiu-Jitsu for kids - Tue & Wed 5:30-6:30 PM',
  },
  'adult-bjj': {
    priceInCents: 10000,
    name: 'Adult Gi Classes',
    description: 'Brazilian Jiu-Jitsu for adults - Tue & Wed 6:30-8:00 PM + Morning Rolls',
  },
};

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { memberId } = body;

    if (!memberId) {
      return NextResponse.json(
        { error: 'Member ID is required' },
        { status: 400 }
      );
    }

    const supabase = createServerSupabaseClient();

    // Get member info
    const { data: member, error: memberError } = await supabase
      .from('members')
      .select('id, first_name, last_name, email, stripe_customer_id, program, birth_date, parent_email')
      .eq('id', memberId)
      .single();

    if (memberError || !member) {
      return NextResponse.json({ error: 'Member not found' }, { status: 404 });
    }

    // Determine if minor
    const birthDate = new Date(member.birth_date);
    const today = new Date();
    const age = today.getFullYear() - birthDate.getFullYear();
    const isMinor = age < 18;

    // Create or get Stripe customer
    let stripeCustomerId = member.stripe_customer_id;

    if (!stripeCustomerId) {
      const customer = await stripe.customers.create({
        email: isMinor && member.parent_email ? member.parent_email : member.email,
        name: `${member.first_name} ${member.last_name}`,
        metadata: {
          member_id: member.id,
        },
      });
      stripeCustomerId = customer.id;

      // Update member with stripe customer id
      await supabase
        .from('members')
        .update({ stripe_customer_id: stripeCustomerId })
        .eq('id', memberId);
    }

    // Get pricing based on program
    const program = member.program || 'adult-bjj';
    const priceConfig = STRIPE_PRICES[program] || STRIPE_PRICES['adult-bjj'];

    const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || 'https://thefortjiujitsu.com';

    // Create checkout session for subscription
    const checkoutSession = await stripe.checkout.sessions.create({
      customer: stripeCustomerId,
      mode: 'subscription',
      payment_method_types: ['card'],
      line_items: [
        {
          price_data: {
            currency: 'usd',
            unit_amount: priceConfig.priceInCents,
            product_data: {
              name: priceConfig.name,
              description: priceConfig.description,
              images: [`${baseUrl}/jiu-jitsu.png`],
            },
            recurring: { interval: 'month' },
          },
          quantity: 1,
        },
      ],
      subscription_data: {
        trial_period_days: 7, // 7-day free trial
        metadata: {
          member_id: member.id,
        },
      },
      success_url: `${baseUrl}/signup/success?session_id={CHECKOUT_SESSION_ID}&resubscribe=true`,
      cancel_url: `${baseUrl}/member?resubscribe=cancelled`,
      metadata: {
        member_id: member.id,
        payment_type: 'resubscribe',
        membership_type: program === 'kids-bjj' ? 'kids' : 'adult',
      },
      allow_promotion_codes: true,
    });

    return NextResponse.json({
      success: true,
      checkoutUrl: checkoutSession.url,
    });
  } catch (error) {
    console.error('Resubscribe error:', error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Failed to create subscription' },
      { status: 500 }
    );
  }
}
