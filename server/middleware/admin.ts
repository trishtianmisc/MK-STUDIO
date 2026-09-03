import type { Request, Response, NextFunction } from "express";
import { supabase } from "../lib/supabase.js";
import type { AuthenticatedRequest } from "./auth.js";

/**
 * Admin authorization middleware.
 *
 * Must be used after requireAuth. Verifies that the authenticated user
 * has an admin profile (profiles.is_admin = true).
 *
 * If the profile row is missing (e.g. trigger failed), it creates one
 * with is_admin = false and returns 403.
 *
 * Returns 403 when authenticated but not authorized.
 */
export async function requireAdmin(req: Request, res: Response, next: NextFunction) {
  const userId = (req as AuthenticatedRequest).user.id;

  try {
    const { data: profile, error } = await supabase
      .from("profiles")
      .select("is_admin")
      .eq("id", userId)
      .single();

    if (error || !profile) {
      // Profile row missing — create as non-admin (is_admin is always false)
      const { error: insertError } = await supabase
        .from("profiles")
        .insert({ id: userId, is_admin: false });

      // Duplicate key = concurrent request already created it — safe to ignore
      if (insertError && insertError.code !== "23505") {
        console.error("Failed to create profile:", insertError);
      }

      res.status(403).json({ error: "You do not have permission to access the admin area" });
      return;
    }

    if (!profile.is_admin) {
      res.status(403).json({ error: "You do not have permission to access the admin area" });
      return;
    }

    next();
  } catch {
    res.status(403).json({ error: "Authorization check failed" });
  }
}
