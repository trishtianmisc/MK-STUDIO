-- =============================================================================
-- MK Studio — Phase 4: Row Level Security Policies
-- =============================================================================
-- Enables RLS on catalogue tables and defines access policies.
--
-- Security model:
--   - Anonymous users: read-only access to public catalogue data
--   - Authenticated users: read-only access to public catalogue data + own profile
--   - Admin users: full CRUD on catalogue data (via is_admin() helper)
--   - Service-role client (server): bypasses all RLS (used for admin API)
--
-- The is_admin() function uses SECURITY DEFINER to check profiles.is_admin
-- without triggering recursive RLS on the profiles table.
-- =============================================================================

-- =============================================================================
-- HELPER FUNCTION: is_admin()
-- =============================================================================
-- Returns true if the authenticated user has admin privileges.
-- Uses SECURITY DEFINER to bypass RLS when reading from profiles.
-- This avoids recursive RLS when catalogue policies check admin status.
-- The function is STABLE because it reads from the database and returns
-- the same result within a single statement.

CREATE OR REPLACE FUNCTION public.is_admin()
RETURNS BOOLEAN AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.profiles
    WHERE id = auth.uid() AND is_admin = true
  );
$$ LANGUAGE sql SECURITY DEFINER STABLE;

-- =============================================================================
-- CATEGORIES
-- =============================================================================
-- All categories are public (no private/internal fields exist in the schema).
-- All roles can SELECT; only admins can INSERT/UPDATE/DELETE.
-- USING (true) is correct here because all categories are intentionally public.

ALTER TABLE categories ENABLE ROW LEVEL SECURITY;

-- Public can read all categories
CREATE POLICY "Public can read categories"
  ON categories FOR SELECT
  TO anon, authenticated
  USING (true);

-- Admins can insert categories
CREATE POLICY "Admins can insert categories"
  ON categories FOR INSERT
  TO authenticated
  WITH CHECK (public.is_admin());

-- Admins can update categories
CREATE POLICY "Admins can update categories"
  ON categories FOR UPDATE
  TO authenticated
  USING (public.is_admin())
  WITH CHECK (public.is_admin());

-- Admins can delete categories
CREATE POLICY "Admins can delete categories"
  ON categories FOR DELETE
  TO authenticated
  USING (public.is_admin());

-- =============================================================================
-- PRODUCTS
-- =============================================================================
-- Public users can only read products where is_public = true.
-- Admins can read all products (including private) and perform full CRUD.
-- The is_public column has a partial index for efficient filtering.

ALTER TABLE products ENABLE ROW LEVEL SECURITY;

-- Public can read public products
-- Uses the partial index idx_products_is_public for performance
CREATE POLICY "Public can read public products"
  ON products FOR SELECT
  TO anon, authenticated
  USING (is_public = true);

-- Admins can read all products (including private/draft)
CREATE POLICY "Admins can read all products"
  ON products FOR SELECT
  TO authenticated
  USING (public.is_admin());

-- Admins can insert products
CREATE POLICY "Admins can insert products"
  ON products FOR INSERT
  TO authenticated
  WITH CHECK (public.is_admin());

-- Admins can update products
CREATE POLICY "Admins can update products"
  ON products FOR UPDATE
  TO authenticated
  USING (public.is_admin())
  WITH CHECK (public.is_admin());

-- Admins can delete products
CREATE POLICY "Admins can delete products"
  ON products FOR DELETE
  TO authenticated
  USING (public.is_admin());

-- =============================================================================
-- PRODUCT IMAGES
-- =============================================================================
-- Public users can only read images belonging to public products.
-- Admins can read all images and perform full CRUD.
-- The EXISTS subquery uses indexed columns:
--   - product_images.product_id (indexed)
--   - products.id (primary key)

ALTER TABLE product_images ENABLE ROW LEVEL SECURITY;

-- Public can read images of public products
CREATE POLICY "Public can read images of public products"
  ON product_images FOR SELECT
  TO anon, authenticated
  USING (
    EXISTS (
      SELECT 1 FROM products
      WHERE products.id = product_images.product_id
        AND products.is_public = true
    )
  );

-- Admins can read all product images
CREATE POLICY "Admins can read all product images"
  ON product_images FOR SELECT
  TO authenticated
  USING (public.is_admin());

-- Admins can insert product images
CREATE POLICY "Admins can insert product images"
  ON product_images FOR INSERT
  TO authenticated
  WITH CHECK (public.is_admin());

-- Admins can update product images
CREATE POLICY "Admins can update product images"
  ON product_images FOR UPDATE
  TO authenticated
  USING (public.is_admin())
  WITH CHECK (public.is_admin());

-- Admins can delete product images
CREATE POLICY "Admins can delete product images"
  ON product_images FOR DELETE
  TO authenticated
  USING (public.is_admin());
