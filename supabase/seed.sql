-- =============================================================================
-- MK Studio — Seed Data
-- =============================================================================
-- Run after table creation to populate initial categories.
-- Products will be migrated from client/src/data/catalogue.ts in a later phase.

INSERT INTO categories (slug, name, description, short, image, sort_order)
VALUES
  ('wedding-guest', 'Wedding guest', 'For the invitation', 'For the invitation', '/images/my-studio-wedding_fb88aaa2.jpg', 1),
  ('date-night', 'Date night', 'For after dark', 'For after dark', '/images/my-studio-date-night_9391da5f.jpg', 2),
  ('studio-to-dinner', 'Studio to dinner', 'For the whole day', 'For the whole day', '/images/my-studio-workwear_671a35a4.jpg', 3),
  ('consignment', 'Consignment', 'Pre-loved studio pieces', 'Pre-loved studio pieces', '/images/my-studio-mark_4967063e.png', 4)
ON CONFLICT (slug) DO NOTHING;
