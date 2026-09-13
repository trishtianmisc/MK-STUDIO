-- Replace colour, fabric, sizing, description, details with style and length
-- style = current fabric values (e.g., "Stretch Fit", "Lace", "Satin")
-- length = last token from sizing string (e.g., "Mini", "Maxi", "Gown", "Midi")

-- 1. Add new columns
ALTER TABLE products ADD COLUMN IF NOT EXISTS style TEXT;
ALTER TABLE products ADD COLUMN IF NOT EXISTS length TEXT;

-- 2. Populate style from fabric
UPDATE products SET style = fabric WHERE fabric IS NOT NULL;

-- 3. Populate length by extracting last token from sizing (before the · delimiter)
UPDATE products SET length = TRIM(SPLIT_PART(sizing, '·', array_length(string_to_array(sizing, '·'), 1)))
WHERE sizing IS NOT NULL AND sizing != '';

-- 4. Drop old columns
ALTER TABLE products DROP COLUMN IF EXISTS color;
ALTER TABLE products DROP COLUMN IF EXISTS fabric;
ALTER TABLE products DROP COLUMN IF EXISTS sizing;
ALTER TABLE products DROP COLUMN IF EXISTS description;
ALTER TABLE products DROP COLUMN IF EXISTS details;
