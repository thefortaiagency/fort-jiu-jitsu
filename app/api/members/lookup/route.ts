import { NextRequest, NextResponse } from 'next/server';
import { createServerSupabaseClient } from '@/lib/supabase';

// GET - Lookup member by barcode/code
export async function GET(request: NextRequest) {
  try {
    const supabase = createServerSupabaseClient();
    const { searchParams } = new URL(request.url);
    const code = searchParams.get('code');

    if (!code) {
      return NextResponse.json(
        { error: 'Code is required' },
        { status: 400 }
      );
    }

    // Try to find member by:
    // 1. UUID (full member ID)
    // 2. Last 4 digits of phone number
    // 3. Email address
    // 4. Name search (first or last name)

    let member = null;

    // Try by UUID if it looks like one
    if (code.length === 36 && code.includes('-')) {
      const { data: byId } = await supabase
        .from('members')
        .select('id, first_name, last_name, email, phone, program, status')
        .eq('id', code)
        .eq('status', 'active')
        .single();

      if (byId) {
        member = byId;
      }
    }

    // Try by last 4 digits of phone (common for gym check-ins)
    if (!member && /^\d{4}$/.test(code)) {
      const { data: byPhone } = await supabase
        .from('members')
        .select('id, first_name, last_name, email, phone, program, status')
        .like('phone', `%${code}`)
        .eq('status', 'active')
        .limit(1)
        .single();

      if (byPhone) {
        member = byPhone;
      }
    }

    // Try by email
    if (!member && code.includes('@')) {
      const { data: byEmail } = await supabase
        .from('members')
        .select('id, first_name, last_name, email, phone, program, status')
        .eq('email', code.toLowerCase())
        .eq('status', 'active')
        .single();

      if (byEmail) {
        member = byEmail;
      }
    }

    // Try by name (case-insensitive search on first or last name)
    if (!member && code.length >= 2) {
      const { data: byName } = await supabase
        .from('members')
        .select('id, first_name, last_name, email, phone, program, status')
        .or(`first_name.ilike.%${code}%,last_name.ilike.%${code}%`)
        .eq('status', 'active')
        .limit(1)
        .single();

      if (byName) {
        member = byName;
      }
    }

    if (!member) {
      return NextResponse.json(
        { error: 'Member not found', member: null },
        { status: 404 }
      );
    }

    return NextResponse.json({ member });
  } catch (error) {
    console.error('Member lookup error:', error);
    return NextResponse.json(
      { error: 'Lookup failed' },
      { status: 500 }
    );
  }
}
