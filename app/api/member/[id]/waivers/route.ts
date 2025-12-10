import { NextRequest, NextResponse } from 'next/server';
import { createServerSupabaseClient } from '@/lib/supabase';

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id: memberId } = await params;

    if (!memberId) {
      return NextResponse.json({ error: 'Member ID is required' }, { status: 400 });
    }

    const supabase = createServerSupabaseClient();

    // Verify member exists
    const { data: member, error: memberError } = await supabase
      .from('members')
      .select('id, first_name, last_name')
      .eq('id', memberId)
      .single();

    if (memberError || !member) {
      return NextResponse.json({ error: 'Member not found' }, { status: 404 });
    }

    // Get all waivers for this member
    const { data: waivers, error: waiversError } = await supabase
      .from('waivers')
      .select('id, member_id, waiver_type, signed_at, signer_name')
      .eq('member_id', memberId)
      .order('signed_at', { ascending: false });

    if (waiversError) {
      console.error('Waivers fetch error:', waiversError);
      return NextResponse.json(
        { error: 'Failed to fetch waivers' },
        { status: 500 }
      );
    }

    // Calculate validity (waivers are valid for 1 year)
    const oneYearAgo = new Date();
    oneYearAgo.setFullYear(oneYearAgo.getFullYear() - 1);

    const waiversData = (waivers || []).map((waiver) => {
      const signedDate = new Date(waiver.signed_at);
      const expiresDate = new Date(signedDate);
      expiresDate.setFullYear(expiresDate.getFullYear() + 1);
      const isValid = signedDate > oneYearAgo;

      return {
        id: waiver.id,
        waiverType: waiver.waiver_type,
        signedAt: waiver.signed_at,
        signerName: waiver.signer_name,
        isValid,
        expiresAt: expiresDate.toISOString(),
      };
    });

    // Find the most recent valid waiver
    const validWaiver = waiversData.find((w) => w.isValid);

    return NextResponse.json({
      waivers: waiversData,
      hasValidWaiver: !!validWaiver,
      validWaiver: validWaiver || null,
      totalWaivers: waiversData.length,
    });
  } catch (error) {
    console.error('Get waivers error:', error);
    return NextResponse.json(
      { error: 'Failed to fetch waivers' },
      { status: 500 }
    );
  }
}
