#!/usr/bin/env python3
"""
fetch_osm_trails.py
====================
Fetches real trail geometries for Nepal from OpenStreetMap via the Overpass API
and writes them as GeoJSON + updates the kathmandu_trails.js coordinate arrays.

Usage
-----
  pip install requests
  python scripts/fetch_osm_trails.py

Output
------
  scripts/osm_output/          ← one .geojson per trail
  scripts/osm_output/all.geojson  ← merged FeatureCollection
  (also prints JS coordinate arrays ready to paste into kathmandu_trails.js)

Overpass API
------------
  Public instance: https://overpass-api.de/api/interpreter
  Backup:          https://lz4.overpass-api.de/api/interpreter
  Rate-limit: max 1 request every 2 s, no bulk downloads.

OSM tags used
-------------
  highway=path | footway  – hiking paths
  route=hiking             – official hiking routes (relations)
  sac_scale                – hiking difficulty
  trail_visibility         – how visible the path is
  surface                  – dirt, rock, grass, etc.
  ele                      – elevation (on nodes/ways)

The 10 Nepal trails we target
------------------------------
  Hikes (Kathmandu Valley)
    1.  sundarijal-chisapani  OSM relation 12345678 (example – update with real ID)
    2.  shivapuri             OSM relation ~
    3.  nagarkot-changu       OSM relation ~
    4.  phulchowki            OSM relation ~
    5.  champadevi            OSM relation ~
    6.  nagarjun              OSM relation ~
    7.  chandragiri           OSM relation ~
  Treks
    8.  helambu               OSM relation ~
    9.  langtang-valley       OSM relation ~
   10.  gosaikunda            OSM relation ~

  (Other treks: poon-hill, annapurna-base-camp, mardi-himal, everest-base-camp
   are included but have a larger footprint – use `zoom_out=True` below.)

Finding the right OSM relation ID
----------------------------------
  1. Go to https://www.openstreetmap.org
  2. Search for the trail name, e.g. "Sundarijal Chisapani trail Nepal"
  3. Click the relation result → note the numeric ID in the URL
  4. Put it in OSM_RELATION_IDS below.

  You can also browse:
    https://overpass-turbo.eu
  and run:
    [out:json]; relation["route"="hiking"]["name"~"Chisapani"]; out geom;
"""

import json, time, os, sys
from pathlib import Path

try:
    import requests
except ImportError:
    sys.exit("Run: pip install requests")

# ── Edit these once you have the real relation IDs from openstreetmap.org ───
OSM_RELATION_IDS = {
    "sundarijal-chisapani": None,   # e.g. 12345678
    "shivapuri":            None,
    "nagarkot-changu":      None,
    "phulchowki":           None,
    "champadevi":           None,
    "nagarjun":             None,
    "chandragiri":          None,
    "helambu":              None,
    "langtang-valley":      None,
    "gosaikunda":           None,
    "poon-hill":            None,
    "annapurna-base-camp":  None,
    "everest-base-camp":    None,
}

# Bounding-box fallback queries when relation ID is unknown
# Format: (south, west, north, east)
BBOX_QUERIES = {
    "sundarijal-chisapani": (27.74, 85.37, 27.80, 85.41),
    "shivapuri":            (27.77, 85.34, 27.83, 85.38),
    "nagarkot-changu":      (27.70, 85.42, 27.73, 85.54),
    "phulchowki":           (27.57, 85.37, 27.61, 85.41),
    "champadevi":           (27.58, 85.25, 27.60, 85.30),
    "nagarjun":             (27.72, 85.27, 27.76, 85.31),
    "chandragiri":          (27.64, 85.19, 27.68, 85.23),
    "helambu":              (27.74, 85.38, 27.90, 85.67),
    "langtang-valley":      (28.14, 85.34, 28.25, 85.62),
    "gosaikunda":           (28.07, 85.28, 28.12, 85.43),
    "poon-hill":            (28.32, 83.67, 28.42, 83.82),
    "annapurna-base-camp":  (28.32, 83.69, 28.54, 83.90),
    "everest-base-camp":    (27.68, 86.70, 28.01, 86.87),
}

OVERPASS_ENDPOINT = "https://overpass-api.de/api/interpreter"
OUT_DIR = Path(__file__).parent / "osm_output"


def overpass_query_by_relation(relation_id: int) -> dict:
    """Fetch a complete hiking relation (way + node geometry)."""
    query = f"""
    [out:json][timeout:30];
    relation({relation_id});
    (._;>;);
    out geom;
    """
    r = requests.post(OVERPASS_ENDPOINT, data={"data": query}, timeout=35)
    r.raise_for_status()
    return r.json()


def overpass_query_by_bbox(bbox: tuple) -> dict:
    """Fetch all hiking paths inside a bounding box."""
    s, w, n, e = bbox
    query = f"""
    [out:json][timeout:30];
    (
      way["highway"~"path|footway"]["sac_scale"]({s},{w},{n},{e});
      way["route"="hiking"]({s},{w},{n},{e});
      relation["route"="hiking"]({s},{w},{n},{e});
    );
    out geom;
    """
    r = requests.post(OVERPASS_ENDPOINT, data={"data": query}, timeout=35)
    r.raise_for_status()
    return r.json()


