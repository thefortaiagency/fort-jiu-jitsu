# Class Schedule Management System

Complete admin interface for managing class schedules at The Fort.

## Files Created

### `/app/admin/classes/page.tsx`
Server component that handles authentication and renders the ClassManagement component.

### `/app/admin/classes/ClassManagement.tsx`
Main client component featuring:
- **Weekly Schedule View**: 7-column grid showing classes organized by day
- **List View**: Traditional table view with sortable columns
- **Stats Dashboard**: Total classes, active classes, and breakdown by program
- **Program Filter**: Filter classes by program (BJJ, Hammers, etc.)
- **CRUD Operations**: Create, edit, delete, and toggle active status
- **Responsive Design**: Works on mobile, tablet, and desktop

### `/app/admin/classes/ClassFormModal.tsx`
Modal form for creating and editing classes with:
- Form validation (required fields, time validation, age range validation)
- All class properties configurable
- Dark theme UI matching admin console
- Error handling and display
- Loading states

## Features

### Weekly View
- 7-day grid layout (Monday-Sunday)
- Classes displayed as cards within their day
- Time display (start/end)
- Click any class card to edit
- Visual indication of inactive classes
- Program badges
- Instructor names

### List View
- Sortable table with all class details
- Quick edit/delete actions
- Toggle active/inactive status inline
- Capacity display
- Skill level indicators
- Responsive table design

### Class Form
- **Required Fields**: name, program, instructor, day, start time, end time, max capacity
- **Optional Fields**: age range (min/max), skill level
- **Validation**:
  - End time must be after start time
  - Max age must be greater than min age
  - Capacity must be at least 1
- **Active Toggle**: Control class visibility

### Stats
- Total classes count
- Active classes count (green highlight)
- Classes by program breakdown

## Database Schema

The system uses the `classes` table with these fields:

```typescript
interface Class {
  id: string;
  name: string;
  program: string; // kids-bjj, adult-bjj, beginners, junior-hammers, big-hammers, lady-hammers
  instructor: string;
  day_of_week: string; // Monday-Sunday
  start_time: string; // HH:MM format
  end_time: string; // HH:MM format
  max_capacity: number;
  age_min?: number;
  age_max?: number;
  skill_level: string; // all, beginner, intermediate, advanced
  is_active: boolean;
  created_at: string;
  updated_at: string;
}
```

## Usage

Navigate to `/admin/classes` in your browser (requires admin authentication).

### Creating a Class
1. Click "+ Add Class" button
2. Fill in all required fields
3. Optionally set age range and skill level
4. Click "Create Class"

### Editing a Class
- **Weekly View**: Click on any class card
- **List View**: Click "Edit" button in the row
- Make changes and click "Update Class"

### Deleting a Class
- Click "Delete" in list view or from the edit modal
- Confirm the deletion (cannot be undone)

### Toggling Active Status
- Click the status badge in list view to toggle
- Inactive classes appear dimmed and show "Inactive" label

## Styling

- Dark theme (bg-black, bg-gray-900)
- Border: gray-800
- Text: white/gray
- Accent: green (active), red (inactive), blue (actions)
- Matches existing admin console design

## Navigation

- **Back to Dashboard**: Returns to main admin page
- **Sign Out**: Logs out of admin console

## Future Enhancements

Potential additions:
- Class enrollment management
- Attendance tracking
- Recurring class templates
- Calendar export (iCal)
- Instructor scheduling conflicts
- Capacity warnings
- Member waitlists
- Class history/analytics
