# Kiosk Check-In System

A complete touch-friendly check-in system for The Fort Jiu-Jitsu, designed for tablet/kiosk display.

## Features

### 1. Kiosk Landing Page (`/kiosk`)
- Clean, minimal black background design
- Large touch-friendly buttons (min 60px height)
- Two check-in methods: QR Code and PIN Entry
- Real-time date and time display
- Optimized for tablet displays

### 2. QR Code Scanner (`/kiosk/scan`)
- Camera-based QR code scanning using html5-qrcode library
- Auto-submits when QR code is detected
- Visual feedback during scanning
- Success/error screens with member name
- Auto-redirects to home after 3 seconds

### 3. PIN Entry (`/kiosk/pin`)
- Large number pad (0-9) optimized for touch
- Visual PIN dots show entry progress
- Clear button to reset
- Submit button (only active when 4 digits entered)
- Success/error screens with member name
- Auto-redirects to home after 3 seconds

### 4. Success/Error Feedback
- **Success**: Green checkmark, "Welcome, [Name]!" message
- **Error**: Red X icon with specific error message
- Handles multiple error cases:
  - QR code/PIN not found
  - Member not active
  - Payment status not active
  - No valid waiver on file
  - Already checked in today

## API Routes

### POST `/api/kiosk/check-in-qr`
Check in a member using their QR code.

**Request:**
```json
{
  "qrCode": "abc123xyz"
}
```

**Response (Success):**
```json
{
  "success": true,
  "alreadyCheckedIn": false,
  "memberName": "John Doe",
  "message": "Check-in successful"
}
```

**Response (Error):**
```json
{
  "error": "Member account is not active",
  "memberName": "John Doe"
}
```

### POST `/api/kiosk/check-in-pin`
Check in a member using their 4-digit PIN.

**Request:**
```json
{
  "pin": "1234"
}
```

**Response:** Same format as QR code endpoint

## Validation Logic

Both endpoints validate:
1. **Member exists** - QR code or PIN must match a member
2. **Member status** - Must be 'active'
3. **Payment status** - Must be 'active'
4. **Valid waiver** - Must have liability waiver signed within last year
5. **Already checked in** - Prevents duplicate check-ins on same day

## Database Requirements

### Members Table
Must have these fields:
- `qr_code` - Unique QR code for each member
- `pin_code` - 4-digit PIN for each member
- `status` - Member status ('active', 'inactive', etc.)
- `payment_status` - Payment status ('active', 'past_due', etc.)

### Waivers Table
- `member_id` - Foreign key to members
- `waiver_type` - Type of waiver ('liability', etc.)
- `signed_at` - Timestamp when waiver was signed

### Check-ins Table
- `member_id` - Foreign key to members
- `check_in_time` - Timestamp of check-in
- `class_type` - Type of class ('general', etc.)

## Setup Instructions

1. **Install Dependencies**
   ```bash
   npm install html5-qrcode
   ```

2. **Database Setup**
   - Ensure members table has `qr_code` and `pin_code` fields
   - Run waiver table migration if not already done
   - Create check_ins table if not exists

3. **Generate QR Codes for Members**
   - Generate unique QR codes for each member
   - Store in `members.qr_code` field
   - Print QR codes on membership cards

4. **Assign PINs to Members**
   - Generate 4-digit PINs for each member
   - Store in `members.pin_code` field
   - Communicate PINs to members securely

5. **Kiosk Setup**
   - Use a tablet (iPad, Android tablet, etc.)
   - Open browser to `/kiosk` route
   - Consider kiosk mode browser for full-screen
   - Enable camera permissions for QR scanning

## Design System

Following The Fort Jiu-Jitsu brand:
- **Background**: Black (#000000)
- **Text**: White (#FFFFFF)
- **Borders**: White with 20% opacity
- **Accents**:
  - Success: Green (#10B981)
  - Error: Red (#EF4444)
- **Typography**: Large, bold fonts for readability
- **Touch Targets**: Minimum 60px height for all interactive elements
- **Animations**: Framer Motion for smooth transitions

## User Flow

### QR Code Flow
1. Member arrives at kiosk
2. Clicks "Scan QR Code"
3. Camera opens, member holds QR code to camera
4. System auto-detects and processes QR code
5. Success/error screen shows for 3 seconds
6. Auto-returns to home

### PIN Flow
1. Member arrives at kiosk
2. Clicks "Enter PIN"
3. Member enters 4-digit PIN on number pad
4. Member clicks "Submit"
5. Success/error screen shows for 3 seconds
6. Auto-returns to home

## Error Handling

All errors show:
- Member name (if member found)
- Specific error message
- Red error screen
- Auto-reset after 3 seconds

Common errors:
- "QR code not found" / "PIN not found"
- "Member account is not active"
- "Payment status is not active"
- "No valid waiver on file"
- "Already checked in today"

## Security Considerations

1. **No Authentication Required** - Intentional for kiosk use
2. **Limited Information** - Only shows member name on success
3. **Auto-Reset** - Clears all data after each check-in
4. **No Member Data Display** - Privacy-focused design

## Testing

Manual testing checklist:
- [ ] Valid QR code check-in succeeds
- [ ] Valid PIN check-in succeeds
- [ ] Invalid QR code shows error
- [ ] Invalid PIN shows error
- [ ] Inactive member shows error
- [ ] Expired waiver shows error
- [ ] Duplicate check-in handled correctly
- [ ] Camera permissions work
- [ ] Touch targets are large enough
- [ ] Auto-redirect timing works
- [ ] Mobile/tablet display works

## Future Enhancements

- [ ] Class selection during check-in
- [ ] Display today's schedule
- [ ] Show member photo on success
- [ ] Admin unlock code for troubleshooting
- [ ] Check-in statistics display
- [ ] Multiple kiosk support with sync
- [ ] Offline mode with sync when online
- [ ] Member achievement badges on check-in
- [ ] Birthday/milestone recognition
