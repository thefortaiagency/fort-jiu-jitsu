import { NextRequest, NextResponse } from 'next/server';
import { createServerSupabaseClient } from '@/lib/supabase';

// GET - Debug endpoint to test waiver queries
export async function GET(request: NextRequest) {
  try {
    const supabase = createServerSupabaseClient();

    // Test members query (same as waivers page)
    const { data: membersData, error: membersError } = await supabase
      .from('members')
      .select(`
        id,
        first_name,
        last_name,
        email,
        status,
        birth_date
      `)
      .order('last_name', { ascending: true });

    // Test waivers query (same as waivers page)
    const { data: waiversData, error: waiversError } = await supabase
      .from('waivers')
      .select('*')
      .order('signed_at', { ascending: false });

    return NextResponse.json({
      membersCount: membersData?.length || 0,
      members: membersData,
      membersError: membersError?.message || null,
      waiversCount: waiversData?.length || 0,
      waivers: waiversData,
      waiversError: waiversError?.message || null,
    });
  } catch (error) {
    console.error('Debug waivers error:', error);
    return NextResponse.json(
      { error: 'Failed to fetch debug data', details: String(error) },
      { status: 500 }
    );
  }
}
