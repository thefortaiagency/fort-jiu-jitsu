#!/usr/bin/env ts-node
/**
 * The Fort Jiu-Jitsu - Stripe Products Setup Script
 *
 * This script creates all necessary Stripe products, prices, and coupons
 * for The Fort Jiu-Jitsu gym membership system.
 *
 * Run with: npx ts-node scripts/setup-stripe-products.ts
 *
 * Features:
 * - Idempotent (safe to run multiple times)
 * - Creates products for Kids BJJ, Adult BJJ, Family Plan, and Drop-in
 * - Sets up monthly and annual pricing with discounts
 * - Creates promotional coupons
 * - Outputs all product/price IDs for use in application
 */

import Stripe from 'stripe';
import * as dotenv from 'dotenv';
import * as path from 'path';
import { fileURLToPath } from 'url';

// Load environment variables
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
dotenv.config({ path: path.join(__dirname, '../.env.local') });

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: '2025-11-17.clover',
});

// Color codes for terminal output
const colors = {
  reset: '\x1b[0m',
  bright: '\x1b[1m',
  green: '\x1b[32m',
  blue: '\x1b[34m',
  yellow: '\x1b[33m',
  red: '\x1b[31m',
};

// Product definitions
interface ProductConfig {
  name: string;
  description: string;
  metadata: {
    program: string;
    category: string;
  };
  prices: {
    monthly?: number;
    annual?: number;
    oneTime?: number;
  };
}

const PRODUCTS: Record<string, ProductConfig> = {
  KIDS_BJJ: {
    name: 'Kids Brazilian Jiu-Jitsu',
    description: '2x/week classes (Tue/Wed 5:30-6:30 PM) + morning rolls for ages 5-17',
    metadata: {
      program: 'kids-bjj',
      category: 'membership',
    },
    prices: {
      monthly: 7500, // $75.00
      annual: 75000, // $750.00 (save $150)
    },
  },
  ADULT_BJJ: {
    name: 'Adult Brazilian Jiu-Jitsu',
    description: '2x/week classes (Tue/Wed 6:30-8:00 PM) + morning rolls for ages 18+',
    metadata: {
      program: 'adult-bjj',
      category: 'membership',
    },
    prices: {
      monthly: 10000, // $100.00
      annual: 100000, // $1000.00 (save $200)
    },
  },
  FAMILY_PLAN: {
    name: 'Family Membership Plan',
    description: 'Full access for 2+ family members - 25% savings vs individual memberships',
    metadata: {
      program: 'family',
      category: 'membership',
    },
    prices: {
      monthly: 15000, // $150.00
    },
  },
  DROP_IN: {
    name: 'Drop-in Class',
    description: 'Single class visit - no commitment required',
    metadata: {
      program: 'drop-in',
      category: 'one-time',
    },
    prices: {
      oneTime: 2000, // $20.00
    },
  },
};

// Coupon definitions
interface CouponConfig {
  id: string;
  name: string;
  percentOff?: number;
  amountOff?: number;
  duration: 'once' | 'repeating' | 'forever';
  durationInMonths?: number;
  metadata: Record<string, string>;
}

const COUPONS: CouponConfig[] = [
  {
    id: 'FAMILY_DISCOUNT_25',
    name: 'Family Plan 25% Discount',
    percentOff: 25,
    duration: 'forever',
    metadata: {
      type: 'family_discount',
      description: 'Automatic 25% discount for family memberships',
    },
  },
  {
    id: 'FIRST_WEEK_FREE',
    name: 'First Week Free Trial',
    percentOff: 100,
    duration: 'once',
    metadata: {
      type: 'free_trial',
      description: 'One week free trial for new members',
    },
  },
  {
    id: 'GRAND_OPENING_50',
    name: 'Grand Opening 50% Off First Month',
    percentOff: 50,
    duration: 'once',
    metadata: {
      type: 'promotion',
      description: 'Grand opening special - 50% off first month',
    },
  },
];

