import { supabase } from "../lib/supabase.js";
import type { FeedbackStatus } from "../../shared/schemas/feedback.js";

export interface Feedback {
  id: string;
  rating: number;
  message: string | null;
  status: FeedbackStatus;
  created_at: string;
}

/**
 * Create a feedback record (public submission).
 */
export async function createFeedback(input: {
  rating: number;
  message?: string;
}): Promise<Feedback> {
  const { data, error } = await supabase
    .from("feedback")
    .insert({
      rating: input.rating,
      message: input.message && input.message !== "" ? input.message : null,
    })
    .select()
    .single();

  if (error) throw error;
  return data as Feedback;
}

/**
 * Get all feedback, newest first (admin).
 */
export async function listFeedback(): Promise<Feedback[]> {
  const { data, error } = await supabase
    .from("feedback")
    .select("*")
    .order("created_at", { ascending: false });

  if (error) throw error;
  return (data ?? []) as Feedback[];
}

/**
 * Update a feedback record's status (admin).
 */
export async function updateFeedbackStatus(
  id: string,
  status: FeedbackStatus
): Promise<Feedback> {
  const { data, error } = await supabase
    .from("feedback")
    .update({ status })
    .eq("id", id)
    .select()
    .single();

  if (error) throw error;
  return data as Feedback;
}

/**
 * Delete a feedback record (admin).
 */
export async function deleteFeedback(id: string): Promise<boolean> {
  const { error } = await supabase.from("feedback").delete().eq("id", id);

  if (error) throw error;
  return true;
}
