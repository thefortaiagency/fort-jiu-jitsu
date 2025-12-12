# CSV Export Feature for Check-Ins

## Overview
The admin check-ins page now includes a robust CSV export feature for attendance reports.

## Features

### 1. **Download CSV Button**
- Located in the admin check-ins page controls section
- Opens a modal to select date range
- Includes a download icon for better UX

### 2. **Date Range Options**
Three predefined options are available:
- **Last 7 Days** - Recent week of attendance
- **Last 30 Days** - Monthly attendance report (default)
- **All Time** - Complete attendance history

### 3. **CSV Format**
Exported CSV files include the following columns:
- **Date** - Check-in date (MM/DD/YYYY format)
- **Time** - Check-in time (HH:MM AM/PM format)
- **Member Name** - Full name (First Last)
- **Email** - Member email address
- **Class Type** - Program name (formatted nicely, e.g., "Jiu Jitsu")

### 4. **File Naming**
Files are automatically named with the date range:
```
check-ins-2025-11-11-to-2025-12-11.csv
```

## Technical Implementation

### API Route
**Path:** `/app/api/admin/check-ins/export/route.ts`

**Query Parameters:**
- `range` - One of: `last-7`, `last-30`, `all` (default: `last-30`)
- `startDate` - Optional custom start date (ISO format)
- `endDate` - Optional custom end date (ISO format)

**Example Usage:**
```typescript
// Last 30 days (default)
GET /api/admin/check-ins/export?range=last-30

// Last 7 days
GET /api/admin/check-ins/export?range=last-7

// All time
GET /api/admin/check-ins/export?range=all

// Custom date range (future enhancement)
GET /api/admin/check-ins/export?startDate=2025-01-01&endDate=2025-12-31
```

**Response:**
- Content-Type: `text/csv; charset=utf-8`
- Content-Disposition: `attachment; filename="check-ins-[dates].csv"`
- Body: CSV formatted data

### UI Component Updates
**File:** `/app/admin/check-ins/CheckInManagement.tsx`

**New State:**
```typescript
const [showExportModal, setShowExportModal] = useState(false);
const [exportRange, setExportRange] = useState<'last-7' | 'last-30' | 'all'>('last-30');
const [isExporting, setIsExporting] = useState(false);
```

**Export Function:**
```typescript
const handleExportCSV = async () => {
  // Fetches CSV from API
  // Downloads file with proper filename
  // Shows loading state
}
```

## Usage

### For Admins
1. Navigate to `/admin/check-ins`
2. Click the "Download CSV" button in the top right
3. Select your desired date range:
   - Last 7 Days
   - Last 30 Days
   - All Time
4. Click "Download CSV"
5. File will automatically download to your browser's default download location

### Data Sorting
- Check-ins are sorted by date/time in descending order (most recent first)
- This matches the display order in the admin table

## CSV Escaping
The export properly handles:
- Commas in data fields
- Quotes in data fields
- Newlines in data fields

All special characters are properly escaped according to CSV RFC 4180 standards.

## Future Enhancements
Potential improvements for the future:
1. Custom date range picker (startDate/endDate parameters are already supported)
2. Additional export formats (Excel, PDF)
3. Scheduled/automated reports via email
4. Filter by program type or member
5. Include additional columns (member status, phone number, etc.)
6. Summary statistics in the export

## Database Query
The export uses a join with the members table to include full member details:

```typescript
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
```

This ensures accurate member information even if member details change after check-in.

## Performance Considerations
- Queries are limited by date range to avoid loading entire database
- "All Time" option loads all records - may be slow for large datasets
- Consider pagination or limits for very large exports (future enhancement)

## Security
- Uses server-side authentication via `createServerSupabaseClient()`
- Inherits admin-only access from the check-ins page authentication
- No query parameters that could expose sensitive data
- Proper content-type and disposition headers prevent XSS

## Testing
To test the feature:
1. Ensure you have check-ins in the database
2. Log in as admin
3. Navigate to check-ins page
4. Click "Download CSV" and test each date range option
5. Verify CSV file downloads correctly
6. Open CSV in Excel/Google Sheets to verify formatting
