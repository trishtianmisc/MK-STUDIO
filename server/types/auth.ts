import type { User } from "@supabase/supabase-js";

export interface AuthenticatedRequest extends Express.Request {
  user: User;
}
