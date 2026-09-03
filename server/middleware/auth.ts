import type { Request, Response, NextFunction } from "express";
import { supabaseAuth } from "../lib/supabase.js";
import type { User } from "@supabase/supabase-js";

export interface AuthenticatedRequest extends Request {
  user: User;
}

/**
 * Authentication middleware.
 *
 * 1. Reads the Authorization header (expects "Bearer <token>").
 * 2. Verifies the JWT via Supabase Auth server.
 * 3. Attaches the authenticated user to req.user.
 * 4. Returns 401 if authentication is missing or invalid.
 */
export async function requireAuth(req: Request, res: Response, next: NextFunction) {
  const header = req.headers.authorization;

  if (!header || !header.startsWith("Bearer ")) {
    res.status(401).json({ error: "Authentication required" });
    return;
  }

  const token = header.slice(7);

  if (!token) {
    res.status(401).json({ error: "Authentication required" });
    return;
  }

  try {
    const { data, error } = await supabaseAuth.auth.getUser(token);

    if (error || !data.user) {
      res.status(401).json({ error: "Invalid or expired token" });
      return;
    }

    (req as AuthenticatedRequest).user = data.user;
    next();
  } catch {
    res.status(401).json({ error: "Authentication failed" });
  }
}
