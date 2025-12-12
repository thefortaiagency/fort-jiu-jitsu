import { NextRequest, NextResponse } from 'next/server';
import { createServerSupabaseClient } from '@/lib/supabase';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { firstName, lastName, email, phone, dateOfBirth, signatureData, signerName } = body;

    if (!firstName || !lastName || !email || !signatureData || !signerName) {
      return NextResponse.json(
        { error: 'First name, last name, email, signature, and signer name are required' },
        { status: 400 }
      );
    }

    const supabase = createServerSupabaseClient();

    // Check if this email already exists as a member
    const { data: existingMember } = await supabase
      .from('members')
      .select('id, first_name, last_name, status')
      .eq('email', email.toLowerCase().trim())
      .single();

    let memberId: string;

    if (existingMember) {
      // Use existing member
      memberId = existingMember.id;
    } else {
      // Create a new trial/pending member record
      const { data: newMember, error: memberError } = await supabase
        .from('members')
        .insert({
          first_name: firstName,
          last_name: lastName,
          email: email.toLowerCase().trim(),
          phone: phone || null,
          birth_date: dateOfBirth || '1990-01-01', // Placeholder if not provided
          program: 'adult-bjj', // Default program
          skill_level: 'beginner',
          status: 'trial', // Trial status for waiver-only signups
          membership_type: 'trial',
          payment_status: 'none',
          is_primary_account_holder: true,
          individual_monthly_cost: 0,
        })
        .select()
        .single();

      if (memberError) {
        console.error('Error creating member:', memberError);
        return NextResponse.json(
          { error: 'Failed to create member record' },
          { status: 500 }
        );
      }

      memberId = newMember.id;
    }

    // Determine if minor based on date of birth
    let signerRelationship = 'self';
    if (dateOfBirth) {
      const birthDate = new Date(dateOfBirth);
      const today = new Date();
      const age = today.getFullYear() - birthDate.getFullYear();
      const isMinor = age < 18;

      if (isMinor) {
        signerRelationship = 'parent';
      }
    }

    // Store waiver signature
    const { error: waiverError } = await supabase.from('waivers').insert({
      member_id: memberId,
      waiver_type: 'liability',
      waiver_version: '1.0',
      signer_name: signerName,
      signer_email: email.toLowerCase().trim(),
      signer_relationship: signerRelationship,
      signature_data: signatureData,
      ip_address: request.headers.get('x-forwarded-for') || request.headers.get('x-real-ip') || 'unknown',
      user_agent: request.headers.get('user-agent') || 'unknown',
    });

    if (waiverError) {
      console.error('Error storing waiver:', waiverError);
      return NextResponse.json(
        { error: 'Failed to save waiver' },
        { status: 500 }
      );
    }

    // Create a check-in record for the trial visit
    const { error: checkInError } = await supabase.from('check_ins').insert({
      member_id: memberId,
      check_in_method: 'kiosk',
      notes: 'Trial/waiver sign-up check-in',
    });

    if (checkInError) {
      console.error('Error creating check-in:', checkInError);
      // Don't fail the whole request if check-in fails
    }

    return NextResponse.json({
      success: true,
      member: {
        id: memberId,
        firstName,
        lastName,
        email,
      },
      message: 'Waiver signed successfully!',
    });
  } catch (error) {
    console.error('Waiver sign error:', error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Failed to process waiver' },
      { status: 500 }
    );
  }
}
