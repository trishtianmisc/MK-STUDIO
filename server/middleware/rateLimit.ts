import type { Request, Response, NextFunction } from "express";

interface RateLimitEntry {
  count: number;
  resetAt: number;
}

const store = new Map<string, RateLimitEntry>();

/**
 * Simple in-memory rate limiter.
 *
 * @param windowMs - Time window in milliseconds
 * @param max      - Maximum requests per window
 */
export function rateLimit(windowMs: number, max: number) {
  // Clean up expired entries periodically
  const cleanup = setInterval(() => {
    const now = Date.now();
    store.forEach((entry, key) => {
      if (now > entry.resetAt) {
        store.delete(key);
      }
    });
  }, windowMs);

  // Allow the process to exit without waiting for cleanup
  if (typeof cleanup.unref === "function") {
    cleanup.unref();
  }

  return (req: Request, res: Response, next: NextFunction) => {
    const key = req.ip || req.socket.remoteAddress || "unknown";
    const now = Date.now();
    const entry = store.get(key);

    if (!entry || now > entry.resetAt) {
      store.set(key, { count: 1, resetAt: now + windowMs });
      next();
      return;
    }

    entry.count++;

    if (entry.count > max) {
      res.status(429).json({ error: "Too many requests. Please try again later." });
      return;
    }

    next();
  };
}
