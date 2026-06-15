INSERT INTO users (
  user_id, password_hash, password_salt, first_name, last_name, email, phone_number, role
) VALUES
  (
    1,
    'e8aacb5784c8edbacd5d3cc61ee4281787862ac6dfa96511af1f9e9407486608b319f0964e0d0262f0e133dfc7c6290f7cd51021aa0a3b3a50503bc9fa985071',
    '5f8b1844102f33480ab9a8e523c8229a',
    'Common',
    'User',
    'user@example.com',
    '+8411111111',
    'common'
  ),
  (
    2,
    '5b69461ac912e76de35886ae05314d79c4a1ae8903ee0f29415b8a6600934fd6b2b5490b5c9ee93feeb0686c12a93ad54ea9278a0e072abdd141ede6ae52f37e',
    '285653d33f9a2bb6ae2937400550dc0a',
    'Owner',
    'User',
    'owner@example.com',
    '+8422222222',
    'owner'
  ),
  (
    3,
    '875436da31c42051020bfc390180ae0c675de3300176d7b7a4a0ccc152adf145032b6ccd6da1fcf2357aaf9c24a2a7651518537206ae7df492b6571bad55ef98',
    'b1a118796667c8418695a178b8787030',
    'Admin',
    'User',
    'admin@example.com',
    '+8433333333',
    'admin'
  );

INSERT INTO owners (owner_id, bank_account_number)
VALUES (2, '0123456789');

INSERT INTO admins (admin_id, admin_code)
VALUES (3, 'ADMIN-001');

INSERT INTO homestays (
  homestay_id, owner_id, title, description, price_per_hour, is_verified, status, rejection_reason, created_at
) VALUES
  (
    1,
    2,
    'Homestay Da Lat View',
    'Room with hillside view near the center, suitable for small groups and remote work.',
    150000,
    TRUE,
    'approved',
    NULL,
    '2026-01-01T10:00:00Z'
  ),
  (
    2,
    2,
    'Coastal Homestay Nha Trang',
    'Near the beach with an open layout, convenient for families.',
    200000,
    TRUE,
    'approved',
    NULL,
    '2026-01-02T10:00:00Z'
  ),
  (
    3,
    2,
    'Budget Room Da Lat',
    'Budget room near the market and main attractions.',
    80000,
    FALSE,
    'pending',
    NULL,
    '2026-01-03T10:00:00Z'
  ),
  (
    4,
    2,
    'Rejected Garden House',
    'Sample rejected listing for status checks.',
    120000,
    FALSE,
    'rejected',
    'Please upload clearer property details.',
    '2026-01-04T10:00:00Z'
  ),
  (
    5,
    2,
    'Hanoi Old Quarter Loft',
    'Bright loft tucked inside the Old Quarter with easy access to cafes, Hoan Kiem Lake, and weekend walking streets.',
    180000,
    TRUE,
    'approved',
    NULL,
    '2026-01-05T10:00:00Z'
  ),
  (
    6,
    2,
    'Hoi An Lantern Villa',
    'Quiet villa near the ancient town with a garden courtyard for families and small groups.',
    220000,
    TRUE,
    'approved',
    NULL,
    '2026-01-06T10:00:00Z'
  ),
  (
    7,
    2,
    'Da Nang Beach Studio',
    'Modern studio close to My Khe Beach with workspace, balcony, and quick access to seafood restaurants.',
    170000,
    FALSE,
    'pending',
    NULL,
    '2026-01-07T10:00:00Z'
  ),
  (
    8,
    2,
    'Sa Pa Mountain Retreat',
    'Wooden retreat overlooking terraced rice fields, suitable for guests planning trekking trips.',
    160000,
    TRUE,
    'approved',
    NULL,
    '2026-01-08T10:00:00Z'
  ),
  (
    9,
    2,
    'Hue Riverside Heritage Room',
    'Heritage-style room near the Perfume River and imperial sites, pending document verification.',
    130000,
    FALSE,
    'pending',
    NULL,
    '2026-01-09T10:00:00Z'
  ),
  (
    10,
    2,
    'Phu Quoc Sunset Bungalow',
    'Beach bungalow sample rejected for admin review workflows and owner resubmission testing.',
    240000,
    FALSE,
    'rejected',
    'Please provide updated safety certification and clearer exterior photos.',
    '2026-01-10T10:00:00Z'
  );

