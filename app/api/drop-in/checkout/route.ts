import { NextRequest, NextResponse } from 'next/server';
import Stripe from 'stripe';
import { createServerSupabaseClient } from '@/lib/supabase';

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY || '');

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { firstName, lastName, email, phone } = body;

    if (!firstName || !lastName || !email) {
      return NextResponse.json(
        { error: 'First name, last name, and email are required' },
        { status: 400 }
      );
    }

    const supabase = createServerSupabaseClient();

    // Check if this email already exists as a member
    const { data: existingMember } = await supabase
      .from('members')
      .select('id, status, stripe_customer_id')
      .eq('email', email.toLowerCase().trim())
      .single();

    let stripeCustomerId: string;
    let memberId: string | null = null;

    if (existingMember) {
      // Use existing member's Stripe customer or create new one
      memberId = existingMember.id;
      if (existingMember.stripe_customer_id) {
        stripeCustomerId = existingMember.stripe_customer_id;
      } else {
        const customer = await stripe.customers.create({
          email: email.toLowerCase().trim(),
          name: `${firstName} ${lastName}`,
          phone: phone || undefined,
          metadata: {
            member_id: existingMember.id,
            source: 'drop-in-checkout',
          },
        });
        stripeCustomerId = customer.id;

        // Update member with stripe customer id
        await supabase
          .from('members')
          .update({ stripe_customer_id: stripeCustomerId })
          .eq('id', existingMember.id);
      }
    } else {
      // Create new Stripe customer for visitor
      const customer = await stripe.customers.create({
        email: email.toLowerCase().trim(),
        name: `${firstName} ${lastName}`,
        phone: phone || undefined,
        metadata: {
          source: 'drop-in-checkout',
          visitor: 'true',
        },
      });
      stripeCustomerId = customer.id;

      // Create a pending member record for the visitor
      const { data: newMember, error: memberError } = await supabase
        .from('members')
        .insert({
          first_name: firstName,
          last_name: lastName,
          email: email.toLowerCase().trim(),
          phone: phone || null,
          birth_date: '1990-01-01', // Placeholder - will need to be updated
          program: 'adult-bjj',
          skill_level: 'beginner',
          status: 'pending',
          membership_type: 'drop-in',
          stripe_customer_id: stripeCustomerId,
          payment_status: 'pending',
          is_primary_account_holder: true,
          individual_monthly_cost: 20,
        })
        .select()
        .single();

      if (!memberError && newMember) {
        memberId = newMember.id;
      }
    }

    const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || 'https://thefortjiujitsu.com';

    // Create checkout session for drop-in
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
      success_url: `${baseUrl}/check-in/success?drop_in=true&name=${encodeURIComponent(firstName)}`,
      cancel_url: `${baseUrl}/check-in?drop_in=cancelled`,
      metadata: {
        member_id: memberId || '',
        payment_type: 'drop-in',
        visitor_name: `${firstName} ${lastName}`,
        visitor_email: email,
      },
    });

    return NextResponse.json({
      success: true,
      checkoutUrl: checkoutSession.url,
    });
  } catch (error) {
    console.error('Drop-in checkout error:', error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Failed to create checkout session' },
      { status: 500 }
    );
  }
}
