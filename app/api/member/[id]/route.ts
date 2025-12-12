import { NextRequest, NextResponse } from 'next/server';
import { createServerSupabaseClient } from '@/lib/supabase';

// Helper to determine if the param is an email or UUID
function isEmail(value: string): boolean {
  return value.includes('@') || value.includes('%40');
}

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const decodedId = decodeURIComponent(id);

    const supabase = createServerSupabaseClient();

    // Determine if looking up by email or UUID
    const lookupField = isEmail(decodedId) ? 'email' : 'id';
    const lookupValue = isEmail(decodedId) ? decodedId.toLowerCase().trim() : decodedId;

    // Look up member
    const { data: member, error: memberError } = await supabase
      .from('members')
      .select(`
        id,
        first_name,
        last_name,
        email,
        phone,
        birth_date,
        status,
        payment_status,
        membership_type,
        program,
        skill_level,
        stripe_customer_id,
        stripe_subscription_id,
        family_account_id,
        is_primary_account_holder,
        individual_monthly_cost,
        current_belt_id,
        current_stripes,
        belt_updated_at,
        total_classes_attended,
        emergency_contact_name,
        emergency_contact_phone,
        emergency_contact_relationship,
        medical_conditions,
        qr_code,
        created_at,
        updated_at
      `)
      .eq(lookupField, lookupValue)
      .single();

    if (memberError || !member) {
      return NextResponse.json(
        { error: 'Member not found' },
        { status: 404 }
      );
    }

    // Get belt info if member has one
    let beltInfo = null;
    if (member.current_belt_id) {
      const { data: belt } = await supabase
        .from('belt_ranks')
        .select('name, display_name, color_hex, is_kids_belt')
        .eq('id', member.current_belt_id)
        .single();

      if (belt) {
        beltInfo = {
          name: belt.name,
          displayName: belt.display_name,
          colorHex: belt.color_hex,
          isKidsBelt: belt.is_kids_belt,
          stripes: member.current_stripes || 0,
          updatedAt: member.belt_updated_at,
        };
      }
    }

    // Get all family members if this member has a family account
    let familyMembers: any[] = [];
    if (member.family_account_id) {
      const { data: familyData } = await supabase
        .from('members')
        .select(`
          id,
          first_name,
          last_name,
          email,
          program,
          status,
          is_primary_account_holder,
          current_belt_id,
          current_stripes,
          qr_code
        `)
        .eq('family_account_id', member.family_account_id);

      familyMembers = familyData || [];
    }

    // Transform member data
    const memberData = {
      id: member.id,
      firstName: member.first_name,
      lastName: member.last_name,
      email: member.email,
      phone: member.phone,
      birthDate: member.birth_date,
      status: member.status,
      paymentStatus: member.payment_status || 'pending',
      membershipType: member.membership_type || 'monthly',
      program: member.program,
      skillLevel: member.skill_level || 'beginner',
      isActive: member.status === 'active',
      individualMonthlyCost: member.individual_monthly_cost || 100,
      isPrimaryAccountHolder: member.is_primary_account_holder,
      familyAccountId: member.family_account_id,
      stripeCustomerId: member.stripe_customer_id,
      stripeSubscriptionId: member.stripe_subscription_id,
      totalClassesAttended: member.total_classes_attended || 0,
      emergencyContact: {
        name: member.emergency_contact_name,
        phone: member.emergency_contact_phone,
        relationship: member.emergency_contact_relationship,
      },
      medicalConditions: member.medical_conditions,
      qrCode: member.qr_code,
      belt: beltInfo,
      createdAt: member.created_at,
      updatedAt: member.updated_at,
    };

    // Transform family members
    const familyMembersData = familyMembers.map((fm: any) => ({
      id: fm.id,
      firstName: fm.first_name,
      lastName: fm.last_name,
      email: fm.email,
      program: fm.program,
      status: fm.status,
      isPrimaryAccountHolder: fm.is_primary_account_holder,
      qrCode: fm.qr_code,
    }));

    return NextResponse.json({
      member: memberData,
      familyMembers: familyMembersData,
    });
  } catch (error) {
    console.error('Member lookup error:', error);
    return NextResponse.json(
      { error: 'Failed to load member data' },
      { status: 500 }
    );
  }
}

// PUT - Update member profile
export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const decodedId = decodeURIComponent(id);
    const body = await request.json();

    const supabase = createServerSupabaseClient();

    // Determine if looking up by email or UUID
    const lookupField = isEmail(decodedId) ? 'email' : 'id';
    const lookupValue = isEmail(decodedId) ? decodedId.toLowerCase().trim() : decodedId;

    // Get member ID first
    const { data: member } = await supabase
      .from('members')
      .select('id')
      .eq(lookupField, lookupValue)
      .single();

    if (!member) {
      return NextResponse.json({ error: 'Member not found' }, { status: 404 });
    }

    // Fields that members can update themselves
    const allowedFields = [
      'phone',
      'emergency_contact_name',
      'emergency_contact_phone',
      'emergency_contact_relationship',
      'medical_conditions',
      'medications',
      'allergies',
      'address_line1',
      'address_line2',
      'city',
      'state',
      'zip_code',
    ];

    // Filter to only allowed fields
    const updateData: any = {};
    for (const field of allowedFields) {
      if (body[field] !== undefined) {
        updateData[field] = body[field];
      }
    }

    updateData.updated_at = new Date().toISOString();

    const { error } = await supabase
      .from('members')
      .update(updateData)
      .eq('id', member.id);

    if (error) {
      console.error('Error updating member:', error);
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Member update error:', error);
    return NextResponse.json(
      { error: 'Failed to update member' },
      { status: 500 }
    );
  }
}
