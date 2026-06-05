INSERT INTO homestays (
  homestay_id, owner_id, title, description, price_per_hour, is_verified,
  latitude, longitude, address, city
) VALUES
  ('HS001', 'OWN01', 'Homestay Da Lat View', 'Phong view doi, gan trung tam', 150000, TRUE, 11.9404, 108.4583, '123 Tran Phu', 'Da Lat'),
  ('HS002', 'OWN02', 'Coastal Homestay Nha Trang', 'Gan bien, co be boi', 200000, TRUE, 12.2388, 109.1967, '45 Tran Phu', 'Nha Trang'),
  ('HS003', 'OWN01', 'Budget Room Da Lat', 'Gia re, phu hop sinh vien', 80000, FALSE, 11.9465, 108.4419, '8 Nguyen Chi Thanh', 'Da Lat')
ON CONFLICT (homestay_id) DO NOTHING;