INSERT INTO locations (homestay_id, latitude, longitude, address, city)
VALUES
  (1, 11.940400, 108.458300, '123 Tran Phu', 'Da Lat'),
  (2, 12.238800, 109.196700, '45 Tran Phu', 'Nha Trang'),
  (3, 11.946500, 108.441900, '8 Nguyen Chi Thanh', 'Da Lat'),
  (4, 10.762622, 106.660172, '10 Le Loi', 'Ho Chi Minh City'),
  (5, 21.030653, 105.847130, '18 Hang Gai', 'Hanoi'),
  (6, 15.879444, 108.335000, '27 Nguyen Thai Hoc', 'Hoi An'),
  (7, 16.054407, 108.244789, '92 Vo Nguyen Giap', 'Da Nang'),
  (8, 22.336360, 103.843786, '15 Fansipan', 'Sa Pa'),
  (9, 16.463713, 107.590866, '6 Le Loi', 'Hue'),
  (10, 10.289879, 103.984020, '44 Tran Hung Dao', 'Phu Quoc');

INSERT INTO amenities (
  homestay_id,
  number_of_beds,
  number_of_bedrooms,
  max_guests,
  has_wifi,
  has_air_conditioning,
  has_kitchen,
  has_bathtub,
  has_tv,
  has_parking,
  is_pet_friendly
) VALUES
  (1, 3, 2, 4, TRUE, TRUE, TRUE, FALSE, TRUE, TRUE, FALSE),
  (2, 4, 3, 6, TRUE, TRUE, TRUE, TRUE, TRUE, TRUE, TRUE),
  (3, 1, 1, 2, TRUE, FALSE, FALSE, FALSE, FALSE, FALSE, FALSE),
  (4, 2, 2, 4, TRUE, TRUE, TRUE, FALSE, TRUE, FALSE, TRUE),
  (5, 2, 1, 3, TRUE, TRUE, FALSE, FALSE, TRUE, FALSE, FALSE),
  (6, 5, 3, 7, TRUE, TRUE, TRUE, TRUE, TRUE, TRUE, TRUE),
  (7, 1, 1, 2, TRUE, TRUE, TRUE, FALSE, TRUE, TRUE, FALSE),
  (8, 3, 2, 5, TRUE, FALSE, TRUE, FALSE, FALSE, TRUE, TRUE),
  (9, 2, 1, 4, TRUE, TRUE, FALSE, TRUE, TRUE, FALSE, FALSE),
  (10, 4, 2, 6, TRUE, TRUE, TRUE, TRUE, TRUE, TRUE, FALSE);

INSERT INTO bookings (
  booking_id, homestay_id, guest_id, check_in_date, check_out_date, total_price, status, created_at
) VALUES
  (1, 1, 1, '2026-01-15T09:00:00Z', '2026-01-15T15:00:00Z', 900000, 'completed', '2026-01-10T10:00:00Z'),
  (2, 2, 1, '2026-02-01T10:00:00Z', '2026-02-01T16:00:00Z', 1200000, 'confirmed', '2026-01-20T10:00:00Z'),
  (3, 1, 1, '2026-07-01T10:00:00Z', '2026-07-01T14:00:00Z', 600000, 'pending', '2026-06-01T10:00:00Z');

INSERT INTO transactions (
  transaction_id, booking_id, amount, payment_method, transaction_date, status
) VALUES
  (1, 1, 900000, 'credit_card', '2026-01-10T10:05:00Z', 'confirmed'),
  (2, 2, 1200000, 'bank_transfer', '2026-01-20T10:05:00Z', 'confirmed');

INSERT INTO feedbacks (
  feedback_id, booking_id, homestay_id, guest_id, rating, feedback_date, feedback_message
) VALUES
  (1, 1, 1, 1, 5, '2026-01-16T08:00:00Z', 'Great stay with a clean room and helpful owner.');

SELECT setval('users_user_id_seq', (SELECT MAX(user_id) FROM users));
SELECT setval('homestays_homestay_id_seq', (SELECT MAX(homestay_id) FROM homestays));
SELECT setval('bookings_booking_id_seq', (SELECT MAX(booking_id) FROM bookings));
SELECT setval('transactions_transaction_id_seq', (SELECT MAX(transaction_id) FROM transactions));
SELECT setval('feedbacks_feedback_id_seq', (SELECT MAX(feedback_id) FROM feedbacks));
SELECT setval('locations_location_id_seq', (SELECT MAX(location_id) FROM locations));
