import { createClient, type SupabaseClient } from "@supabase/supabase-js";

// Inlined at build time. When either is missing, sync is turned off and the
// app stays purely local.
const URL = process.env.NEXT_PUBLIC_SUPABASE_URL;
const ANON_KEY = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

export const syncEnabled = Boolean(URL && ANON_KEY);

let client: SupabaseClient | null = null;

/** Lazily created browser client, or null when sync is not configured. */
export function getSupabase(): SupabaseClient | null {
  if (!syncEnabled || typeof window === "undefined") return null;
  client ??= createClient(URL!, ANON_KEY!, {
    auth: { persistSession: true, detectSessionInUrl: true, flowType: "implicit" },
  });
  return client;
}

/** Where the magic link sends the user back to (works under the Pages basePath). */
export function authRedirectUrl() {
  return `${window.location.origin}${process.env.NEXT_PUBLIC_BASE_PATH ?? ""}/`;
}
