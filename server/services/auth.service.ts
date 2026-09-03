import { createClient } from "@supabase/supabase-js";
import { supabase, supabaseAuth } from "../lib/supabase.js";

/**
 * Authenticate a user with email and password via Supabase Auth.
 */
export async function signIn(email: string, password: string) {
  const { data, error } = await supabaseAuth.auth.signInWithPassword({ email, password });
  if (error) throw error;
  return data;
}

/**
 * Sign out a user by invalidating their refresh token.
 */
export async function signOut(accessToken: string) {
  const userClient = createClientWithToken(accessToken);
  const { error } = await userClient.auth.signOut();
  if (error) throw error;
}

/**
 * Get the current user from an access token.
 */
export async function getUser(accessToken: string) {
  const { data, error } = await supabaseAuth.auth.getUser(accessToken);
  if (error || !data.user) return null;
  return data.user;
}

/**
 * Check if a user is an admin by looking up their profile.
 * Creates a non-admin profile lazily if one doesn't exist.
 */
export async function isAdmin(userId: string): Promise<boolean> {
  const { data } = await supabase
    .from("profiles")
    .select("is_admin")
    .eq("id", userId)
    .single();

  if (data) {
    return data.is_admin === true;
  }

  // Profile doesn't exist — create as non-admin (is_admin is always false)
  const { error: insertError } = await supabase
    .from("profiles")
    .insert({ id: userId, is_admin: false });

  if (insertError) {
    if (insertError.code === "23505") {
      // Duplicate key — profile created by concurrent request, re-check
      const { data: retryData } = await supabase
        .from("profiles")
        .select("is_admin")
        .eq("id", userId)
        .single();
      return retryData?.is_admin === true;
    }
    console.error("Failed to create profile:", insertError);
  }

  return false;
}

/**
 * Create a temporary Supabase client authenticated with a user's token.
 */
function createClientWithToken(accessToken: string) {
  return createClient(
    process.env.SUPABASE_URL!,
    process.env.SUPABASE_ANON_KEY!,
    {
      global: {
        headers: { Authorization: `Bearer ${accessToken}` },
      },
    },
  );
}
