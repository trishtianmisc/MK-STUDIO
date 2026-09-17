import { z } from "zod";

export const contactSchema = z.object({
  name: z.string().min(1, "Name is required").max(200, "Name too long"),
  email: z.string().email("Invalid email address"),
  occasion: z.string().max(200, "Occasion too long").optional().or(z.literal("")),
  message: z.string().max(2000, "Message too long").optional(),
});

export type ContactInput = z.infer<typeof contactSchema>;
