#!/usr/bin/env ts-node
/**
 * The Fort Jiu-Jitsu - Stripe Integration Test Script
 *
 * This script tests the complete Stripe integration:
 * 1. Verifies Stripe connection
 * 2. Lists products and prices
 * 3. Tests checkout session creation
 * 4. Tests customer portal URL generation
 *
 * Run with: npx ts-node scripts/test-stripe-integration.ts
 */

import Stripe from 'stripe';
import * as dotenv from 'dotenv';
import * as path from 'path';

// Load environment variables
dotenv.config({ path: path.join(__dirname, '../.env.local') });

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: '2025-11-17.clover',
});

// Color codes
const colors = {
  reset: '\x1b[0m',
  bright: '\x1b[1m',
  green: '\x1b[32m',
  blue: '\x1b[34m',
  yellow: '\x1b[33m',
  red: '\x1b[31m',
};

function log(message: string, color: keyof typeof colors = 'reset') {
  console.log(`${colors[color]}${message}${colors.reset}`);
}

async function testStripeConnection() {
  log('\n1. Testing Stripe Connection...', 'blue');
  try {
    const account = await stripe.accounts.retrieve();
    log(`   ✓ Connected to Stripe account: ${account.email || account.id}`, 'green');
    log(`   ✓ Mode: ${process.env.STRIPE_SECRET_KEY?.startsWith('sk_live') ? 'LIVE' : 'TEST'}`, 'yellow');
    return true;
  } catch (error) {
    log(`   ✗ Connection failed: ${error instanceof Error ? error.message : 'Unknown error'}`, 'red');
    return false;
  }
}

async function listProducts() {
  log('\n2. Listing Products...', 'blue');
  try {
    const products = await stripe.products.list({
      active: true,
      limit: 10,
    });

    if (products.data.length === 0) {
      log('   ⚠ No products found. Run setup-stripe-products.ts first.', 'yellow');
      return false;
    }

    log(`   ✓ Found ${products.data.length} products:`, 'green');

    for (const product of products.data) {
      log(`\n   ${colors.bright}${product.name}${colors.reset}`, 'reset');
      log(`     ID: ${product.id}`, 'reset');
      log(`     Description: ${product.description || 'N/A'}`, 'reset');

      // Get prices for this product
      const prices = await stripe.prices.list({
        product: product.id,
        active: true,
      });

      if (prices.data.length > 0) {
        log(`     Prices:`, 'reset');
        for (const price of prices.data) {
          const amount = price.unit_amount ? `$${(price.unit_amount / 100).toFixed(2)}` : 'N/A';
          const interval = price.recurring ? `/${price.recurring.interval}` : ' (one-time)';
          log(`       - ${amount}${interval} (ID: ${price.id})`, 'reset');
        }
      }
    }

    return true;
  } catch (error) {
    log(`   ✗ Error listing products: ${error instanceof Error ? error.message : 'Unknown error'}`, 'red');
    return false;
  }
}

async function testCheckoutSession() {
  log('\n3. Testing Checkout Session Creation...', 'blue');
  try {
    // Get a test price ID
    const prices = await stripe.prices.list({
      active: true,
      limit: 1,
    });

    if (prices.data.length === 0) {
      log('   ⚠ No prices found. Cannot test checkout session.', 'yellow');
      return false;
    }

    const testPriceId = prices.data[0].id;
    log(`   Using test price: ${testPriceId}`, 'reset');

    // Create a test checkout session
    const session = await stripe.checkout.sessions.create({
      mode: prices.data[0].type === 'one_time' ? 'payment' : 'subscription',
      payment_method_types: ['card'],
      line_items: [
        {
          price: testPriceId,
          quantity: 1,
        },
      ],
      success_url: 'https://thefortjiujitsu.com/success?session_id={CHECKOUT_SESSION_ID}',
      cancel_url: 'https://thefortjiujitsu.com/pricing',
      metadata: {
        test: 'true',
        membership_type: 'test',
      },
    });

    log(`   ✓ Checkout session created successfully!`, 'green');
    log(`   Session ID: ${session.id}`, 'reset');
    log(`   Checkout URL: ${session.url}`, 'reset');
    log(`   Status: ${session.status}`, 'reset');

    return true;
  } catch (error) {
    log(`   ✗ Error creating checkout session: ${error instanceof Error ? error.message : 'Unknown error'}`, 'red');
    return false;
  }
}

