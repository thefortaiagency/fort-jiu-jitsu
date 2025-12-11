import { NextRequest, NextResponse } from 'next/server';
import Stripe from 'stripe';
import { createServerSupabaseClient } from '@/lib/supabase';

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY || '');

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
      .select('id, first_name, last_name, email, stripe_customer_id, program')
      .eq('id', memberId)
      .single();

    if (memberError || !member) {
      return NextResponse.json({ error: 'Member not found' }, { status: 404 });
    }

    // Create or get Stripe customer
    let stripeCustomerId = member.stripe_customer_id;

    if (!stripeCustomerId) {
      const customer = await stripe.customers.create({
        email: member.email,
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

    const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || 'https://thefortjiujitsu.com';

    // Create checkout session for drop-in payment
    const checkoutSession = await stripe.checkout.sessions.create({
      customer: stripeCustomerId,
      mode: 'payment',
      payment_method_types: ['card'],
      line_items: [
        {
          price_data: {
            currency: 'usd',
            unit_amount: 2000, // $20.00
            product_data: {
              name: 'Drop-in Class',
              description: 'Single class visit at The Fort Jiu-Jitsu',
              images: [`${baseUrl}/jiu-jitsu.png`],
            },
          },
          quantity: 1,
        },
      ],
      success_url: `${baseUrl}/member?drop_in=success`,
      cancel_url: `${baseUrl}/member?drop_in=cancelled`,
      metadata: {
        member_id: member.id,
        payment_type: 'drop-in',
      },
    });

    return NextResponse.json({
      success: true,
      checkoutUrl: checkoutSession.url,
    });
  } catch (error) {
    console.error('Drop-in payment error:', error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Failed to create payment session' },
      { status: 500 }
    );
  }
}
