import { NextResponse } from 'next/server';
import { createServerSupabaseClient } from '@/lib/supabase';

// GET - Fetch members with one-click login enabled
export async function GET() {
  try {
    const supabase = createServerSupabaseClient();

    const { data: members, error } = await supabase
      .from('members')
      .select('id, first_name, last_name, email, program')
      .eq('one_click_login_enabled', true)
      .eq('status', 'active')
      .order('first_name');

    if (error) {
      // Column might not exist yet, return empty array
      if (error.message.includes('one_click_login_enabled')) {
        return NextResponse.json({ members: [] });
      }
      throw error;
    }

    return NextResponse.json({ members: members || [] });
  } catch (error) {
    console.error('Quick login fetch error:', error);
    return NextResponse.json({ members: [] });
  }
}
