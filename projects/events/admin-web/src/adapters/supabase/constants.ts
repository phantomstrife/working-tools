const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;
// Server-only secret (no NEXT_PUBLIC_ prefix): never inlined into the browser bundle.
const supabaseServiceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY ?? '';

export const SUPABASE = {
   URL: supabaseUrl,
   ANON_KEY: supabaseAnonKey,
   SERVICE_ROLE_KEY: supabaseServiceRoleKey,
};
