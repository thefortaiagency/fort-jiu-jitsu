import { NextRequest, NextResponse } from 'next/server';
import Stripe from 'stripe';
import { createServerSupabaseClient } from '@/lib/supabase';

// Initialize Stripe - let the library use its default API version
const stripe = new Stripe(process.env.STRIPE_SECRET_KEY || '');

const STRIPE_PRICES: Record<string, { priceInCents: number; mode: 'subscription' | 'payment' }> = {
  kids: { priceInCents: 7500, mode: 'subscription' },
  adult: { priceInCents: 10000, mode: 'subscription' },
  'drop-in': { priceInCents: 2000, mode: 'payment' },
};

export async function POST(request: NextRequest) {
  // Check Stripe configuration at runtime
  if (!process.env.STRIPE_SECRET_KEY) {
    console.error('Signup failed: STRIPE_SECRET_KEY not configured');
    return NextResponse.json(
      { error: 'Payment system not configured. Please contact support.' },
      { status: 500 }
    );
  }

  try {
    const body = await request.json();
    const {
      firstName,
      lastName,
      email,
      phone,
      dateOfBirth,
      membershipType,
      parentFirstName,
      parentLastName,
      parentEmail,
      parentPhone,
      emergencyContactName,
      emergencyContactPhone,
      emergencyContactRelationship,
      medicalConditions,
      waiverAgreed,
      signatureData,
      signerName,
      linkToParentId, // Optional: for family member signup flow
      promoCode, // Optional: discount/coupon code
    } = body;

    // Validate required fields
    if (!firstName || !lastName || !email || !dateOfBirth || !membershipType) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      );
    }

    if (!waiverAgreed || !signatureData || !signerName) {
      return NextResponse.json(
        { error: 'Waiver must be signed' },
        { status: 400 }
      );
    }

    // Determine if minor
    const birthDate = new Date(dateOfBirth);
    const today = new Date();
    const age = today.getFullYear() - birthDate.getFullYear();
    const isMinor = age < 18;

    // Validate parent info for minors (REQUIRED, not optional)
    if (isMinor && (!parentFirstName || !parentLastName || !parentEmail)) {
      return NextResponse.json(
        { error: 'Parent/Guardian information is required for minors under 18' },
        { status: 400 }
      );
    }

    const supabase = createServerSupabaseClient();

    // Check if member already exists
    const { data: existingMember } = await supabase
      .from('members')
      .select('id, email')
      .eq('email', email)
      .single();

    if (existingMember) {
      return NextResponse.json(
        { error: 'A member with this email already exists' },
        { status: 400 }
      );
    }

    // Determine program based on membership type
    const program = membershipType === 'kids' ? 'kids-bjj' : 'adult-bjj';

    // Handle family account linking
    let parentMember = null;
    let familyAccountId = null;
    let isPrimaryAccountHolder = true;
    let stripeCustomerId = null;

    // If this is a child signup and we have parent email, check if parent exists
    if (isMinor && parentEmail && !linkToParentId) {
      const { data: existingParent } = await supabase
        .from('members')
        .select('id, stripe_customer_id, is_primary_account_holder, email, family_account_id')
        .eq('email', parentEmail)
        .single();

      if (existingParent) {
        // Parent exists, link to their account
        parentMember = existingParent;
        familyAccountId = existingParent.is_primary_account_holder
          ? existingParent.id
          : existingParent.family_account_id;
        isPrimaryAccountHolder = false;
        stripeCustomerId = existingParent.stripe_customer_id;
      }
    }

    // If linkToParentId is provided (from family signup flow)
    if (linkToParentId) {
      const { data: existingParent } = await supabase
        .from('members')
        .select('id, stripe_customer_id, is_primary_account_holder, family_account_id')
        .eq('id', linkToParentId)
        .single();

      if (existingParent) {
        parentMember = existingParent;
        familyAccountId = existingParent.is_primary_account_holder
          ? existingParent.id
          : existingParent.family_account_id;
        isPrimaryAccountHolder = false;
        stripeCustomerId = existingParent.stripe_customer_id;
      }
    }

    // Create Stripe customer only if not using parent's
    if (!stripeCustomerId) {
      const stripeCustomer = await stripe.customers.create({
        email: isMinor && parentEmail ? parentEmail : email,
        name: isMinor
          ? `${parentFirstName} ${parentLastName} (for ${firstName} ${lastName})`
          : `${firstName} ${lastName}`,
        metadata: {
          member_name: `${firstName} ${lastName}`,
          membership_type: membershipType,
          source: 'thefortjiujitsu.com',
          is_primary_account_holder: isPrimaryAccountHolder.toString(),
        },
      });
      stripeCustomerId = stripeCustomer.id;
    }

    // Create member in database
    const { data: newMember, error: memberError } = await supabase
      .from('members')
      .insert({
        first_name: firstName,
        last_name: lastName,
        email: email,
        phone: phone || null,
        birth_date: dateOfBirth,
        program: program,
        skill_level: 'beginner',
        status: 'pending',
        membership_type: membershipType === 'drop-in' ? 'drop-in' : 'monthly',
        parent_first_name: isMinor ? parentFirstName : null,
        parent_last_name: isMinor ? parentLastName : null,
        parent_email: isMinor ? parentEmail : null,
        parent_phone: isMinor ? parentPhone : null,
        emergency_contact_name: emergencyContactName,
        emergency_contact_phone: emergencyContactPhone,
        emergency_contact_relationship: emergencyContactRelationship || null,
        medical_conditions: medicalConditions || null,
        stripe_customer_id: stripeCustomerId,
        payment_status: 'pending',
        family_account_id: familyAccountId,
        is_primary_account_holder: isPrimaryAccountHolder,
        individual_monthly_cost: membershipType === 'kids' ? 75 : membershipType === 'adult' ? 100 : 20,
      })
      .select()
      .single();

    if (memberError) {
      console.error('Error creating member:', memberError);
      // Clean up Stripe customer if member creation fails (only if we created a new one)
      if (isPrimaryAccountHolder && stripeCustomerId) {
        await stripe.customers.del(stripeCustomerId);
      }
      return NextResponse.json(
        { error: 'Failed to create member account' },
        { status: 500 }
      );
    }

    // Determine signer relationship
    let signerRelationship = 'self';
    if (isMinor) {
      // For minors, determine if parent or guardian based on signer name match
      const signerNameLower = signerName.toLowerCase();
      const parentNameLower = `${parentFirstName} ${parentLastName}`.toLowerCase();
      signerRelationship = signerNameLower === parentNameLower ? 'parent' : 'guardian';
    }

    // Store waiver signature
    const { error: waiverError } = await supabase.from('waivers').insert({
      member_id: newMember.id,
      waiver_type: 'liability',
      waiver_version: '1.0',
      signer_name: signerName,
      signer_email: isMinor && parentEmail ? parentEmail : email,
      signer_relationship: signerRelationship,
      signature_data: signatureData,
      ip_address: request.headers.get('x-forwarded-for') || request.headers.get('x-real-ip') || 'unknown',
      user_agent: request.headers.get('user-agent') || 'unknown',
    });

    if (waiverError) {
      console.error('Error storing waiver:', waiverError);
      // Don't fail the whole signup if waiver storage fails - just log it
    }

    // Get price config
    const priceConfig = STRIPE_PRICES[membershipType];
    if (!priceConfig) {
      return NextResponse.json(
        { error: 'Invalid membership type' },
        { status: 400 }
      );
    }

    const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || 'https://thefortjiujitsu.com';

    // Map promo codes to Stripe coupon IDs
    const PROMO_CODE_MAP: Record<string, string> = {
      TEST1: 'TEST_1_DOLLAR',
      TESTFREE: 'TEST_FREE',
      FAMILY_DISCOUNT_25: 'FAMILY_DISCOUNT_25',
      FIRST_WEEK_FREE: 'FIRST_WEEK_FREE',
      GRAND_OPENING_50: 'GRAND_OPENING_50',
      GRANDOPENING: 'GRAND_OPENING_50',
      FOUNDER: 'FOUNDER_DISCOUNT',
    };

    // Build checkout session params
    const checkoutParams: Stripe.Checkout.SessionCreateParams = {
      customer: stripeCustomerId,
      mode: priceConfig.mode,
      payment_method_types: ['card'],
      line_items: [
        {
          price_data: {
            currency: 'usd',
            unit_amount: priceConfig.priceInCents,
            product_data: {
              name:
                membershipType === 'kids'
                  ? 'Kids Gi Classes'
                  : membershipType === 'adult'
                  ? 'Adult Gi Classes'
                  : 'Drop-in Class',
              description:
                membershipType === 'kids'
                  ? 'Brazilian Jiu-Jitsu for kids - Tue & Wed 5:30-6:30 PM'
                  : membershipType === 'adult'
                  ? 'Brazilian Jiu-Jitsu for adults - Tue & Wed 6:30-8:00 PM + Morning Rolls'
                  : 'Single class visit',
            },
            ...(priceConfig.mode === 'subscription' && {
              recurring: { interval: 'month' },
            }),
          },
          quantity: 1,
        },
      ],
      success_url: `${baseUrl}/signup/success?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${baseUrl}/signup?cancelled=true`,
      metadata: {
        member_id: newMember.id,
        membership_type: membershipType,
        promo_code: promoCode || '',
      },
    };

    // Apply promo code if provided
    if (promoCode) {
      const couponId = PROMO_CODE_MAP[promoCode.toUpperCase()] || promoCode.toUpperCase();
      try {
        // Verify the coupon exists in Stripe
        await stripe.coupons.retrieve(couponId);
        checkoutParams.discounts = [{ coupon: couponId }];
      } catch {
        // Coupon doesn't exist - allow checkout to proceed without it
        console.warn(`Coupon ${couponId} not found in Stripe, proceeding without discount`);
        // Still allow promotion codes to be entered at checkout
        checkoutParams.allow_promotion_codes = true;
      }
    } else {
      // Allow users to enter promo codes at checkout if they didn't provide one
      checkoutParams.allow_promotion_codes = true;
    }

    // Create Stripe checkout session
    const checkoutSession = await stripe.checkout.sessions.create(checkoutParams);

    return NextResponse.json({
      success: true,
      checkoutUrl: checkoutSession.url,
      memberId: newMember.id,
    });
  } catch (error) {
    console.error('Signup error:', error);

    // Handle Stripe-specific errors
    if (error instanceof Stripe.errors.StripeError) {
      console.error('Stripe error type:', error.type);
      console.error('Stripe error code:', error.code);
      return NextResponse.json(
        { error: `Payment error: ${error.message}` },
        { status: 400 }
      );
    }

    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Signup failed' },
      { status: 500 }
    );
  }
}
