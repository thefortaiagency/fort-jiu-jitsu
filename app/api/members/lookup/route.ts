import { NextRequest, NextResponse } from 'next/server';
import { createServerSupabaseClient } from '@/lib/supabase';

// GET - Lookup member by barcode/member code
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
    // 1. member_code field (if we add one)
    // 2. Last 4 digits of phone number
    // 3. Member ID (UUID)
    // 4. Email prefix

    let member = null;

    // Try by member_code first
    const { data: byCode } = await supabase
      .from('members')
      .select('*')
      .eq('member_code', code)
      .eq('status', 'active')
      .single();

    if (byCode) {
      member = byCode;
    }

    // Try by UUID if it looks like one
    if (!member && code.length === 36 && code.includes('-')) {
      const { data: byId } = await supabase
        .from('members')
        .select('*')
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
        .select('*')
        .like('phone', `%${code}`)
        .eq('status', 'active')
        .limit(1)
        .single();

      if (byPhone) {
        member = byPhone;
      }
    }

    // Try by numeric member number (if stored as part of a code)
    if (!member && /^\d+$/.test(code)) {
      // Check if this matches a short ID or sequential number
      const { data: byNumeric } = await supabase
        .from('members')
        .select('*')
        .eq('short_id', parseInt(code))
        .eq('status', 'active')
        .single();

      if (byNumeric) {
        member = byNumeric;
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
