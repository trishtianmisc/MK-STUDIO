ALTER TABLE products ADD COLUMN IF NOT EXISTS waist_in INTEGER;
ALTER TABLE products ADD COLUMN IF NOT EXISTS dress_length_in INTEGER;

ALTER TABLE products DROP CONSTRAINT IF EXISTS products_waist_in_range;
ALTER TABLE products ADD CONSTRAINT products_waist_in_range
  CHECK (waist_in IS NULL OR waist_in BETWEEN 1 AND 100);

ALTER TABLE products DROP CONSTRAINT IF EXISTS products_dress_length_in_range;
ALTER TABLE products ADD CONSTRAINT products_dress_length_in_range
  CHECK (dress_length_in IS NULL OR dress_length_in BETWEEN 1 AND 100);

COMMENT ON COLUMN products.waist_in IS 'Waist measurement in inches';
COMMENT ON COLUMN products.dress_length_in IS 'Garment measurement in inches, shoulder to hem';
