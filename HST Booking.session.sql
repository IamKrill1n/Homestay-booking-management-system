CREATE TABLE bookings (
  booking_id SERIAL PRIMARY KEY,
  homestay_id INT NOT NULL,
  guest_id INT NOT NULL,
  check_in_date DATE NOT NULL,
  check_out_date DATE NOT NULL,
  status VARCHAR(50) DEFAULT 'Pending'
);