import { NextRequest, NextResponse } from 'next/server';
import { createServerSupabaseClient } from '@/lib/supabase';

// PUT - Assign QR code to member
export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const supabase = createServerSupabaseClient();
    const body = await request.json();
    const { qr_code } = body;

    if (!qr_code) {
      return NextResponse.json(
        { error: 'QR code is required' },
        { status: 400 }
      );
    }

    // Check if QR code is already assigned to another member
    const { data: existingMember } = await supabase
      .from('members')
      .select('id, first_name, last_name')
      .eq('qr_code', qr_code)
      .neq('id', id)
      .single();

    if (existingMember) {
      return NextResponse.json(
        {
          error: `QR code already assigned to ${existingMember.first_name} ${existingMember.last_name}`
        },
        { status: 409 }
      );
    }

    // Assign QR code to member
    const { error } = await supabase
      .from('members')
      .update({
        qr_code,
        updated_at: new Date().toISOString()
      })
      .eq('id', id);

    if (error) {
      console.error('Error assigning QR code:', error);
      return NextResponse.json(
        { error: error.message },
        { status: 500 }
      );
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('QR code assignment error:', error);
    return NextResponse.json(
      { error: 'Failed to assign QR code' },
      { status: 500 }
    );
  }
}

// DELETE - Remove QR code from member
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const supabase = createServerSupabaseClient();

    const { error } = await supabase
      .from('members')
      .update({
        qr_code: null,
        updated_at: new Date().toISOString()
      })
      .eq('id', id);

    if (error) {
      console.error('Error removing QR code:', error);
      return NextResponse.json(
        { error: error.message },
        { status: 500 }
      );
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('QR code removal error:', error);
    return NextResponse.json(
      { error: 'Failed to remove QR code' },
      { status: 500 }
    );
  }
}
