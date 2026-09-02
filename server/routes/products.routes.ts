import { Router } from "express";
import type { Request, Response } from "express";

const router = Router();

router.get("/", async (_req: Request, res: Response) => {
  res.json({ message: "Products API — not yet connected to Supabase" });
});

router.get("/:slug", async (req: Request, res: Response) => {
  res.json({ message: `Product ${req.params.slug} — not yet connected to Supabase` });
});

export default router;
