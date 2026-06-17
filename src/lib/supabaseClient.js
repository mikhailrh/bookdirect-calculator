import { createClient } from "@supabase/supabase-js";

// Pilot Supabase project. The publishable key is safe to ship in the browser;
// real data is gated server-side by the `ops-metrics` edge function (founder
// email allowlist), not by hiding this key.
const url =
  import.meta.env.VITE_SUPABASE_URL || "https://gmjjjteohwifazyagjnb.supabase.co";
const publishableKey =
  import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY ||
  "sb_publishable_fU04aalMOXyHSiGXGCmq1w_Jp6xEiFC";

export const supabase = createClient(url, publishableKey, {
  auth: {
    persistSession: true,
    autoRefreshToken: true,
    detectSessionInUrl: true,
  },
});
