import Stripe from 'stripe';

export const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: '2025-04-30.basil',
});

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

// Get subscription status
export async function getSubscription(subscriptionId: string) {
  return await stripe.subscriptions.retrieve(subscriptionId);
}
