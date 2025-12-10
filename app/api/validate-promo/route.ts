import { NextRequest, NextResponse } from 'next/server';
import { stripe } from '@/lib/stripe';

// Valid promo codes and their descriptions
const PROMO_CODES: Record<string, { couponId: string; description: string }> = {
  // Test codes
  TEST1: { couponId: 'TEST_1_DOLLAR', description: '$1 test signup' },
  TESTFREE: { couponId: 'TEST_FREE', description: '100% off for testing' },

  // Real promotional codes
  FAMILY_DISCOUNT_25: { couponId: 'FAMILY_DISCOUNT_25', description: '25% off' },
  FIRST_WEEK_FREE: { couponId: 'FIRST_WEEK_FREE', description: 'First week free' },
  GRAND_OPENING_50: { couponId: 'GRAND_OPENING_50', description: '50% off first month' },
  GRANDOPENING: { couponId: 'GRAND_OPENING_50', description: '50% off first month' },
  FOUNDER: { couponId: 'FOUNDER_DISCOUNT', description: 'Founder discount' },
};

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { promoCode } = body;

    if (!promoCode) {
      return NextResponse.json(
        { error: 'Promo code is required' },
        { status: 400 }
      );
    }

    const code = promoCode.trim().toUpperCase();

    // Check if it's a known promo code
    const promoConfig = PROMO_CODES[code];

    if (promoConfig) {
      // Verify coupon exists in Stripe
      try {
        const coupon = await stripe.coupons.retrieve(promoConfig.couponId);

        if (!coupon.valid) {
          return NextResponse.json(
            { error: 'This promo code has expired' },
            { status: 400 }
          );
        }

        const discount = coupon.percent_off
          ? `${coupon.percent_off}% off`
          : coupon.amount_off
            ? `$${(coupon.amount_off / 100).toFixed(2)} off`
            : promoConfig.description;

        return NextResponse.json({
          valid: true,
          discount,
          message: `Promo code applied: ${discount}`,
          couponId: promoConfig.couponId,
        });
      } catch {
        // Coupon doesn't exist in Stripe yet - that's ok for some codes
        return NextResponse.json({
          valid: true,
          discount: promoConfig.description,
          message: `Promo code applied: ${promoConfig.description}`,
          couponId: promoConfig.couponId,
        });
      }
    }

    // Try to find the coupon directly in Stripe by code
    try {
      const coupon = await stripe.coupons.retrieve(code);

      if (!coupon.valid) {
        return NextResponse.json(
          { error: 'This promo code has expired' },
          { status: 400 }
        );
      }

      const discount = coupon.percent_off
        ? `${coupon.percent_off}% off`
        : coupon.amount_off
          ? `$${(coupon.amount_off / 100).toFixed(2)} off`
          : 'Discount applied';

      return NextResponse.json({
        valid: true,
        discount,
        message: `Promo code applied: ${discount}`,
        couponId: code,
      });
    } catch {
      return NextResponse.json(
        { error: 'Invalid promo code' },
        { status: 400 }
      );
    }
  } catch (error) {
    console.error('Promo validation error:', error);
    return NextResponse.json(
      { error: 'Failed to validate promo code' },
      { status: 500 }
    );
  }
}
