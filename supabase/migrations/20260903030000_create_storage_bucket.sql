-- =============================================================================
-- MK Studio — Phase 6: Storage Bucket & Policies
-- =============================================================================
-- Creates the product-images Storage bucket and access policies.
--
-- The bucket is public for image delivery. Database RLS controls which
-- images are visible to which users. Storage policies control who can
-- upload/modify/delete objects.
--
-- Run via Supabase Dashboard → SQL Editor if Supabase CLI is not configured.
-- =============================================================================

-- =============================================================================
-- STORAGE BUCKET
-- =============================================================================
-- Create the bucket if it doesn't already exist.

INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
  'product-images',
  'product-images',
  true,              -- public bucket for direct image delivery
  5242880,           -- 5 MB in bytes
  ARRAY['image/jpeg', 'image/png', 'image/webp']
)
ON CONFLICT (id) DO UPDATE SET
  public = EXCLUDED.public,
  file_size_limit = EXCLUDED.file_size_limit,
  allowed_mime_types = EXCLUDED.allowed_mime_types;

-- =============================================================================
-- STORAGE POLICIES
-- =============================================================================

-- Admins can upload to the product-images bucket
-- Uses is_admin() which is SECURITY DEFINER and bypasses RLS

CREATE POLICY "Admins can upload product images"
  ON storage.objects
  FOR INSERT
  TO authenticated
  WITH CHECK (
    bucket_id = 'product-images'
    AND public.is_admin()
  );

-- Admins can update objects in the product-images bucket

CREATE POLICY "Admins can update product images"
  ON storage.objects
  FOR UPDATE
  TO authenticated
  USING (
    bucket_id = 'product-images'
    AND public.is_admin()
  );

-- Admins can delete objects in the product-images bucket

CREATE POLICY "Admins can delete product images"
  ON storage.objects
  FOR DELETE
  TO authenticated
  USING (
    bucket_id = 'product-images'
    AND public.is_admin()
  );

-- Anyone can read objects in the public bucket

CREATE POLICY "Public can read product images"
  ON storage.objects
  FOR SELECT
  TO anon, authenticated
  USING (
    bucket_id = 'product-images'
  );
