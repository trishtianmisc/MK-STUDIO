-- =============================================================================
-- MK Studio — Seed: single test product
-- =============================================================================
-- Inserts 1 category and 1 product for testing the catalogue flow.
-- Safe to re-run: uses ON CONFLICT to avoid duplicates.

INSERT INTO categories (slug, name, description, image, sort_order)
VALUES (
  'wedding-guest',
  'Wedding guest',
  'For the invitation with a little more expectation.',
  '/images/my-studio-wedding_fb88aaa2.jpg',
  1
)
ON CONFLICT (slug) DO NOTHING;

INSERT INTO products (
  category_id,
  slug,
  name,
  description,
  details,
  sizing,
  sizes,
  fabric,
  color,
  rental_price,
  availability,
  unavailable_days,
  rental_note,
  is_featured,
  image,
  sort_order,
  is_public
)
SELECT
  c.id,
  'velvet-evening-slip',
  'The Velvet Evening Slip',
  'A floor-length burgundy velvet slip with a softly draped neckline that catches the light as you move.',
  'Fully lined with a concealed side zip. A dramatic but effortless choice for receptions and late tables.',
  'Fits UK 6-12; true to size.',
  ARRAY['UK 6', 'UK 8', 'UK 10', 'UK 12'],
  'Silk velvet',
  'Burgundy',
  1800,
  'Available',
  ARRAY[12, 13, 25]::integer[],
  '3-day rental · Professional care included',
  true,
  '/images/dress-wedding-01_6dc2cc7f.jpg',
  1,
  true
FROM categories c
WHERE c.slug = 'wedding-guest'
  AND NOT EXISTS (SELECT 1 FROM products WHERE slug = 'velvet-evening-slip');
