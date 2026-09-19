CREATE INDEX idx_products_public_filters
  ON products (is_public, style, rental_price)
  WHERE is_public = true;
