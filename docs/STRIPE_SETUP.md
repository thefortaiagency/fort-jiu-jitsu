# The Fort Jiu-Jitsu - Stripe Integration Setup Guide

Complete guide for setting up Stripe payments for The Fort Jiu-Jitsu gym membership system.

## Table of Contents
- [Prerequisites](#prerequisites)
- [Initial Setup](#initial-setup)
- [Running the Setup Script](#running-the-setup-script)
- [Configuring Webhooks](#configuring-webhooks)
- [Testing the Integration](#testing-the-integration)
- [Production Deployment](#production-deployment)
- [Troubleshooting](#troubleshooting)

## Prerequisites

1. **Stripe Account**: Sign up at [stripe.com](https://stripe.com)
2. **API Keys**: Located in Stripe Dashboard > Developers > API Keys
3. **Environment Variables**: Already configured in `.env.local`

## Initial Setup

### 1. Install Dependencies

The Stripe package is already installed. Verify with:

```bash
npm list stripe
```

### 2. Set Environment Variables

Add to your `.env.local` (already configured):

```env
# Stripe Keys
STRIPE_SECRET_KEY=sk_live_51IR...  # Your secret key
STRIPE_PUBLISHABLE_KEY=pk_live_... # Your publishable key
STRIPE_WEBHOOK_SECRET=whsec_...    # Webhook signing secret (add after webhook setup)

# App URL for redirects
NEXT_PUBLIC_SITE_URL=https://thefortjiujitsu.com
```

## Running the Setup Script

### 1. Install ts-node (if needed)

```bash
npm install -D ts-node
```

### 2. Run the Product Setup Script

```bash
npx ts-node scripts/setup-stripe-products.ts
```

This script will:
- ✅ Create 4 products in Stripe (Kids BJJ, Adult BJJ, Family Plan, Drop-in)
- ✅ Set up monthly and annual pricing with automatic discounts
- ✅ Create promotional coupons (Family discount, Free trial, Grand opening)
- ✅ Output product and price IDs for your application

### 3. Copy Product IDs

The script will output JSON like this:

```json
{
  "products": {
    "KIDS_BJJ": {
      "productId": "prod_XXXXXXXXXX",
      "monthlyPriceId": "price_XXXXXXXXXX",
      "annualPriceId": "price_XXXXXXXXXX"
    },
    "ADULT_BJJ": {
      "productId": "prod_XXXXXXXXXX",
      "monthlyPriceId": "price_XXXXXXXXXX",
      "annualPriceId": "price_XXXXXXXXXX"
    },
    "FAMILY_PLAN": {
      "productId": "prod_XXXXXXXXXX",
      "monthlyPriceId": "price_XXXXXXXXXX"
    },
    "DROP_IN": {
      "productId": "prod_XXXXXXXXXX",
      "oneTimePriceId": "price_XXXXXXXXXX"
    }
  },
  "coupons": {
    "FAMILY_DISCOUNT_25": "FAMILY_DISCOUNT_25",
    "FIRST_WEEK_FREE": "FIRST_WEEK_FREE",
    "GRAND_OPENING_50": "GRAND_OPENING_50"
  }
}
```

### 4. Update Product IDs File

Replace the placeholder IDs in `lib/stripe-products.ts`:

```typescript
export const STRIPE_PRODUCTS: Record<string, StripeProduct> = {
  KIDS_BJJ: {
    productId: 'prod_XXXXXXXXXX', // ← Paste your IDs here
    monthlyPriceId: 'price_XXXXXXXXXX',
    annualPriceId: 'price_XXXXXXXXXX',
  },
  // ... etc
};
```

## Configuring Webhooks

Webhooks are essential for keeping your database in sync with Stripe events.

### 1. Local Testing with Stripe CLI

Install the Stripe CLI:

```bash
# macOS
brew install stripe/stripe-cli/stripe

# Login to your Stripe account
stripe login
```

Forward webhooks to your local server:

```bash
stripe listen --forward-to localhost:3000/api/webhooks/stripe
```

This will output a webhook signing secret like `whsec_...`. Add it to `.env.local`:

```env
STRIPE_WEBHOOK_SECRET=whsec_...
```

### 2. Production Webhook Setup

1. Go to [Stripe Dashboard > Developers > Webhooks](https://dashboard.stripe.com/webhooks)
2. Click **"Add endpoint"**
3. Enter your endpoint URL:
   ```
   https://thefortjiujitsu.com/api/webhooks/stripe
   ```
4. Select events to listen for:
   - ✅ `checkout.session.completed`
   - ✅ `customer.subscription.created`
   - ✅ `customer.subscription.updated`
   - ✅ `customer.subscription.deleted`
   - ✅ `invoice.payment_succeeded`
   - ✅ `invoice.payment_failed`

5. Copy the webhook signing secret and add to your production environment variables

### 3. Verify Webhook Configuration

Test the webhook endpoint:

```bash
curl https://thefortjiujitsu.com/api/webhooks/stripe
```

You should see:

```json
{
  "message": "Stripe webhook endpoint",
  "handledEvents": [
    "checkout.session.completed",
    "customer.subscription.created",
    ...
  ]
}
```

## Testing the Integration

### 1. Test the Checkout API

```bash
curl -X POST http://localhost:3000/api/create-checkout \
  -H "Content-Type: application/json" \
  -d '{
    "membershipType": "adult-bjj",
    "interval": "monthly",
    "includeFreeTrial": true
  }'
```

Expected response:

```json
{
  "sessionId": "cs_test_...",
  "url": "https://checkout.stripe.com/c/pay/cs_test_...",
  "customerId": "cus_..."
}
```

### 2. Test with Stripe Test Cards

Use these test card numbers in checkout:

- **Success**: `4242 4242 4242 4242`
- **Declined**: `4000 0000 0000 0002`
- **3D Secure**: `4000 0025 0000 3155`

All test cards:
- Expiry: Any future date (e.g., 12/34)
- CVC: Any 3 digits (e.g., 123)
- ZIP: Any 5 digits (e.g., 12345)

### 3. Test Webhook Events

Trigger a test event:

```bash
stripe trigger checkout.session.completed
```

Check your server logs to verify the webhook was received and processed.

## Production Deployment

### 1. Switch to Live Mode

In Stripe Dashboard:
1. Toggle from **Test mode** to **Live mode** (top right)
2. Update your `.env.local` with live keys
3. Re-run the setup script to create live products

### 2. Enable Customer Portal

The customer portal allows members to manage their own subscriptions.

1. Go to [Stripe Dashboard > Settings > Billing > Customer portal](https://dashboard.stripe.com/settings/billing/portal)
2. Configure settings:
   - ✅ Allow customers to update payment methods
   - ✅ Allow customers to cancel subscriptions
   - ✅ Allow customers to switch plans
   - ✅ Show proration logic

3. Test the portal:

```bash
curl -X POST http://localhost:3000/api/customer-portal \
  -H "Content-Type: application/json" \
  -d '{"customerId": "cus_XXXXXXXXXX"}'
```

### 3. Monitor in Production

Key metrics to track in Stripe Dashboard:

- **Revenue**: Total monthly recurring revenue (MRR)
- **Active subscriptions**: Number of paying members
- **Churn rate**: Cancelled subscriptions / total subscriptions
- **Failed payments**: Members with past_due status
- **Disputed charges**: Review and respond to disputes

## Membership Pricing Structure

### Individual Memberships

| Tier | Monthly | Annual | Savings |
|------|---------|--------|---------|
| **Kids BJJ** (ages 5-17) | $75/mo | $750/yr | $150 (2 months free) |
| **Adult BJJ** (ages 18+) | $100/mo | $1,000/yr | $200 (2 months free) |

**Includes**:
- 2x/week classes (Tue/Wed)
- Morning rolls
- 1 week free trial

### Family Plan

| Members | Monthly Cost | Savings |
|---------|-------------|---------|
| 2+ family members | $150/mo | 25% off individual pricing |

**Example savings**:
- 1 adult + 1 kid individually: $175/mo
- Family plan: $150/mo
- **You save: $25/mo (14%)**

### Drop-in

- **$20** per class
- No commitment
- One-time payment

## API Routes

### POST /api/create-checkout

Create a Stripe checkout session.

**Request body**:
```json
{
  "membershipType": "kids-bjj" | "adult-bjj" | "family" | "drop-in",
  "interval": "monthly" | "annual" | "one-time",
  "memberId": "uuid",
  "customerId": "cus_XXXXXXXXXX",
  "familyAccountId": "uuid",
  "memberCount": 2,
  "couponCode": "GRAND_OPENING_50",
  "includeFreeTrial": true
}
```

**Response**:
```json
{
  "sessionId": "cs_test_...",
  "url": "https://checkout.stripe.com/...",
  "customerId": "cus_..."
}
```

### POST /api/webhooks/stripe

Handles Stripe webhook events. Automatically updates member status in database.

**Events handled**:
- `checkout.session.completed`: Activate member after payment
- `customer.subscription.created`: New subscription
- `customer.subscription.updated`: Plan changes, status updates
- `customer.subscription.deleted`: Cancellation
- `invoice.payment_succeeded`: Successful payment
- `invoice.payment_failed`: Failed payment (mark as past_due)

## Troubleshooting

### Webhook not receiving events

1. **Check webhook secret**: Verify `STRIPE_WEBHOOK_SECRET` is set correctly
2. **Check endpoint URL**: Must be publicly accessible (not localhost)
3. **Check event selection**: Ensure required events are selected in Stripe Dashboard
4. **Check logs**: View webhook attempts in Stripe Dashboard > Developers > Webhooks > [Your endpoint]

### Checkout session not creating

1. **Check price IDs**: Verify IDs in `stripe-products.ts` match Stripe Dashboard
2. **Check API keys**: Ensure using correct mode (test vs live)
3. **Check customer ID**: If providing `customerId`, ensure it exists in Stripe
4. **Check metadata**: Ensure member IDs are valid UUIDs

### Member status not updating

1. **Check webhook is firing**: View webhook logs in Stripe Dashboard
2. **Check database**: Verify `stripe_customer_id` matches between Stripe and Supabase
3. **Check Supabase service role key**: Required for webhook to update database
4. **Check server logs**: Look for errors in webhook handler

### Free trial not applying

1. **Check price configuration**: Verify `trial_period_days: 7` in setup script
2. **Check existing customer**: Free trials only apply to new subscriptions
3. **Check checkout session**: Trial should show in checkout before payment

## Support

For Stripe-specific issues:
- [Stripe Documentation](https://stripe.com/docs)
- [Stripe Support](https://support.stripe.com/)
- [Stripe Discord](https://discord.gg/stripe)

For implementation issues:
- Check server logs
- Review Stripe Dashboard > Developers > Logs
- Test with Stripe CLI: `stripe logs tail`

## Security Checklist

- ✅ Webhook signature verification enabled
- ✅ API keys stored in environment variables (not in code)
- ✅ Using HTTPS in production
- ✅ Customer portal configured with allowed actions
- ✅ Metadata validated before database updates
- ✅ Error logging enabled for debugging
- ✅ Rate limiting on API endpoints (consider adding)

## Next Steps

1. ✅ Run setup script to create products
2. ✅ Update `stripe-products.ts` with real IDs
3. ✅ Configure webhooks for local testing
4. ✅ Test checkout flow with test cards
5. ✅ Deploy to production
6. ✅ Configure live webhooks
7. ✅ Enable customer portal
8. ✅ Monitor for first real payments!

---

**Coach, your Stripe integration is production-ready!** Let's get those memberships rolling in! 💪
