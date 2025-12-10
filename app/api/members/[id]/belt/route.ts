// API Route: /api/members/[id]/belt
// GET: Get member's current belt and promotion eligibility
// POST: Promote member (admin only)

import { NextRequest, NextResponse } from 'next/server';
import { createServerSupabaseClient } from '@/lib/supabase';
import { isValidPromotion, getNextBelt } from '@/lib/belt-utils';

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const supabase = createServerSupabaseClient();
  const { id: memberId } = await params;

  try {
    // Get member with current belt
    const { data: member, error: memberError } = await supabase
      .from('members')
      .select(
        `
        *,
        current_belt:belt_ranks(*)
      `
      )
      .eq('id', memberId)
      .single();

    if (memberError) throw memberError;

    // Get belt history
    const { data: history, error: historyError } = await supabase
      .from('member_belt_history')
      .select(
        `
        *,
        belt_rank:belt_ranks(*),
        promoted_by_member:members!promoted_by(first_name, last_name)
      `
      )
      .eq('member_id', memberId)
      .order('promoted_at', { ascending: false });

    if (historyError) throw historyError;

    // Calculate promotion eligibility using database function
    const { data: eligibility, error: eligError } = await supabase.rpc(
      'get_promotion_eligibility',
      {
        p_member_id: memberId,
        p_min_days: 180, // 6 months for adults
        p_min_classes: 50,
      }
    );

    if (eligError) {
      console.error('Eligibility check error:', eligError);
    }

    // Calculate days at current belt manually as fallback
    let daysAtBelt = 0;
    let classesAtBelt = 0;
    if (member.belt_updated_at) {
      const updated = new Date(member.belt_updated_at);
      const now = new Date();
      daysAtBelt = Math.floor(
        (now.getTime() - updated.getTime()) / (1000 * 60 * 60 * 24)
      );
    }

    // Get classes since last promotion
    const currentHistory = history.find((h) => h.is_current);
    if (currentHistory) {
      classesAtBelt =
        member.total_classes_attended -
        currentHistory.classes_attended_at_promotion;
    }

    return NextResponse.json({
      member,
      history,
      eligibility: eligibility?.[0] || {
        is_eligible: false,
        days_at_current_belt: daysAtBelt,
        classes_since_promotion: classesAtBelt,
        current_belt_name: member.current_belt?.display_name || 'No Belt',
        next_belt_name: null,
        recommendation: 'Unable to calculate eligibility',
      },
    });
  } catch (error) {
    console.error('Error fetching member belt info:', error);
    return NextResponse.json(
      { error: 'Failed to fetch member belt information' },
      { status: 500 }
    );
  }
}

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const supabase = createServerSupabaseClient();
  const { id: memberId } = await params;

  try {
    const body = await request.json();
    const {
      new_belt_id,
      new_belt_name,
      stripes = 0,
      promoted_by,
      notes = '',
      is_stripe_promotion = false,
    } = body;

    // Validate required fields
    if (!promoted_by) {
      return NextResponse.json(
        { error: 'Promoted by (instructor ID) is required' },
        { status: 400 }
      );
    }

    // Get member's current belt info
    const { data: member, error: memberError } = await supabase
      .from('members')
      .select(
        `
        *,
        current_belt:belt_ranks(*)
      `
      )
      .eq('id', memberId)
      .single();

    if (memberError) throw memberError;

    // Get current belt history to calculate days at previous belt
    const { data: currentHistory } = await supabase
      .from('member_belt_history')
      .select('*')
      .eq('member_id', memberId)
      .eq('is_current', true)
      .single();

    let daysAtPreviousBelt = 0;
    if (currentHistory && currentHistory.promoted_at) {
      const promoted = new Date(currentHistory.promoted_at);
      const now = new Date();
      daysAtPreviousBelt = Math.floor(
        (now.getTime() - promoted.getTime()) / (1000 * 60 * 60 * 24)
      );
    }

    // If this is a stripe promotion, just update stripes
    if (is_stripe_promotion) {
      const newStripes = Math.min(4, (member.current_stripes || 0) + 1);

      // Create history entry for stripe promotion
      const { error: historyError } = await supabase
        .from('member_belt_history')
        .insert({
          member_id: memberId,
          belt_rank_id: member.current_belt_id,
          stripes: newStripes,
          promoted_by,
          notes: notes || `Stripe promotion to ${newStripes} stripes`,
          classes_attended_at_promotion: member.total_classes_attended || 0,
          days_at_previous_belt: daysAtPreviousBelt,
          is_current: true,
        });

      if (historyError) throw historyError;

      return NextResponse.json({
        success: true,
        message: `Member promoted to ${newStripes} stripes`,
      });
    }

    // Belt promotion validation
    if (!new_belt_id && !new_belt_name) {
      return NextResponse.json(
        { error: 'New belt ID or name is required for belt promotion' },
        { status: 400 }
      );
    }

    // Get new belt info
    let newBelt;
    if (new_belt_id) {
      const { data, error } = await supabase
        .from('belt_ranks')
        .select('*')
        .eq('id', new_belt_id)
        .single();
      if (error) throw error;
      newBelt = data;
    } else if (new_belt_name) {
      const { data, error } = await supabase
        .from('belt_ranks')
        .select('*')
        .eq('name', new_belt_name)
        .single();
      if (error) throw error;
      newBelt = data;
    }

    if (!newBelt) {
      return NextResponse.json({ error: 'New belt not found' }, { status: 404 });
    }

    // Validate promotion is legal
    if (member.current_belt) {
      const validation = isValidPromotion(
        member.current_belt.name,
        newBelt.name,
        newBelt.is_kids_belt
      );

      if (!validation.valid) {
        return NextResponse.json(
          { error: validation.error },
          { status: 400 }
        );
      }
    }

    // Create belt promotion history entry
    const { error: historyError } = await supabase
      .from('member_belt_history')
      .insert({
        member_id: memberId,
        belt_rank_id: newBelt.id,
        stripes,
        promoted_by,
        notes,
        classes_attended_at_promotion: member.total_classes_attended || 0,
        days_at_previous_belt: daysAtPreviousBelt,
        is_current: true,
      });

    if (historyError) throw historyError;

    // Create notification for member
    try {
      await supabase.from('notifications').insert({
        member_id: memberId,
        type: 'belt_promotion',
        title: 'Belt Promotion!',
        message: `Congratulations! You've been promoted to ${newBelt.display_name}!`,
        action_url: '/member',
        read: false,
      });
    } catch (notifError) {
      console.error('Failed to create notification:', notifError);
      // Don't fail the promotion if notification fails
    }

    return NextResponse.json({
      success: true,
      message: `Member promoted to ${newBelt.display_name}`,
      new_belt: newBelt,
    });
  } catch (error) {
    console.error('Error promoting member:', error);
    return NextResponse.json(
      { error: 'Failed to promote member' },
      { status: 500 }
    );
  }
}
