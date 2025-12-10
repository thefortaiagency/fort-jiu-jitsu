# Stripe API Quick Reference

Quick reference for The Fort Jiu-Jitsu Stripe integration.

## API Endpoints

### POST /api/create-checkout

Creates a Stripe checkout session and returns a URL for payment.

**Endpoint:** `POST /api/create-checkout`

**Request Body:**
```typescript
{
  membershipType: 'kids-bjj' | 'adult-bjj' | 'family' | 'drop-in',  // Required
  interval?: 'monthly' | 'annual' | 'one-time',                      // Default: 'monthly'
  memberId?: string,                                                  // Member UUID
  customerId?: string,                                                // Stripe customer ID
  familyAccountId?: string,                                           // For family plans
  memberCount?: number,                                               // Number of family members
  couponCode?: string,                                                // Promo code to apply
  includeFreeTrial?: boolean                                          // Default: true
}
```

**Response:**
```typescript
{
  sessionId: string,      // Stripe session ID
  url: string,           // Redirect URL for checkout
  customerId: string     // Stripe customer ID
}
```

**Example:**
```javascript
const response = await fetch('/api/create-checkout', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    membershipType: 'adult-bjj',
    interval: 'monthly',
    memberId: 'user-uuid',
    includeFreeTrial: true
  })
});

const { url } = await response.json();
window.location.href = url; // Redirect to Stripe
```

### POST /api/webhooks/stripe

Handles Stripe webhook events (internal use only).

**Handled Events:**
- `checkout.session.completed` - Payment successful, activate member
- `customer.subscription.created` - New subscription started
- `customer.subscription.updated` - Subscription changed
- `customer.subscription.deleted` - Subscription cancelled
- `invoice.payment_succeeded` - Payment received
- `invoice.payment_failed` - Payment failed

**Security:** Requires valid webhook signature from Stripe.

## Helper Functions

### lib/stripe.ts

#### createStripeCustomer()
```typescript
import { createStripeCustomer } from '@/lib/stripe';

const customer = await createStripeCustomer(
  'member@example.com',
  'John Doe',
  { member_id: 'uuid' } // Optional metadata
);
```

#### getCustomerPortalUrl()
```typescript
import { getCustomerPortalUrl } from '@/lib/stripe';

const portalUrl = await getCustomerPortalUrl(
  'cus_XXXXXXXXXX',
  'https://thefortjiujitsu.com/account'
);

// Redirect member to portal for self-service
window.location.href = portalUrl;
```

#### cancelSubscriptionAtPeriodEnd()
```typescript
import { cancelSubscriptionAtPeriodEnd } from '@/lib/stripe';

// Cancels at end of current billing period
const subscription = await cancelSubscriptionAtPeriodEnd('sub_XXXXXXXXXX');
```

#### reactivateSubscription()
```typescript
import { reactivateSubscription } from '@/lib/stripe';

// Undoes a pending cancellation
const subscription = await reactivateSubscription('sub_XXXXXXXXXX');
```

#### updateSubscriptionPrice()
```typescript
import { updateSubscriptionPrice } from '@/lib/stripe';

// Upgrade/downgrade member
const subscription = await updateSubscriptionPrice(
  'sub_XXXXXXXXXX',
  'price_YYYYYYYYYY', // New price ID
  'create_prorations' // 'create_prorations' | 'none' | 'always_invoice'
);
```

### lib/stripe-products.ts

#### getPriceId()
```typescript
import { getPriceId } from '@/lib/stripe-products';

const priceId = getPriceId('adult-bjj', 'monthly');
// Returns: 'price_XXXXXXXXXX'
```

#### calculateFamilySavings()
```typescript
import { calculateFamilySavings } from '@/lib/stripe-products';

const savings = calculateFamilySavings(1, 1); // 1 adult, 1 kid
// Returns:
// {
//   individualCost: 175,
//   familyCost: 150,
//   savings: 25,
//   savingsPercent: 14
// }
```

## Product IDs

After running setup script, replace these in `lib/stripe-products.ts`:

```typescript
export const STRIPE_PRODUCTS = {
  KIDS_BJJ: {
    productId: 'prod_XXXXXXXXXXXXXXXX',
    monthlyPriceId: 'price_XXXXXXXXXXXXXXXX',  // $75/mo
    annualPriceId: 'price_XXXXXXXXXXXXXXXX',   // $750/yr
  },
  ADULT_BJJ: {
    productId: 'prod_XXXXXXXXXXXXXXXX',
    monthlyPriceId: 'price_XXXXXXXXXXXXXXXX',  // $100/mo
    annualPriceId: 'price_XXXXXXXXXXXXXXXX',   // $1000/yr
  },
  FAMILY_PLAN: {
    productId: 'prod_XXXXXXXXXXXXXXXX',
    monthlyPriceId: 'price_XXXXXXXXXXXXXXXX',  // $150/mo
  },
  DROP_IN: {
    productId: 'prod_XXXXXXXXXXXXXXXX',
    oneTimePriceId: 'price_XXXXXXXXXXXXXXXX',  // $20
  },
};
```

## Coupon Codes

```typescript
export const STRIPE_COUPONS = {
  FAMILY_DISCOUNT_25: 'FAMILY_DISCOUNT_25',  // 25% off forever
  FIRST_WEEK_FREE: 'FIRST_WEEK_FREE',        // 100% off once
  GRAND_OPENING_50: 'GRAND_OPENING_50',      // 50% off first month
};
```

## Test Cards

Use these in test mode:

