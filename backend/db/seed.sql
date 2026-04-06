-- Treco Seed Data — Nepal Trails
-- Run AFTER schema.sql: psql -U postgres -d treco_db -f seed.sql

INSERT INTO trails (name, description, difficulty, distance_km, duration_days, elevation_gain_m, max_altitude_m, location_name, region, latitude, longitude, permit_required, best_season, tea_houses_available) VALUES
('Annapurna Base Camp', 'Classic trek through rhododendron forests to the base of Annapurna at 4,130m. One of Nepal''s most popular treks with stunning mountain panoramas.', 'moderate', 110.0, 11, 2800, 4130, 'Pokhara', 'Annapurna', 28.5314, 83.8778, TRUE, 'March-May, September-November', TRUE),
('Everest Base Camp', 'Iconic trek to the base of the world''s highest peak through legendary Sherpa villages and monasteries.', 'challenging', 130.0, 14, 3600, 5364, 'Lukla', 'Khumbu', 28.0026, 86.8528, TRUE, 'March-May, September-November', TRUE),
('Langtang Valley Trek', 'Beautiful trek into the Langtang Valley with Tamang villages, glaciers and views of Langtang Lirung.', 'moderate', 65.0, 7, 1900, 3870, 'Syabrubesi', 'Langtang', 28.2136, 85.5142, TRUE, 'March-May, October-December', TRUE),
('Poon Hill Trek', 'Short scenic trek offering stunning sunrise views over Dhaulagiri and Annapurna from Poon Hill at 3,210m.', 'easy', 42.0, 4, 1600, 3210, 'Pokhara', 'Annapurna', 28.3974, 83.6912, FALSE, 'October-April', TRUE),
('Shivapuri Day Hike', 'Popular day hike near Kathmandu in Shivapuri Nagarjun National Park with city views.', 'easy', 14.0, 1, 700, 2732, 'Kathmandu', 'Bagmati', 27.8194, 85.3606, TRUE, 'Year-round', FALSE),
('Nagarkot Sunrise Hike', 'Easy hike to Nagarkot for breathtaking sunrise views of the Himalayas including Everest on clear days.', 'easy', 10.0, 1, 400, 2175, 'Bhaktapur', 'Bagmati', 27.7153, 85.5154, FALSE, 'October-April', FALSE),
('Gokyo Lakes Trek', 'Trek to the sacred turquoise Gokyo Lakes and climb Gokyo Ri for panoramic views of four 8000m peaks.', 'hard', 120.0, 13, 3800, 5357, 'Lukla', 'Khumbu', 27.9614, 86.6853, TRUE, 'March-May, September-November', TRUE),
('Mardi Himal Trek', 'Newer and quieter trail in the Annapurna region with excellent views of Machapuchare and Annapurna.', 'moderate', 52.0, 6, 2200, 4500, 'Pokhara', 'Annapurna', 28.4667, 83.9500, TRUE, 'March-May, October-December', TRUE)
ON CONFLICT DO NOTHING;
