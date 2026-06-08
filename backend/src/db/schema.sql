CREATE TABLE IF NOT EXISTS homestays (
  homestay_id VARCHAR(32) PRIMARY KEY,
  owner_id VARCHAR(32) NOT NULL,
  title VARCHAR(255) NOT NULL,
  description TEXT,
  price_per_hour NUMERIC(12, 2) NOT NULL,
  is_verified BOOLEAN DEFAULT FALSE,
  status VARCHAR(20) NOT NULL DEFAULT 'pending',
  rejection_reason TEXT,
  latitude DOUBLE PRECISION,
  longitude DOUBLE PRECISION,
  address VARCHAR(255),
  city VARCHAR(100)
);

CREATE TABLE IF NOT EXISTS users (
  user_id       VARCHAR(32)   PRIMARY KEY,
  password      TEXT          NOT NULL, 
  first_name    VARCHAR(255)  NOT NULL, 
  last_name     VARCHAR(255)  NOT NULL, 
  email         VARCHAR(255)  UNIQUE NOT NULL, 
  phone_number  VARCHAR(20)   NOT NULL, 
  role          VARCHAR(10)   NOT NULL CHECK (role IN ('common', 'owner', 'admin')) DEFAULT 'common'
)

-- Idempotent upgrades for existing databases (re-runnable via npm run db:init).
ALTER TABLE homestays ADD COLUMN IF NOT EXISTS status VARCHAR(20) NOT NULL DEFAULT 'pending';
ALTER TABLE homestays ADD COLUMN IF NOT EXISTS rejection_reason TEXT;