import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;

// Client-side Supabase client (uses anon key)
export const supabase = createClient(supabaseUrl, supabaseAnonKey);

// Server-side Supabase client (uses service role key for admin operations)
export function createServerSupabaseClient() {
  const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;
  return createClient(supabaseUrl, serviceRoleKey, {
    auth: {
      autoRefreshToken: false,
      persistSession: false,
    },
  });
}

// Types matching your existing Fort Wrestling database schema
export interface Member {
  id: string;
  first_name: string;
  last_name: string;
  email: string;
  phone?: string;
  birth_date?: string;
  program: string; // 'junior-hammers' | 'big-hammers' | 'lady-hammers' | 'beginners' | 'kids-bjj' | 'adult-bjj'
  skill_level: string;
  weight_class?: string;
  status: 'active' | 'inactive' | 'pending' | 'cancelled';
  membership_type: 'monthly' | 'annual' | 'drop-in';
  // Parent/Guardian (for minors)
  parent_first_name?: string;
  parent_last_name?: string;
  parent_email?: string;
  parent_phone?: string;
  // Emergency Contact
  emergency_contact_name?: string;
  emergency_contact_phone?: string;
  emergency_contact_relationship?: string;
  // Medical
  medical_conditions?: string;
  medications?: string;
  allergies?: string;
  // Address
  address_line1?: string;
  address_line2?: string;
  city?: string;
  state?: string;
  zip_code?: string;
  // Check-in
  qr_code?: string;
  pin_code?: string;
  // Family Account
  family_account_id?: string;
  is_primary_account_holder: boolean;
  individual_monthly_cost: number;
  // Stripe
  stripe_customer_id?: string;
  stripe_subscription_id?: string;
  last_payment_date?: string;
  payment_status: 'pending' | 'active' | 'past_due' | 'cancelled';
  // Timestamps
  created_at: string;
  updated_at: string;
}

export interface Class {
  id: string;
  name: string;
  program: string;
  instructor: string;
  day_of_week: string;
  start_time: string;
  end_time: string;
  max_capacity: number;
  age_min?: number;
  age_max?: number;
  skill_level: string;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export interface Event {
  id: string;
  // Add event fields as needed
  created_at: string;
  updated_at: string;
}

// Helper functions for Jiu-Jitsu specific queries
export async function getJiuJitsuMembers() {
  const supabase = createServerSupabaseClient();
  return supabase
    .from('members')
    .select('*')
    .in('program', ['kids-bjj', 'adult-bjj', 'beginners'])
    .eq('status', 'active');
}

export async function getJiuJitsuClasses() {
  const supabase = createServerSupabaseClient();
  return supabase
    .from('classes')
    .select('*')
    .eq('is_active', true)
    .ilike('program', '%bjj%');
}
