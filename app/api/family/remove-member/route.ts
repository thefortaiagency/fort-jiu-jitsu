import { NextRequest, NextResponse } from 'next/server';
import { createServerSupabaseClient } from '@/lib/supabase';
import { updateFamilySubscription, calculateFamilyPrice, MemberType } from '@/lib/stripe';

/**
 * POST /api/family/remove-member
 * Remove a family member from a family account
 *
 * Request body:
 * {
 *   primaryAccountHolderId: string,
 *   memberIdToRemove: string,
 *   convertToIndividual?: boolean // If true and removing brings count to 1, convert to individual pricing
 * }
 *
 * This will:
 * 1. Validate authorization (primary account holder only)
 * 2. Prevent removing the primary account holder
 * 3. Unlink member from family (but keep member record)
 * 4. Update Stripe subscription with new pricing
 * 5. If family drops to 1 member, optionally convert to individual pricing
 * 6. Return updated family information
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { primaryAccountHolderId, memberIdToRemove, convertToIndividual = true } = body;

    // Validate required fields
    if (!primaryAccountHolderId || !memberIdToRemove) {
      return NextResponse.json(
        { error: 'Primary account holder ID and member ID to remove are required' },
        { status: 400 }
      );
    }

    // Can't remove self
    if (primaryAccountHolderId === memberIdToRemove) {
      return NextResponse.json(
        { error: 'Cannot remove the primary account holder from the family' },
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
        { error: 'Only the primary account holder can remove family members' },
        { status: 403 }
      );
    }

    // Get member to remove
    const { data: memberToRemove, error: memberError } = await supabase
      .from('members')
      .select('*')
      .eq('id', memberIdToRemove)
      .single();

    if (memberError || !memberToRemove) {
      return NextResponse.json(
        { error: 'Member to remove not found' },
        { status: 404 }
      );
    }

    // Verify member is part of this family
    if (memberToRemove.family_account_id !== primaryAccountHolderId) {
      return NextResponse.json(
        { error: 'Member is not part of this family account' },
        { status: 400 }
      );
    }

    // Unlink member from family (keep the member record, just remove family link)
    const { data: unlinkedMember, error: unlinkError } = await supabase
      .from('members')
      .update({
        family_account_id: null,
        is_primary_account_holder: false,
        stripe_customer_id: null, // Remove reference to family's Stripe customer
        family_role: null,
        relationship_to_primary: null,
        status: 'inactive', // Set to inactive since they're no longer subscribed
        payment_status: 'cancelled',
        updated_at: new Date().toISOString(),
      })
      .eq('id', memberIdToRemove)
      .select()
      .single();

    if (unlinkError) {
      console.error('Error unlinking member:', unlinkError);
      return NextResponse.json(
        { error: 'Failed to remove member from family' },
        { status: 500 }
      );
    }

    // Get remaining family members
    const { data: remainingMembers } = await supabase
      .from('members')
      .select('*')
      .or(`id.eq.${primaryAccountHolderId},family_account_id.eq.${primaryAccountHolderId}`)
      .order('is_primary_account_holder', { ascending: false });

    const memberCount = remainingMembers?.length || 0;

    let pricingMessage = '';
    let shouldConvertToIndividual = false;

    // Check if family drops below 2 members
    if (memberCount <= 1) {
      shouldConvertToIndividual = convertToIndividual;

      if (shouldConvertToIndividual) {
        pricingMessage =
          'Family size is now 1 - converting to individual pricing. You may want to cancel the family plan.';

        // Update primary member to individual pricing
        const individualCost = primaryMember.program?.includes('kid') ? 75 : 100;
        await supabase
          .from('members')
          .update({
            is_primary_account_holder: false, // No longer a family account holder
            individual_monthly_cost: individualCost,
            updated_at: new Date().toISOString(),
          })
          .eq('id', primaryAccountHolderId);

        // Delete or deactivate family_accounts record
        await supabase
          .from('family_accounts')
          .update({
            is_active: false,
            updated_at: new Date().toISOString(),
          })
          .eq('primary_member_id', primaryAccountHolderId);
      } else {
        pricingMessage = 'Family size is now 1. Consider converting to individual pricing.';
      }
    } else {
      // Still a valid family, update subscription
      const memberTypes: MemberType[] =
        remainingMembers?.map((m) => (m.program?.includes('kid') ? 'kid' : 'adult')) || [];
      const pricing = calculateFamilyPrice(memberTypes);

      // Update Stripe subscription
      const stripeResult = await updateFamilySubscription(primaryAccountHolderId, memberCount);

      if (!stripeResult.success) {
        console.error('Stripe update warning:', stripeResult.error);
        pricingMessage = 'Member removed, but Stripe subscription update may have failed.';
      } else {
        pricingMessage = `Family subscription updated. New monthly rate: $${pricing.monthlyTotal}`;
      }
    }

    // TODO: Send notification email to removed member
    // await sendMemberRemovedEmail({
    //   memberEmail: memberToRemove.email,
    //   memberName: `${memberToRemove.first_name} ${memberToRemove.last_name}`,
    //   familyName: `${primaryMember.first_name} ${primaryMember.last_name} Family`,
    // });

    return NextResponse.json({
      success: true,
      message: `${memberToRemove.first_name} ${memberToRemove.last_name} has been removed from the family account`,
      pricingMessage,
      unlinkedMember,
      remainingMembers,
      memberCount,
      convertedToIndividual: shouldConvertToIndividual,
    });
  } catch (error) {
    console.error('Remove family member error:', error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Failed to remove family member' },
      { status: 500 }
    );
  }
}
