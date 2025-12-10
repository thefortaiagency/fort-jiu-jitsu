import { NextRequest, NextResponse } from 'next/server';
import { createServerSupabaseClient } from '@/lib/supabase-auth';

// GET - List all active members
export async function GET(request: NextRequest) {
  try {
    const supabase = createServerSupabaseClient();
    const { searchParams } = new URL(request.url);
    const status = searchParams.get('status') || 'active';
    const program = searchParams.get('program');

    let query = supabase
      .from('members')
      .select('id, first_name, last_name, email, phone, program, status, member_code, short_id')
      .order('first_name', { ascending: true });

    if (status !== 'all') {
      query = query.eq('status', status);
    }

    if (program) {
      query = query.eq('program', program);
    }

    const { data, error } = await query;

    if (error) {
      console.error('Error fetching members:', error);
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({ members: data });
  } catch (error) {
    console.error('Members GET error:', error);
    return NextResponse.json(
      { error: 'Failed to fetch members' },
      { status: 500 }
    );
  }
}
