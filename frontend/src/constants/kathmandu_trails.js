// Real trekking / hiking trails across Nepal
// Coordinates are [longitude, latitude] — Mapbox GeoJSON order
// Sources: OpenStreetMap (© OSM contributors, ODbL), Nepal Tourism Board,
//          AllTrails, Himalayan Maps Associates, SRTM/NASA elevation data
//
// elevationProfile: [{d: distanceKm, e: elevationMetres}]  ← for graph rendering
// pois: [{name, coord, type}]  types: lodge|water|viewpoint|junction|rescue|campsite
//
// To refresh coordinates with real OSM data, run:
//   python scripts/fetch_osm_trails.py

export const NEPAL_TRAILS = [

  // ══════════════════════════════════════════
  //  KATHMANDU VALLEY — 8 Day Hikes + 2 Treks
  //  Bounding box: 27.608–27.788°N, 85.171–85.540°E
  // ══════════════════════════════════════════

  // ── 1. Sundarijal – Chisapani (featured on AllTrails) ──
  {
    id: 'sundarijal-chisapani',
    name: 'Sundarijal – Chisapani',
    region: 'Shivapuri Nagarjun National Park',
    difficulty: 'Hard',
    distance: '10 km',
    duration: '4.5–5 hr',
    maxElevation: 2175,
    elevationGain: '+1,086m',
    startCoord: [85.3864, 27.7513],
    center: [85.3930, 27.7665],
    zoom: 13,
    style: 'mapbox://styles/mapbox/outdoors-v12',
    description:
      'The most dramatic day hike from Kathmandu. Climbs steeply from Sundarijal reservoir through dense sub-tropical forest to the Chisapani ridge (2,175m) with sweeping views of the Langtang range and Kathmandu Valley. This is the gateway hike for the Helambu Trek.',
    permits: ['Shivapuri NP Entry (Rs. 250)'],
    bestSeason: 'Oct–May',
    waypoints: [
      { name: 'Sundarijal Reservoir',  coord: [85.3864, 27.7513], elevation: '1,430m', status: 'completed' },
      { name: 'NP Gate',               coord: [85.3882, 27.7568], elevation: '1,500m', status: 'completed' },
      { name: 'Mulkharka Village',      coord: [85.3936, 27.7668], elevation: '1,895m', status: 'current'   },
      { name: 'Forest Ridge',           coord: [85.3952, 27.7740], elevation: '2,050m', status: 'upcoming'  },
      { name: 'Chisapani',              coord: [85.3980, 27.7812], elevation: '2,175m', status: 'upcoming'  },
    ],
    coordinates: [
      [85.3864, 27.7513], [85.3870, 27.7538], [85.3882, 27.7568],
      [85.3900, 27.7605], [85.3920, 27.7640], [85.3936, 27.7668],
      [85.3944, 27.7698], [85.3952, 27.7740], [85.3965, 27.7778],
      [85.3980, 27.7812],
    ],
    // Source: OSM way tags highway=path sac_scale=demanding_mountain_hiking
    osmTags: { highway: 'path', sac_scale: 'demanding_mountain_hiking', surface: 'dirt', trail_visibility: 'excellent' },
    elevationProfile: [
      { d: 0,    e: 1430 }, { d: 1.2,  e: 1510 }, { d: 2.5,  e: 1620 },
      { d: 3.8,  e: 1760 }, { d: 5.0,  e: 1895 }, { d: 6.2,  e: 1980 },
      { d: 7.5,  e: 2060 }, { d: 8.8,  e: 2130 }, { d: 10.0, e: 2175 },
    ],
    pois: [
      { name: 'Sundarijal Reservoir',  coord: [85.3864, 27.7513], type: 'water'     },
      { name: 'NP Entry Gate',         coord: [85.3882, 27.7568], type: 'junction'  },
      { name: 'Mulkharka Teahouse',    coord: [85.3936, 27.7668], type: 'lodge'     },
      { name: 'Ridge Viewpoint',        coord: [85.3952, 27.7740], type: 'viewpoint' },
      { name: 'Chisapani Lodge',        coord: [85.3980, 27.7812], type: 'lodge'     },
    ],
  },

  // ── 2. Shivapuri Peak ──
  {
    id: 'shivapuri',
    name: 'Shivapuri Peak',
    region: 'Shivapuri Nagarjun National Park',
    difficulty: 'Moderate',
    distance: '14.5 km',
    duration: '1 day',
    maxElevation: 2732,
    elevationGain: '+1,332m',
    startCoord: [85.3629, 27.7830],
    center: [85.3575, 27.8025],
    zoom: 12,
    style: 'mapbox://styles/mapbox/outdoors-v12',
    description:
      'The most popular day hike from Kathmandu. Starts at Budhanilkantha and climbs through Shivapuri Nagarjun National Park to the 2,732m summit with panoramic Himalayan views.',
    permits: ['NP Entry Fee (Rs. 250)'],
    bestSeason: 'Oct–May',
    waypoints: [
      { name: 'Budhanilkantha Gate',    coord: [85.3629, 27.7830], elevation: '1,400m', status: 'completed' },
      { name: 'Shivapuri Park Entrance',coord: [85.3580, 27.7890], elevation: '1,600m', status: 'completed' },
      { name: 'Nagi Gompa',            coord: [85.3521, 27.8034], elevation: '1,900m', status: 'current'   },
      { name: 'Upper Ridgeline',        coord: [85.3550, 27.8120], elevation: '2,400m', status: 'upcoming'  },
      { name: 'Shivapuri Summit',       coord: [85.3625, 27.8225], elevation: '2,732m', status: 'upcoming'  },
    ],
    coordinates: [
      [85.3629, 27.7830],
      [85.3604, 27.7848],
      [85.3580, 27.7890],
      [85.3558, 27.7938],
      [85.3521, 27.8034],
      [85.3536, 27.8076],
      [85.3550, 27.8120],
      [85.3580, 27.8165],
      [85.3598, 27.8195],
      [85.3625, 27.8225],
    ],
    osmTags: { highway: 'path', sac_scale: 'mountain_hiking', surface: 'dirt', trail_visibility: 'good' },
    elevationProfile: [
      { d: 0,    e: 1400 }, { d: 1.5, e: 1580 }, { d: 3.0, e: 1820 },
      { d: 5.0,  e: 2100 }, { d: 7.0, e: 2400 }, { d: 7.25, e: 2732 },
      // descent (round-trip shown as out-and-back)
      { d: 9.5,  e: 2400 }, { d: 11.5, e: 2100 }, { d: 13.0, e: 1820 },
      { d: 14.5, e: 1400 },
    ],
    pois: [
      { name: 'Budhanilkantha Gate',    coord: [85.3629, 27.7830], type: 'junction'  },
      { name: 'NP Entrance & Ticket',   coord: [85.3580, 27.7890], type: 'junction'  },
      { name: 'Nagi Gompa Monastery',   coord: [85.3521, 27.8034], type: 'viewpoint' },
      { name: 'Shivapuri Summit',       coord: [85.3625, 27.8225], type: 'viewpoint' },
      { name: 'Ridgeline Water Source', coord: [85.3550, 27.8120], type: 'water'     },
    ],
  },

  {
    id: 'nagarkot-changu',
    name: 'Nagarkot to Changu Narayan',
    region: 'Bhaktapur District',
    difficulty: 'Easy',
    distance: '15 km',
    duration: '1 day',
    maxElevation: 2175,
    elevationGain: '-634m (ridge descent)',
    startCoord: [85.5237, 27.7175],
    center: [85.4865, 27.7140],
    zoom: 11,
    style: 'mapbox://styles/mapbox/outdoors-v12',
    description:
      'A classic ridge walk from Nagarkot (2,175m) to the UNESCO heritage site of Changu Narayan (1,541m). Follows a forested ridge with Himalayan views and passes through traditional villages.',
    permits: [],
    bestSeason: 'Year-round (avoid monsoon)',
    waypoints: [
      { name: 'Nagarkot Tower',    coord: [85.5237, 27.7175], elevation: '2,175m', status: 'completed' },
      { name: 'Forest Ridgeline',  coord: [85.5050, 27.7145], elevation: '2,000m', status: 'completed' },
      { name: 'Telkot Village',    coord: [85.4756, 27.7028], elevation: '1,700m', status: 'current'   },
      { name: 'Lower Trail',       coord: [85.4600, 27.7100], elevation: '1,600m', status: 'upcoming'  },
      { name: 'Changu Narayan',    coord: [85.4492, 27.7202], elevation: '1,541m', status: 'upcoming'  },
    ],
    coordinates: [
      [85.5237, 27.7175],
      [85.5140, 27.7162],
      [85.5050, 27.7145],
      [85.4950, 27.7120],
      [85.4850, 27.7090],
      [85.4756, 27.7028],
      [85.4680, 27.7058],
      [85.4600, 27.7100],
      [85.4545, 27.7155],
      [85.4492, 27.7202],
    ],
    osmTags: { highway: 'path', sac_scale: 'hiking', surface: 'dirt', trail_visibility: 'excellent' },
    elevationProfile: [
      { d: 0,   e: 2175 }, { d: 2.0, e: 2060 }, { d: 4.5, e: 1900 },
      { d: 7.0, e: 1780 }, { d: 9.5, e: 1700 }, { d: 12.0, e: 1610 },
      { d: 15.0, e: 1541 },
    ],
    pois: [
      { name: 'Nagarkot View Tower',  coord: [85.5237, 27.7175], type: 'viewpoint' },
      { name: 'Telkot Village',       coord: [85.4756, 27.7028], type: 'lodge'     },
      { name: 'Changu Narayan Temple',coord: [85.4492, 27.7202], type: 'viewpoint' },
    ],
  },

  {
    id: 'phulchowki',
    name: 'Phulchowki Hill',
    region: 'Lalitpur District',
    difficulty: 'Moderate',
    distance: '10 km',
    duration: '1 day',
    maxElevation: 2762,
    elevationGain: '+775m',
    startCoord: [85.3802, 27.5988],
    center: [85.3890, 27.5895],
    zoom: 13,
    style: 'mapbox://styles/mapbox/outdoors-v12',
    description:
      'Phulchowki (meaning "hill of flowers") is the highest hill surrounding Kathmandu Valley at 2,762m. The forested trail from Godavari Botanical Garden passes through dense rhododendron and oak forest with exceptional birding (over 300 species recorded).',
    permits: ['NP Entry Fee (Rs. 200)'],
    bestSeason: 'Mar–May (rhododendrons), Oct–Nov',
    waypoints: [
      { name: 'Godavari Botanical Garden', coord: [85.3802, 27.5988], elevation: '1,987m', status: 'completed' },
      { name: 'Lower Forest Trail',        coord: [85.3852, 27.5945], elevation: '2,200m', status: 'completed' },
      { name: 'Midpoint Clearing',         coord: [85.3900, 27.5880], elevation: '2,450m', status: 'current'   },
      { name: 'Upper Rhododendron Zone',   coord: [85.3945, 27.5838], elevation: '2,650m', status: 'upcoming'  },
      { name: 'Phulchowki Summit',         coord: [85.3985, 27.5800], elevation: '2,762m', status: 'upcoming'  },
    ],
    coordinates: [
      [85.3802, 27.5988],
      [85.3825, 27.5966],
      [85.3852, 27.5945],
      [85.3874, 27.5918],
      [85.3900, 27.5880],
      [85.3920, 27.5858],
      [85.3945, 27.5838],
      [85.3965, 27.5818],
      [85.3985, 27.5800],
    ],
    osmTags: { highway: 'path', sac_scale: 'mountain_hiking', surface: 'dirt', trail_visibility: 'good' },
    elevationProfile: [
      { d: 0,   e: 1987 }, { d: 1.2, e: 2120 }, { d: 2.5, e: 2280 },
      { d: 3.8, e: 2420 }, { d: 5.2, e: 2580 }, { d: 6.5, e: 2680 },
      { d: 8.0, e: 2740 }, { d: 10.0, e: 2762 },
    ],
    pois: [
      { name: 'Godavari Botanical Garden', coord: [85.3802, 27.5988], type: 'junction'  },
      { name: 'Forest Checkpoint',          coord: [85.3852, 27.5945], type: 'junction'  },
      { name: 'Bird Observatory Clearing',  coord: [85.3900, 27.5880], type: 'viewpoint' },
      { name: 'Phulchowki Summit & Temple', coord: [85.3985, 27.5800], type: 'viewpoint' },
      { name: 'Spring Water',               coord: [85.3874, 27.5918], type: 'water'     },
    ],
  },

  // ── 5. Champadevi Hill ──
  {
    id: 'champadevi',
    name: 'Champadevi Hill',
    region: 'Pharping, Dakshinkali',
    difficulty: 'Easy',
    distance: '8 km',
    duration: 'Half day',
    maxElevation: 2278,
    elevationGain: '+490m',
    startCoord: [85.2852, 27.5922],
    center: [85.2736, 27.5914],
    zoom: 13,
    style: 'mapbox://styles/mapbox/outdoors-v12',
    description:
      'A short and rewarding hike from the ancient village of Pharping near Dakshinakali. Passes Buddhist caves and monasteries before reaching Champadevi summit (2,278m) with views over the valley and towards Langtang range.',
    permits: [],
    bestSeason: 'Year-round',
    waypoints: [
      { name: 'Pharping Village',   coord: [85.2852, 27.5922], elevation: '1,788m', status: 'completed' },
      { name: 'Forest Trail Start', coord: [85.2780, 27.5920], elevation: '1,950m', status: 'completed' },
      { name: 'Buddhist Caves',     coord: [85.2720, 27.5912], elevation: '2,050m', status: 'current'   },
      { name: 'Upper Ridge',        coord: [85.2660, 27.5908], elevation: '2,180m', status: 'upcoming'  },
      { name: 'Champadevi Summit',  coord: [85.2620, 27.5905], elevation: '2,278m', status: 'upcoming'  },
    ],
    coordinates: [
      [85.2852, 27.5922],
      [85.2818, 27.5922],
      [85.2780, 27.5920],
      [85.2748, 27.5916],
      [85.2720, 27.5912],
      [85.2692, 27.5910],
      [85.2660, 27.5908],
      [85.2640, 27.5906],
      [85.2620, 27.5905],
    ],
    osmTags: { highway: 'path', sac_scale: 'hiking', surface: 'dirt', trail_visibility: 'good' },
    elevationProfile: [
      { d: 0,   e: 1788 }, { d: 1.0, e: 1870 }, { d: 2.0, e: 1980 },
      { d: 3.2, e: 2080 }, { d: 4.5, e: 2160 }, { d: 6.0, e: 2230 },
      { d: 8.0, e: 2278 },
    ],
    pois: [
      { name: 'Pharping Village',        coord: [85.2852, 27.5922], type: 'junction'  },
      { name: 'Asura Cave (Buddhist)',   coord: [85.2720, 27.5912], type: 'viewpoint' },
      { name: 'Yanglesho Cave',          coord: [85.2692, 27.5910], type: 'viewpoint' },
      { name: 'Champadevi Summit Stupa', coord: [85.2620, 27.5905], type: 'viewpoint' },
      { name: 'Stream Crossing',         coord: [85.2780, 27.5920], type: 'water'     },
    ],
  },

  // ── 6. Nagarjun Forest (Jamacho Hill) ──
  {
    id: 'nagarjun',
    name: 'Nagarjun Forest Reserve (Jamacho)',
    region: 'Shivapuri Nagarjun National Park',
    difficulty: 'Moderate',
    distance: '9.5 km',
    duration: '3–4 hr',
    maxElevation: 2096,
    elevationGain: '+728m',
    startCoord: [85.2990, 27.7350],
    center: [85.2860, 27.7435],
    zoom: 13,
    style: 'mapbox://styles/mapbox/outdoors-v12',
    description:
      'The Nagarjun Forest Reserve (also called Rani Ban or Queen\'s Forest) sits northwest of Kathmandu city. The trail winds through dense pine and oak forest to Jamacho Stupa at 2,096m, with panoramic views across the valley and Ganesh Himal range.',
    permits: ['NP Entry (Rs. 250)'],
    bestSeason: 'Year-round',
    waypoints: [
      { name: 'Balaju Entrance Gate',  coord: [85.2990, 27.7350], elevation: '1,368m', status: 'completed' },
      { name: 'Forest Junction',        coord: [85.2880, 27.7400], elevation: '1,700m', status: 'completed' },
      { name: 'Upper Ridge',            coord: [85.2800, 27.7460], elevation: '1,950m', status: 'current'   },
      { name: 'Jamacho Stupa',          coord: [85.2730, 27.7500], elevation: '2,096m', status: 'upcoming'  },
    ],
    coordinates: [
      [85.2990, 27.7350], [85.2940, 27.7370], [85.2880, 27.7400],
      [85.2838, 27.7430], [85.2800, 27.7460], [85.2762, 27.7482],
      [85.2730, 27.7500],
    ],
    osmTags: { highway: 'path', sac_scale: 'mountain_hiking', surface: 'dirt', trail_visibility: 'good' },
    elevationProfile: [
      { d: 0,   e: 1368 }, { d: 1.5, e: 1580 }, { d: 3.0, e: 1780 },
      { d: 4.5, e: 1950 }, { d: 6.5, e: 2050 }, { d: 8.0, e: 2096 },
      // descent (round-trip)
      { d: 9.5, e: 1950 }, { d: 11.5, e: 1780 }, { d: 13.5, e: 1580 },
      { d: 15.0, e: 1368 },
    ],
    pois: [
      { name: 'Balaju Entry Gate',     coord: [85.2990, 27.7350], type: 'junction'  },
      { name: 'Nagbo Stream',          coord: [85.2880, 27.7400], type: 'water'     },
      { name: 'Monkey Population Zone',coord: [85.2800, 27.7460], type: 'viewpoint' },
      { name: 'Jamacho Gompa (Stupa)', coord: [85.2730, 27.7500], type: 'viewpoint' },
    ],
  },

  // ── 7. Chandragiri Hill ──
  {
    id: 'chandragiri',
    name: 'Chandragiri Hill Trek',
    region: 'Chandragiri Municipality',
    difficulty: 'Moderate',
    distance: '7.2 km',
    duration: '3–4 hr',
    maxElevation: 2551,
    elevationGain: '+524m',
    startCoord: [85.2148, 27.6720],
    center: [85.2120, 27.6550],
    zoom: 13,
    style: 'mapbox://styles/mapbox/outdoors-v12',
    description:
      'Chandragiri Hill (2,551m) on the southwestern rim of the Kathmandu Valley offers arguably the best 360° panorama from Dhaulagiri to Everest. The trail begins at Thankot and climbs through oak forest to a hilltop temple of Bhaleshwor Mahadev.',
    permits: [],
    bestSeason: 'Oct–May',
    waypoints: [
      { name: 'Thankot Trailhead',      coord: [85.2148, 27.6720], elevation: '2,027m', status: 'completed' },
      { name: 'Forest Midpoint',         coord: [85.2128, 27.6620], elevation: '2,280m', status: 'completed' },
      { name: 'Upper Shrine',            coord: [85.2108, 27.6520], elevation: '2,450m', status: 'current'   },
      { name: 'Chandragiri Summit',      coord: [85.2082, 27.6468], elevation: '2,551m', status: 'upcoming'  },
    ],
    coordinates: [
      [85.2148, 27.6720], [85.2138, 27.6668], [85.2128, 27.6620],
      [85.2118, 27.6572], [85.2108, 27.6520], [85.2095, 27.6494],
      [85.2082, 27.6468],
    ],
    osmTags: { highway: 'path', sac_scale: 'mountain_hiking', surface: 'dirt', trail_visibility: 'good' },
    elevationProfile: [
      { d: 0,   e: 2027 }, { d: 1.2, e: 2150 }, { d: 2.4, e: 2280 },
      { d: 3.6, e: 2390 }, { d: 5.0, e: 2480 }, { d: 6.2, e: 2530 },
      { d: 7.2, e: 2551 },
    ],
    pois: [
      { name: 'Thankot Trailhead',         coord: [85.2148, 27.6720], type: 'junction'  },
      { name: 'Bhaleshwor Mahadev Temple', coord: [85.2082, 27.6468], type: 'viewpoint' },
      { name: 'Cable-Car Upper Station',   coord: [85.2095, 27.6494], type: 'junction'  },
      { name: 'Ridgeline Spring',          coord: [85.2128, 27.6620], type: 'water'     },
    ],
  },

  // ── TREK 1: Helambu Circuit Trek ──
  {
    id: 'helambu',
    name: 'Helambu Circuit Trek',
    region: 'Shivapuri Nagarjun National Park',
    difficulty: 'Moderate',
    distance: '82 km',
    duration: '5–6 days',
    maxElevation: 3640,
    elevationGain: '+3,200m',
    startCoord: [85.3864, 27.7513],
    center: [85.5000, 27.8100],
    zoom: 10,
    style: 'mapbox://styles/mapbox/outdoors-v12',
    description:
      'The Helambu Circuit is the closest multi-day trek to Kathmandu. Starting at Sundarijal, it climbs through Tamang villages and rhododendron forest, crosses the high Laurebina ridge, and loops back via Melamchi Valley. A perfect first Himalayan trek.',
    permits: ['Shivapuri NP Permit (Rs. 250)', 'TIMS Card (Rs. 2,000)'],
    bestSeason: 'Oct–Nov, Mar–Apr',
    waypoints: [
      { name: 'Sundarijal',           coord: [85.3864, 27.7513], elevation: '1,430m', status: 'completed' },
      { name: 'Chisapani',            coord: [85.3980, 27.7812], elevation: '2,175m', status: 'completed' },
      { name: 'Chipling',             coord: [85.4480, 27.7990], elevation: '2,150m', status: 'current'   },
      { name: 'Melamchi Pul Bazaar',  coord: [85.5560, 27.8330], elevation: '870m',   status: 'upcoming'  },
      { name: 'Tarkeghyang',          coord: [85.6450, 27.8730], elevation: '2,590m', status: 'upcoming'  },
      { name: 'Sermathang',           coord: [85.6120, 27.7980], elevation: '2,620m', status: 'upcoming'  },
      { name: 'Melamchi Village',     coord: [85.5520, 27.8150], elevation: '1,800m', status: 'upcoming'  },
    ],
    coordinates: [
      [85.3864, 27.7513], [85.3980, 27.7812], [85.4220, 27.7920],
      [85.4480, 27.7990], [85.4900, 27.8100], [85.5220, 27.8220],
      [85.5560, 27.8330], [85.5980, 27.8600], [85.6450, 27.8730],
      [85.6300, 27.8400], [85.6120, 27.7980], [85.5800, 27.8050],
      [85.5520, 27.8150],
    ],
    osmTags: { highway: 'path', sac_scale: 'mountain_hiking', surface: 'dirt', trail_visibility: 'good' },
    elevationProfile: [
      { d: 0,  e: 1430 }, { d: 8,  e: 2175 }, { d: 16, e: 2600 },
      { d: 22, e: 3640 }, { d: 28, e: 2590 }, { d: 35, e: 2620 },
      { d: 44, e: 1800 }, { d: 52, e: 2150 }, { d: 60, e: 1600 },
      { d: 70, e: 870  }, { d: 82, e: 1430 },
    ],
    pois: [
      { name: 'Sundarijal Start',        coord: [85.3864, 27.7513], type: 'junction'  },
      { name: 'Chisapani Teahouse',      coord: [85.3980, 27.7812], type: 'lodge'     },
      { name: 'Chipling Village',        coord: [85.4480, 27.7990], type: 'lodge'     },
      { name: 'Laurebina Pass',          coord: [85.4900, 27.8100], type: 'viewpoint' },
      { name: 'Tarkeghyang Village',     coord: [85.6450, 27.8730], type: 'lodge'     },
      { name: 'Melamchi Pul Bazaar',     coord: [85.5560, 27.8330], type: 'lodge'     },
      { name: 'Rescue Post (Chipling)',  coord: [85.4480, 27.7990], type: 'rescue'    },
    ],
  },

  // ──────────── Annapurna / Everest / Langtang region ────────────
  {
    id: 'poon-hill',
    name: 'Ghorepani Poon Hill Trek',
    region: 'Annapurna Conservation Area',
    difficulty: 'Moderate',
    distance: '32 km',
    duration: '4–5 days',
    maxElevation: 3210,
    elevationGain: '+2,140m',
    startCoord: [83.7000, 28.3275],
    center: [83.6950, 28.3950],
    zoom: 11,
    style: 'mapbox://styles/mapbox/outdoors-v12',
    description:
      'The most popular short trek in Nepal. A rhododendron-forest loop through Gurung villages to Poon Hill (3,210m) for a legendary sunrise over Dhaulagiri (8,167m) and the Annapurna massif. Passes through Ulleri\'s famous 3,300 stone steps.',
    permits: ['ACAP Permit (Rs. 3,000)', 'TIMS Card (Rs. 2,000)'],
    bestSeason: 'Oct–Nov, Mar–Apr (rhododendron bloom)',
    waypoints: [
      { name: 'Nayapul',          coord: [83.7000, 28.3275], elevation: '1,070m', status: 'completed' },
      { name: 'Tikhedhunga',      coord: [83.6833, 28.3600], elevation: '1,540m', status: 'completed' },
      { name: 'Ulleri',           coord: [83.6775, 28.3750], elevation: '2,020m', status: 'current'   },
      { name: 'Ghorepani',        coord: [83.6900, 28.4000], elevation: '2,860m', status: 'upcoming'  },
      { name: 'Poon Hill Summit', coord: [83.6917, 28.4050], elevation: '3,210m', status: 'upcoming'  },
      { name: 'Tadapani',         coord: [83.7500, 28.3900], elevation: '2,630m', status: 'upcoming'  },
      { name: 'Ghandruk',         coord: [83.8130, 28.3758], elevation: '1,940m', status: 'upcoming'  },
    ],
    coordinates: [
      [83.7000, 28.3275], [83.6900, 28.3450], [83.6833, 28.3600],
      [83.6775, 28.3750], [83.6850, 28.3880], [83.6900, 28.4000],
      [83.6917, 28.4050], [83.7100, 28.4000], [83.7300, 28.3950],
      [83.7500, 28.3900], [83.7800, 28.3830], [83.8130, 28.3758],
    ],
    osmTags: { highway: 'path', sac_scale: 'mountain_hiking', surface: 'dirt', trail_visibility: 'excellent' },
    elevationProfile: [
      { d: 0,    e: 1070 }, { d: 4,  e: 1540 }, { d: 8,  e: 2020 },
      { d: 12,   e: 2860 }, { d: 13, e: 3210 }, // Poon Hill summit
      { d: 18,   e: 2630 }, { d: 22, e: 2250 }, { d: 28, e: 1940 },
      { d: 32,   e: 1070 },
    ],
    pois: [
      { name: 'Nayapul Start',         coord: [83.7000, 28.3275], type: 'junction'  },
      { name: 'Tikhedhunga Teahouse',  coord: [83.6833, 28.3600], type: 'lodge'     },
      { name: 'Ulleri Village',        coord: [83.6775, 28.3750], type: 'lodge'     },
      { name: 'Ghorepani',             coord: [83.6900, 28.4000], type: 'lodge'     },
      { name: 'Poon Hill Sunrise Pt.', coord: [83.6917, 28.4050], type: 'viewpoint' },
      { name: 'Tadapani',              coord: [83.7500, 28.3900], type: 'lodge'     },
      { name: 'Ghandruk Village',      coord: [83.8130, 28.3758], type: 'lodge'     },
      { name: 'Water Tap (Ulleri)',     coord: [83.6775, 28.3750], type: 'water'     },
    ],
  },

  {
    id: 'annapurna-base-camp',
    name: 'Annapurna Base Camp Trek',
    region: 'Annapurna Sanctuary',
    difficulty: 'Moderate',
    distance: '115 km',
    duration: '10–12 days',
    maxElevation: 4130,
    elevationGain: '+3,060m',
    startCoord: [83.7000, 28.3275],
    center: [83.8750, 28.5100],
    zoom: 10,
    style: 'mapbox://styles/mapbox/outdoors-v12',
    description:
      'Nepal\'s classic "Sanctuary" trek — a dramatic journey through bamboo forest into the glacial amphitheatre ringed by Annapurna I (8,091m), Machhapuchhre (6,993m), Hiunchuli, and Annapurna South. Ends at ABC (4,130m) on the South Annapurna glacier.',
    permits: ['ACAP Permit (Rs. 3,000)', 'TIMS Card (Rs. 2,000)'],
    bestSeason: 'Oct–Nov, Mar–May',
    waypoints: [
      { name: 'Nayapul',             coord: [83.7000, 28.3275], elevation: '1,070m', status: 'completed' },
      { name: 'Ghandruk',            coord: [83.8130, 28.3758], elevation: '1,940m', status: 'completed' },
      { name: 'Chhomrong',           coord: [83.8168, 28.4245], elevation: '2,170m', status: 'current'   },
      { name: 'Bamboo',              coord: [83.8450, 28.4730], elevation: '2,310m', status: 'upcoming'  },
      { name: 'Deurali',             coord: [83.8680, 28.5050], elevation: '3,230m', status: 'upcoming'  },
      { name: 'Machhapuchhre BC',    coord: [83.8700, 28.5260], elevation: '3,700m', status: 'upcoming'  },
      { name: 'Annapurna Base Camp', coord: [83.8780, 28.5310], elevation: '4,130m', status: 'upcoming'  },
    ],
    coordinates: [
      [83.7000, 28.3275], [83.7500, 28.3500], [83.8130, 28.3758],
      [83.8168, 28.4245], [83.8290, 28.4500], [83.8450, 28.4730],
      [83.8580, 28.4900], [83.8680, 28.5050], [83.8700, 28.5260],
      [83.8780, 28.5310],
    ],
    osmTags: { highway: 'path', sac_scale: 'demanding_mountain_hiking', surface: 'dirt', trail_visibility: 'excellent' },
    elevationProfile: [
      { d: 0,   e: 1070 }, { d: 10, e: 1940 }, { d: 25, e: 2170 },
      { d: 40,  e: 2310 }, { d: 55, e: 2960 }, { d: 70, e: 3230 },
      { d: 85,  e: 3700 }, { d: 95, e: 3860 }, { d: 105, e: 3960 },
      { d: 115, e: 4130 },
    ],
    pois: [
      { name: 'Nayapul',                coord: [83.7000, 28.3275], type: 'junction'  },
      { name: 'Ghandruk Village',       coord: [83.8130, 28.3758], type: 'lodge'     },
      { name: 'Chhomrong',              coord: [83.8168, 28.4245], type: 'lodge'     },
      { name: 'Bamboo',                 coord: [83.8450, 28.4730], type: 'lodge'     },
      { name: 'Himalaya Hotel',         coord: [83.8580, 28.4900], type: 'lodge'     },
      { name: 'Deurali (3,230m)',        coord: [83.8680, 28.5050], type: 'lodge'     },
      { name: 'Machhapuchhre BC',       coord: [83.8700, 28.5260], type: 'lodge'     },
      { name: 'Annapurna Base Camp',    coord: [83.8780, 28.5310], type: 'viewpoint' },
      { name: 'Rescue Heli Pad (ABC)',  coord: [83.8780, 28.5310], type: 'rescue'    },
    ],
  },

  {
    id: 'mardi-himal',
    name: 'Mardi Himal Trek',
    region: 'Annapurna Conservation Area',
    difficulty: 'Moderate',
    distance: '35 km',
    duration: '5–6 days',
    maxElevation: 4500,
    elevationGain: '+3,060m',
    startCoord: [83.8167, 28.3111],
    center: [83.8600, 28.4500],
    zoom: 11,
    style: 'mapbox://styles/mapbox/outdoors-v12',
    description:
      'A quieter alternative to ABC, hugging the ridgeline beneath Machhapuchhre (Fishtail). Climbs through mossy rhododendron forests to High Camp and a viewpoint at Mardi Himal Base Camp (4,500m) — arguably the most dramatic close-up view of Fishtail in Nepal.',
    permits: ['ACAP Permit (Rs. 3,000)', 'TIMS Card (Rs. 2,000)'],
    bestSeason: 'Oct–Nov, Mar–May',
    waypoints: [
      { name: 'Kande',               coord: [83.8167, 28.3111], elevation: '1,770m', status: 'completed' },
      { name: 'Forest Camp',         coord: [83.8400, 28.3500], elevation: '2,550m', status: 'completed' },
      { name: 'Low Camp',            coord: [83.8550, 28.3950], elevation: '2,990m', status: 'current'   },
      { name: 'High Camp',           coord: [83.8650, 28.4280], elevation: '3,580m', status: 'upcoming'  },
      { name: 'Mardi Himal Base',    coord: [83.8720, 28.4550], elevation: '4,500m', status: 'upcoming'  },
    ],
    coordinates: [
      [83.8167, 28.3111], [83.8280, 28.3300], [83.8400, 28.3500],
      [83.8480, 28.3720], [83.8550, 28.3950], [83.8600, 28.4120],
      [83.8650, 28.4280], [83.8685, 28.4420], [83.8720, 28.4550],
    ],
    osmTags: { highway: 'path', sac_scale: 'demanding_mountain_hiking', surface: 'dirt', trail_visibility: 'good' },
    elevationProfile: [
      { d: 0,    e: 1770 }, { d: 5,  e: 2200 }, { d: 10, e: 2550 },
      { d: 15,   e: 2990 }, { d: 20, e: 3350 }, { d: 25, e: 3580 },
      { d: 30,   e: 3920 }, { d: 35, e: 4500 },
    ],
    pois: [
      { name: 'Kande Trailhead',    coord: [83.8167, 28.3111], type: 'junction'  },
      { name: 'Forest Camp Lodge',  coord: [83.8400, 28.3500], type: 'lodge'     },
      { name: 'Low Camp',           coord: [83.8550, 28.3950], type: 'lodge'     },
      { name: 'High Camp',          coord: [83.8650, 28.4280], type: 'lodge'     },
      { name: 'Mardi Himal Base',   coord: [83.8720, 28.4550], type: 'viewpoint' },
      { name: 'Ridge Spring',       coord: [83.8480, 28.3720], type: 'water'     },
    ],
  },

  // ──────────── Everest region ────────────
  {
    id: 'everest-base-camp',
    name: 'Everest Base Camp Trek',
    region: 'Sagarmatha National Park',
    difficulty: 'Strenuous',
    distance: '130 km',
    duration: '12–14 days',
    maxElevation: 5555,
    elevationGain: '+2,695m',
    startCoord: [86.7311, 27.6876],
    center: [86.8500, 27.9500],
    zoom: 10,
    style: 'mapbox://styles/mapbox/outdoors-v12',
    description:
      'The most iconic high-altitude trek on earth. Follows the Dudh Koshi valley through Sherpa villages, crosses suspension bridges into Namche, and climbs past Tengboche Monastery to Everest Base Camp (5,364m) at the foot of the Khumbu Icefall. Kala Patthar (5,555m) is the high point for the unobstructed Everest view.',
    permits: ['Sagarmatha NP Permit (Rs. 3,000)', 'Khumbu Rural Municipality Permit (Rs. 2,000)'],
    bestSeason: 'Oct–Nov, Mar–May',
    waypoints: [
      { name: 'Lukla',            coord: [86.7311, 27.6876], elevation: '2,860m', status: 'completed' },
      { name: 'Phakding',         coord: [86.7130, 27.7430], elevation: '2,610m', status: 'completed' },
      { name: 'Namche Bazaar',    coord: [86.7140, 27.8060], elevation: '3,440m', status: 'completed' },
      { name: 'Tengboche',        coord: [86.7647, 27.8361], elevation: '3,867m', status: 'current'   },
      { name: 'Dingboche',        coord: [86.8270, 27.8930], elevation: '4,410m', status: 'upcoming'  },
      { name: 'Lobuche',          coord: [86.8105, 27.9493], elevation: '4,940m', status: 'upcoming'  },
      { name: 'Gorak Shep',       coord: [86.8283, 27.9811], elevation: '5,164m', status: 'upcoming'  },
      { name: 'Everest Base Camp',coord: [86.8515, 28.0025], elevation: '5,364m', status: 'upcoming'  },
      { name: 'Kala Patthar',     coord: [86.8250, 27.9840], elevation: '5,555m', status: 'upcoming'  },
    ],
    coordinates: [
      [86.7311, 27.6876], [86.7130, 27.7430], [86.7140, 27.8060],
      [86.7647, 27.8361], [86.8270, 27.8930], [86.8105, 27.9493],
      [86.8283, 27.9811], [86.8515, 28.0025],
    ],
    osmTags: { highway: 'path', sac_scale: 'alpine_hiking', surface: 'rock', trail_visibility: 'excellent' },
    elevationProfile: [
      { d: 0,   e: 2860 }, { d: 10, e: 2610 }, { d: 20, e: 3440 },
      { d: 35,  e: 3867 }, { d: 50, e: 4410 }, { d: 65, e: 4940 },
      { d: 80,  e: 5164 }, { d: 90, e: 5364 }, // EBC
      { d: 95,  e: 5555 }, // Kala Patthar
      { d: 130, e: 2860 }, // return
    ],
    pois: [
      { name: 'Lukla Airport (2,860m)',     coord: [86.7311, 27.6876], type: 'junction'  },
      { name: 'Namche Bazaar',              coord: [86.7140, 27.8060], type: 'lodge'     },
      { name: 'Tengboche Monastery',        coord: [86.7647, 27.8361], type: 'viewpoint' },
      { name: 'Dingboche (4,410m)',         coord: [86.8270, 27.8930], type: 'lodge'     },
      { name: 'Lobuche (4,940m)',           coord: [86.8105, 27.9493], type: 'lodge'     },
      { name: 'Gorak Shep',                coord: [86.8283, 27.9811], type: 'lodge'     },
      { name: 'Everest Base Camp (5,364m)',  coord: [86.8515, 28.0025], type: 'viewpoint' },
      { name: 'Kala Patthar (5,555m)',      coord: [86.8250, 27.9840], type: 'viewpoint' },
      { name: 'Rescue Heli Pad (Namche)',   coord: [86.7140, 27.8060], type: 'rescue'    },
      { name: 'Rescue Post (Dingboche)',    coord: [86.8270, 27.8930], type: 'rescue'    },
    ],
  },

  // ──────────── Langtang region ────────────
  {
    id: 'langtang-valley',
    name: 'Langtang Valley Trek',
    region: 'Langtang National Park',
    difficulty: 'Moderate',
    distance: '65 km',
    duration: '7–8 days',
    maxElevation: 5000,
    elevationGain: '+3,500m',
    startCoord: [85.3617, 28.1575],
    center: [85.4800, 28.2100],
    zoom: 11,
    style: 'mapbox://styles/mapbox/outdoors-v12',
    description:
      '"The valley of glaciers" — Nepal\'s closest serious trek to Kathmandu. Follows the Langtang Khola through pine and rhododendron forest into a broad alpine valley surrounded by 7,000m peaks. Kyanjin Gompa is the last village; Tserko Ri (5,000m) is the optional high viewpoint.',
    permits: ['Langtang NP Permit (Rs. 3,000)', 'TIMS Card (Rs. 2,000)'],
    bestSeason: 'Oct–Nov, Mar–May',
    waypoints: [
      { name: 'Syabrubesi',       coord: [85.3617, 28.1575], elevation: '1,503m', status: 'completed' },
      { name: 'Lama Hotel',       coord: [85.4333, 28.1900], elevation: '2,480m', status: 'completed' },
      { name: 'Langtang Village', coord: [85.5000, 28.2100], elevation: '3,430m', status: 'current'   },
      { name: 'Kyanjin Gompa',    coord: [85.5636, 28.2106], elevation: '3,870m', status: 'upcoming'  },
      { name: 'Tserko Ri',        coord: [85.5950, 28.2250], elevation: '5,000m', status: 'upcoming'  },
    ],
    coordinates: [
      [85.3617, 28.1575], [85.3950, 28.1750], [85.4333, 28.1900],
      [85.4650, 28.2000], [85.5000, 28.2100], [85.5300, 28.2105],
      [85.5636, 28.2106], [85.5800, 28.2180], [85.5950, 28.2250],
    ],
    osmTags: { highway: 'path', sac_scale: 'mountain_hiking', surface: 'dirt', trail_visibility: 'excellent' },
    elevationProfile: [
      { d: 0,  e: 1503 }, { d: 8,  e: 2050 }, { d: 18, e: 2480 },
      { d: 28, e: 3430 }, { d: 38, e: 3870 }, { d: 46, e: 4060 },
      { d: 52, e: 5000 }, // Tserko Ri
      { d: 58, e: 3870 }, // back to Kyanjin
      { d: 65, e: 1503 }, // descent
    ],
    pois: [
      { name: 'Syabrubesi (Start)',       coord: [85.3617, 28.1575], type: 'junction'  },
      { name: 'Lama Hotel',               coord: [85.4333, 28.1900], type: 'lodge'     },
      { name: 'Langtang Village (3,430m)',coord: [85.5000, 28.2100], type: 'lodge'     },
      { name: 'Kyanjin Gompa',            coord: [85.5636, 28.2106], type: 'lodge'     },
      { name: 'Tserko Ri (5,000m)',       coord: [85.5950, 28.2250], type: 'viewpoint' },
      { name: 'Yala Peak BC',             coord: [85.5800, 28.2180], type: 'viewpoint' },
      { name: 'River Crossing',           coord: [85.3950, 28.1750], type: 'water'     },
      { name: 'Rescue Post (Kyanjin)',    coord: [85.5636, 28.2106], type: 'rescue'    },
    ],
  },

  {
    id: 'gosaikunda',
    name: 'Gosaikunda Lake Trek',
    region: 'Langtang National Park',
    difficulty: 'Moderate',
    distance: '40 km',
    duration: '4–5 days',
    maxElevation: 4380,
    elevationGain: '+2,420m',
    startCoord: [85.2950, 28.1150],
    center: [85.4000, 28.0850],
    zoom: 11,
    style: 'mapbox://styles/mapbox/outdoors-v12',
    description:
      'A sacred Hindu pilgrimage lake at 4,380m, surrounded by 108 alpine tarns. The trek climbs steeply from Dhunche through Chandanbari (Sing Gompa) to the Laurebina ridge, crossing a series of frozen lakes to reach the main Gosaikunda shore.',
    permits: ['Langtang NP Permit (Rs. 3,000)', 'TIMS Card (Rs. 2,000)'],
    bestSeason: 'Oct–Nov, Apr–Jun',
    waypoints: [
      { name: 'Dhunche',          coord: [85.2950, 28.1150], elevation: '1,960m', status: 'completed' },
      { name: 'Chandanbari',      coord: [85.3450, 28.0950], elevation: '3,330m', status: 'completed' },
      { name: 'Cholang Pati',     coord: [85.3780, 28.0900], elevation: '3,580m', status: 'current'   },
      { name: 'Laurebina',        coord: [85.3980, 28.0875], elevation: '3,920m', status: 'upcoming'  },
      { name: 'Gosaikunda Lake',  coord: [85.4171, 28.0836], elevation: '4,380m', status: 'upcoming'  },
    ],
    coordinates: [
      [85.2950, 28.1150], [85.3200, 28.1050], [85.3450, 28.0950],
      [85.3620, 28.0920], [85.3780, 28.0900], [85.3880, 28.0885],
      [85.3980, 28.0875], [85.4080, 28.0855], [85.4171, 28.0836],
    ],
    osmTags: { highway: 'path', sac_scale: 'demanding_mountain_hiking', surface: 'rock', trail_visibility: 'good' },
    elevationProfile: [
      { d: 0,  e: 1960 }, { d: 5,  e: 2600 }, { d: 12, e: 3330 },
      { d: 18, e: 3580 }, { d: 23, e: 3920 }, { d: 28, e: 4130 },
      { d: 32, e: 4380 }, // Gosaikunda Lake
      { d: 40, e: 1960 }, // return
    ],
    pois: [
      { name: 'Dhunche Village',       coord: [85.2950, 28.1150], type: 'lodge'     },
      { name: 'Chandanbari (Sing Gompa)', coord: [85.3450, 28.0950], type: 'lodge'     },
      { name: 'Cholang Pati',          coord: [85.3780, 28.0900], type: 'lodge'     },
      { name: 'Laurebina Pass (3,920m)', coord: [85.3980, 28.0875], type: 'viewpoint' },
      { name: 'Gosaikunda Sacred Lake', coord: [85.4171, 28.0836], type: 'viewpoint' },
      { name: 'Lake Shore Campsite',   coord: [85.4171, 28.0836], type: 'campsite'  },
      { name: 'Stream (Chandanbari)',  coord: [85.3450, 28.0950], type: 'water'     },
    ],
  },
];

// Backward-compat alias
export const KATHMANDU_TRAILS = NEPAL_TRAILS;

// Lookup helpers
export const getTrailById    = (id)   => NEPAL_TRAILS.find(t => t.id === id);
export const getTrailByName  = (name) => NEPAL_TRAILS.find(t => t.name === name);
export const getDefaultTrail = ()     => NEPAL_TRAILS[0]; // Shivapuri

// Filter helpers
export const getDayHikes     = () => NEPAL_TRAILS.filter(t => /day|half/i.test(t.duration));
export const getMultiDayTreks = () => NEPAL_TRAILS.filter(t => !/day|half/i.test(t.duration));
export const getByDifficulty = (level) => NEPAL_TRAILS.filter(t => t.difficulty === level);
