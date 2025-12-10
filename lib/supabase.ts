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
  // Belt Progression (BJJ)
  current_belt_id?: string;
  current_stripes?: number;
  belt_updated_at?: string;
  total_classes_attended?: number;
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

// Family account helper functions
export async function getFamilyMembers(primaryMemberId: string) {
  const supabase = createServerSupabaseClient();

  // Get the primary member first
  const { data: primaryMember, error: primaryError } = await supabase
    .from('members')
    .select('*')
    .eq('id', primaryMemberId)
    .single();

  if (primaryError || !primaryMember) {
    return { data: null, error: primaryError };
  }

  // If this member is not a primary account holder, find their family
  const familyAccountId = primaryMember.is_primary_account_holder
    ? primaryMember.id
    : primaryMember.family_account_id;

  if (!familyAccountId) {
    return { data: [primaryMember], error: null };
  }

  // Get all family members
  const { data, error } = await supabase
    .from('members')
    .select('*')
    .or(`id.eq.${familyAccountId},family_account_id.eq.${familyAccountId}`)
    .order('is_primary_account_holder', { ascending: false })
    .order('created_at', { ascending: true });

  return { data, error };
}

export async function linkToFamily(childId: string, parentId: string) {
  const supabase = createServerSupabaseClient();

  // Verify parent exists and is a primary account holder
  const { data: parent, error: parentError } = await supabase
    .from('members')
    .select('id, is_primary_account_holder, stripe_customer_id')
    .eq('id', parentId)
    .single();

  if (parentError || !parent) {
    return { data: null, error: new Error('Parent member not found') };
  }

  if (!parent.is_primary_account_holder) {
    return { data: null, error: new Error('Parent must be a primary account holder') };
  }

  // Update child to link to parent's family
  const { data, error } = await supabase
    .from('members')
    .update({
      family_account_id: parentId,
      is_primary_account_holder: false,
      stripe_customer_id: parent.stripe_customer_id, // Use parent's Stripe customer
      updated_at: new Date().toISOString(),
    })
    .eq('id', childId)
    .select()
    .single();

  return { data, error };
}

export async function getFamilyBilling(primaryMemberId: string) {
  const supabase = createServerSupabaseClient();

  // Get all family members
  const { data: familyMembers, error } = await getFamilyMembers(primaryMemberId);

  if (error || !familyMembers) {
    return { data: null, error };
  }

  // Calculate family billing
  const primaryMember = familyMembers.find((m) => m.is_primary_account_holder);
  const childMembers = familyMembers.filter((m) => !m.is_primary_account_holder);

  // Family discount: $150/month for family (vs $100+$75 = $175 individual)
  const hasFamilyDiscount = familyMembers.length > 1;
  const familyTotal = hasFamilyDiscount ? 150 : (primaryMember?.individual_monthly_cost || 100);

  return {
    data: {
      primaryMember,
      childMembers,
      totalMembers: familyMembers.length,
      monthlyTotal: familyTotal,
      savings: hasFamilyDiscount ? 25 : 0,
      stripeCustomerId: primaryMember?.stripe_customer_id,
    },
    error: null,
  };
}

export async function getMemberByEmail(email: string) {
  const supabase = createServerSupabaseClient();
  return supabase
    .from('members')
    .select('*')
    .eq('email', email)
    .single();
}
