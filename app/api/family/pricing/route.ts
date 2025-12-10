import { NextRequest, NextResponse } from 'next/server';
import { calculateFamilyPrice, MemberType } from '@/lib/stripe';

/**
 * POST /api/family/pricing
 * Calculate family pricing based on member types
 *
 * Request body:
 * {
 *   memberCount: number,
 *   memberTypes: ('adult' | 'kid')[]
 * }
 *
 * Response:
 * {
 *   monthlyTotal: number,
 *   breakdown: { type: string, count: number, rate: number }[],
 *   savings: number,
 *   vsIndividual: number,
 *   memberCount: number
 * }
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { memberCount, memberTypes } = body;

    // Validate input
    if (typeof memberCount !== 'number' || memberCount < 0) {
      return NextResponse.json(
        { error: 'Valid member count is required' },
        { status: 400 }
      );
    }

    if (!Array.isArray(memberTypes)) {
      return NextResponse.json(
        { error: 'memberTypes must be an array of "adult" or "kid"' },
        { status: 400 }
      );
    }

    // Validate member types
    const validTypes: MemberType[] = ['adult', 'kid'];
    const invalidTypes = memberTypes.filter((type) => !validTypes.includes(type));
    if (invalidTypes.length > 0) {
      return NextResponse.json(
        { error: `Invalid member types: ${invalidTypes.join(', ')}. Must be "adult" or "kid"` },
        { status: 400 }
      );
    }

    // Ensure memberTypes length matches memberCount
    if (memberTypes.length !== memberCount) {
      return NextResponse.json(
        {
          error: `memberTypes array length (${memberTypes.length}) must match memberCount (${memberCount})`,
        },
        { status: 400 }
      );
    }

    // Calculate pricing
    const pricing = calculateFamilyPrice(memberTypes);

    return NextResponse.json({
      success: true,
      ...pricing,
    });
  } catch (error) {
    console.error('Family pricing calculation error:', error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Failed to calculate pricing' },
      { status: 500 }
    );
  }
}

/**
 * GET /api/family/pricing?kids=2&adults=1
 * Calculate family pricing via query params (alternative to POST)
 */
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const kidsCount = parseInt(searchParams.get('kids') || '0', 10);
    const adultsCount = parseInt(searchParams.get('adults') || '0', 10);

    if (kidsCount < 0 || adultsCount < 0) {
      return NextResponse.json(
        { error: 'Member counts cannot be negative' },
        { status: 400 }
      );
    }

    // Build memberTypes array
    const memberTypes: MemberType[] = [
      ...Array(kidsCount).fill('kid'),
      ...Array(adultsCount).fill('adult'),
    ];

    // Calculate pricing
    const pricing = calculateFamilyPrice(memberTypes);

    return NextResponse.json({
      success: true,
      ...pricing,
    });
  } catch (error) {
    console.error('Family pricing calculation error:', error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Failed to calculate pricing' },
      { status: 500 }
    );
  }
}
