import { createServerClient } from '@supabase/ssr';
import { cookies } from 'next/headers';

// Server client for server components and API routes
export async function createServerAuthClient() {
  const cookieStore = await cookies();

  return createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return cookieStore.getAll();
        },
        setAll(cookiesToSet) {
          try {
            cookiesToSet.forEach(({ name, value, options }) =>
              cookieStore.set(name, value, options)
            );
          } catch {
            // The `setAll` method was called from a Server Component.
            // This can be ignored if you have middleware refreshing sessions.
          }
        },
      },
    }
  );
}

// Check if user is admin (you can customize this based on your needs)
export async function isAdmin(userId: string): Promise<boolean> {
  // For now, we'll check against a list of admin emails in the database
  // You could also use Supabase RLS policies or a separate admins table
  const supabase = await createServerAuthClient();

  const { data: user } = await supabase.auth.getUser();
  if (!user?.user) return false;

  // Check if user email is in admins list (you can modify this logic)
  const adminEmails = process.env.ADMIN_EMAILS?.split(',') || [];
  return adminEmails.includes(user.user.email || '');
}
