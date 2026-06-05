CREATE TABLE IF NOT EXISTS homestays (
  homestay_id VARCHAR(32) PRIMARY KEY,
  owner_id VARCHAR(32) NOT NULL,
  title VARCHAR(255) NOT NULL,
  description TEXT,
  price_per_hour NUMERIC(12, 2) NOT NULL,
  is_verified BOOLEAN DEFAULT FALSE,
  latitude DOUBLE PRECISION,
  longitude DOUBLE PRECISION,
  address VARCHAR(255),
  city VARCHAR(100)
);