def osm_to_geojson(osm_data: dict, trail_id: str) -> dict:
    """Convert raw Overpass JSON to a GeoJSON FeatureCollection."""
    features = []

    for el in osm_data.get("elements", []):
        if el["type"] == "way" and "geometry" in el:
            coords = [[n["lon"], n["lat"]] for n in el["geometry"]]
            tags = el.get("tags", {})
            features.append({
                "type": "Feature",
                "properties": {
                    "osm_id":            el["id"],
                    "name":              tags.get("name", ""),
                    "highway":           tags.get("highway", "path"),
                    "sac_scale":         tags.get("sac_scale", ""),
                    "trail_visibility":  tags.get("trail_visibility", ""),
                    "surface":           tags.get("surface", ""),
                    "ele":               tags.get("ele", ""),
                    "trail_id":          trail_id,
                },
                "geometry": {
                    "type": "LineString",
                    "coordinates": coords,
                },
            })

        elif el["type"] == "relation":
            tags = el.get("tags", {})
            # Collect all member ways in order
            for member in el.get("members", []):
                if member.get("type") == "way" and "geometry" in member:
                    coords = [[n["lon"], n["lat"]] for n in member["geometry"]]
                    features.append({
                        "type": "Feature",
                        "properties": {
                            "osm_id":    el["id"],
                            "name":      tags.get("name", ""),
                            "route":     tags.get("route", "hiking"),
                            "sac_scale": tags.get("sac_scale", ""),
                            "network":   tags.get("network", ""),
                            "trail_id":  trail_id,
                        },
                        "geometry": {
                            "type": "LineString",
                            "coordinates": coords,
                        },
                    })

    return {"type": "FeatureCollection", "features": features}


def geojson_to_js_coords(geojson: dict) -> list:
    """
    Extract a simplified [lon, lat] list from all LineStrings,
    suitable for pasting into kathmandu_trails.js coordinates[].
    Reduces density: keeps every Nth point.
    """
    all_coords = []
    for f in geojson["features"]:
        all_coords.extend(f["geometry"]["coordinates"])

    # Reduce to ~30 representative points
    step = max(1, len(all_coords) // 30)
    reduced = all_coords[::step]
    if all_coords and (not reduced or reduced[-1] != all_coords[-1]):
        reduced.append(all_coords[-1])

    return [[round(c[0], 4), round(c[1], 4)] for c in reduced]


def main():
    OUT_DIR.mkdir(exist_ok=True)
    all_features = []

    for trail_id, rel_id in OSM_RELATION_IDS.items():
        print(f"\n{'='*60}")
        print(f"  Fetching: {trail_id}")

        try:
            if rel_id:
                print(f"  Method: OSM relation {rel_id}")
                raw = overpass_query_by_relation(rel_id)
            else:
                bbox = BBOX_QUERIES.get(trail_id)
                if not bbox:
                    print(f"  SKIP — no relation ID and no bbox defined")
                    continue
                print(f"  Method: bbox {bbox}")
                raw = overpass_query_by_bbox(bbox)

            geojson = osm_to_geojson(raw, trail_id)
            count = len(geojson["features"])
            print(f"  Got {count} way segments")

            if count == 0:
                print(f"  WARNING: no features returned — check bbox or relation ID")
                continue

            # Save individual GeoJSON
            out_path = OUT_DIR / f"{trail_id}.geojson"
            with open(out_path, "w") as f:
                json.dump(geojson, f, indent=2)
            print(f"  Saved → {out_path}")

            # Print JS coordinate array
            js_coords = geojson_to_js_coords(geojson)
            print(f"\n  // ── Paste into kathmandu_trails.js > {trail_id} > coordinates ──")
            print(f"  coordinates: [")
            for i, c in enumerate(js_coords):
                comma = "," if i < len(js_coords) - 1 else ""
                print(f"    [{c[0]}, {c[1]}]{comma}")
            print(f"  ],")

            all_features.extend(geojson["features"])

        except Exception as e:
            print(f"  ERROR: {e}")
        finally:
            time.sleep(2)  # Overpass rate limit

    # Save merged FeatureCollection
    merged = {"type": "FeatureCollection", "features": all_features}
    merged_path = OUT_DIR / "all_trails.geojson"
    with open(merged_path, "w") as f:
        json.dump(merged, f, indent=2)
    print(f"\n\nAll trails merged → {merged_path}")
    print(f"Total features: {len(all_features)}")
    print("""
Next steps
----------
1. Copy the printed coordinate arrays into frontend/src/constants/kathmandu_trails.js
2. Load all_trails.geojson into Mapbox Studio for custom styling
3. (Optional) run tippecanoe to create MBTiles for offline use:
     tippecanoe -o nepal_trails.mbtiles -Z6 -z14 \\
       --drop-densest-as-needed --layer=trails \\
       scripts/osm_output/all_trails.geojson
""")


if __name__ == "__main__":
    main()
