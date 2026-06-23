DROP TABLE IF EXISTS amenities CASCADE;
DROP TABLE IF EXISTS locations CASCADE;
DROP TABLE IF EXISTS feedbacks CASCADE;
DROP TABLE IF EXISTS payouts CASCADE;
DROP TABLE IF EXISTS transactions CASCADE;
DROP TABLE IF EXISTS bookings CASCADE;
DROP TABLE IF EXISTS homestays CASCADE;
DROP TABLE IF EXISTS owners CASCADE;
DROP TABLE IF EXISTS admins CASCADE;
DROP TABLE IF EXISTS users CASCADE;

CREATE TABLE IF NOT EXISTS users (
  user_id       SERIAL        PRIMARY KEY,
  password_hash TEXT          NOT NULL,
  password_salt TEXT          NOT NULL,
  first_name    VARCHAR(255)  NOT NULL, 
  last_name     VARCHAR(255)  NOT NULL, 
  email         VARCHAR(255)  UNIQUE NOT NULL, 
  phone_number  VARCHAR(20)   NOT NULL, 
  role          VARCHAR(10)   NOT NULL CHECK (role IN ('common', 'owner', 'admin')) DEFAULT 'common'
);

CREATE TABLE IF NOT EXISTS admins (
  admin_id   INT         PRIMARY KEY REFERENCES users(user_id) ON DELETE CASCADE,
  admin_code VARCHAR(50) UNIQUE NOT NULL
);

CREATE TABLE IF NOT EXISTS owners (
  owner_id            INT         PRIMARY KEY REFERENCES users(user_id) ON DELETE CASCADE,
  bank_name VARCHAR(100) NOT NULL,
  bank_account_name VARCHAR(100) NOT NULL,
  bank_account_number VARCHAR(50) NOT NULL
);

CREATE TABLE IF NOT EXISTS homestays (
  homestay_id SERIAL PRIMARY KEY,
  owner_id INT NOT NULL REFERENCES owners(owner_id) ON DELETE CASCADE,
  title VARCHAR(255) NOT NULL,
  description TEXT,
  rental_type VARCHAR(10) NOT NULL default 'hourly' CHECK (rental_type IN ('hourly', 'daily')),
  price_per_hour NUMERIC(12, 2) NOT NULL,
  check_in_time TIME DEFAULT '14:00:00',
  check_out_time TIME DEFAULT '10:00:00',
  is_verified BOOLEAN DEFAULT FALSE,
  status VARCHAR(20) NOT NULL DEFAULT 'pending',
  rejection_reason TEXT,
  cancellation_policy VARCHAR(20) NOT NULL DEFAULT 'flexible' CHECK (cancellation_policy IN ('flexible', 'moderate', 'strict')),
  created_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP
);


CREATE TABLE IF NOT EXISTS bookings (
  booking_id    SERIAL      PRIMARY KEY,
  homestay_id   INT         NOT NULL REFERENCES homestays(homestay_id) ON DELETE CASCADE,
  guest_id      INT         NOT NULL REFERENCES users(user_id) ON DELETE CASCADE,
  number_of_guests  INT NOT NULL,
  check_in_date TIMESTAMPTZ NOT NULL,
  check_out_date TIMESTAMPTZ NOT NULL CHECK (check_out_date > check_in_date),
  total_price   NUMERIC(12, 2),
  status        VARCHAR(20) NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'approved', 'rejected', 'confirmed', 'cancelled', 'completed', 'refunded')),
  created_at    TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS transactions (
  transaction_id   SERIAL        PRIMARY KEY,
  booking_id       INT           NOT NULL REFERENCES bookings(booking_id) ON DELETE CASCADE,
  amount           NUMERIC(12,2) NOT NULL,
  payment_method   VARCHAR(50)   NOT NULL,
  transaction_date TIMESTAMPTZ   NOT NULL DEFAULT CURRENT_TIMESTAMP,
  status           VARCHAR(50)   NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'success', 'failed', 'refunded'))
);

CREATE TABLE IF NOT EXISTS payouts (
  payout_id        SERIAL        PRIMARY KEY,
  booking_id       INT           NOT NULL UNIQUE REFERENCES bookings(booking_id) ON DELETE CASCADE,
  owner_id         INT           NOT NULL REFERENCES owners(owner_id) ON DELETE CASCADE,
  amount           NUMERIC(12,2) NOT NULL, 
  status           VARCHAR(20)   NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'processing', 'completed', 'failed')),
  payout_date      TIMESTAMPTZ,
  created_at       TIMESTAMPTZ   NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS feedbacks (
  feedback_id      SERIAL      PRIMARY KEY,
  booking_id       INT         NOT NULL UNIQUE REFERENCES bookings(booking_id) ON DELETE CASCADE,
  homestay_id      INT         NOT NULL REFERENCES homestays(homestay_id) ON DELETE CASCADE,
  guest_id         INT         NOT NULL REFERENCES users(user_id) ON DELETE CASCADE,
  rating           INT         NOT NULL CHECK (rating BETWEEN 1 AND 5),
  feedback_date    TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
  feedback_message TEXT        NOT NULL
);

CREATE TABLE IF NOT EXISTS locations (
  location_id SERIAL        PRIMARY KEY,
  homestay_id INT           NOT NULL UNIQUE REFERENCES homestays(homestay_id) ON DELETE CASCADE,
  latitude    DECIMAL(9,6),
  longitude   DECIMAL(9,6),
  address     VARCHAR(255)  NOT NULL,
  city        VARCHAR(100)  NOT NULL
);

CREATE TABLE IF NOT EXISTS amenities (
  homestay_id          INT     PRIMARY KEY REFERENCES homestays(homestay_id) ON DELETE CASCADE,
  number_of_beds       INT     NOT NULL DEFAULT 0 CHECK (number_of_beds >= 0),
  number_of_bedrooms   INT     NOT NULL DEFAULT 0 CHECK (number_of_bedrooms >= 0),
  max_guests           INT     NOT NULL DEFAULT 1 CHECK (max_guests > 0),
  has_wifi             BOOLEAN NOT NULL DEFAULT FALSE,
  has_air_conditioning BOOLEAN NOT NULL DEFAULT FALSE,
  has_kitchen          BOOLEAN NOT NULL DEFAULT FALSE,
  has_bathtub          BOOLEAN NOT NULL DEFAULT FALSE,
  has_tv               BOOLEAN NOT NULL DEFAULT FALSE,
  has_parking          BOOLEAN NOT NULL DEFAULT FALSE,
  is_pet_friendly      BOOLEAN NOT NULL DEFAULT FALSE
);



-- -- Idempotent upgrades for existing databases (re-runnable via npm run db:init).
-- ALTER TABLE homestays ADD COLUMN IF NOT EXISTS status VARCHAR(20) NOT NULL DEFAULT 'pending';
-- ALTER TABLE homestays ADD COLUMN IF NOT EXISTS rejection_reason TEXT;
