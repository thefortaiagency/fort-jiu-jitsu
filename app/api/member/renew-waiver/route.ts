import { NextRequest, NextResponse } from 'next/server';
import { createServerSupabaseClient } from '@/lib/supabase';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { memberId, signatureData, signerName } = body;

    if (!memberId || !signatureData || !signerName) {
      return NextResponse.json(
        { error: 'Member ID, signature, and signer name are required' },
        { status: 400 }
      );
    }

    const supabase = createServerSupabaseClient();

    // Get member info
    const { data: member, error: memberError } = await supabase
      .from('members')
      .select('id, first_name, last_name, email, birth_date')
      .eq('id', memberId)
      .single();

    if (memberError || !member) {
      return NextResponse.json({ error: 'Member not found' }, { status: 404 });
    }

    // Calculate expiration date (1 year from now)
    const expiresAt = new Date();
    expiresAt.setFullYear(expiresAt.getFullYear() + 1);

    // Create new waiver record
    const { data: waiver, error: waiverError } = await supabase
      .from('waivers')
      .insert({
        member_id: memberId,
        waiver_type: 'standard',
        signer_name: signerName,
        signer_relationship: 'self',
        signature_data: signatureData,
        signed_at: new Date().toISOString(),
        expires_at: expiresAt.toISOString(),
        ip_address: request.headers.get('x-forwarded-for') || request.headers.get('x-real-ip') || 'unknown',
        user_agent: request.headers.get('user-agent') || 'unknown',
      })
      .select()
      .single();

    if (waiverError) {
      console.error('Error creating waiver:', waiverError);
      return NextResponse.json(
        { error: 'Failed to create waiver' },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      waiver: {
        id: waiver.id,
        signedAt: waiver.signed_at,
        expiresAt: waiver.expires_at,
      },
    });
  } catch (error) {
    console.error('Waiver renewal error:', error);
    return NextResponse.json(
      { error: 'Failed to renew waiver' },
      { status: 500 }
    );
  }
}
