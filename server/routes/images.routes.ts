import { Router } from "express";
import type { Request, Response } from "express";

const router = Router();

router.post("/upload", async (_req: Request, res: Response) => {
  res.json({ message: "Image upload — not yet connected to Supabase Storage" });
});

export default router;
