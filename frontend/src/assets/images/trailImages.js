// Remote hero photos for each Kathmandu-valley trail (Unsplash — royalty-free).
// These are fetched at runtime by the user's device, so no bundle-size impact.
// Keyed by trail id from constants/kathmandu_trails.js.

export const TRAIL_IMAGES = {
  // ── Kathmandu Valley hikes ──
  'sundarijal-chisapani':
    'https://images.unsplash.com/photo-1476514525535-07fb3b4ae5f1?auto=format&fit=crop&w=1200&q=70',
  nagarjun:
    'https://images.unsplash.com/photo-1511497584788-876760111969?auto=format&fit=crop&w=1200&q=70',
  chandragiri:
    'https://images.unsplash.com/photo-1464822759023-fed622ff2c3b?auto=format&fit=crop&w=1200&q=70',
  helambu:
    'https://images.unsplash.com/photo-1544735716-392fe2489ffa?auto=format&fit=crop&w=1200&q=70',
  shivapuri:
    'https://images.unsplash.com/photo-1605640840605-14ac1855827b?auto=format&fit=crop&w=1200&q=70',
  'nagarkot-changu':
    'https://images.unsplash.com/photo-1544735716-392fe2489ffa?auto=format&fit=crop&w=1200&q=70',
  phulchowki:
    'https://images.unsplash.com/photo-1501785888041-af3ef285b470?auto=format&fit=crop&w=1200&q=70',
  champadevi:
    'https://images.unsplash.com/photo-1506905925346-21bda4d32df4?auto=format&fit=crop&w=1200&q=70',
  // Annapurna region
  'poon-hill':
    'https://images.unsplash.com/photo-1464822759023-fed622ff2c3b?auto=format&fit=crop&w=1200&q=70',
  'annapurna-base-camp':
    'https://images.unsplash.com/photo-1486911278844-a81c5267e227?auto=format&fit=crop&w=1200&q=70',
  'mardi-himal':
    'https://images.unsplash.com/photo-1454496522488-7a8e488e8606?auto=format&fit=crop&w=1200&q=70',
  // Everest region
  'everest-base-camp':
    'https://images.unsplash.com/photo-1519681393784-d120267933ba?auto=format&fit=crop&w=1200&q=70',
  // Langtang region
  'langtang-valley':
    'https://images.unsplash.com/photo-1486870591958-9b9d0d1dda99?auto=format&fit=crop&w=1200&q=70',
  gosaikunda:
    'https://images.unsplash.com/photo-1493558103817-58b2924bce98?auto=format&fit=crop&w=1200&q=70',
};

// Generic fallbacks for screens that want a trail photo but don't have a specific id
export const GENERIC_TRAIL_IMAGES = [
  'https://images.unsplash.com/photo-1464822759023-fed622ff2c3b?auto=format&fit=crop&w=1200&q=70',
  'https://images.unsplash.com/photo-1454496522488-7a8e488e8606?auto=format&fit=crop&w=1200&q=70',
  'https://images.unsplash.com/photo-1519681393784-d120267933ba?auto=format&fit=crop&w=1200&q=70',
  'https://images.unsplash.com/photo-1486870591958-9b9d0d1dda99?auto=format&fit=crop&w=1200&q=70',
];

export function getTrailImage(id, fallbackIndex = 0) {
  if (id && TRAIL_IMAGES[id]) return TRAIL_IMAGES[id];
  return GENERIC_TRAIL_IMAGES[fallbackIndex % GENERIC_TRAIL_IMAGES.length];
}
