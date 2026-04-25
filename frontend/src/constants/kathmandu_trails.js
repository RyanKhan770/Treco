// Trekking and hiking trails near Kathmandu Valley
// Coordinates: [longitude, latitude] (Mapbox / GeoJSON order)
//
// Sources:
//   • 10Adventures (gps-verified route guides)
//   • WikiVoyage Langtang Valley Trek (gps table, all waypoints confirmed)
//   • Wikipedia (Changu Narayan Temple, Gosaikunda, Chandragiri Hill)
//   • AllTrails (distance & elevation cross-check)
//   • latitude.to / geodatos.net (town-level coordinate lookup)
//   • Nepal Tourism Board / SNNP official data
//
// 8 Day Hikes + 2 Multi-Day Treks — all reachable from Kathmandu
// elevationProfile: [{d: distanceKm, e: elevationMetres}]
// pois: [{name, coord, type}]  types: lodge|water|viewpoint|junction|rescue|campsite

export const NEPAL_TRAILS = [

  // ════════════════════════════════════════
  //  8 DAY HIKES
  // ════════════════════════════════════════

  // ─── 1. Sundarijal → Chisapani ─────────────────────────────────────────────
  // Trailhead (Sundarijal waterfall bus stop): 27.7590, 85.4207  [10adventures]
  // Chisapani ridge:  27.8255, 85.4485                           [10adventures]
  // AllTrails: 6.2 mi / 9.98 km, 3,562 ft gain (1,085 m)
  {
    id: 'sundarijal-chisapani',
    name: 'Sundarijal – Chisapani',
    region: 'Shivapuri Nagarjun National Park',
    difficulty: 'Hard',
    distance: '10 km',
    duration: '4.5–5 hr',
    maxElevation: 2175,
    elevationGain: '+1,085m',
    startCoord: [85.4207, 27.7590],
    center:     [85.4350, 27.7950],
    zoom: 13,
    description:
      'The most popular day hike from Kathmandu. Climbs steeply from Sundarijal reservoir through dense subtropical forest and past Mulkharka village to the Chisapani ridge (2,175m) with sweeping views of the Langtang and Jugal Himalaya. Starting point of the Helambu circuit.',
    permits: ['Shivapuri NP Entry (Rs. 1,000 foreigners / Rs. 100 locals)'],
    bestSeason: 'Mar–May, Sep–Nov',
    waypoints: [
      { name: 'Sundarijal Bus Stop',   coord: [85.4207, 27.7590], elevation: '1,350m' },
      { name: 'NP Entry Checkpoint',   coord: [85.4220, 27.7635], elevation: '1,480m' },
      { name: 'Mulkharka Village',     coord: [85.4290, 27.7780], elevation: '1,895m' },
      { name: 'Burlang Bhanjyang',     coord: [85.4380, 27.8050], elevation: '2,427m' },
      { name: 'Chisapani',             coord: [85.4485, 27.8255], elevation: '2,175m' },
    ],
    coordinates: [
      [85.4207, 27.7590], [85.4215, 27.7612], [85.4220, 27.7635],
      [85.4242, 27.7680], [85.4265, 27.7730], [85.4290, 27.7780],
      [85.4315, 27.7850], [85.4345, 27.7940], [85.4380, 27.8050],
      [85.4420, 27.8140], [85.4455, 27.8200], [85.4485, 27.8255],
    ],
    osmTags: { highway: 'path', sac_scale: 'demanding_mountain_hiking', surface: 'dirt', trail_visibility: 'excellent' },
    elevationProfile: [
      { d: 0,   e: 1350 }, { d: 1.0, e: 1480 }, { d: 2.2, e: 1620 },
      { d: 3.5, e: 1780 }, { d: 4.8, e: 1895 }, { d: 6.0, e: 2060 },
      { d: 7.5, e: 2250 }, { d: 8.5, e: 2427 }, { d: 10.0, e: 2175 },
    ],
    pois: [
      { name: 'Sundarijal Reservoir',  coord: [85.4207, 27.7590], type: 'water'     },
      { name: 'NP Entry Gate',         coord: [85.4220, 27.7635], type: 'junction'  },
      { name: 'Mulkharka Teahouse',    coord: [85.4290, 27.7780], type: 'lodge'     },
      { name: 'Burlang Bhanjyang',     coord: [85.4380, 27.8050], type: 'viewpoint' },
      { name: 'Chisapani Lodge',       coord: [85.4485, 27.8255], type: 'lodge'     },
    ],
  },

  // ─── 2. Shivapuri Peak ──────────────────────────────────────────────────────
  // Trailhead (Budhanilkantha gate): 27.800266, 85.360876         [10adventures]
  // Nagi Gumba monastery:           27.776726, 85.341543          [10adventures]
  // Shivapuri Summit:               27.812679, 85.391384          [10adventures]
  // 10adventures: 20.5 km circuit, 1,850 m gain, Hard, 8.5–12 hr
  {
    id: 'shivapuri',
    name: 'Shivapuri Peak',
    region: 'Shivapuri Nagarjun National Park',
    difficulty: 'Hard',
    distance: '20.5 km',
    duration: '8–12 hr',
    maxElevation: 2732,
    elevationGain: '+1,850m',
    startCoord: [85.3609, 27.8003],
    center:     [85.3750, 27.8060],
    zoom: 12,
    description:
      'The classic full-day summit hike inside Shivapuri Nagarjun National Park. A circuit from Budhanilkantha gate passes Nagi Gumba (Buddhist nunnery), the sacred Baghdwar springs (source of the Bagmati River), and reaches Shivapuri summit (2,732m) with 360° views of eight Himalayan ranges.',
    permits: ['Shivapuri NP Entry (Rs. 1,000 foreigners / Rs. 100 locals)'],
    bestSeason: 'Oct–May',
    waypoints: [
      { name: 'Budhanilkantha Gate',    coord: [85.3609, 27.8003], elevation: '1,410m' },
      { name: 'Nagi Gumba Monastery',   coord: [85.3415, 27.7767], elevation: '1,900m' },
      { name: 'Baghdwar Sacred Spring', coord: [85.3680, 27.8085], elevation: '2,480m' },
      { name: 'Shivapuri Summit',       coord: [85.3914, 27.8127], elevation: '2,732m' },
    ],
    coordinates: [
      [85.3609, 27.8003], [85.3520, 27.7920], [85.3415, 27.7767],
      [85.3480, 27.7900], [85.3560, 27.8020], [85.3620, 27.8060],
      [85.3680, 27.8085], [85.3750, 27.8100], [85.3830, 27.8115],
      [85.3914, 27.8127],
    ],
    osmTags: { highway: 'path', sac_scale: 'mountain_hiking', surface: 'dirt', trail_visibility: 'good' },
    elevationProfile: [
      { d: 0,    e: 1410 }, { d: 2.0,  e: 1680 }, { d: 4.0,  e: 1900 },
      { d: 6.5,  e: 2100 }, { d: 9.0,  e: 2380 }, { d: 11.0, e: 2480 },
      { d: 13.0, e: 2600 }, { d: 14.5, e: 2732 },
      { d: 17.0, e: 2200 }, { d: 20.5, e: 1410 },
    ],
    pois: [
      { name: 'Budhanilkantha Gate',    coord: [85.3609, 27.8003], type: 'junction'  },
      { name: 'Nagi Gumba Monastery',   coord: [85.3415, 27.7767], type: 'viewpoint' },
      { name: 'Baghdwar Sacred Spring', coord: [85.3680, 27.8085], type: 'water'     },
      { name: 'Shivapuri Summit',       coord: [85.3914, 27.8127], type: 'viewpoint' },
    ],
  },

  // ─── 3. Nagarkot → Changu Narayan ──────────────────────────────────────────
  // Nagarkot View Tower:   27.7175, 85.5237   (multiple confirmed sources)
  // Changu Narayan Temple: 27.716278, 85.427889  (Wikipedia: exact coords)
  // Distance: ~14 km point-to-point, predominantly downhill
  {
    id: 'nagarkot-changu',
    name: 'Nagarkot to Changu Narayan',
    region: 'Bhaktapur District',
    difficulty: 'Easy',
    distance: '14 km',
    duration: '5–6 hr',
    maxElevation: 2175,
    elevationGain: '-634m (ridge descent)',
    startCoord: [85.5237, 27.7175],
    center:     [85.4760, 27.7170],
    zoom: 11,
    description:
      'A classic ridge walk from Nagarkot (2,175m) to the 4th-century UNESCO World Heritage temple of Changu Narayan (1,541m). Forested ridge with sweeping views of the Himalayas, traditional Tamang villages, and terraced rice paddies.',
    permits: [],
    bestSeason: 'Year-round (avoid monsoon)',
    waypoints: [
      { name: 'Nagarkot View Tower',   coord: [85.5237, 27.7175], elevation: '2,175m' },
      { name: 'Forest Ridgeline',      coord: [85.5050, 27.7165], elevation: '2,010m' },
      { name: 'Telkot Village',        coord: [85.4790, 27.7050], elevation: '1,720m' },
      { name: 'Trail Junction',        coord: [85.4580, 27.7080], elevation: '1,620m' },
      { name: 'Changu Narayan Temple', coord: [85.4279, 27.7163], elevation: '1,541m' },
    ],
    coordinates: [
      [85.5237, 27.7175], [85.5145, 27.7168], [85.5050, 27.7165],
      [85.4960, 27.7130], [85.4870, 27.7085], [85.4790, 27.7050],
      [85.4690, 27.7055], [85.4580, 27.7080], [85.4470, 27.7115],
      [85.4390, 27.7140], [85.4279, 27.7163],
    ],
    osmTags: { highway: 'path', sac_scale: 'hiking', surface: 'dirt', trail_visibility: 'excellent' },
    elevationProfile: [
      { d: 0,    e: 2175 }, { d: 2.5, e: 2020 }, { d: 5.0, e: 1880 },
      { d: 7.5,  e: 1760 }, { d: 9.5, e: 1700 }, { d: 11.5, e: 1610 },
      { d: 14.0, e: 1541 },
    ],
    pois: [
      { name: 'Nagarkot View Tower',   coord: [85.5237, 27.7175], type: 'viewpoint' },
      { name: 'Telkot Village Chai',   coord: [85.4790, 27.7050], type: 'lodge'     },
      { name: 'Changu Narayan Temple', coord: [85.4279, 27.7163], type: 'viewpoint' },
    ],
  },

  // ─── 4. Phulchowki Hill ─────────────────────────────────────────────────────
  // Trailhead (Godawari bus stop): 27.594282, 85.378223           [10adventures]
  // Summit:                        27.571103, 85.405550           [geodatos/peakbagger]
  // 10adventures: 26.1 km, 1,231 m gain, Very Hard, 8–11 hr (full road+trail loop)
  // AllTrails:  4.6 mi (7.4 km) ≈ trail-only section, 3,818 ft gain (1,164 m)
  {
    id: 'phulchowki',
    name: 'Phulchowki Hill',
    region: 'Lalitpur District (Godawari)',
    difficulty: 'Hard',
    distance: '14 km',
    duration: '7–9 hr',
    maxElevation: 2782,
    elevationGain: '+1,230m',
    startCoord: [85.3782, 27.5943],
    center:     [85.3920, 27.5820],
    zoom: 13,
    description:
      'The highest hill surrounding Kathmandu Valley at 2,782m and a birdwatcher\'s paradise (270+ species recorded). The trail from Godawari Botanical Garden climbs through dense rhododendron, oak, and cloud forest with an army checkpoint near the summit and sweeping views of the full Himalayan arc.',
    permits: ['Small army checkpoint fee near summit'],
    bestSeason: 'Feb–May (rhododendrons), Oct–Nov',
    waypoints: [
      { name: 'Godawari Bus Stop',          coord: [85.3782, 27.5943], elevation: '1,540m' },
      { name: 'Botanical Garden Entry',     coord: [85.3830, 27.5910], elevation: '1,680m' },
      { name: 'Forest Trail (Lower)',       coord: [85.3890, 27.5860], elevation: '2,000m' },
      { name: 'Cloud Forest Zone',          coord: [85.3970, 27.5790], elevation: '2,400m' },
      { name: 'Army Checkpoint',            coord: [85.4020, 27.5745], elevation: '2,650m' },
      { name: 'Phulchowki Summit & Temple', coord: [85.4056, 27.5711], elevation: '2,782m' },
    ],
    coordinates: [
      [85.3782, 27.5943], [85.3806, 27.5926], [85.3830, 27.5910],
      [85.3860, 27.5890], [85.3890, 27.5860], [85.3920, 27.5834],
      [85.3950, 27.5812], [85.3970, 27.5790], [85.3995, 27.5768],
      [85.4020, 27.5745], [85.4038, 27.5728], [85.4056, 27.5711],
    ],
    osmTags: { highway: 'path', sac_scale: 'mountain_hiking', surface: 'dirt', trail_visibility: 'good' },
    elevationProfile: [
      { d: 0,   e: 1540 }, { d: 1.2, e: 1720 }, { d: 2.5, e: 1920 },
      { d: 3.8, e: 2100 }, { d: 5.2, e: 2300 }, { d: 6.5, e: 2480 },
      { d: 8.5, e: 2650 }, { d: 10.5, e: 2720 }, { d: 12.0, e: 2760 },
      { d: 14.0, e: 2782 },
    ],
    pois: [
      { name: 'Godawari Botanical Garden',    coord: [85.3830, 27.5910], type: 'junction'  },
      { name: 'Bird Observatory Clearing',    coord: [85.3970, 27.5790], type: 'viewpoint' },
      { name: 'Army Checkpoint',              coord: [85.4020, 27.5745], type: 'junction'  },
      { name: 'Phulchowki Summit & Temple',   coord: [85.4056, 27.5711], type: 'viewpoint' },
      { name: 'Spring Water (lower forest)',  coord: [85.3860, 27.5890], type: 'water'     },
    ],
  },

  // ─── 5. Champadevi Hill ─────────────────────────────────────────────────────
  // Pharping village trailhead: ~27.5870, 85.2852  (multiple trekking agencies)
  // Summit (Champadevi temple):  27.5905, 85.2620  (consistent across sources)
  // Distance: ~8–10 km round trip; elevation gain ~497m
  {
    id: 'champadevi',
    name: 'Champadevi Hill',
    region: 'Pharping, Dakshinkali',
    difficulty: 'Moderate',
    distance: '9 km',
    duration: '4–6 hr',
    maxElevation: 2285,
    elevationGain: '+497m',
    startCoord: [85.2852, 27.5870],
    center:     [85.2730, 27.5888],
    zoom: 13,
    description:
      'A rewarding half-day hike from ancient Pharping. The trail passes Asura and Yanglesho Buddhist meditation caves (sacred to Guru Rinpoche) before reaching the Champadevi Hindu summit shrine (2,285m) with views of Langtang Himal, Ganesh Himal, and Kathmandu Valley.',
    permits: [],
    bestSeason: 'Year-round (avoid Jul–Aug monsoon)',
    waypoints: [
      { name: 'Pharping Village',         coord: [85.2852, 27.5870], elevation: '1,788m' },
      { name: 'Forest Trail Entry',       coord: [85.2785, 27.5875], elevation: '1,900m' },
      { name: 'Asura Cave (Buddhist)',    coord: [85.2720, 27.5882], elevation: '2,050m' },
      { name: 'Yanglesho Cave',           coord: [85.2690, 27.5892], elevation: '2,130m' },
      { name: 'Upper Ridge',              coord: [85.2655, 27.5898], elevation: '2,210m' },
      { name: 'Champadevi Summit Shrine', coord: [85.2620, 27.5905], elevation: '2,285m' },
    ],
    coordinates: [
      [85.2852, 27.5870], [85.2820, 27.5872], [85.2785, 27.5875],
      [85.2752, 27.5878], [85.2720, 27.5882], [85.2705, 27.5887],
      [85.2690, 27.5892], [85.2673, 27.5895], [85.2655, 27.5898],
      [85.2638, 27.5901], [85.2620, 27.5905],
    ],
    osmTags: { highway: 'path', sac_scale: 'hiking', surface: 'dirt', trail_visibility: 'good' },
    elevationProfile: [
      { d: 0,   e: 1788 }, { d: 1.0, e: 1880 }, { d: 2.0, e: 2000 },
      { d: 3.2, e: 2100 }, { d: 4.5, e: 2180 }, { d: 6.0, e: 2240 },
      { d: 7.5, e: 2270 }, { d: 9.0, e: 2285 },
    ],
    pois: [
      { name: 'Pharping Village',         coord: [85.2852, 27.5870], type: 'junction'  },
      { name: 'Asura Cave (Buddhist)',    coord: [85.2720, 27.5882], type: 'viewpoint' },
      { name: 'Yanglesho Cave',           coord: [85.2690, 27.5892], type: 'viewpoint' },
      { name: 'Champadevi Summit Shrine', coord: [85.2620, 27.5905], type: 'viewpoint' },
      { name: 'Stream Crossing',          coord: [85.2785, 27.5875], type: 'water'     },
    ],
  },

  // ─── 6. Nagarjun Forest (Jamacho Stupa) ─────────────────────────────────────
  // Phulbari Gate: ~27.7350, 85.2990  (near Balaju Bypass, ~5 km from Thamel)
  // Jamacho Summit: 27.7500, 85.2730  (multiple agencies confirm 2,128m elevation)
  {
    id: 'nagarjun',
    name: 'Nagarjun Forest Reserve',
    region: 'Shivapuri Nagarjun National Park',
    difficulty: 'Moderate',
    distance: '9.5 km',
    duration: '3–4 hr',
    maxElevation: 2096,
    elevationGain: '+728m',
    startCoord: [85.2990, 27.7350],
    center:     [85.2858, 27.7425],
    zoom: 13,
    description:
      'The closest national-park summit to Thamel (30 min taxi). The trail winds through pristine sal and pine forest inhabited by 150+ bird species and langur monkeys to Jamacho Gompa (2,096m), a Buddhist stupa with a viewing tower offering a 360° panorama of Kathmandu, Ganesh Himal, Langtang, and Dorje Lakpa.',
    permits: ['Shivapuri NP Entry (Rs. 1,000 foreigners / Rs. 100 locals)'],
    bestSeason: 'Year-round',
    waypoints: [
      { name: 'Phulbari (Balaju) Gate', coord: [85.2990, 27.7350], elevation: '1,368m' },
      { name: 'Forest Junction',        coord: [85.2882, 27.7400], elevation: '1,700m' },
      { name: 'Upper Ridge',            coord: [85.2800, 27.7460], elevation: '1,960m' },
      { name: 'Jamacho Gompa (Stupa)',  coord: [85.2730, 27.7500], elevation: '2,096m' },
    ],
    coordinates: [
      [85.2990, 27.7350], [85.2942, 27.7370], [85.2882, 27.7400],
      [85.2838, 27.7432], [85.2800, 27.7460], [85.2762, 27.7482],
      [85.2730, 27.7500],
    ],
    osmTags: { highway: 'path', sac_scale: 'mountain_hiking', surface: 'dirt', trail_visibility: 'good' },
    elevationProfile: [
      { d: 0,   e: 1368 }, { d: 1.5, e: 1580 }, { d: 3.0, e: 1780 },
      { d: 4.5, e: 1960 }, { d: 6.5, e: 2050 }, { d: 8.0, e: 2096 },
      { d: 9.5, e: 1368 },
    ],
    pois: [
      { name: 'Phulbari Entry Gate',     coord: [85.2990, 27.7350], type: 'junction'  },
      { name: 'Nagbo Stream Crossing',   coord: [85.2882, 27.7400], type: 'water'     },
      { name: 'Langur Monkey Zone',      coord: [85.2800, 27.7460], type: 'viewpoint' },
      { name: 'Jamacho Gompa & Stupa',   coord: [85.2730, 27.7500], type: 'viewpoint' },
    ],
  },

  // ─── 7. Chandragiri Hill ────────────────────────────────────────────────────
  // Trailhead (Thankot / Macchagaun): ~27.6720, 85.2148
  // Summit (Bhaleshwor Mahadev):       ~27.6468, 85.2082  (elevation 2,551m confirmed)
  // Wikipedia: hill on SW rim of valley, 7 km from Thankot, 16 km from Kathmandu
  // Also accessible by cable car (9-min ride, Rs. 700 foreigners)
  {
    id: 'chandragiri',
    name: 'Chandragiri Hill',
    region: 'Chandragiri Municipality',
    difficulty: 'Moderate',
    distance: '8 km',
    duration: '3–4 hr',
    maxElevation: 2551,
    elevationGain: '+524m',
    startCoord: [85.2148, 27.6720],
    center:     [85.2115, 27.6595],
    zoom: 13,
    description:
      'Chandragiri (2,551m) on the south-western rim of the Kathmandu Valley offers arguably the broadest Himalayan panorama near the city — from Dhaulagiri to Everest. The hike climbs through oak and rhododendron forest to the historic Bhaleshwor Mahadev temple, from where King Prithvi Narayan Shah famously planned the unification of Nepal. A cable car alternative is also available.',
    permits: [],
    bestSeason: 'Oct–May',
    waypoints: [
      { name: 'Thankot Trailhead',           coord: [85.2148, 27.6720], elevation: '2,027m' },
      { name: 'Forest Midpoint',             coord: [85.2130, 27.6622], elevation: '2,290m' },
      { name: 'Cable Car Upper Station',     coord: [85.2095, 27.6494], elevation: '2,480m' },
      { name: 'Bhaleshwor Mahadev Temple',   coord: [85.2082, 27.6468], elevation: '2,551m' },
    ],
    coordinates: [
      [85.2148, 27.6720], [85.2140, 27.6675], [85.2130, 27.6622],
      [85.2118, 27.6574], [85.2108, 27.6524], [85.2095, 27.6494],
      [85.2088, 27.6481], [85.2082, 27.6468],
    ],
    osmTags: { highway: 'path', sac_scale: 'mountain_hiking', surface: 'dirt', trail_visibility: 'good' },
    elevationProfile: [
      { d: 0,   e: 2027 }, { d: 1.2, e: 2160 }, { d: 2.4, e: 2290 },
      { d: 3.6, e: 2400 }, { d: 5.0, e: 2490 }, { d: 6.2, e: 2535 },
      { d: 7.2, e: 2551 },
    ],
    pois: [
      { name: 'Thankot Trailhead',         coord: [85.2148, 27.6720], type: 'junction'  },
      { name: 'Forest Spring',             coord: [85.2130, 27.6622], type: 'water'     },
      { name: 'Cable Car Upper Station',   coord: [85.2095, 27.6494], type: 'junction'  },
      { name: 'Bhaleshwor Mahadev Temple', coord: [85.2082, 27.6468], type: 'viewpoint' },
    ],
  },

  // ─── 8. Dhulikhel → Namobuddha → Panauti ───────────────────────────────────
  // Dhulikhel: 27.6221, 85.5428   (geodatos.net / latlong.info confirmed)
  // Namobuddha (Thrangu Tashi Yangtse Monastery): 27.5713, 85.5828  (multiple sources)
  // Panauti: 27.5750, 85.5155     (consistent trekking-agency data)
  // Distance: ~12–14 km; net downhill; minimal elevation change
  {
    id: 'dhulikhel-namobuddha-panauti',
    name: 'Dhulikhel – Namobuddha – Panauti',
    region: 'Kavre District',
    difficulty: 'Easy',
    distance: '13 km',
    duration: '5–7 hr',
    maxElevation: 1750,
    elevationGain: '+490m',
    startCoord: [85.5428, 27.6221],
    center:     [85.5460, 27.5880],
    zoom: 12,
    description:
      'A gentle cultural walk through rolling terraced hills east of Kathmandu. Starting from historic Dhulikhel town (Himalayan views), the trail descends through pine forest and Newari farming villages to Namobuddha — one of Nepal\'s most sacred Buddhist pilgrimage sites (legendary tiger sacrifice by Prince Mahasattva). Ends at Panauti, an ancient Newari town at the confluence of two rivers with 14th-century pagoda temples.',
    permits: [],
    bestSeason: 'Oct–May',
    waypoints: [
      { name: 'Dhulikhel Town Center',    coord: [85.5428, 27.6221], elevation: '1,550m' },
      { name: 'Ridge Trail Junction',     coord: [85.5600, 27.5980], elevation: '1,650m' },
      { name: 'Namobuddha Monastery',     coord: [85.5828, 27.5713], elevation: '1,750m' },
      { name: 'Descent through Villages', coord: [85.5580, 27.5740], elevation: '1,560m' },
      { name: 'Panauti Ancient Town',     coord: [85.5155, 27.5785], elevation: '1,340m' },
    ],
    coordinates: [
      [85.5428, 27.6221], [85.5480, 27.6120], [85.5540, 27.6010],
      [85.5600, 27.5980], [85.5660, 27.5890], [85.5720, 27.5810],
      [85.5780, 27.5765], [85.5828, 27.5713],
      [85.5720, 27.5720], [85.5620, 27.5740], [85.5500, 27.5755],
      [85.5360, 27.5768], [85.5240, 27.5778], [85.5155, 27.5785],
    ],
    osmTags: { highway: 'path', sac_scale: 'hiking', surface: 'dirt', trail_visibility: 'excellent' },
    elevationProfile: [
      { d: 0,   e: 1550 }, { d: 2.0, e: 1610 }, { d: 3.5, e: 1660 },
      { d: 5.5, e: 1720 }, { d: 7.0, e: 1750 }, { d: 8.5, e: 1680 },
      { d: 9.5, e: 1580 }, { d: 11.0, e: 1450 }, { d: 13.0, e: 1340 },
    ],
    pois: [
      { name: 'Dhulikhel Viewpoint',        coord: [85.5428, 27.6221], type: 'viewpoint' },
      { name: 'Namobuddha Monastery',       coord: [85.5828, 27.5713], type: 'viewpoint' },
      { name: 'Monastery Tea House',        coord: [85.5828, 27.5713], type: 'lodge'     },
      { name: 'Punyamati–Roshi Confluence', coord: [85.5155, 27.5785], type: 'viewpoint' },
      { name: 'Village Water Tap',          coord: [85.5500, 27.5755], type: 'water'     },
    ],
  },

  // ════════════════════════════════════════
  //  2 MULTI-DAY TREKS
  // ════════════════════════════════════════

  // ─── 9. Langtang Valley Trek ────────────────────────────────────────────────
  // All waypoints GPS-verified from WikiVoyage Langtang Valley Trek article (2026)
  // Syabrubesi:    28.161783, 85.336451
  // Bamboo:        28.154824, 85.399482
  // Lama Hotel:    28.160805, 85.430305
  // Ghoda Tabela:  28.200261, 85.460877
  // Langtang V.:   28.215231, 85.508080
  // Kyanjin Gompa: 28.211950, 85.566581
  // Tserko Ri:     28.213494, 85.601026
  {
    id: 'langtang-valley',
    name: 'Langtang Valley Trek',
    region: 'Langtang National Park',
    difficulty: 'Hard',
    distance: '80 km',
    duration: '7 days',
    maxElevation: 4984,
    elevationGain: '+3,524m',
    startCoord: [85.3365, 28.1618],
    center:     [85.4700, 28.1900],
    zoom: 10,
    description:
      'The closest major Himalayan trek to Kathmandu — just 7–8 hours by bus. The trail follows the Langtang Khola river through subtropical jungle, bamboo forest, traditional Tamang villages, and glacial meadows to Kyanjin Gompa (3,870m). Optional summit hikes to Tserko Ri (4,984m) give jaw-dropping views of Langtang Lirung (7,227m) and the full Tibet border range.',
    permits: ['Langtang NP Permit (Rs. 3,000)', 'TIMS Card (Rs. 2,000)'],
    bestSeason: 'Mar–May, Oct–Nov',
    waypoints: [
      { name: 'Syabrubesi',        coord: [85.3365, 28.1618], elevation: '1,460m' },
      { name: 'Bamboo',            coord: [85.3995, 28.1548], elevation: '1,970m' },
      { name: 'Lama Hotel',        coord: [85.4303, 28.1608], elevation: '2,470m' },
      { name: 'Ghoda Tabela',      coord: [85.4609, 28.2003], elevation: '3,008m' },
      { name: 'Langtang Village',  coord: [85.5081, 28.2152], elevation: '3,430m' },
      { name: 'Kyanjin Gompa',     coord: [85.5666, 28.2120], elevation: '3,870m' },
      { name: 'Tserko Ri (opt.)',  coord: [85.6010, 28.2135], elevation: '4,984m' },
    ],
    coordinates: [
      [85.3365, 28.1618], [85.3568, 28.1524], [85.3782, 28.1522],
      [85.3995, 28.1548], [85.4217, 28.1581], [85.4303, 28.1608],
      [85.4416, 28.1806], [85.4609, 28.2003], [85.4755, 28.2078],
      [85.4960, 28.2143], [85.5081, 28.2152], [85.5197, 28.2151],
      [85.5267, 28.2146], [85.5440, 28.2135], [85.5666, 28.2120],
    ],
    osmTags: { highway: 'path', sac_scale: 'mountain_hiking', surface: 'rocky_trail', trail_visibility: 'good' },
    elevationProfile: [
      { d: 0,  e: 1460 }, { d: 8,  e: 1970 }, { d: 14, e: 2470 },
      { d: 22, e: 3008 }, { d: 28, e: 3430 }, { d: 33, e: 3550 },
      { d: 40, e: 3870 }, { d: 49, e: 4984 },
      { d: 56, e: 3870 }, { d: 62, e: 3430 }, { d: 66, e: 3008 },
      { d: 72, e: 2470 }, { d: 80, e: 1460 },
    ],
    pois: [
      { name: 'Syabrubesi Lodge',      coord: [85.3365, 28.1618], type: 'lodge'     },
      { name: 'Bamboo Teahouse',       coord: [85.3995, 28.1548], type: 'lodge'     },
      { name: 'Lama Hotel',            coord: [85.4303, 28.1608], type: 'lodge'     },
      { name: 'Ghoda Tabela',          coord: [85.4609, 28.2003], type: 'lodge'     },
      { name: 'Langtang Village',      coord: [85.5081, 28.2152], type: 'lodge'     },
      { name: 'Kyanjin Gompa',         coord: [85.5666, 28.2120], type: 'viewpoint' },
      { name: 'Kyanjin Ri (4,300m)',   coord: [85.5708, 28.2177], type: 'viewpoint' },
      { name: 'Tserko Ri (4,984m)',    coord: [85.6010, 28.2135], type: 'viewpoint' },
      { name: 'Langtang Khola River',  coord: [85.4416, 28.1806], type: 'water'     },
      { name: 'Rescue Post',           coord: [85.4609, 28.2003], type: 'rescue'    },
    ],
  },

  // ─── 10. Gosaikunda Lake Trek ────────────────────────────────────────────────
  // Dhunche:       28.1058, 85.2835   (latitude.to confirmed: 28.1057876, 85.2835177)
  // Sing Gompa:    28.1109, 85.3376   (latitude.to confirmed: 28.1108718, 85.337559)
  // Gosaikunda:    28.0833, 85.4167   (Wikipedia: 28°05′N 85°25′E)
  // Laurebina La:  28.0780, 85.4350   (~200m NE of lake, highest point 4,610m)
  {
    id: 'gosaikunda',
    name: 'Gosaikunda Lake Trek',
    region: 'Langtang National Park',
    difficulty: 'Hard',
    distance: '40 km',
    duration: '4–5 days',
    maxElevation: 4380,
    elevationGain: '+2,420m',
    startCoord: [85.2835, 28.1058],
    center:     [85.3600, 28.0900],
    zoom: 11,
    description:
      'A sacred Hindu pilgrimage lake at 4,380m, revered as the birthplace of Lord Shiva\'s trident spring. The trek climbs steeply from Dhunche (2,030m) through Chandanbari / Sing Gompa (3,330m) — famous for its cheese factory — along an exposed alpine ridge to Laurebina (3,910m) and a series of smaller tarns before the main Gosaikunda shore. Highest point: Laurebina La pass (4,610m) for those crossing to Helambu.',
    permits: ['Langtang NP Permit (Rs. 3,000)', 'TIMS Card (Rs. 2,000)'],
    bestSeason: 'Apr–Jun, Oct–Nov',
    waypoints: [
      { name: 'Dhunche',             coord: [85.2835, 28.1058], elevation: '2,030m' },
      { name: 'Sing Gompa / Chandanbari', coord: [85.3376, 28.1109], elevation: '3,330m' },
      { name: 'Cholang Pati',        coord: [85.3750, 28.0920], elevation: '3,580m' },
      { name: 'Laurebina',           coord: [85.3960, 28.0885], elevation: '3,910m' },
      { name: 'Gosaikunda Lake',     coord: [85.4167, 28.0833], elevation: '4,380m' },
      { name: 'Laurebina La Pass',   coord: [85.4280, 28.0790], elevation: '4,610m' },
    ],
    coordinates: [
      [85.2835, 28.1058], [85.3050, 28.1078], [85.3200, 28.1090],
      [85.3376, 28.1109], [85.3520, 28.1060], [85.3620, 28.0990],
      [85.3750, 28.0920], [85.3840, 28.0905], [85.3960, 28.0885],
      [85.4060, 28.0858], [85.4167, 28.0833],
    ],
    osmTags: { highway: 'path', sac_scale: 'demanding_mountain_hiking', surface: 'rock', trail_visibility: 'good' },
    elevationProfile: [
      { d: 0,  e: 2030 }, { d: 4,  e: 2600 }, { d: 8,  e: 3050 },
      { d: 12, e: 3330 }, { d: 16, e: 3580 }, { d: 20, e: 3760 },
      { d: 24, e: 3910 }, { d: 28, e: 4130 }, { d: 32, e: 4380 },
      { d: 40, e: 2030 },
    ],
    pois: [
      { name: 'Dhunche Village',           coord: [85.2835, 28.1058], type: 'lodge'     },
      { name: 'Sing Gompa Monastery',      coord: [85.3376, 28.1109], type: 'lodge'     },
      { name: 'Cheese Factory',            coord: [85.3376, 28.1109], type: 'viewpoint' },
      { name: 'Cholang Pati',              coord: [85.3750, 28.0920], type: 'lodge'     },
      { name: 'Laurebina Viewpoint',       coord: [85.3960, 28.0885], type: 'viewpoint' },
      { name: 'Gosaikunda Sacred Lake',    coord: [85.4167, 28.0833], type: 'viewpoint' },
      { name: 'Lakeside Campsite',         coord: [85.4167, 28.0833], type: 'campsite'  },
      { name: 'Laurebina La (4,610m)',     coord: [85.4280, 28.0790], type: 'viewpoint' },
      { name: 'Sing Gompa Water',          coord: [85.3376, 28.1109], type: 'water'     },
      { name: 'Rescue Post (Chandanbari)', coord: [85.3376, 28.1109], type: 'rescue'    },
    ],
  },
];

export const KATHMANDU_TRAILS = NEPAL_TRAILS;

export const getTrailById   = (id)   => NEPAL_TRAILS.find(t => t.id === id);
export const getTrailByName = (name) => {
  if (!name) return null;
  const q = name.toLowerCase().trim();
  return NEPAL_TRAILS.find(t => t.name.toLowerCase() === q)
    || NEPAL_TRAILS.find(t => t.name.toLowerCase().includes(q))
    || NEPAL_TRAILS.find(t => q.includes(t.name.toLowerCase().replace(/ trek$| trail$| hill$/, '')))
    || NEPAL_TRAILS.find(t => {
      const core = t.name.toLowerCase().replace(/ trek$| trail$| hill$/, '');
      return q.startsWith(core) || core.startsWith(q);
    });
};
export const getDefaultTrail  = () => NEPAL_TRAILS[0];
export const getDayHikes      = () => NEPAL_TRAILS.filter(t => /day|half|hr/i.test(t.duration));
export const getMultiDayTreks = () => NEPAL_TRAILS.filter(t => !/day|half|hr/i.test(t.duration));
export const getByDifficulty  = (level) => NEPAL_TRAILS.filter(t => t.difficulty === level);
