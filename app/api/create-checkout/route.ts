/**
 * The Fort Jiu-Jitsu - Create Stripe Checkout Session
 *
 * This API route creates a Stripe Checkout session for membership purchases.
 * It handles:
 * - Individual memberships (Kids BJJ, Adult BJJ)
 * - Family memberships with automatic discount
 * - Drop-in one-time payments
 * - Free trial periods for new members
 * - Coupon/discount codes
 *
 * POST /api/create-checkout
 * Body: {
 *   membershipType: 'kids-bjj' | 'adult-bjj' | 'family' | 'drop-in',
 *   interval: 'monthly' | 'annual' | 'one-time',
 *   memberId?: string,
 *   customerId?: string,
 *   familyAccountId?: string,
 *   memberCount?: number,
 *   couponCode?: string,
 *   includeFreeTrial?: boolean
 * }
 */

import { NextRequest, NextResponse } from 'next/server';
import { stripe } from '@/lib/stripe';
import { getPriceId, STRIPE_COUPONS, TRIAL_PERIOD_DAYS } from '@/lib/stripe-products';
import { createServerSupabaseClient } from '@/lib/supabase';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const {
      membershipType,
      interval = 'monthly',
      memberId,
      customerId,
      familyAccountId,
      memberCount,
      couponCode,
      includeFreeTrial = true,
    } = body;

    // Validate required fields
    if (!membershipType) {
      return NextResponse.json(
        { error: 'membershipType is required' },
        { status: 400 }
      );
    }

    // Build the success and cancel URLs
    const baseUrl = process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000';
    const successUrl = `${baseUrl}/success?session_id={CHECKOUT_SESSION_ID}`;
    const cancelUrl = `${baseUrl}/pricing`;

    // Determine checkout mode and price
    const isOneTime = membershipType === 'drop-in' || interval === 'one-time';
    const mode = isOneTime ? 'payment' : 'subscription';

    // Get the price ID
    const priceId = getPriceId(
      membershipType as 'kids-bjj' | 'adult-bjj' | 'family' | 'drop-in',
      interval as 'monthly' | 'annual' | 'one-time'
    );

    // Build metadata
    const metadata: Record<string, string> = {
      membership_type: membershipType,
      interval,
    };

    if (memberId) {
      metadata.member_id = memberId;
    }

    if (familyAccountId) {
      metadata.family_account_id = familyAccountId;
      metadata.is_family_plan = 'true';
    }

    if (memberCount) {
      metadata.member_count = memberCount.toString();
    }

    // Determine if we should apply family discount
    const shouldApplyFamilyDiscount =
      membershipType === 'family' || (familyAccountId && memberCount && memberCount >= 2);

    // Build the checkout session parameters
    const sessionParams: any = {
      mode,
      payment_method_types: ['card'],
      line_items: [
        {
          price: priceId,
          quantity: 1,
        },
      ],
      success_url: successUrl,
      cancel_url: cancelUrl,
      allow_promotion_codes: true,
      billing_address_collection: 'required',
      metadata,
    };

    // Add customer if provided
    if (customerId) {
      sessionParams.customer = customerId;
      sessionParams.customer_update = {
        address: 'auto',
      };
    } else if (mode === 'payment') {
      // For one-time payments, we can use customer_creation
      sessionParams.customer_creation = 'always';
    }
    // For subscriptions without a customerId, Stripe will create a customer automatically

    // For subscriptions, add subscription-specific parameters
    if (mode === 'subscription') {
      sessionParams.subscription_data = {
        metadata,
      };

      // Add trial period for new members (not for drop-ins)
      if (includeFreeTrial && !customerId) {
        sessionParams.subscription_data.trial_period_days = TRIAL_PERIOD_DAYS;
      }

      // Apply family discount if applicable
      if (shouldApplyFamilyDiscount) {
        sessionParams.discounts = [
          {
            coupon: STRIPE_COUPONS.FAMILY_DISCOUNT_25,
          },
        ];
      }

      // Apply custom coupon code if provided
      if (couponCode) {
        sessionParams.discounts = [
          {
            coupon: couponCode,
          },
        ];
      }
    }

    // Create the checkout session
    const session = await stripe.checkout.sessions.create(sessionParams);

    // If we have a member ID, update the database with session info
    if (memberId) {
      const supabase = createServerSupabaseClient();
      await supabase
        .from('members')
        .update({
          payment_status: 'pending',
          updated_at: new Date().toISOString(),
        })
        .eq('id', memberId);
    }

    return NextResponse.json({
      sessionId: session.id,
      url: session.url,
      customerId: session.customer,
    });
  } catch (error) {
    console.error('Error creating checkout session:', error);

    return NextResponse.json(
      {
        error: error instanceof Error ? error.message : 'Failed to create checkout session',
      },
      { status: 500 }
    );
  }
}

// Handle GET requests for testing/verification
export async function GET(request: NextRequest) {
  return NextResponse.json({
    message: 'Checkout API is ready',
    endpoints: {
      POST: '/api/create-checkout',
    },
    requiredFields: {
      membershipType: 'kids-bjj | adult-bjj | family | drop-in',
      interval: 'monthly | annual | one-time (optional, defaults to monthly)',
    },
    optionalFields: {
      memberId: 'Member ID from database',
      customerId: 'Existing Stripe customer ID',
      familyAccountId: 'Family account ID for family plans',
      memberCount: 'Number of family members',
      couponCode: 'Stripe coupon code to apply',
      includeFreeTrial: 'boolean (defaults to true for new members)',
    },
  });
}
