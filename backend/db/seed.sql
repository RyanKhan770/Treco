-- Treco Seed Data — Nepal Trails
-- Names MUST match kathmandu_trails.js exactly (case-insensitive) for mergeTrail() to work.
-- Run AFTER schema.sql:  psql -U postgres -d treco_db -f seed.sql
--
-- Safe to re-run: DELETE+INSERT instead of INSERT ON CONFLICT
-- so stale duplicates are removed automatically.

DELETE FROM trails WHERE name IN (
  'Sundarijal – Chisapani',
  'Shivapuri Peak',
  'Nagarkot to Changu Narayan',
  'Phulchowki Hill',
  'Champadevi Hill',
  'Nagarjun Forest Reserve',
  'Chandragiri Hill',
  'Dhulikhel – Namobuddha – Panauti',
  'Langtang Valley Trek',
  'Gosaikunda Lake Trek',
  -- old / mismatched names that may exist from previous seeds
  'Shivapuri Day Hike',
  'Nagarkot Sunrise Hike',
  'Annapurna Base Camp',
  'Everest Base Camp',
  'Poon Hill Trek',
  'Gokyo Lakes Trek',
  'Mardi Himal Trek'
);

INSERT INTO trails (
  name, description, difficulty, distance_km, duration_days,
  elevation_gain_m, max_altitude_m, location_name, region,
  latitude, longitude, permit_required, best_season, tea_houses_available
) VALUES

-- ── Day Hikes ──────────────────────────────────────────────────────────────

('Sundarijal – Chisapani',
 'The most popular day hike from Kathmandu. Climbs steeply from Sundarijal reservoir through dense subtropical forest and past Mulkharka village to the Chisapani ridge (2,175m) with sweeping views of the Langtang and Jugal Himalaya.',
 'hard', 10.0, 1, 1085, 2175, 'Sundarijal', 'Shivapuri Nagarjun National Park',
 27.7590, 85.4207, TRUE, 'Mar–May, Sep–Nov', FALSE),

('Shivapuri Peak',
 'The classic full-day summit hike inside Shivapuri Nagarjun National Park. A circuit from Budhanilkantha gate passes Nagi Gumba (Buddhist nunnery), the sacred Baghdwar springs, and reaches Shivapuri summit (2,732m) with 360° views of eight Himalayan ranges.',
 'hard', 20.5, 1, 1850, 2732, 'Budhanilkantha', 'Shivapuri Nagarjun National Park',
 27.8003, 85.3609, TRUE, 'Oct–May', FALSE),

('Nagarkot to Changu Narayan',
 'A classic ridge walk from Nagarkot (2,175m) to the 4th-century UNESCO World Heritage temple of Changu Narayan (1,541m). Forested ridge with sweeping views of the Himalayas, traditional Tamang villages, and terraced rice paddies.',
 'easy', 14.0, 1, NULL, 2175, 'Nagarkot', 'Bhaktapur District',
 27.7175, 85.5237, FALSE, 'Year-round (avoid monsoon)', FALSE),

('Phulchowki Hill',
 'The highest hill surrounding Kathmandu Valley at 2,782m and a birdwatcher''s paradise (270+ species recorded). Trail from Godawari Botanical Garden through dense rhododendron, oak, and cloud forest. Army checkpoint near the summit.',
 'hard', 14.0, 1, 1230, 2782, 'Godawari', 'Lalitpur District',
 27.5943, 85.3782, FALSE, 'Feb–May, Oct–Nov', FALSE),

('Champadevi Hill',
 'A rewarding half-day hike from ancient Pharping. The trail passes Asura and Yanglesho Buddhist meditation caves before reaching the Champadevi Hindu summit shrine (2,285m) with views of Langtang Himal and Kathmandu Valley.',
 'moderate', 9.0, 1, 497, 2285, 'Pharping', 'Dakshinkali',
 27.5870, 85.2852, FALSE, 'Year-round', FALSE),

('Nagarjun Forest Reserve',
 'The closest national-park summit to Thamel (30 min taxi). Trail winds through pristine sal and pine forest to Jamacho Gompa (2,096m), a Buddhist stupa with a viewing tower offering panoramic valley and Himalayan views.',
 'moderate', 9.5, 1, 728, 2096, 'Balaju', 'Shivapuri Nagarjun National Park',
 27.7350, 85.2990, TRUE, 'Year-round', FALSE),

('Chandragiri Hill',
 'Chandragiri (2,551m) on the south-western rim of the Kathmandu Valley offers arguably the broadest Himalayan panorama near the city — from Dhaulagiri to Everest. Climbs to historic Bhaleshwor Mahadev temple. Cable car alternative available.',
 'moderate', 8.0, 1, 524, 2551, 'Thankot', 'Chandragiri Municipality',
 27.6720, 85.2148, FALSE, 'Oct–May', FALSE),

('Dhulikhel – Namobuddha – Panauti',
 'A gentle cultural walk through rolling terraced hills east of Kathmandu. From Dhulikhel (Himalayan views) to sacred Namobuddha monastery and on to ancient Panauti Newari town at the confluence of two rivers.',
 'easy', 13.0, 1, 490, 1750, 'Dhulikhel', 'Kavre District',
 27.6221, 85.5428, FALSE, 'Oct–May', FALSE),

-- ── Multi-Day Treks ────────────────────────────────────────────────────────

('Langtang Valley Trek',
 'The closest major Himalayan trek to Kathmandu (7–8 hr by bus). Follows the Langtang Khola through subtropical jungle, bamboo forest, Tamang villages, and glacial meadows to Kyanjin Gompa (3,870m). Optional Tserko Ri summit at 4,984m.',
 'hard', 80.0, 7, 3524, 4984, 'Syabrubesi', 'Langtang National Park',
 28.1618, 85.3365, TRUE, 'Mar–May, Oct–Nov', TRUE),

('Gosaikunda Lake Trek',
 'A sacred Hindu pilgrimage lake at 4,380m, revered as the birthplace of Lord Shiva''s trident spring. Trek climbs from Dhunche through Chandanbari/Sing Gompa (famous cheese factory) to Laurebina ridge and the stunning alpine lake.',
 'hard', 40.0, 5, 2420, 4380, 'Dhunche', 'Langtang National Park',
 28.1058, 85.2835, TRUE, 'Apr–Jun, Oct–Nov', TRUE);
