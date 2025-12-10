import { NextRequest, NextResponse } from 'next/server';
import {
  createServerSupabaseClient,
  getFamilyMembers,
  linkToFamily,
  getFamilyBilling,
} from '@/lib/supabase';
import { calculateFamilyPrice, MemberType } from '@/lib/stripe';

// GET /api/family?memberId=xxx - Get all family members with detailed billing
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const memberId = searchParams.get('memberId');

    if (!memberId) {
      return NextResponse.json({ error: 'Member ID is required' }, { status: 400 });
    }

    const { data: familyMembers, error } = await getFamilyMembers(memberId);

    if (error) {
      console.error('Error fetching family members:', error);
      return NextResponse.json({ error: 'Failed to fetch family members' }, { status: 500 });
    }

    // Get billing information
    const { data: billingInfo, error: billingError } = await getFamilyBilling(memberId);

    if (billingError) {
      console.error('Error fetching billing info:', billingError);
    }

    // Calculate detailed pricing if we have family members
    let detailedPricing = null;
    if (familyMembers && familyMembers.length > 0) {
      const memberTypes: MemberType[] = familyMembers.map((m) =>
        m.program?.includes('kid') ? 'kid' : 'adult'
      );
      detailedPricing = calculateFamilyPrice(memberTypes);
    }

    // Get family account record if exists
    const supabase = createServerSupabaseClient();
    const primaryMember = familyMembers?.find((m) => m.is_primary_account_holder);

    let familyAccount = null;
    if (primaryMember) {
      const { data: familyAccountData } = await supabase
        .from('family_accounts')
        .select('*')
        .eq('primary_member_id', primaryMember.id)
        .single();

      familyAccount = familyAccountData;
    }

    return NextResponse.json({
      success: true,
      familyMembers,
      billing: billingInfo || null,
      pricing: detailedPricing,
      familyAccount,
    });
  } catch (error) {
    console.error('Family API error:', error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Failed to fetch family data' },
      { status: 500 }
    );
  }
}

// POST /api/family/link - Link existing member to family
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { parentMemberId, childMemberId } = body;

    if (!parentMemberId || !childMemberId) {
      return NextResponse.json(
        { error: 'Parent member ID and child member ID are required' },
        { status: 400 }
      );
    }

    // Verify both members exist
    const supabase = createServerSupabaseClient();

    const { data: parent, error: parentError } = await supabase
      .from('members')
      .select('id, first_name, last_name, is_primary_account_holder, stripe_customer_id')
      .eq('id', parentMemberId)
      .single();

    if (parentError || !parent) {
      return NextResponse.json(
        { error: 'Parent member not found' },
        { status: 404 }
      );
    }

    const { data: child, error: childError } = await supabase
      .from('members')
      .select('id, first_name, last_name, family_account_id')
      .eq('id', childMemberId)
      .single();

    if (childError || !child) {
      return NextResponse.json(
        { error: 'Child member not found' },
        { status: 404 }
      );
    }

    // Check if child is already linked to a family
    if (child.family_account_id) {
      return NextResponse.json(
        { error: 'This member is already linked to a family account' },
        { status: 400 }
      );
    }

    // Link the child to parent's family
    const { data: linkedMember, error: linkError } = await linkToFamily(childMemberId, parentMemberId);

    if (linkError) {
      console.error('Error linking family members:', linkError);
      return NextResponse.json(
        { error: linkError.message || 'Failed to link family members' },
        { status: 500 }
      );
    }

    // Get updated family information
    const { data: familyMembers } = await getFamilyMembers(parentMemberId);
    const { data: billingInfo } = await getFamilyBilling(parentMemberId);

    return NextResponse.json({
      success: true,
      message: `${child.first_name} ${child.last_name} has been linked to ${parent.first_name} ${parent.last_name}'s family account`,
      linkedMember,
      familyMembers,
      billing: billingInfo,
    });
  } catch (error) {
    console.error('Link family API error:', error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Failed to link family members' },
      { status: 500 }
    );
  }
}

// PUT /api/family - Update family account settings
export async function PUT(request: NextRequest) {
  try {
    const body = await request.json();
    const { primaryMemberId, familyName, metadata } = body;

    if (!primaryMemberId) {
      return NextResponse.json(
        { error: 'Primary member ID is required' },
        { status: 400 }
      );
    }

    const supabase = createServerSupabaseClient();

    // Verify primary member exists and is primary account holder
    const { data: primaryMember, error: memberError } = await supabase
      .from('members')
      .select('id, is_primary_account_holder, first_name, last_name')
      .eq('id', primaryMemberId)
      .single();

    if (memberError || !primaryMember) {
      return NextResponse.json(
        { error: 'Primary member not found' },
        { status: 404 }
      );
    }

    if (!primaryMember.is_primary_account_holder) {
      return NextResponse.json(
        { error: 'Member is not a primary account holder' },
        { status: 400 }
      );
    }

    // Update family account
    const updateData: any = {
      updated_at: new Date().toISOString(),
    };

    if (familyName) {
      updateData.family_name = familyName;
    }

    if (metadata) {
      updateData.metadata = metadata;
    }

    const { data: updatedFamily, error: updateError } = await supabase
      .from('family_accounts')
      .update(updateData)
      .eq('primary_member_id', primaryMemberId)
      .select()
      .single();

    if (updateError) {
      console.error('Error updating family account:', updateError);
      return NextResponse.json(
        { error: 'Failed to update family account' },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      message: 'Family account updated successfully',
      familyAccount: updatedFamily,
    });
  } catch (error) {
    console.error('Update family API error:', error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Failed to update family account' },
      { status: 500 }
    );
  }
}
