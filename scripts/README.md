# The Fort Jiu-Jitsu - Scripts Directory

This directory contains utility scripts for setting up and testing the Stripe integration.

## Quick Start

### 1. Setup Stripe Products

Creates all products, prices, and coupons in your Stripe account:

```bash
npx ts-node scripts/setup-stripe-products.ts
```

**What it does:**
- ✅ Creates Kids BJJ product ($75/mo, $750/yr)
- ✅ Creates Adult BJJ product ($100/mo, $1000/yr)
- ✅ Creates Family Plan product ($150/mo)
- ✅ Creates Drop-in product ($20 one-time)
- ✅ Creates promotional coupons (Family discount, Free trial, Grand opening)
- ✅ Outputs all product/price IDs to copy into your app

**After running:**
1. Copy the output JSON
2. Replace the placeholder IDs in `lib/stripe-products.ts`
3. Commit the updated file

### 2. Test Integration

Verifies everything is working correctly:

```bash
npx ts-node scripts/test-stripe-integration.ts
```

**What it tests:**
- ✅ Stripe API connection
- ✅ Products and prices are created
- ✅ Checkout session creation works
- ✅ Customer portal is configured
- ✅ Coupons are valid

**Expected output:**
```
Tests Passed: 5/5
  ✓ connection
  ✓ products
  ✓ checkout
  ✓ portal
  ✓ coupons
```

## Scripts Overview

### setup-stripe-products.ts

**Purpose:** Initial Stripe account setup

**When to run:**
- First time setting up the project
- After resetting your Stripe account
- When switching from test to live mode

**Features:**
- Idempotent (safe to run multiple times)
- Checks for existing products before creating
- Color-coded output for easy reading
- Detailed logging of all operations

**Pricing created:**
| Product | Monthly | Annual |
|---------|---------|--------|
| Kids BJJ | $75 | $750 (save $150) |
| Adult BJJ | $100 | $1000 (save $200) |
| Family Plan | $150 | N/A |
| Drop-in | N/A | $20 (one-time) |

**Coupons created:**
| Coupon | Discount | Duration |
|--------|----------|----------|
| FAMILY_DISCOUNT_25 | 25% off | Forever |
| FIRST_WEEK_FREE | 100% off | Once |
| GRAND_OPENING_50 | 50% off | Once |

### test-stripe-integration.ts

**Purpose:** Verify Stripe integration is working

**When to run:**
- After initial setup
- Before deploying to production
- When debugging payment issues
- After updating Stripe configuration

**Tests performed:**
1. **Connection Test**: Verifies API keys are valid
2. **Product Test**: Lists all products and prices
3. **Checkout Test**: Creates a test checkout session
4. **Portal Test**: Generates customer portal URL
5. **Coupon Test**: Lists all available coupons

**Exit codes:**
- `0`: All tests passed
- `1`: One or more tests failed

## Troubleshooting

### "Stripe API key not found"

**Solution:**
```bash
# Check your .env.local file
cat .env.local | grep STRIPE_SECRET_KEY

# If missing, add it:
echo "STRIPE_SECRET_KEY=sk_live_..." >> .env.local
```

### "Product already exists"

This is normal! The setup script is idempotent and will skip existing products.

**To force recreation:**
1. Delete products in Stripe Dashboard
2. Re-run setup script

### "No prices found"

**Solution:**
Run the setup script first:
```bash
npx ts-node scripts/setup-stripe-products.ts
```

### "ts-node not found"

**Solution:**
```bash
npm install -D ts-node
```

### "TypeScript errors in script"

**Solution:**
```bash
# Compile without running
npx tsc --noEmit scripts/setup-stripe-products.ts

# If errors, install missing types
npm install -D @types/node
```

## Advanced Usage

### Running in Test Mode

By default, scripts use the Stripe key from `.env.local`. To test in Stripe's test mode:

1. Switch to test key in `.env.local`:
   ```env
   STRIPE_SECRET_KEY=sk_test_...
   ```

2. Run scripts as normal

3. Switch back to live key when ready for production

### Custom Configuration

To modify pricing or products, edit the `PRODUCTS` constant in `setup-stripe-products.ts`:

```typescript
const PRODUCTS: Record<string, ProductConfig> = {
  KIDS_BJJ: {
    name: 'Kids Brazilian Jiu-Jitsu',
    description: '...',
    metadata: { program: 'kids-bjj', category: 'membership' },
    prices: {
      monthly: 7500,  // Change this value (in cents)
      annual: 75000,  // Change this value (in cents)
    },
  },
  // ...
};
```

### Webhook Testing

To test webhooks locally:

1. Install Stripe CLI:
   ```bash
   brew install stripe/stripe-cli/stripe
   ```

2. Login:
   ```bash
   stripe login
   ```

3. Forward webhooks:
   ```bash
   stripe listen --forward-to localhost:3000/api/webhooks/stripe
   ```

4. In another terminal, trigger test events:
   ```bash
   stripe trigger checkout.session.completed
   stripe trigger customer.subscription.created
   stripe trigger invoice.payment_succeeded
   ```

5. Check your app logs to see webhook processing

## CI/CD Integration

### GitHub Actions Example

```yaml
name: Test Stripe Integration

on: [push, pull_request]

jobs:
  test:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v2
      - uses: actions/setup-node@v2
        with:
          node-version: '18'

      - name: Install dependencies
        run: npm install

      - name: Test Stripe Integration
        env:
          STRIPE_SECRET_KEY: ${{ secrets.STRIPE_TEST_KEY }}
        run: npx ts-node scripts/test-stripe-integration.ts
```

### Vercel Deploy Hook

Add to `package.json`:

```json
{
  "scripts": {
    "postdeploy": "npx ts-node scripts/test-stripe-integration.ts"
  }
}
```

## Production Checklist

Before going live:

- [ ] Run setup script with **live** Stripe key
- [ ] Copy product IDs to `lib/stripe-products.ts`
- [ ] Update `STRIPE_WEBHOOK_SECRET` in `.env.local`
- [ ] Configure webhooks in Stripe Dashboard
- [ ] Test checkout with real card (use small amount)
- [ ] Verify webhook events are received
- [ ] Enable customer portal in Stripe settings
- [ ] Run test script to verify everything
- [ ] Set up monitoring alerts in Stripe Dashboard

## Support

For issues with these scripts:
1. Check the troubleshooting section above
2. Review logs for detailed error messages
3. Verify your Stripe API keys are correct
4. Check Stripe Dashboard for any account issues

For Stripe API issues:
- [Stripe Documentation](https://stripe.com/docs)
- [Stripe Support](https://support.stripe.com/)

---

**Ready to get those memberships flowing, Coach!** 💪