async function testCustomerPortal() {
  log('\n4. Testing Customer Portal...', 'blue');
  try {
    // Create a test customer first
    const customer = await stripe.customers.create({
      email: 'test@thefortjiujitsu.com',
      name: 'Test Customer',
      metadata: {
        test: 'true',
      },
    });

    log(`   ✓ Test customer created: ${customer.id}`, 'green');

    // Create portal session
    const portalSession = await stripe.billingPortal.sessions.create({
      customer: customer.id,
      return_url: 'https://thefortjiujitsu.com/account',
    });

    log(`   ✓ Customer portal session created!`, 'green');
    log(`   Portal URL: ${portalSession.url}`, 'reset');

    // Clean up test customer
    await stripe.customers.del(customer.id);
    log(`   ✓ Test customer deleted`, 'green');

    return true;
  } catch (error) {
    log(`   ✗ Error with customer portal: ${error instanceof Error ? error.message : 'Unknown error'}`, 'red');
    return false;
  }
}

async function testCoupons() {
  log('\n5. Testing Coupons...', 'blue');
  try {
    const coupons = await stripe.coupons.list({ limit: 10 });

    if (coupons.data.length === 0) {
      log('   ⚠ No coupons found. Run setup-stripe-products.ts first.', 'yellow');
      return false;
    }

    log(`   ✓ Found ${coupons.data.length} coupons:`, 'green');

    for (const coupon of coupons.data) {
      const discount = coupon.percent_off
        ? `${coupon.percent_off}% off`
        : `$${(coupon.amount_off || 0) / 100} off`;

      log(`\n   ${colors.bright}${coupon.name || coupon.id}${colors.reset}`, 'reset');
      log(`     ID: ${coupon.id}`, 'reset');
      log(`     Discount: ${discount}`, 'reset');
      log(`     Duration: ${coupon.duration}`, 'reset');
      log(`     Valid: ${coupon.valid ? 'Yes' : 'No'}`, 'reset');
    }

    return true;
  } catch (error) {
    log(`   ✗ Error listing coupons: ${error instanceof Error ? error.message : 'Unknown error'}`, 'red');
    return false;
  }
}

async function runTests() {
  log('\n========================================', 'bright');
  log('Stripe Integration Test Suite', 'bright');
  log('========================================', 'bright');

  const results = {
    connection: await testStripeConnection(),
    products: await listProducts(),
    checkout: await testCheckoutSession(),
    portal: await testCustomerPortal(),
    coupons: await testCoupons(),
  };

  log('\n========================================', 'bright');
  log('Test Results Summary', 'bright');
  log('========================================', 'bright');

  const passed = Object.values(results).filter(Boolean).length;
  const total = Object.keys(results).length;

  log(`\nTests Passed: ${passed}/${total}`, passed === total ? 'green' : 'yellow');

  Object.entries(results).forEach(([test, passed]) => {
    const symbol = passed ? '✓' : '✗';
    const color = passed ? 'green' : 'red';
    log(`  ${symbol} ${test}`, color);
  });

  log('\n========================================', 'bright');

  if (passed === total) {
    log('All tests passed! Stripe integration is ready.', 'green');
  } else {
    log('Some tests failed. Check the output above for details.', 'yellow');
    if (!results.products || !results.coupons) {
      log('\nTip: Run setup-stripe-products.ts to create products and coupons.', 'blue');
    }
  }

  log('\n========================================\n', 'bright');

  return passed === total;
}

// Run tests
if (require.main === module) {
  runTests()
    .then((success) => {
      process.exit(success ? 0 : 1);
    })
    .catch((error) => {
      log('\n✗ Test suite failed:', 'red');
      console.error(error);
      process.exit(1);
    });
}

export { runTests };
