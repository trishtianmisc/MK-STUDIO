-- =============================================================================
-- MK Studio — Catalogue Schema Migration
-- =============================================================================
-- Creates the core tables for the MK Studio product catalogue:
--   categories, products, product_images
--
-- Designed to match the existing ShowcaseProduct frontend contract.
-- =============================================================================

-- Enable UUID generation
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- =============================================================================
-- CATEGORIES
-- =============================================================================
CREATE TABLE categories (
  id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  slug        TEXT NOT NULL UNIQUE,
  name        TEXT NOT NULL,
  description TEXT,
  image       TEXT,
  sort_order  INTEGER NOT NULL DEFAULT 0,
  created_at  TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at  TIMESTAMPTZ NOT NULL DEFAULT now()
);

COMMENT ON TABLE categories IS 'Product categories (occasions) for the MK Studio showcase catalogue';
COMMENT ON COLUMN categories.slug IS 'URL-safe identifier, e.g. wedding-guest';
COMMENT ON COLUMN categories.image IS 'Hero image path for the category card';

CREATE INDEX idx_categories_slug ON categories (slug);
CREATE INDEX idx_categories_sort_order ON categories (sort_order);

-- =============================================================================
-- PRODUCTS
-- =============================================================================
CREATE TABLE products (
  id               UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  category_id      UUID NOT NULL REFERENCES categories(id) ON DELETE RESTRICT,
  slug             TEXT NOT NULL UNIQUE,
  name             TEXT NOT NULL,
  description      TEXT,
  details          TEXT,
  sizing           TEXT,
  sizes            TEXT[] DEFAULT '{}',
  fabric           TEXT,
  color            TEXT,
  rental_price     INTEGER NOT NULL,
  availability     TEXT NOT NULL DEFAULT 'Available'
                     CHECK (availability IN ('Available', 'Limited', 'Unavailable')),
  unavailable_days INTEGER[] DEFAULT '{}',
  rental_note      TEXT,
  is_featured      BOOLEAN NOT NULL DEFAULT false,
  image            TEXT,
  sort_order       INTEGER NOT NULL DEFAULT 0,
  is_public        BOOLEAN NOT NULL DEFAULT true,
  created_at       TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at       TIMESTAMPTZ NOT NULL DEFAULT now()
);

COMMENT ON TABLE products IS 'Showcase products (dresses) for the MK Studio catalogue';
COMMENT ON COLUMN products.slug IS 'URL-safe unique identifier';
COMMENT ON COLUMN products.rental_price IS 'Rental price in PHP (whole units)';
COMMENT ON COLUMN products.availability IS 'Current availability status';
COMMENT ON COLUMN products.unavailable_days IS 'Array of day-of-month numbers when the product is unavailable';
COMMENT ON COLUMN products.is_featured IS 'Whether the product is highlighted on the homepage';
COMMENT ON COLUMN products.image IS 'Primary/cover image path';
COMMENT ON COLUMN products.is_public IS 'Whether the product is visible in the public catalogue';

CREATE INDEX idx_products_slug ON products (slug);
CREATE INDEX idx_products_category_id ON products (category_id);
CREATE INDEX idx_products_availability ON products (availability);
CREATE INDEX idx_products_is_featured ON products (is_featured) WHERE is_featured = true;
CREATE INDEX idx_products_is_public ON products (is_public) WHERE is_public = true;
CREATE INDEX idx_products_sort_order ON products (sort_order);

-- =============================================================================
-- PRODUCT IMAGES
-- =============================================================================
CREATE TABLE product_images (
  id         UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  product_id UUID NOT NULL REFERENCES products(id) ON DELETE CASCADE,
  url        TEXT NOT NULL,
  alt_text   TEXT,
  sort_order INTEGER NOT NULL DEFAULT 0,
  is_primary BOOLEAN NOT NULL DEFAULT false,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

COMMENT ON TABLE product_images IS 'Additional images for a product (gallery)';
COMMENT ON COLUMN product_images.url IS 'Image path or URL';
COMMENT ON COLUMN product_images.is_primary IS 'Whether this is the primary display image';

CREATE INDEX idx_product_images_product_id ON product_images (product_id);
CREATE INDEX idx_product_images_is_primary ON product_images (is_primary) WHERE is_primary = true;

-- =============================================================================
-- UPDATED_AT TRIGGER
-- =============================================================================
-- Automatically update the updated_at column on row modification

CREATE OR REPLACE FUNCTION update_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trg_categories_updated_at
  BEFORE UPDATE ON categories
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at();

CREATE TRIGGER trg_products_updated_at
  BEFORE UPDATE ON products
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at();
