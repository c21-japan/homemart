import { createServerClient } from '@supabase/ssr';
import { cookies } from 'next/headers';

export async function createClient(cookieStore?: ReturnType<typeof cookies>) {
  const cookieStoreToUse = cookieStore || await cookies();

  return createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        async getAll() {
          const resolvedCookies = await cookieStoreToUse;
          return resolvedCookies.getAll();
        },
        async setAll(cookiesToSet) {
          try {
            const resolvedCookies = await cookieStoreToUse;
            cookiesToSet.forEach(({ name, value, options }) =>
              resolvedCookies.set(name, value, options)
            );
          } catch {
            // 無視
          }
        },
      },
    }
  );
}
