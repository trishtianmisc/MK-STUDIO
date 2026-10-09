import type { Request, Response } from "express";
import {
  feedbackSchema,
  feedbackStatusSchema,
} from "../../shared/schemas/feedback.js";
import * as feedbackService from "../services/feedback.service.js";

export async function submitFeedback(req: Request, res: Response) {
  const parsed = feedbackSchema.safeParse(req.body);
  if (!parsed.success) {
    const message = parsed.error.issues.map(i => i.message).join(", ");
    res.status(400).json({ error: message });
    return;
  }

  try {
    const feedback = await feedbackService.createFeedback(parsed.data);
    res.status(201).json({ ok: true, id: feedback.id });
  } catch (err) {
    console.error("[Feedback] insert error:", err);
    res.status(500).json({ error: "Failed to submit feedback" });
  }
}

export async function listFeedback(_req: Request, res: Response) {
  try {
    const feedback = await feedbackService.listFeedback();
    res.json(feedback);
  } catch (err) {
    console.error("[Feedback] list error:", err);
    res.status(500).json({ error: "Failed to load feedback" });
  }
}

export async function updateFeedback(req: Request, res: Response) {
  const { id } = req.params;
  const parsed = feedbackStatusSchema.safeParse(req.body?.status);
  if (!parsed.success) {
    res.status(400).json({ error: "Invalid status" });
    return;
  }

  try {
    const feedback = await feedbackService.updateFeedbackStatus(
      id,
      parsed.data
    );
    res.json(feedback);
  } catch (err) {
    console.error("[Feedback] update error:", err);
    res.status(500).json({ error: "Failed to update feedback" });
  }
}

export async function deleteFeedback(req: Request, res: Response) {
  const { id } = req.params;

  try {
    await feedbackService.deleteFeedback(id);
    res.json({ ok: true });
  } catch (err) {
    console.error("[Feedback] delete error:", err);
    res.status(500).json({ error: "Failed to delete feedback" });
  }
}
