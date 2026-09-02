import { Router } from "express";
import type { Request, Response } from "express";

const router = Router();

router.get("/", async (_req: Request, res: Response) => {
  res.json({ message: "Categories API — not yet connected to Supabase" });
});

export default router;
