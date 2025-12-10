import Stripe from 'stripe';
import { createServerSupabaseClient } from './supabase';

export const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!);

// Membership pricing
export const MEMBERSHIP_PRICES = {
  kids: {
    name: 'Kids Gi Classes',
    price: 7500, // $75.00 in cents
    interval: 'month' as const,
  },
  adult: {
    name: 'Adult Gi Classes',
    price: 10000, // $100.00 in cents
    interval: 'month' as const,
  },
  family: {
    name: 'Family Membership',
    price: 15000, // $150.00 in cents (discounted)
    interval: 'month' as const,
  },
};

// Family pricing calculation types
export type MemberType = 'adult' | 'kid';

export interface FamilyPricingBreakdown {
  type: MemberType;
  count: number;
  rate: number;
}

export interface FamilyPricingResult {
  monthlyTotal: number;
  breakdown: FamilyPricingBreakdown[];
  savings: number;
  vsIndividual: number;
  memberCount: number;
}

/**
 * Calculate family pricing based on member types
 * Pricing logic:
 * - 1 member: Individual rate ($75 kid, $100 adult)
 * - 2 members: $150 flat family rate
 * - 3+ members: $150 base + $50 per additional member
 */
export function calculateFamilyPrice(memberTypes: MemberType[]): FamilyPricingResult {
  const memberCount = memberTypes.length;

  // Count member types
  const kidCount = memberTypes.filter((t) => t === 'kid').length;
  const adultCount = memberTypes.filter((t) => t === 'adult').length;

  // Calculate what individual pricing would be
  const individualTotal = kidCount * 75 + adultCount * 100;

  let monthlyTotal: number;
  let breakdown: FamilyPricingBreakdown[];

  if (memberCount === 0) {
    return {
      monthlyTotal: 0,
      breakdown: [],
      savings: 0,
      vsIndividual: 0,
      memberCount: 0,
    };
  } else if (memberCount === 1) {
    // Single member: use individual rate
    monthlyTotal = individualTotal;
    breakdown = [
      {
        type: memberTypes[0],
        count: 1,
        rate: memberTypes[0] === 'kid' ? 75 : 100,
      },
    ];
  } else if (memberCount === 2) {
    // Two members: $150 flat family rate
    monthlyTotal = 150;
    breakdown = [
      { type: 'adult' as MemberType, count: adultCount, rate: 0 },
      { type: 'kid' as MemberType, count: kidCount, rate: 0 },
    ].filter((b) => b.count > 0);
    breakdown[0].rate = monthlyTotal; // Show full family rate on first item
  } else {
    // 3+ members: $150 base + $50 per additional member
    const additionalMembers = memberCount - 2;
    monthlyTotal = 150 + additionalMembers * 50;
    breakdown = [
      { type: 'adult' as MemberType, count: adultCount, rate: 0 },
      { type: 'kid' as MemberType, count: kidCount, rate: 0 },
    ].filter((b) => b.count > 0);
    // Show base rate on first, additional rate explained in description
    breakdown[0].rate = 150;
    if (breakdown.length > 1) {
      breakdown[1].rate = additionalMembers * 50;
    }
  }

  const savings = Math.max(0, individualTotal - monthlyTotal);

  return {
    monthlyTotal,
    breakdown,
    savings,
    vsIndividual: individualTotal,
    memberCount,
  };
}

/**
 * Update family subscription in Stripe based on member count
 * This handles adding/removing family members and adjusting billing
 */
export async function updateFamilySubscription(
  familyAccountId: string,
  memberCount: number
): Promise<{ success: boolean; subscription?: Stripe.Subscription; error?: string }> {
  try {
    const supabase = createServerSupabaseClient();

    // Get family account details
    const { data: familyAccount, error: familyError } = await supabase
      .from('family_accounts')
      .select('*, members!primary_member_id(*)')
      .eq('primary_member_id', familyAccountId)
      .single();

    if (familyError || !familyAccount) {
      return { success: false, error: 'Family account not found' };
    }

    const primaryMember = familyAccount.members;
    if (!primaryMember?.stripe_customer_id) {
      return { success: false, error: 'No Stripe customer ID found' };
    }

    // Get all family members to determine pricing
    const { data: allMembers } = await supabase
      .from('members')
      .select('program, individual_monthly_cost')
      .or(`id.eq.${familyAccountId},family_account_id.eq.${familyAccountId}`);

    if (!allMembers) {
      return { success: false, error: 'Could not retrieve family members' };
    }

    // Determine member types for pricing calculation
    const memberTypes: MemberType[] = allMembers.map((m) =>
      m.program?.includes('kid') ? 'kid' : 'adult'
    );

    const pricing = calculateFamilyPrice(memberTypes);

    // If subscription exists, update it
    if (familyAccount.stripe_subscription_id) {
      const subscription = await stripe.subscriptions.retrieve(
        familyAccount.stripe_subscription_id
      );

      // Get or create a family membership product
      const products = await stripe.products.list({
        active: true,
        limit: 100,
      });
      let familyProduct = products.data.find((p) => p.name === 'Family Membership');
      if (!familyProduct) {
        familyProduct = await stripe.products.create({
          name: 'Family Membership',
          description: 'Family membership with flexible pricing based on member count',
        });
      }

      // Create a new price for the updated amount
      const newPrice = await stripe.prices.create({
        currency: 'usd',
        unit_amount: pricing.monthlyTotal * 100, // Convert to cents
        product: familyProduct.id,
        recurring: { interval: 'month' },
        metadata: {
          member_count: memberCount.toString(),
          description: `${memberCount} family members - $${pricing.monthlyTotal}/month`,
        },
      });

      // Update the subscription with the new price
      const updatedSubscription = await stripe.subscriptions.update(
        familyAccount.stripe_subscription_id,
        {
          items: [
            {
              id: subscription.items.data[0].id,
              price: newPrice.id,
            },
          ],
          proration_behavior: 'always_invoice', // Prorate charges/credits
          metadata: {
            family_account_id: familyAccountId,
            member_count: memberCount.toString(),
            monthly_rate: pricing.monthlyTotal.toString(),
          },
        }
      );

      // Update family_accounts table
      await supabase
        .from('family_accounts')
        .update({
          total_members: memberCount,
          monthly_rate: pricing.monthlyTotal,
          updated_at: new Date().toISOString(),
        })
        .eq('primary_member_id', familyAccountId);

      return { success: true, subscription: updatedSubscription };
    } else {
      // No existing subscription, would need to create one
      return { success: false, error: 'No active subscription to update' };
    }
  } catch (error) {
    console.error('Error updating family subscription:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Failed to update subscription',
    };
  }
}

