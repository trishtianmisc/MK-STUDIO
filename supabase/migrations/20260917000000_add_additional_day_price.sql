ALTER TABLE products ADD COLUMN additional_day_price INTEGER;

COMMENT ON COLUMN products.additional_day_price IS 'Price per additional rental day beyond the base 3-day term';