| Card Number | Description |
|-------------|-------------|
| `4242 4242 4242 4242` | Success (Visa) |
| `5555 5555 5555 4444` | Success (Mastercard) |
| `4000 0025 0000 3155` | 3D Secure required |
| `4000 0000 0000 9995` | Insufficient funds |
| `4000 0000 0000 0002` | Card declined |

**All test cards:**
- Expiry: Any future date (e.g., 12/34)
- CVC: Any 3 digits (e.g., 123)
- ZIP: Any 5 digits (e.g., 12345)

## Common Workflows

### New Member Sign Up

```typescript
// 1. Create member in database
const { data: member } = await supabase
  .from('members')
  .insert({
    first_name: 'John',
    last_name: 'Doe',
    email: 'john@example.com',
    program: 'adult-bjj',
    status: 'pending',
  })
  .select()
  .single();

// 2. Create checkout session
const response = await fetch('/api/create-checkout', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    membershipType: 'adult-bjj',
    interval: 'monthly',
    memberId: member.id,
    includeFreeTrial: true,
  })
});

const { url } = await response.json();

// 3. Redirect to Stripe
window.location.href = url;

// 4. After payment, webhook updates member status to 'active'
```

### Family Plan Sign Up

```typescript
// 1. Create family members
const members = [
  { name: 'Parent', program: 'adult-bjj' },
  { name: 'Kid', program: 'kids-bjj' }
];

const primaryMember = members[0];

// 2. Create checkout with family discount
const response = await fetch('/api/create-checkout', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    membershipType: 'family',
    interval: 'monthly',
    familyAccountId: primaryMember.id,
    memberCount: members.length,
    memberId: primaryMember.id,
  })
});

const { url } = await response.json();
window.location.href = url;
```

### Member Portal Access

```typescript
// Get member's Stripe customer ID
const { data: member } = await supabase
  .from('members')
  .select('stripe_customer_id')
  .eq('id', memberId)
  .single();

// Generate portal URL
const portalUrl = await getCustomerPortalUrl(
  member.stripe_customer_id,
  'https://thefortjiujitsu.com/account'
);

// Redirect
window.location.href = portalUrl;
```

### Upgrade Member to Annual

```typescript
import { updateSubscriptionPrice } from '@/lib/stripe';
import { getPriceId } from '@/lib/stripe-products';

// Get new price ID
const annualPriceId = getPriceId('adult-bjj', 'annual');

// Update subscription
const subscription = await updateSubscriptionPrice(
  member.stripe_subscription_id,
  annualPriceId,
  'create_prorations' // Pro-rate the difference
);
```

### Cancel with Grace Period

```typescript
import { cancelSubscriptionAtPeriodEnd } from '@/lib/stripe';

// Cancel at end of current billing period
const subscription = await cancelSubscriptionAtPeriodEnd(
  member.stripe_subscription_id
);

// Member keeps access until period ends
console.log('Cancels on:', subscription.cancel_at);
```

### Check Subscription Status

```typescript
import { getSubscription } from '@/lib/stripe';

const subscription = await getSubscription(
  member.stripe_subscription_id
);

console.log('Status:', subscription.status);
// 'active', 'past_due', 'canceled', 'incomplete', etc.

console.log('Current period end:', subscription.current_period_end);
console.log('Cancel at period end:', subscription.cancel_at_period_end);
```

## Environment Variables

```env
# Required
STRIPE_SECRET_KEY=sk_live_...
STRIPE_WEBHOOK_SECRET=whsec_...
NEXT_PUBLIC_SITE_URL=https://thefortjiujitsu.com

# Supabase (already configured)
NEXT_PUBLIC_SUPABASE_URL=...
NEXT_PUBLIC_SUPABASE_ANON_KEY=...
SUPABASE_SERVICE_ROLE_KEY=...
```

## Error Handling

### Common Errors

**"Price not found"**
- Check that product IDs in `stripe-products.ts` are correct
- Verify you ran the setup script
- Ensure using correct Stripe mode (test vs live)

**"Customer does not exist"**
- Verify `stripe_customer_id` in database
- Check Stripe customer still exists
- Ensure not mixing test/live modes

**"Webhook signature verification failed"**
- Verify `STRIPE_WEBHOOK_SECRET` is set correctly
- Check webhook endpoint URL matches Stripe Dashboard
- Ensure using correct secret for environment (test vs live)

**"Subscription not found"**
- Verify `stripe_subscription_id` in database
- Check subscription wasn't deleted in Stripe
- Ensure not mixing test/live modes

## Debugging

### View Stripe Logs

```bash
# Install Stripe CLI
brew install stripe/stripe-cli/stripe

# Login
stripe login

# Tail logs
stripe logs tail
```

### Test Webhook Locally

```bash
# Forward webhooks to local server
stripe listen --forward-to localhost:3000/api/webhooks/stripe

# In another terminal, trigger events
stripe trigger checkout.session.completed
stripe trigger invoice.payment_failed
```

### Check Database Sync

```sql
-- Members with Stripe data
SELECT
  id,
  first_name,
  last_name,
  stripe_customer_id,
  stripe_subscription_id,
  payment_status,
  status
FROM members
WHERE stripe_customer_id IS NOT NULL;
```

## Support

- **Setup Guide:** `/docs/STRIPE_SETUP.md`
- **Implementation Summary:** `/STRIPE_IMPLEMENTATION_SUMMARY.md`
- **Script Documentation:** `/scripts/README.md`
- **Stripe Documentation:** https://stripe.com/docs
- **Stripe Support:** https://support.stripe.com

---

**Quick tip:** Bookmark this page for fast reference during development!