/**
 * Create a new family subscription in Stripe
 */
export async function createFamilySubscription({
  customerId,
  memberCount,
  memberTypes,
  familyAccountId,
  successUrl,
  cancelUrl,
}: {
  customerId: string;
  memberCount: number;
  memberTypes: MemberType[];
  familyAccountId: string;
  successUrl: string;
  cancelUrl: string;
}): Promise<Stripe.Checkout.Session> {
  const pricing = calculateFamilyPrice(memberTypes);

  return await stripe.checkout.sessions.create({
    customer: customerId,
    mode: 'subscription',
    payment_method_types: ['card'],
    line_items: [
      {
        price_data: {
          currency: 'usd',
          unit_amount: pricing.monthlyTotal * 100, // Convert to cents
          product_data: {
            name: 'Family Membership',
            description: `${memberCount} family members - Save $${pricing.savings}/month!`,
          },
          recurring: { interval: 'month' },
        },
        quantity: 1,
      },
    ],
    success_url: successUrl,
    cancel_url: cancelUrl,
    metadata: {
      family_account_id: familyAccountId,
      member_count: memberCount.toString(),
      monthly_rate: pricing.monthlyTotal.toString(),
      is_family_subscription: 'true',
    },
  });
}

// Create a Stripe customer
export async function createStripeCustomer(email: string, name: string) {
  return await stripe.customers.create({
    email,
    name,
    metadata: {
      source: 'thefortjiujitsu.com',
    },
  });
}

// Create a subscription checkout session
export async function createCheckoutSession({
  customerId,
  priceId,
  successUrl,
  cancelUrl,
}: {
  customerId: string;
  priceId: string;
  successUrl: string;
  cancelUrl: string;
}) {
  return await stripe.checkout.sessions.create({
    customer: customerId,
    mode: 'subscription',
    payment_method_types: ['card'],
    line_items: [
      {
        price: priceId,
        quantity: 1,
      },
    ],
    success_url: successUrl,
    cancel_url: cancelUrl,
  });
}

// Cancel a subscription
export async function cancelSubscription(subscriptionId: string) {
  return await stripe.subscriptions.cancel(subscriptionId);
}

// Cancel a subscription at period end (keeps access until paid period ends)
export async function cancelSubscriptionAtPeriodEnd(subscriptionId: string) {
  return await stripe.subscriptions.update(subscriptionId, {
    cancel_at_period_end: true,
  });
}

// Reactivate a subscription that was set to cancel
export async function reactivateSubscription(subscriptionId: string) {
  return await stripe.subscriptions.update(subscriptionId, {
    cancel_at_period_end: false,
  });
}

// Get subscription status
export async function getSubscription(subscriptionId: string) {
  return await stripe.subscriptions.retrieve(subscriptionId);
}

// Get customer with subscriptions
export async function getCustomerWithSubscriptions(customerId: string) {
  const customer = await stripe.customers.retrieve(customerId, {
    expand: ['subscriptions'],
  });
  return customer;
}

// Get customer portal URL for self-service billing
export async function getCustomerPortalUrl(
  customerId: string,
  returnUrl: string
) {
  const session = await stripe.billingPortal.sessions.create({
    customer: customerId,
    return_url: returnUrl,
  });

  return session.url;
}

// Update subscription to different price (upgrade/downgrade)
export async function updateSubscriptionPrice(
  subscriptionId: string,
  newPriceId: string,
  prorationBehavior: 'create_prorations' | 'none' | 'always_invoice' = 'create_prorations'
) {
  const subscription = await stripe.subscriptions.retrieve(subscriptionId);

  return await stripe.subscriptions.update(subscriptionId, {
    items: [
      {
        id: subscription.items.data[0].id,
        price: newPriceId,
      },
    ],
    proration_behavior: prorationBehavior,
  });
}

// Webhook signature verification
export function constructWebhookEvent(
  payload: string | Buffer,
  signature: string,
  webhookSecret: string
) {
  return stripe.webhooks.constructEvent(payload, signature, webhookSecret);
}
