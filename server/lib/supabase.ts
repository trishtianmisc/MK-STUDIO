import { createClient } from "@supabase/supabase-js";
import { env } from "../config/env.js";

/** Service-role client — full admin access, bypasses RLS. Use for trusted server operations. */
export const supabase = createClient(env.SUPABASE_URL, env.SUPABASE_SERVICE_ROLE_KEY);

/** Anon client — respects RLS. Use for verifying user auth tokens. */
export const supabaseAuth = createClient(env.SUPABASE_URL, env.SUPABASE_ANON_KEY);
