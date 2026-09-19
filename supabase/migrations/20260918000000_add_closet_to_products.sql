ALTER TABLE products ADD COLUMN closet TEXT NOT NULL DEFAULT 'MK STUDIO';

COMMENT ON COLUMN products.closet IS 'Closet or collection the product belongs to';
