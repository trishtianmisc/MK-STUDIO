/**
 * Database types for the MK Studio Supabase backend.
 *
 * These types will be auto-generated from the Supabase schema once tables are created.
 * For now, this file defines the expected shape of database rows.
 *
 * To regenerate after schema changes, run:
 *   npx supabase gen types typescript --local > client/src/types/database.ts
 */

export type Json = string | number | boolean | null | { [key: string]: Json | undefined } | Json[];

export interface Database {
  public: {
    Tables: {
      categories: {
        Row: {
          id: number;
          slug: string;
          name: string;
          description: string | null;
          image: string | null;
          short: string | null;
          sort_order: number;
          created_at: string;
          updated_at: string;
        };
        Insert: Omit<Database["public"]["Tables"]["categories"]["Row"], "id" | "created_at" | "updated_at">;
        Update: Partial<Database["public"]["Tables"]["categories"]["Insert"]>;
      };
      products: {
        Row: {
          id: number;
          category_id: number;
          name: string;
          slug: string;
          description: string | null;
          details: string | null;
          sizing: string | null;
          sizes: string[];
          fabric: string | null;
          color: string | null;
          rental_price: number;
          rental_term: string;
          images: string[];
          availability: "Available" | "Limited" | "Unavailable";
          unavailable_days: number[];
          rental_note: string | null;
          is_featured: boolean;
          sort_order: number;
          created_at: string;
          updated_at: string;
        };
        Insert: Omit<Database["public"]["Tables"]["products"]["Row"], "id" | "created_at" | "updated_at">;
        Update: Partial<Database["public"]["Tables"]["products"]["Insert"]>;
      };
    };
    Views: Record<string, never>;
    Functions: Record<string, never>;
    Enums: Record<string, never>;
  };
}