// Helper functions
function log(message: string, color: keyof typeof colors = 'reset') {
  console.log(`${colors[color]}${message}${colors.reset}`);
}

function formatCurrency(amountInCents: number): string {
  return `$${(amountInCents / 100).toFixed(2)}`;
}

async function findExistingProduct(name: string): Promise<Stripe.Product | null> {
  const products = await stripe.products.search({
    query: `name:'${name}' AND active:'true'`,
  });

  return products.data.length > 0 ? products.data[0] : null;
}

async function findExistingCoupon(couponId: string): Promise<Stripe.Coupon | null> {
  try {
    const coupon = await stripe.coupons.retrieve(couponId);
    return coupon;
  } catch (error) {
    return null;
  }
}

async function createOrUpdateProduct(
  key: string,
  config: ProductConfig
): Promise<{ product: Stripe.Product; prices: Record<string, Stripe.Price> }> {
  log(`\n${colors.bright}Setting up: ${config.name}${colors.reset}`, 'blue');

  // Check if product exists
  let product = await findExistingProduct(config.name);

  if (product) {
    log(`  ✓ Product already exists (ID: ${product.id})`, 'yellow');

    // Update product metadata if needed
    product = await stripe.products.update(product.id, {
      description: config.description,
      metadata: config.metadata,
    });
  } else {
    // Create new product
    product = await stripe.products.create({
      name: config.name,
      description: config.description,
      metadata: config.metadata,
      active: true,
    });
    log(`  ✓ Product created (ID: ${product.id})`, 'green');
  }

  // Create prices
  const prices: Record<string, Stripe.Price> = {};

  // Get all existing prices for this product
  const existingPrices = await stripe.prices.list({
    product: product.id,
    active: true,
    limit: 100,
  });

  // Monthly price
  if (config.prices.monthly) {
    const existingMonthly = existingPrices.data.find(
      (p) => p.type === 'recurring' && p.recurring?.interval === 'month'
    );

    if (existingMonthly) {
      prices.monthly = existingMonthly;
      log(
        `  ✓ Monthly price exists: ${formatCurrency(prices.monthly.unit_amount!)}/month (ID: ${prices.monthly.id})`,
        'yellow'
      );
    } else {
      prices.monthly = await stripe.prices.create({
        product: product.id,
        unit_amount: config.prices.monthly,
        currency: 'usd',
        recurring: {
          interval: 'month',
          trial_period_days: 7, // 1 week free trial
        },
        metadata: {
          interval: 'monthly',
        },
      });
      log(
        `  ✓ Monthly price created: ${formatCurrency(config.prices.monthly)}/month (ID: ${prices.monthly.id})`,
        'green'
      );
    }
  }

  // Annual price
  if (config.prices.annual) {
    const existingAnnual = existingPrices.data.find(
      (p) => p.type === 'recurring' && p.recurring?.interval === 'year'
    );

    if (existingAnnual) {
      prices.annual = existingAnnual;
      log(
        `  ✓ Annual price exists: ${formatCurrency(prices.annual.unit_amount!)}/year (ID: ${prices.annual.id})`,
        'yellow'
      );
    } else {
      const monthlyCost = config.prices.monthly || 0;
      const annualSavings = monthlyCost * 12 - config.prices.annual;

      prices.annual = await stripe.prices.create({
        product: product.id,
        unit_amount: config.prices.annual,
        currency: 'usd',
        recurring: {
          interval: 'year',
        },
        metadata: {
          interval: 'annual',
          savings: annualSavings.toString(),
        },
      });
      log(
        `  ✓ Annual price created: ${formatCurrency(config.prices.annual)}/year - Save ${formatCurrency(annualSavings)}! (ID: ${prices.annual.id})`,
        'green'
      );
    }
  }

  // One-time price
  if (config.prices.oneTime) {
    const existingOneTime = existingPrices.data.find((p) => p.type === 'one_time');

    if (existingOneTime) {
      prices.oneTime = existingOneTime;
      log(
        `  ✓ One-time price exists: ${formatCurrency(prices.oneTime.unit_amount!)} (ID: ${prices.oneTime.id})`,
        'yellow'
      );
    } else {
      prices.oneTime = await stripe.prices.create({
        product: product.id,
        unit_amount: config.prices.oneTime,
        currency: 'usd',
      });
      log(
        `  ✓ One-time price created: ${formatCurrency(config.prices.oneTime)} (ID: ${prices.oneTime.id})`,
        'green'
      );
    }
  }

  return { product, prices };
}

