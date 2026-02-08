import { createClient, SupabaseClient } from "@supabase/supabase-js";

// Service role client — sadece server-side (API routes) kullanılmalı
// Lazy initialization: build sırasında env yokken hata vermez
let _supabaseAdmin: SupabaseClient | null = null;

export function getSupabaseAdmin(): SupabaseClient {
  if (!_supabaseAdmin) {
    _supabaseAdmin = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!
    );
  }
  return _supabaseAdmin;
}
