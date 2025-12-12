// API Route: /api/admin/seed-belts
// POST: Seed belt_ranks table with all BJJ belts (adult + kids)

import { NextResponse } from 'next/server';
import { createServerSupabaseClient } from '@/lib/supabase';

export async function POST() {
  const supabase = createServerSupabaseClient();

  try {
    // Define adult belts
    const adultBelts = [
      {
        name: 'white',
        display_name: 'White Belt',
        color_hex: '#FFFFFF',
        gradient_start: '#F8F9FA',
        gradient_end: '#FFFFFF',
        sort_order: 1,
        is_kids_belt: false,
        min_age: 16,
        typical_time_months: 12,
        max_stripes: 4,
      },
      {
        name: 'blue',
        display_name: 'Blue Belt',
        color_hex: '#0066CC',
        gradient_start: '#0047AB',
        gradient_end: '#1E90FF',
        sort_order: 2,
        is_kids_belt: false,
        min_age: 16,
        typical_time_months: 24,
        max_stripes: 4,
      },
      {
        name: 'purple',
        display_name: 'Purple Belt',
        color_hex: '#6B21A8',
        gradient_start: '#581C87',
        gradient_end: '#7C3AED',
        sort_order: 3,
        is_kids_belt: false,
        min_age: 16,
        typical_time_months: 24,
        max_stripes: 4,
      },
      {
        name: 'brown',
        display_name: 'Brown Belt',
        color_hex: '#8B4513',
        gradient_start: '#654321',
        gradient_end: '#A0522D',
        sort_order: 4,
        is_kids_belt: false,
        min_age: 16,
        typical_time_months: 18,
        max_stripes: 4,
      },
      {
        name: 'black',
        display_name: 'Black Belt',
        color_hex: '#000000',
        gradient_start: '#000000',
        gradient_end: '#1F1F1F',
        sort_order: 5,
        is_kids_belt: false,
        min_age: 16,
        typical_time_months: 0,
        max_stripes: 0,
      },
    ];

    // Define kids belts
    const kidsBelts = [
      {
        name: 'kids_white',
        display_name: 'White Belt',
        color_hex: '#FFFFFF',
        gradient_start: '#F8F9FA',
        gradient_end: '#FFFFFF',
        sort_order: 1,
        is_kids_belt: true,
        min_age: 4,
        max_age: 15,
        typical_time_months: 6,
        max_stripes: 4,
      },
      {
        name: 'kids_grey_white',
        display_name: 'Grey-White Belt',
        color_hex: '#D3D3D3',
        gradient_start: '#C0C0C0',
        gradient_end: '#E8E8E8',
        sort_order: 2,
        is_kids_belt: true,
        min_age: 4,
        max_age: 15,
        typical_time_months: 6,
        max_stripes: 4,
      },
      {
        name: 'kids_grey',
        display_name: 'Grey Belt',
        color_hex: '#808080',
        gradient_start: '#696969',
        gradient_end: '#A9A9A9',
        sort_order: 3,
        is_kids_belt: true,
        min_age: 4,
        max_age: 15,
        typical_time_months: 6,
        max_stripes: 4,
      },
      {
        name: 'kids_grey_black',
        display_name: 'Grey-Black Belt',
        color_hex: '#5C5C5C',
        gradient_start: '#404040',
        gradient_end: '#707070',
        sort_order: 4,
        is_kids_belt: true,
        min_age: 4,
        max_age: 15,
        typical_time_months: 6,
        max_stripes: 4,
      },
      {
        name: 'kids_yellow_white',
        display_name: 'Yellow-White Belt',
        color_hex: '#FFEB99',
        gradient_start: '#FFE66D',
        gradient_end: '#FFF5CC',
        sort_order: 5,
        is_kids_belt: true,
        min_age: 7,
        max_age: 15,
        typical_time_months: 6,
        max_stripes: 4,
      },
      {
        name: 'kids_yellow',
        display_name: 'Yellow Belt',
        color_hex: '#FFD700',
        gradient_start: '#FFC107',
        gradient_end: '#FFE135',
        sort_order: 6,
        is_kids_belt: true,
        min_age: 7,
        max_age: 15,
        typical_time_months: 6,
        max_stripes: 4,
      },
      {
        name: 'kids_yellow_black',
        display_name: 'Yellow-Black Belt',
        color_hex: '#E6C200',
        gradient_start: '#CCA000',
        gradient_end: '#FFDB58',
        sort_order: 7,
        is_kids_belt: true,
        min_age: 7,
        max_age: 15,
        typical_time_months: 6,
        max_stripes: 4,
      },
      {
        name: 'kids_orange_white',
        display_name: 'Orange-White Belt',
        color_hex: '#FFB366',
        gradient_start: '#FF9A4D',
        gradient_end: '#FFCC99',
        sort_order: 8,
        is_kids_belt: true,
        min_age: 10,
        max_age: 15,
        typical_time_months: 6,
        max_stripes: 4,
      },
      {
        name: 'kids_orange',
        display_name: 'Orange Belt',
        color_hex: '#FF8C00',
        gradient_start: '#FF7F00',
        gradient_end: '#FFA500',
        sort_order: 9,
        is_kids_belt: true,
        min_age: 10,
        max_age: 15,
        typical_time_months: 6,
        max_stripes: 4,
      },
      {
        name: 'kids_orange_black',
        display_name: 'Orange-Black Belt',
        color_hex: '#E67E00',
        gradient_start: '#CC6F00',
        gradient_end: '#FF9500',
        sort_order: 10,
        is_kids_belt: true,
        min_age: 10,
        max_age: 15,
        typical_time_months: 6,
        max_stripes: 4,
      },
      {
        name: 'kids_green_white',
        display_name: 'Green-White Belt',
        color_hex: '#90EE90',
        gradient_start: '#7CCD7C',
        gradient_end: '#B0F0B0',
        sort_order: 11,
        is_kids_belt: true,
        min_age: 13,
        max_age: 15,
        typical_time_months: 6,
        max_stripes: 4,
      },
      {
        name: 'kids_green',
        display_name: 'Green Belt',
        color_hex: '#228B22',
        gradient_start: '#32CD32',
        gradient_end: '#3CB371',
        sort_order: 12,
        is_kids_belt: true,
        min_age: 13,
        max_age: 15,
        typical_time_months: 6,
        max_stripes: 4,
      },
      {
        name: 'kids_green_black',
        display_name: 'Green-Black Belt',
        color_hex: '#1B6B1B',
        gradient_start: '#0F5A0F',
        gradient_end: '#2E8B2E',
        sort_order: 13,
        is_kids_belt: true,
        min_age: 13,
        max_age: 15,
        typical_time_months: 6,
        max_stripes: 4,
      },
    ];

    const allBelts = [...adultBelts, ...kidsBelts];

    // Use upsert to insert or update belts
    const { data, error } = await supabase
      .from('belt_ranks')
      .upsert(allBelts, { onConflict: 'name' })
      .select();

    if (error) throw error;

    return NextResponse.json({
      success: true,
      message: `Successfully seeded ${data?.length || 0} belt ranks`,
      adult_belts: adultBelts.length,
      kids_belts: kidsBelts.length,
      belts: data,
    });
  } catch (error) {
    console.error('Error seeding belts:', error);
    return NextResponse.json(
      { error: 'Failed to seed belt ranks', details: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    );
  }
}

// GET: Check current belts in database
export async function GET() {
  const supabase = createServerSupabaseClient();

  try {
    const { data: belts, error } = await supabase
      .from('belt_ranks')
      .select('*')
      .order('is_kids_belt', { ascending: true })
      .order('sort_order', { ascending: true });

    if (error) throw error;

    const adultBelts = belts?.filter((b) => !b.is_kids_belt) || [];
    const kidsBelts = belts?.filter((b) => b.is_kids_belt) || [];

    return NextResponse.json({
      total: belts?.length || 0,
      adult_belts: adultBelts,
      kids_belts: kidsBelts,
    });
  } catch (error) {
    console.error('Error fetching belts:', error);
    return NextResponse.json(
      { error: 'Failed to fetch belt ranks' },
      { status: 500 }
    );
  }
}
