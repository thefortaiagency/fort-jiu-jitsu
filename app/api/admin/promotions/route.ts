// API Route: /api/admin/promotions
// GET: List members eligible for promotion
// POST: Batch promote multiple members

import { NextRequest, NextResponse } from 'next/server';
import { createServerSupabaseClient } from '@/lib/supabase';

export async function GET(request: NextRequest) {
  const supabase = createServerSupabaseClient();
  const { searchParams } = new URL(request.url);

  const program = searchParams.get('program'); // Filter by program
  const beltName = searchParams.get('belt'); // Filter by current belt
  const minDays = parseInt(searchParams.get('min_days') || '180');
  const minClasses = parseInt(searchParams.get('min_classes') || '50');

  try {
    // Get all active members with their belt info
    let query = supabase
      .from('members')
      .select(
        `
        *,
        current_belt:belt_ranks(*),
        belt_history:member_belt_history!member_id(
          *,
          belt_rank:belt_ranks(*)
        )
      `
      )
      .eq('status', 'active')
      .in('program', ['kids-bjj', 'adult-bjj', 'beginners']);

    if (program) {
      query = query.eq('program', program);
    }

    const { data: members, error } = await query;

    if (error) throw error;

    // Calculate eligibility for each member
    const membersWithEligibility = members.map((member) => {
      // Get current belt history
      const currentHistory = member.belt_history?.find(
        (h: any) => h.is_current
      );

      let daysAtBelt = 0;
      let classesAtBelt = 0;

      if (member.belt_updated_at) {
        const updated = new Date(member.belt_updated_at);
        const now = new Date();
        daysAtBelt = Math.floor(
          (now.getTime() - updated.getTime()) / (1000 * 60 * 60 * 24)
        );
      }

      if (currentHistory) {
        classesAtBelt =
          (member.total_classes_attended || 0) -
          currentHistory.classes_attended_at_promotion;
      }

      const isEligible =
        daysAtBelt >= minDays && classesAtBelt >= minClasses;

      let recommendation = '';
      if (daysAtBelt < minDays) {
        recommendation = `Need ${minDays - daysAtBelt} more days`;
      } else if (classesAtBelt < minClasses) {
        recommendation = `Need ${minClasses - classesAtBelt} more classes`;
      } else if (member.current_stripes >= 4) {
        recommendation = 'Ready for belt promotion';
      } else {
        recommendation = 'Ready for stripe promotion';
      }

      return {
        ...member,
        eligibility: {
          is_eligible: isEligible,
          days_at_belt: daysAtBelt,
          classes_at_belt: classesAtBelt,
          recommendation,
        },
      };
    });

    // Filter by belt if specified
    let filteredMembers = membersWithEligibility;
    if (beltName) {
      filteredMembers = membersWithEligibility.filter(
        (m) => m.current_belt?.name === beltName
      );
    }

    // Sort by eligibility (eligible first), then by days at belt
    filteredMembers.sort((a, b) => {
      if (a.eligibility.is_eligible !== b.eligibility.is_eligible) {
        return a.eligibility.is_eligible ? -1 : 1;
      }
      return b.eligibility.days_at_belt - a.eligibility.days_at_belt;
    });

    // Get statistics
    const stats = {
      total_members: filteredMembers.length,
      eligible_count: filteredMembers.filter((m) => m.eligibility.is_eligible)
        .length,
      by_belt: {} as Record<string, number>,
    };

    filteredMembers.forEach((m) => {
      const beltName = m.current_belt?.display_name || 'No Belt';
      stats.by_belt[beltName] = (stats.by_belt[beltName] || 0) + 1;
    });

    return NextResponse.json({
      members: filteredMembers,
      stats,
      filters: {
        program,
        belt: beltName,
        min_days: minDays,
        min_classes: minClasses,
      },
    });
  } catch (error) {
    console.error('Error fetching promotion candidates:', error);
    return NextResponse.json(
      { error: 'Failed to fetch promotion candidates' },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  const supabase = createServerSupabaseClient();

  try {
    const body = await request.json();
    const { promotions, promoted_by } = body;

    // Validate input
    if (!Array.isArray(promotions) || promotions.length === 0) {
      return NextResponse.json(
        { error: 'Promotions array is required' },
        { status: 400 }
      );
    }

    if (!promoted_by) {
      return NextResponse.json(
        { error: 'Promoted by (instructor ID) is required' },
        { status: 400 }
      );
    }

    // Process each promotion
    const results = [];
    const errors = [];

    for (const promotion of promotions) {
      const { member_id, new_belt_id, stripes, notes, is_stripe_promotion } =
        promotion;

      try {
        // Get member info
        const { data: member, error: memberError } = await supabase
          .from('members')
          .select('*, current_belt:belt_ranks(*)')
          .eq('id', member_id)
          .single();

        if (memberError) throw memberError;

        // Get current history for days calculation
        const { data: currentHistory } = await supabase
          .from('member_belt_history')
          .select('*')
          .eq('member_id', member_id)
          .eq('is_current', true)
          .single();

        let daysAtPreviousBelt = 0;
        if (currentHistory?.promoted_at) {
          const promoted = new Date(currentHistory.promoted_at);
          const now = new Date();
          daysAtPreviousBelt = Math.floor(
            (now.getTime() - promoted.getTime()) / (1000 * 60 * 60 * 24)
          );
        }

        if (is_stripe_promotion) {
          // Stripe promotion
          const newStripes = Math.min(4, (member.current_stripes || 0) + 1);

          await supabase.from('member_belt_history').insert({
            member_id,
            belt_rank_id: member.current_belt_id,
            stripes: newStripes,
            promoted_by,
            notes: notes || `Stripe promotion to ${newStripes} stripes`,
            classes_attended_at_promotion: member.total_classes_attended || 0,
            days_at_previous_belt: daysAtPreviousBelt,
            is_current: true,
          });

          results.push({
            member_id,
            success: true,
            type: 'stripe',
            stripes: newStripes,
          });
        } else {
          // Belt promotion
          const { data: newBelt, error: beltError } = await supabase
            .from('belt_ranks')
            .select('*')
            .eq('id', new_belt_id)
            .single();

          if (beltError) throw beltError;

          await supabase.from('member_belt_history').insert({
            member_id,
            belt_rank_id: new_belt_id,
            stripes: stripes || 0,
            promoted_by,
            notes,
            classes_attended_at_promotion: member.total_classes_attended || 0,
            days_at_previous_belt: daysAtPreviousBelt,
            is_current: true,
          });

          // Create notification
          try {
            await supabase.from('notifications').insert({
              member_id,
              type: 'belt_promotion',
              title: 'Belt Promotion!',
              message: `Congratulations! You've been promoted to ${newBelt.display_name}!`,
              action_url: '/member',
              read: false,
            });
          } catch (notifError) {
            console.error('Failed to create notification:', notifError);
          }

          results.push({
            member_id,
            success: true,
            type: 'belt',
            belt: newBelt.display_name,
          });
        }
      } catch (error) {
        console.error(`Error promoting member ${member_id}:`, error);
        errors.push({
          member_id,
          error: error instanceof Error ? error.message : 'Unknown error',
        });
      }
    }

    return NextResponse.json({
      success: true,
      promoted: results.length,
      failed: errors.length,
      results,
      errors,
    });
  } catch (error) {
    console.error('Error batch promoting members:', error);
    return NextResponse.json(
      { error: 'Failed to process batch promotions' },
      { status: 500 }
    );
  }
}
