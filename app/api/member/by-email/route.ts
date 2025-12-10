import { NextRequest, NextResponse } from 'next/server';
import { createServerSupabaseClient } from '@/lib/supabase';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const email = searchParams.get('email');

    if (!email) {
      return NextResponse.json({ error: 'Email is required' }, { status: 400 });
    }

    const supabase = createServerSupabaseClient();

    // Look up member by email
    const { data: member, error: memberError } = await supabase
      .from('members')
      .select(`
        id,
        first_name,
        last_name,
        email,
        status,
        payment_status,
        membership_type,
        program,
        stripe_customer_id,
        stripe_subscription_id,
        family_account_id,
        is_primary_account_holder,
        individual_monthly_cost,
        created_at,
        updated_at
      `)
      .eq('email', email.toLowerCase().trim())
      .single();

    if (memberError || !member) {
      return NextResponse.json(
        { error: 'Member not found' },
        { status: 404 }
      );
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
          is_primary_account_holder
        `)
        .eq('family_account_id', member.family_account_id)
        .neq('id', member.id); // Exclude the current member

      familyMembers = familyData || [];
    }

    // Transform member data
    const memberData = {
      id: member.id,
      firstName: member.first_name,
      lastName: member.last_name,
      email: member.email,
      status: member.status,
      paymentStatus: member.payment_status,
      membershipType: member.membership_type,
      program: member.program,
      isActive: member.status === 'active' && member.payment_status === 'active',
      individualMonthlyCost: member.individual_monthly_cost || 0,
      isPrimaryAccountHolder: member.is_primary_account_holder,
      familyAccountId: member.family_account_id,
      stripeCustomerId: member.stripe_customer_id,
      stripeSubscriptionId: member.stripe_subscription_id,
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
