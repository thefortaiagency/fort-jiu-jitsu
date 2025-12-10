import { NextRequest, NextResponse } from 'next/server';
import { stripe } from '@/lib/stripe';
import { createServerSupabaseClient } from '@/lib/supabase';
import { isMinor } from '@/lib/waiver-utils';

const DROP_IN_PRICE_CENTS = 2000; // $20

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { memberId, email, firstName, lastName, needsWaiver, signatureData, signerName } = body;

    const supabase = createServerSupabaseClient();
    const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || 'https://thefortjiujitsu.com';

    let member;
    let stripeCustomerId;

    if (memberId) {
      // Existing member - look them up
      const { data: existingMember, error } = await supabase
        .from('members')
        .select('*')
        .eq('id', memberId)
        .single();

      if (error || !existingMember) {
        return NextResponse.json({ error: 'Member not found' }, { status: 404 });
      }

      member = existingMember;
      stripeCustomerId = existingMember.stripe_customer_id;

      // If they need to renew waiver, save it
      if (needsWaiver && signatureData && signerName) {
        // Determine signer relationship based on current age
        const memberIsMinor = member.birth_date && isMinor(member.birth_date);
        let signerRelationship = 'self';

        if (memberIsMinor) {
          // For minors, check if signer matches parent name
          const parentName = `${member.parent_first_name} ${member.parent_last_name}`.toLowerCase();
          const signerNameLower = signerName.toLowerCase();
          signerRelationship = signerNameLower === parentName ? 'parent' : 'guardian';
        }

        await supabase.from('waivers').insert({
          member_id: memberId,
          waiver_type: 'liability',
          waiver_version: '1.0',
          signer_name: signerName,
          signer_email: memberIsMinor && member.parent_email ? member.parent_email : existingMember.email,
          signer_relationship: signerRelationship,
          signature_data: signatureData,
          ip_address: request.headers.get('x-forwarded-for') || request.headers.get('x-real-ip') || 'unknown',
          user_agent: request.headers.get('user-agent') || 'unknown',
        });
      }

      // Create Stripe customer if they don't have one
      if (!stripeCustomerId) {
        const customer = await stripe.customers.create({
          email: existingMember.email,
          name: `${existingMember.first_name} ${existingMember.last_name}`,
          metadata: {
            member_id: memberId,
            source: 'thefortjiujitsu.com',
          },
        });
        stripeCustomerId = customer.id;

        // Update member with Stripe customer ID
        await supabase
          .from('members')
          .update({ stripe_customer_id: customer.id })
          .eq('id', memberId);
      }
    } else {
      // This shouldn't happen for drop-in flow, but handle it
      return NextResponse.json(
        { error: 'Member ID required for drop-in' },
        { status: 400 }
      );
    }

    // Create one-time payment checkout session
    const checkoutSession = await stripe.checkout.sessions.create({
      customer: stripeCustomerId,
      mode: 'payment',
      payment_method_types: ['card'],
      line_items: [
        {
          price_data: {
            currency: 'usd',
            unit_amount: DROP_IN_PRICE_CENTS,
            product_data: {
              name: 'Drop-in Class',
              description: 'Single class visit at The Fort Jiu-Jitsu',
            },
          },
          quantity: 1,
        },
      ],
      success_url: `${baseUrl}/drop-in/success?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${baseUrl}/signup?cancelled=true`,
      metadata: {
        member_id: member.id,
        type: 'drop-in',
      },
    });

    return NextResponse.json({
      success: true,
      checkoutUrl: checkoutSession.url,
    });
  } catch (error) {
    console.error('Drop-in error:', error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Drop-in payment failed' },
      { status: 500 }
    );
  }
}