async function createOrUpdateCoupon(config: CouponConfig): Promise<Stripe.Coupon> {
  log(`\n${colors.bright}Setting up coupon: ${config.name}${colors.reset}`, 'blue');

  // Check if coupon exists
  let coupon = await findExistingCoupon(config.id);

  if (coupon) {
    log(`  ✓ Coupon already exists (ID: ${coupon.id})`, 'yellow');
    return coupon;
  }

  // Create new coupon
  const couponData: Stripe.CouponCreateParams = {
    id: config.id,
    name: config.name,
    duration: config.duration,
    metadata: config.metadata,
  };

  if (config.percentOff) {
    couponData.percent_off = config.percentOff;
  }

  if (config.amountOff) {
    couponData.amount_off = config.amountOff;
    couponData.currency = 'usd';
  }

  if (config.durationInMonths) {
    couponData.duration_in_months = config.durationInMonths;
  }

  coupon = await stripe.coupons.create(couponData);

  const discountText = config.percentOff
    ? `${config.percentOff}% off`
    : `${formatCurrency(config.amountOff!)} off`;

  log(`  ✓ Coupon created: ${discountText} (ID: ${coupon.id})`, 'green');

  return coupon;
}

// Main setup function
async function setupStripeProducts() {
  log('\n========================================', 'bright');
  log('The Fort Jiu-Jitsu - Stripe Setup', 'bright');
  log('========================================\n', 'bright');

  try {
    // Verify Stripe connection
    const account = await stripe.accounts.retrieve();
    log(`✓ Connected to Stripe account: ${account.email || account.id}`, 'green');

    // Create products and prices
    const results: Record<string, any> = {};

    for (const [key, config] of Object.entries(PRODUCTS)) {
      const result = await createOrUpdateProduct(key, config);
      results[key] = {
        productId: result.product.id,
        monthlyPriceId: result.prices.monthly?.id,
        annualPriceId: result.prices.annual?.id,
        oneTimePriceId: result.prices.oneTime?.id,
      };
    }

    // Create coupons
    const coupons: Record<string, string> = {};
    for (const couponConfig of COUPONS) {
      const coupon = await createOrUpdateCoupon(couponConfig);
      coupons[couponConfig.id] = coupon.id;
    }

    // Output configuration for application
    log('\n========================================', 'bright');
    log('Setup Complete!', 'green');
    log('========================================\n', 'bright');

    log('Add these IDs to your lib/stripe-products.ts file:\n', 'blue');

    console.log(JSON.stringify({ products: results, coupons }, null, 2));

    log('\n========================================', 'bright');
    log('Next Steps:', 'yellow');
    log('========================================', 'bright');
    log('1. Copy the IDs above to lib/stripe-products.ts');
    log('2. Update your app to use these product IDs');
    log('3. Test the checkout flow');
    log('4. Configure Stripe webhooks for subscription events\n');

  } catch (error) {
    log('\n❌ Error during setup:', 'red');
    console.error(error);
    process.exit(1);
  }
}

// Run the setup
setupStripeProducts()
  .then(() => {
    log('\n✓ Script completed successfully!\n', 'green');
    process.exit(0);
  })
  .catch((error) => {
    log('\n❌ Script failed:', 'red');
    console.error(error);
    process.exit(1);
  });

export { setupStripeProducts };
