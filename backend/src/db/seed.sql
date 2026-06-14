-- INSERT INTO homestays (
--   homestay_id, owner_id, title, description, price_per_hour, is_verified, status, latitude, longitude, address, city
-- ) VALUES
--   ('HS001', 'OWN01', 'Homestay Da Lat View', 'Phong view doi, gan trung tam', 150000, TRUE, 'approved', 11.9404, 108.4583, '123 Tran Phu', 'Da Lat'),
--   ('HS002', 'OWN02', 'Coastal Homestay Nha Trang', 'Gan bien, co be boi', 200000, TRUE, 'approved', 12.2388, 109.1967, '45 Tran Phu', 'Nha Trang'),
--   ('HS003', 'OWN01', 'Budget Room Da Lat', 'Gia re, phu hop sinh vien', 80000, FALSE, 'pending', 11.9465, 108.4419, '8 Nguyen Chi Thanh', 'Da Lat')
-- ON CONFLICT (homestay_id) DO NOTHING;

INSERT INTO users(password, first_name, last_name, email, phone_number, role)
VALUES
  ('123', 'A', 'Nguyen', 'a.nguyen@gmail.com', '+8412345678', 'common'),
  ('321', 'B', 'Tran', 'b.tran@gmail.com', '+8443215678', 'owner'),
  ('000', 'B', 'Tran', 'b.tran.admin@gmail.com', '+8443215678', 'admin')
ON CONFLICT (user_id) DO NOTHING;
  
INSERT INTO owners (owner_id, bank_account_number)
VALUES 
  (1, '0123'), 
  (2, '2345'), 
  (3, '3456')
ON CONFLICT (owner_id) DO NOTHING;

INSERT INTO homestays (
  owner_id, title, description, price_per_hour, is_verified, status, latitude, longitude, address, city
) VALUES
  (1, 'Homestay Da Lat View', 'Phong view doi, gan trung tam', 150000, TRUE, 'approved', 11.9404, 108.4583, '123 Tran Phu', 'Da Lat'),
  (2, 'Coastal Homestay Nha Trang', 'Gan bien, co be boi', 200000, TRUE, 'approved', 12.2388, 109.1967, '45 Tran Phu', 'Nha Trang'),
  (3, 'Budget Room Da Lat', 'Gia re, phu hop sinh vien', 80000, FALSE, 'pending', 11.9465, 108.4419, '8 Nguyen Chi Thanh', 'Da Lat')
ON CONFLICT (homestay_id) DO NOTHING;