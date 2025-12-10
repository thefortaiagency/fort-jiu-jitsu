// API Route: /api/belts
// GET: List all belt ranks
// GET with member_id query param: Get member's belt history

import { NextRequest, NextResponse } from 'next/server';
import { createServerSupabaseClient } from '@/lib/supabase';

export async function GET(request: NextRequest) {
  const supabase = createServerSupabaseClient();
  const { searchParams } = new URL(request.url);
  const memberId = searchParams.get('member_id');

  try {
    // If member_id provided, return their belt history
    if (memberId) {
      const { data: history, error: historyError } = await supabase
        .from('member_belt_history')
        .select(
          `
          *,
          belt_rank:belt_ranks(*)
        `
        )
        .eq('member_id', memberId)
        .order('promoted_at', { ascending: false });

      if (historyError) throw historyError;

      // Get member's current belt info
      const { data: member, error: memberError } = await supabase
        .from('members')
        .select(
          `
          id,
          first_name,
          last_name,
          current_belt_id,
          current_stripes,
          belt_updated_at,
          total_classes_attended,
          current_belt:belt_ranks(*)
        `
        )
        .eq('id', memberId)
        .single();

      if (memberError) throw memberError;

      return NextResponse.json({
        member,
        history,
      });
    }

    // Otherwise, return all belt ranks
    const { data: belts, error } = await supabase
      .from('belt_ranks')
      .select('*')
      .order('is_kids_belt', { ascending: true })
      .order('sort_order', { ascending: true });

    if (error) throw error;

    // Group belts by type
    const adultBelts = belts.filter((b) => !b.is_kids_belt);
    const kidsBelts = belts.filter((b) => b.is_kids_belt);

    return NextResponse.json({
      adult_belts: adultBelts,
      kids_belts: kidsBelts,
      all_belts: belts,
    });
  } catch (error) {
    console.error('Error fetching belts:', error);
    return NextResponse.json(
      { error: 'Failed to fetch belt data' },
      { status: 500 }
    );
  }
}
