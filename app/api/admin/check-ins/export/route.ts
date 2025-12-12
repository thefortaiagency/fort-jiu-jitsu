import { NextRequest, NextResponse } from 'next/server';
import { createServerSupabaseClient } from '@/lib/supabase';

// GET - Export check-ins as CSV
export async function GET(request: NextRequest) {
  try {
    const supabase = createServerSupabaseClient();
    const { searchParams } = new URL(request.url);

    const range = searchParams.get('range') || 'last-30';
    const startDateParam = searchParams.get('startDate');
    const endDateParam = searchParams.get('endDate');

    let startDate: Date;
    let endDate: Date = new Date();
    endDate.setHours(23, 59, 59, 999);

    // Determine date range based on parameter
    if (startDateParam && endDateParam) {
      startDate = new Date(startDateParam);
      endDate = new Date(endDateParam);
      endDate.setHours(23, 59, 59, 999);
    } else {
      switch (range) {
        case 'last-7':
          startDate = new Date();
          startDate.setDate(startDate.getDate() - 7);
          break;
        case 'last-30':
          startDate = new Date();
          startDate.setDate(startDate.getDate() - 30);
          break;
        case 'all':
          startDate = new Date('2000-01-01');
          break;
        default:
          startDate = new Date();
          startDate.setDate(startDate.getDate() - 30);
      }
      startDate.setHours(0, 0, 0, 0);
    }

    // Fetch check-ins with member details
    const { data: checkIns, error } = await supabase
      .from('check_ins')
      .select(`
        id,
        checked_in_at,
        class_id,
        member:members(
          id,
          first_name,
          last_name,
          email,
          program
        )
      `)
      .gte('checked_in_at', startDate.toISOString())
      .lte('checked_in_at', endDate.toISOString())
      .order('checked_in_at', { ascending: false });

    if (error) {
      console.error('Error fetching check-ins for export:', error);
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    // Generate CSV content
    const headers = ['Date', 'Time', 'Member Name', 'Email', 'Class Type'];
    const rows = (checkIns || []).map((checkIn: any) => {
      const date = new Date(checkIn.checked_in_at);

      // Format date as MM/DD/YYYY
      const formattedDate = date.toLocaleDateString('en-US', {
        month: '2-digit',
        day: '2-digit',
        year: 'numeric'
      });

      // Format time as HH:MM AM/PM
      const formattedTime = date.toLocaleTimeString('en-US', {
        hour: 'numeric',
        minute: '2-digit',
        hour12: true
      });

      const memberName = checkIn.member
        ? `${checkIn.member.first_name} ${checkIn.member.last_name}`
        : 'Unknown';

      const email = checkIn.member?.email || '';

      // Format program name (e.g., 'jiu-jitsu' -> 'Jiu Jitsu')
      const classType = checkIn.member?.program
        ? checkIn.member.program
            .split('-')
            .map((word: string) => word.charAt(0).toUpperCase() + word.slice(1))
            .join(' ')
        : '';

      return [formattedDate, formattedTime, memberName, email, classType];
    });

    // Build CSV content with proper escaping
    const csvContent = [
      headers.join(','),
      ...rows.map((row) =>
        row.map((cell) => {
          // Escape quotes and wrap in quotes if contains comma, quote, or newline
          const cellStr = String(cell);
          if (cellStr.includes(',') || cellStr.includes('"') || cellStr.includes('\n')) {
            return `"${cellStr.replace(/"/g, '""')}"`;
          }
          return cellStr;
        }).join(',')
      ),
    ].join('\n');

    // Create filename with date range
    const filename = `check-ins-${startDate.toISOString().split('T')[0]}-to-${endDate.toISOString().split('T')[0]}.csv`;

    // Return CSV with proper headers
    return new NextResponse(csvContent, {
      status: 200,
      headers: {
        'Content-Type': 'text/csv; charset=utf-8',
        'Content-Disposition': `attachment; filename="${filename}"`,
      },
    });
  } catch (error) {
    console.error('Check-ins export error:', error);
    return NextResponse.json(
      { error: 'Failed to export check-ins' },
      { status: 500 }
    );
  }
}
