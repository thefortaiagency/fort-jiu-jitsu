import { NextRequest, NextResponse } from 'next/server';
import { createServerSupabaseClient, getFamilyMembers, linkToFamily, getFamilyBilling } from '@/lib/supabase';

// GET /api/family?memberId=xxx - Get all family members
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const memberId = searchParams.get('memberId');

    if (!memberId) {
      return NextResponse.json(
        { error: 'Member ID is required' },
        { status: 400 }
      );
    }

    const { data: familyMembers, error } = await getFamilyMembers(memberId);

    if (error) {
      console.error('Error fetching family members:', error);
      return NextResponse.json(
        { error: 'Failed to fetch family members' },
        { status: 500 }
      );
    }

    // Get billing information
    const { data: billingInfo, error: billingError } = await getFamilyBilling(memberId);

    if (billingError) {
      console.error('Error fetching billing info:', billingError);
    }

    return NextResponse.json({
      success: true,
      familyMembers,
      billing: billingInfo || null,
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
