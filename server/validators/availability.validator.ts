import { z } from "zod";

export const createRentalDateSchema = z.object({
  product_id: z.string().uuid("Invalid product ID"),
  start_date: z.string().min(1, "Start date is required"),
  end_date: z.string().min(1, "End date is required"),
  type: z.enum(["rented", "maintenance", "blocked"]).default("rented"),
  note: z.string().max(500, "Note too long").nullable().optional(),
}).refine(
  (data) => new Date(data.end_date) >= new Date(data.start_date),
  { message: "End date must be on or after start date", path: ["end_date"] }
);

export type CreateRentalDateInput = z.infer<typeof createRentalDateSchema>;
