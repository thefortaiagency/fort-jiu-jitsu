import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

// Initialize Supabase client with service role key for admin access
const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!,
  {
    auth: {
      autoRefreshToken: false,
      persistSession: false,
    },
  }
);

/**
 * GET /api/onboarding?memberId=xxx
 * Fetch member's onboarding progress
 */
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const memberId = searchParams.get('memberId');

    if (!memberId) {
      return NextResponse.json(
        { error: 'Member ID is required' },
        { status: 400 }
      );
    }

    // Fetch member with onboarding data
    const { data: member, error } = await supabaseAdmin
      .from('members')
      .select('id, first_name, last_name, email, onboarding_checklist, onboarding_completed_at, first_class_date, created_at')
      .eq('id', memberId)
      .single();

    if (error) {
      console.error('Error fetching member:', error);
      return NextResponse.json(
        { error: 'Member not found' },
        { status: 404 }
      );
    }

    // Parse onboarding checklist (JSONB field)
    const checklist = member.onboarding_checklist || {};

    return NextResponse.json({
      success: true,
      member: {
        id: member.id,
        firstName: member.first_name,
        lastName: member.last_name,
        email: member.email,
        firstClassDate: member.first_class_date,
        onboardingCompletedAt: member.onboarding_completed_at,
        memberSince: member.created_at,
        checklist,
      },
    });
  } catch (error) {
    console.error('Onboarding GET error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

/**
 * PUT /api/onboarding
 * Update onboarding checklist item
 * Body: { memberId, itemId, completed }
 */
export async function PUT(request: NextRequest) {
  try {
    const body = await request.json();
    const { memberId, itemId, completed } = body;

    if (!memberId || !itemId || typeof completed !== 'boolean') {
      return NextResponse.json(
        { error: 'memberId, itemId, and completed (boolean) are required' },
        { status: 400 }
      );
    }

    // Fetch current checklist
    const { data: member, error: fetchError } = await supabaseAdmin
      .from('members')
      .select('onboarding_checklist, onboarding_completed_at')
      .eq('id', memberId)
      .single();

    if (fetchError) {
      console.error('Error fetching member:', fetchError);
      return NextResponse.json(
        { error: 'Member not found' },
        { status: 404 }
      );
    }

    // Update checklist item
    const currentChecklist = member.onboarding_checklist || {};
    const updatedChecklist = {
      ...currentChecklist,
      [itemId]: completed,
    };

    // Check if all items are complete
    const defaultItems = [
      'profile',
      'first-class-guide',
      'watch-welcome',
      'schedule-class',
      'etiquette',
    ];
    const allComplete = defaultItems.every((item) => updatedChecklist[item] === true);

    // Update database
    const updateData: any = {
      onboarding_checklist: updatedChecklist,
    };

    // If all complete and not already marked, set completion timestamp
    if (allComplete && !member.onboarding_completed_at) {
      updateData.onboarding_completed_at = new Date().toISOString();
    }

    const { error: updateError } = await supabaseAdmin
      .from('members')
      .update(updateData)
      .eq('id', memberId);

    if (updateError) {
      console.error('Error updating checklist:', updateError);
      return NextResponse.json(
        { error: 'Failed to update checklist' },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      checklist: updatedChecklist,
      allComplete,
    });
  } catch (error) {
    console.error('Onboarding PUT error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

/**
 * POST /api/onboarding
 * Schedule first class date
 * Body: { memberId, firstClassDate }
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { memberId, firstClassDate } = body;

    if (!memberId || !firstClassDate) {
      return NextResponse.json(
        { error: 'memberId and firstClassDate are required' },
        { status: 400 }
      );
    }

    // Validate date format
    const classDate = new Date(firstClassDate);
    if (isNaN(classDate.getTime())) {
      return NextResponse.json(
        { error: 'Invalid date format' },
        { status: 400 }
      );
    }

    // Update member's first class date
    const { error } = await supabaseAdmin
      .from('members')
      .update({ first_class_date: classDate.toISOString() })
      .eq('id', memberId);

    if (error) {
      console.error('Error updating first class date:', error);
      return NextResponse.json(
        { error: 'Failed to update first class date' },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      firstClassDate: classDate.toISOString(),
    });
  } catch (error) {
    console.error('Onboarding POST error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
