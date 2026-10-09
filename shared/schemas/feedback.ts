import { z } from "zod";

export const feedbackSchema = z.object({
  rating: z
    .number({ error: "Please choose a rating" })
    .int("Please choose a rating")
    .min(1, "Please choose a rating")
    .max(5, "Rating must be between 1 and 5"),
  message: z
    .string()
    .max(2000, "Message too long")
    .optional()
    .or(z.literal("")),
});

export type FeedbackInput = z.infer<typeof feedbackSchema>;

export const feedbackStatusSchema = z.enum(["new", "reviewed", "archived"]);

export type FeedbackStatus = z.infer<typeof feedbackStatusSchema>;
