-- Add brand column to products table
ALTER TABLE products ADD COLUMN IF NOT EXISTS brand TEXT;
