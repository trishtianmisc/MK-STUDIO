import { Router } from "express";
import type { Request, Response } from "express";
import { z } from "zod";
import { requireAuth, type AuthenticatedRequest } from "../middleware/auth.js";
import { requireAdmin } from "../middleware/admin.js";
import { rateLimit } from "../middleware/rateLimit.js";
import * as authService from "../services/auth.service.js";

const loginSchema = z.object({
  email: z.string().email("Invalid email address"),
  password: z.string().min(1, "Password is required"),
});

const router = Router();

/**
 * POST /api/auth/login
 * Authenticate with email and password.
 * Returns the session (access token, refresh token, user).
 */
router.post(
  "/login",
  rateLimit(15 * 60 * 1000, 10), // 10 attempts per 15 minutes
  async (req: Request, res: Response) => {
    try {
      const parsed = loginSchema.safeParse(req.body);
      if (!parsed.success) {
        res.status(400).json({ error: "Invalid input" });
        return;
      }

      const { email, password } = parsed.data;

      const data = await authService.signIn(email, password);

      // Check if user is admin
      const admin = await authService.isAdmin(data.user.id);

      if (!admin) {
        res.status(403).json({ error: "You do not have permission to access the admin area" });
        return;
      }

      res.json({
        user: {
          id: data.user.id,
          email: data.user.email,
        },
        session: {
          access_token: data.session.access_token,
          refresh_token: data.session.refresh_token,
          expires_at: data.session.expires_at,
        },
      });
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : "Unknown error";

      if (message.includes("Invalid login credentials")) {
        res.status(401).json({ error: "Invalid email or password" });
        return;
      }

      console.error("[Auth Login]", message);
      res.status(500).json({ error: "Something went wrong. Please try again." });
    }
  },
);

/**
 * POST /api/auth/logout
 * Sign out the current user.
 */
router.post("/logout", requireAuth, async (req: Request, res: Response) => {
  try {
    const authReq = req as AuthenticatedRequest;
    const token = req.headers.authorization?.slice(7);
    if (token) {
      await authService.signOut(token);
    }
    res.json({ message: "Logged out successfully" });
  } catch {
    // Even if Supabase logout fails, return success to the client
    // The client will clear its local session regardless
    res.json({ message: "Logged out successfully" });
  }
});

/**
 * GET /api/auth/me
 * Return the current authenticated user's info.
 * Requires a valid session.
 */
router.get("/me", requireAuth, requireAdmin, (req: Request, res: Response) => {
  const authReq = req as AuthenticatedRequest;
  res.json({
    user: {
      id: authReq.user.id,
      email: authReq.user.email,
    },
  });
});

export default router;
