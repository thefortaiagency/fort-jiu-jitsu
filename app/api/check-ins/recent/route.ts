import { NextRequest, NextResponse } from 'next/server';
import { createServerSupabaseClient } from '@/lib/supabase';

// GET - Recent check-ins for today
export async function GET(request: NextRequest) {
  try {
    const supabase = createServerSupabaseClient();
    const { searchParams } = new URL(request.url);
    const limit = parseInt(searchParams.get('limit') || '10');

    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);

    const { data, error } = await supabase
      .from('check_ins')
      .select(`
        id,
        checked_in_at,
        check_in_method,
        member:members(id, first_name, last_name, program)
      `)
      .gte('checked_in_at', today.toISOString())
      .lt('checked_in_at', tomorrow.toISOString())
      .order('checked_in_at', { ascending: false })
      .limit(limit);

    if (error) {
      console.error('Error fetching recent check-ins:', error);
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    // Flatten member data for easier consumption
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const checkIns = data?.map((checkIn: any) => {
      const member = checkIn.member;
      return {
        id: checkIn.id,
        checked_in_at: checkIn.checked_in_at,
        check_in_method: checkIn.check_in_method,
        member_id: member?.id,
        first_name: member?.first_name,
        last_name: member?.last_name,
        program: member?.program,
      };
    }) || [];

    return NextResponse.json({ checkIns });
  } catch (error) {
    console.error('Recent check-ins error:', error);
    return NextResponse.json(
      { error: 'Failed to fetch recent check-ins' },
      { status: 500 }
    );
  }
}
