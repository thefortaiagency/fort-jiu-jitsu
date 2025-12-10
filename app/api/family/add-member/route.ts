import { NextRequest, NextResponse } from 'next/server';
import { createServerSupabaseClient } from '@/lib/supabase';
import { updateFamilySubscription, calculateFamilyPrice, MemberType } from '@/lib/stripe';

/**
 * POST /api/family/add-member
 * Add a new family member to an existing family account
 *
 * Request body:
 * {
 *   primaryAccountHolderId: string,
 *   firstName: string,
 *   lastName: string,
 *   email: string,
 *   phone?: string,
 *   dateOfBirth: string,
 *   program: 'kids-bjj' | 'adult-bjj',
 *   familyRole?: 'spouse' | 'child' | 'other',
 *   relationshipToPrimary?: string,
 *   emergencyContactName?: string,
 *   emergencyContactPhone?: string,
 *   emergencyContactRelationship?: string,
 *   medicalConditions?: string
 * }
 *
 * This will:
 * 1. Validate primary account holder exists
 * 2. Check if new member already exists
 * 3. Create member record linked to family
 * 4. Update Stripe subscription with new pricing
 * 5. Send welcome email to new member
 * 6. Return updated family information
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const {
      primaryAccountHolderId,
      firstName,
      lastName,
      email,
      phone,
      dateOfBirth,
      program,
      familyRole,
      relationshipToPrimary,
      emergencyContactName,
      emergencyContactPhone,
      emergencyContactRelationship,
      medicalConditions,
    } = body;

    // Validate required fields
    if (!primaryAccountHolderId || !firstName || !lastName || !email || !dateOfBirth || !program) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      );
    }

    const supabase = createServerSupabaseClient();

    // Verify primary account holder exists
    const { data: primaryMember, error: primaryError } = await supabase
      .from('members')
      .select('*')
      .eq('id', primaryAccountHolderId)
      .single();

    if (primaryError || !primaryMember) {
      return NextResponse.json(
        { error: 'Primary account holder not found' },
        { status: 404 }
      );
    }

    if (!primaryMember.is_primary_account_holder) {
      return NextResponse.json(
        { error: 'Specified member is not a primary account holder' },
        { status: 400 }
      );
    }

    // Check if new member already exists by email
    const { data: existingMember } = await supabase
      .from('members')
      .select('id, email, family_account_id, first_name, last_name')
      .eq('email', email)
      .single();

    if (existingMember) {
      // Member exists - check if they're already in a family
      if (existingMember.family_account_id) {
        return NextResponse.json(
          {
            error: `${existingMember.first_name} ${existingMember.last_name} is already linked to a family account`,
          },
          { status: 400 }
        );
      }

      // Existing member not in a family - link them to this family
      const { data: linkedMember, error: linkError } = await supabase
        .from('members')
        .update({
          family_account_id: primaryAccountHolderId,
          is_primary_account_holder: false,
          stripe_customer_id: primaryMember.stripe_customer_id,
          family_role: familyRole || 'other',
          relationship_to_primary: relationshipToPrimary || 'family member',
          updated_at: new Date().toISOString(),
        })
        .eq('id', existingMember.id)
        .select()
        .single();

      if (linkError) {
        console.error('Error linking existing member:', linkError);
        return NextResponse.json(
          { error: 'Failed to link existing member to family' },
          { status: 500 }
        );
      }

      // Get updated family info
      const { data: familyMembers } = await supabase
        .from('members')
        .select('*')
        .or(`id.eq.${primaryAccountHolderId},family_account_id.eq.${primaryAccountHolderId}`)
        .order('is_primary_account_holder', { ascending: false });

      const memberCount = familyMembers?.length || 0;

      // Update Stripe subscription
      const stripeResult = await updateFamilySubscription(primaryAccountHolderId, memberCount);

      if (!stripeResult.success) {
        console.error('Stripe update warning:', stripeResult.error);
        // Don't fail the whole operation if Stripe update fails
      }

      return NextResponse.json({
        success: true,
        message: `${existingMember.first_name} ${existingMember.last_name} has been added to the family account`,
        linkedMember,
        familyMembers,
        memberCount,
        stripeUpdated: stripeResult.success,
      });
    }

    // Calculate age to determine if minor
    const birthDate = new Date(dateOfBirth);
    const today = new Date();
    const age = today.getFullYear() - birthDate.getFullYear();
    const isMinor = age < 18;

    // Determine individual monthly cost based on program
    const individualMonthlyCost = program.includes('kid') ? 75 : 100;

    // Create new member linked to family
    const { data: newMember, error: createError } = await supabase
      .from('members')
      .insert({
        first_name: firstName,
        last_name: lastName,
        email: email,
        phone: phone || null,
        birth_date: dateOfBirth,
        program: program,
        skill_level: 'beginner',
        status: 'active', // Active since they're joining existing family subscription
        membership_type: 'monthly',
        parent_first_name: isMinor ? primaryMember.first_name : null,
        parent_last_name: isMinor ? primaryMember.last_name : null,
        parent_email: isMinor ? primaryMember.email : null,
        parent_phone: isMinor ? primaryMember.phone : null,
        emergency_contact_name: emergencyContactName || null,
        emergency_contact_phone: emergencyContactPhone || null,
        emergency_contact_relationship: emergencyContactRelationship || null,
        medical_conditions: medicalConditions || null,
        stripe_customer_id: primaryMember.stripe_customer_id, // Use family's Stripe customer
        payment_status: 'active',
        family_account_id: primaryAccountHolderId,
        is_primary_account_holder: false,
        family_role: familyRole || (isMinor ? 'child' : 'other'),
        relationship_to_primary: relationshipToPrimary || (isMinor ? 'child' : 'family member'),
        individual_monthly_cost: individualMonthlyCost,
      })
      .select()
      .single();

    if (createError) {
      console.error('Error creating new member:', createError);
      return NextResponse.json(
        { error: 'Failed to create new family member' },
        { status: 500 }
      );
    }

    // Get updated family info
    const { data: familyMembers } = await supabase
      .from('members')
      .select('*')
      .or(`id.eq.${primaryAccountHolderId},family_account_id.eq.${primaryAccountHolderId}`)
      .order('is_primary_account_holder', { ascending: false });

    const memberCount = familyMembers?.length || 0;

    // Calculate new pricing
    const memberTypes: MemberType[] =
      familyMembers?.map((m) => (m.program?.includes('kid') ? 'kid' : 'adult')) || [];
    const pricing = calculateFamilyPrice(memberTypes);

    // Update Stripe subscription with new member count
    const stripeResult = await updateFamilySubscription(primaryAccountHolderId, memberCount);

    if (!stripeResult.success) {
      console.error('Stripe update warning:', stripeResult.error);
      // Don't fail the whole operation if Stripe update fails
    }

    // TODO: Send welcome email to new member
    // await sendFamilyMemberWelcomeEmail({
    //   memberEmail: email,
    //   memberName: `${firstName} ${lastName}`,
    //   primaryName: `${primaryMember.first_name} ${primaryMember.last_name}`,
    //   familyName: `${primaryMember.first_name} ${primaryMember.last_name} Family`,
    // });

    return NextResponse.json({
      success: true,
      message: `${firstName} ${lastName} has been added to the family account`,
      newMember,
      familyMembers,
      memberCount,
      pricing,
      stripeUpdated: stripeResult.success,
    });
  } catch (error) {
    console.error('Add family member error:', error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Failed to add family member' },
      { status: 500 }
    );
  }
}
