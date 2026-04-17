import { useState, useRef, useMemo, useEffect } from 'react';
import {
  View, Text, StyleSheet, TouchableOpacity, Alert,
  StatusBar, ScrollView, Platform, Dimensions, Animated,
} from 'react-native';
import {
  ArrowLeft, Layers, Plus, Minus, Locate, RotateCcw,
  Pause, Play, AlertTriangle,
} from 'lucide-react-native';

const { width: SCREEN_W } = Dimensions.get('window');
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import * as Location from 'expo-location';
import Constants from 'expo-constants';
import MapboxMock from '../../utils/MapboxMock';

const isExpoGo = Constants.executionEnvironment === 'storeClient';
const MapboxGL = isExpoGo ? MapboxMock : require('@rnmapbox/maps').default;
import { colors } from '../../constants/colors';
import { getTrailById, getTrailByName, getDefaultTrail } from '../../constants/kathmandu_trails';

// ── Constants ──────────────────────────────────────────────────────────
const ADVANCE_RADIUS_M = 80;
const FOLLOW_ZOOM      = 15.5;

const MAP_STYLES = {
  Outdoors:  'mapbox://styles/mapbox/outdoors-v12',
  Satellite: 'mapbox://styles/mapbox/satellite-streets-v12',
};

const STATUS_COLOR = {
  completed: colors.success,
  current:   colors.primary,
  upcoming:  colors.border,
};

// ── Haversine distance (metres) ────────────────────────────────────────
function haversineM([lng1, lat1], [lng2, lat2]) {
  const R = 6371000;
  const dLat = ((lat2 - lat1) * Math.PI) / 180;
  const dLng = ((lng2 - lng1) * Math.PI) / 180;
  const a =
    Math.sin(dLat / 2) ** 2 +
    Math.cos((lat1 * Math.PI) / 180) *
      Math.cos((lat2 * Math.PI) / 180) *
      Math.sin(dLng / 2) ** 2;
  return R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
}

// ── Split trail into completed / upcoming at current waypoint ─────────
function splitTrailSegments(coordinates, waypoints) {
  const currentIdx = waypoints.findIndex((w) => w.status === 'current');
  if (currentIdx === -1) return { completed: coordinates, upcoming: [] };

  const currentCoord = waypoints[currentIdx].coord;
  let splitAt = 0;
  let minDist = Infinity;
  for (let i = 0; i < coordinates.length; i++) {
    const dx = coordinates[i][0] - currentCoord[0];
    const dy = coordinates[i][1] - currentCoord[1];
    const d  = dx * dx + dy * dy;
    if (d < minDist) { minDist = d; splitAt = i; }
  }
  return {
    completed: coordinates.slice(0, splitAt + 1),
    upcoming:  coordinates.slice(splitAt),
  };
}

// ── Pulsing dot (tracking badge) ──────────────────────────────────────
function PulsingDot({ color = colors.success, size = 8 }) {
  const pulse = useRef(new Animated.Value(1)).current;
  useEffect(() => {
    Animated.loop(
      Animated.sequence([
        Animated.timing(pulse, { toValue: 2,   duration: 700, useNativeDriver: true }),
        Animated.timing(pulse, { toValue: 1,   duration: 700, useNativeDriver: true }),
      ]),
    ).start();
  }, []);
  return (
    <View style={{ width: size * 2.5, height: size * 2.5, alignItems: 'center', justifyContent: 'center' }}>
      <Animated.View style={{
        position: 'absolute',
        width: size, height: size, borderRadius: size / 2,
        backgroundColor: color, opacity: 0.35,
        transform: [{ scale: pulse }],
      }} />
      <View style={{ width: size, height: size, borderRadius: size / 2, backgroundColor: color }} />
    </View>
  );
}

// ── Main Screen ───────────────────────────────────────────────────────
export default function MapViewScreen({ route, navigation }) {
  const insets    = useSafeAreaInsets();
  const cameraRef = useRef(null);
  const followRef = useRef(false);
  const zoomLvl   = useRef(null);

  const { trailId, trailName, tracking = false } = route.params || {};
  const baseTrail = getTrailById(trailId) || getTrailByName(trailName) || getDefaultTrail();

  // Live waypoints state (mutated during tracking)
  const [waypoints,      setWaypoints]      = useState(() => baseTrail.waypoints.map((w) => ({ ...w })));
  const [styleKey,       setStyleKey]       = useState('Outdoors');
  const [sheetExpanded,  setSheetExpanded]  = useState(false);
  const [userLocation,   setUserLocation]   = useState(null);
  const [trackingActive, setTrackingActive] = useState(tracking);
  const [elapsedSecs,    setElapsedSecs]    = useState(0);

  const trail = useMemo(() => ({ ...baseTrail, waypoints }), [baseTrail, waypoints]);

  // ── Elapsed timer ──────────────────────────────────────────────────
  useEffect(() => {
    if (!tracking) return;
    const id = setInterval(() => setElapsedSecs((s) => s + 1), 1000);
    return () => clearInterval(id);
  }, [tracking]);

  const elapsedLabel = useMemo(() => {
    const h = Math.floor(elapsedSecs / 3600);
    const m = Math.floor((elapsedSecs % 3600) / 60);
    const s = elapsedSecs % 60;
    return h > 0
      ? `${h}:${String(m).padStart(2, '0')}:${String(s).padStart(2, '0')}`
      : `${String(m).padStart(2, '0')}:${String(s).padStart(2, '0')}`;
  }, [elapsedSecs]);

  // ── GPS watch (tracking mode only — for auto-advance) ─────────────
  useEffect(() => {
    if (!tracking) return;
    let subscription;
    (async () => {
      const { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== 'granted') return;
      subscription = await Location.watchPositionAsync(
        { accuracy: Location.Accuracy.BestForNavigation, distanceInterval: 4 },
        (loc) => {
          const coord = [loc.coords.longitude, loc.coords.latitude];
          setUserLocation(coord);
          if (trackingActive) {
            setWaypoints((prev) => advanceWaypoints(prev, coord));
            if (followRef.current) {
              cameraRef.current?.setCamera({
                centerCoordinate: coord,
                zoomLevel:        FOLLOW_ZOOM,
                animationDuration: 350,
              });
            }
          }
        },
      );
      followRef.current = true;
    })();
    return () => subscription?.remove();
  }, [tracking]);

  // ── Auto-advance waypoints ─────────────────────────────────────────
  function advanceWaypoints(wps, userCoord) {
    const currentIdx = wps.findIndex((w) => w.status === 'current');
    if (currentIdx === -1 || currentIdx + 1 >= wps.length) return wps;
    const nextWp = wps[currentIdx + 1];
    if (haversineM(userCoord, nextWp.coord) <= ADVANCE_RADIUS_M) {
      return wps.map((w, i) => {
        if (i === currentIdx)     return { ...w, status: 'completed' };
        if (i === currentIdx + 1) return { ...w, status: 'current' };
        return w;
      });
    }
    return wps;
  }

  // ── Trail segment GeoJSON ──────────────────────────────────────────
  const { completed, upcoming } = useMemo(
    () => splitTrailSegments(trail.coordinates, trail.waypoints),
    [trail.coordinates, trail.waypoints],
  );

  const completedGeoJSON = useMemo(() => ({
    type: 'Feature', geometry: { type: 'LineString', coordinates: completed },
  }), [completed]);

  const upcomingGeoJSON = useMemo(() => ({
    type: 'Feature', geometry: { type: 'LineString', coordinates: upcoming },
  }), [upcoming]);

  // ── Progress ───────────────────────────────────────────────────────
  const progress = Math.round(
    (trail.waypoints.filter((w) => w.status === 'completed').length / trail.waypoints.length) * 100,
  );

  // ── Camera controls ────────────────────────────────────────────────
  const getZoom = () => zoomLvl.current ?? trail.zoom;

  const recenter = () => {
    followRef.current = false;
    cameraRef.current?.setCamera({
      centerCoordinate: trail.center,
      zoomLevel:        trail.zoom,
      animationDuration: 600,
    });
    zoomLvl.current = trail.zoom;
  };

  const centerOnMe = () => {
    if (userLocation) {
      followRef.current = true;
      cameraRef.current?.setCamera({
        centerCoordinate: userLocation,
        zoomLevel:        FOLLOW_ZOOM,
        animationDuration: 500,
      });
      zoomLvl.current = FOLLOW_ZOOM;
    }
  };

  const zoomIn = () => {
    zoomLvl.current = Math.min(getZoom() + 1, 20);
    cameraRef.current?.setCamera({ zoomLevel: zoomLvl.current, animationDuration: 220 });
  };

  const zoomOut = () => {
    zoomLvl.current = Math.max(getZoom() - 1, 5);
    cameraRef.current?.setCamera({ zoomLevel: zoomLvl.current, animationDuration: 220 });
  };

  // ── Pause / resume ─────────────────────────────────────────────────
  const toggleTracking = () => {
    setTrackingActive((prev) => {
      if (!prev && userLocation) {
        followRef.current = true;
        cameraRef.current?.setCamera({
          centerCoordinate: userLocation,
          zoomLevel: FOLLOW_ZOOM,
          animationDuration: 500,
        });
      } else {
        followRef.current = false;
      }
      return !prev;
    });
  };

  // ── SOS ───────────────────────────────────────────────────────────
  const handleSOS = () => {
    Alert.alert(
      'Send SOS?',
      'This will send your GPS location to your emergency contact and alert nearby rescue posts.',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Send SOS',
          style: 'destructive',
          onPress: () =>
            Alert.alert('SOS sent', 'Your location has been shared with your emergency contact.'),
        },
      ],
    );
  };

  const headerTop = (insets.top || 0) + 8;

  return (
    <View style={styles.root}>
      <StatusBar barStyle="dark-content" translucent backgroundColor="transparent" />

      {/* ── Full-screen Mapbox map ─────────────────────────────────── */}
      <MapboxGL.MapView
        style={StyleSheet.absoluteFill}
        styleURL={MAP_STYLES[styleKey]}
        compassEnabled={false}
        attributionPosition={{ bottom: sheetExpanded ? 348 : 200, left: 8 }}
        logoPosition={{ bottom: sheetExpanded ? 348 : 200, left: 80 }}
        onTouchStart={() => { followRef.current = false; }}
      >
        <MapboxGL.Camera
          ref={cameraRef}
          zoomLevel={trail.zoom}
          centerCoordinate={trail.center}
          animationMode="flyTo"
          animationDuration={800}
        />

        {/* Native user location dot (blue heading indicator) */}
        <MapboxGL.UserLocation
          visible={true}
          showsUserHeadingIndicator={true}
          onUpdate={(loc) => {
            const coord = [loc.coords.longitude, loc.coords.latitude];
            setUserLocation(coord);
          }}
        />

        {/* Completed trail segment — solid */}
        {completed.length >= 2 && (
          <MapboxGL.ShapeSource id="completedSource" shape={completedGeoJSON}>
            <MapboxGL.LineLayer
              id="completedHalo"
              style={{ lineColor: '#fff', lineWidth: 8, lineOpacity: 0.45 }}
            />
            <MapboxGL.LineLayer
              id="completedLine"
              style={{
                lineColor: tracking ? colors.accent : colors.primary,
                lineWidth:  4,
                lineOpacity: 0.95,
                lineCap:    'round',
                lineJoin:   'round',
              }}
            />
          </MapboxGL.ShapeSource>
        )}

        {/* Upcoming trail segment — dashed */}
        {upcoming.length >= 2 && (
          <MapboxGL.ShapeSource id="upcomingSource" shape={upcomingGeoJSON}>
            <MapboxGL.LineLayer
              id="upcomingHalo"
              style={{ lineColor: '#fff', lineWidth: 6, lineOpacity: 0.2 }}
            />
            <MapboxGL.LineLayer
              id="upcomingLine"
              style={{
                lineColor:    colors.accentSoft,
                lineWidth:    3,
                lineOpacity:  0.75,
                lineCap:      'round',
                lineJoin:     'round',
                lineDasharray: [2, 3],
              }}
            />
          </MapboxGL.ShapeSource>
        )}

        {/* POI markers */}
        {(trail.pois || []).map((poi, i) => (
          <MapboxGL.MarkerView
            key={`poi-${i}`}
            id={`poi-${i}`}
            coordinate={poi.coord}
            anchor={{ x: 0.5, y: 1 }}
          >
            <View style={styles.poiPin}>
              <Text style={styles.poiEmoji}>{POI_EMOJI[poi.type] || '📍'}</Text>
            </View>
          </MapboxGL.MarkerView>
        ))}

        {/* Waypoint markers */}
        {trail.waypoints.map((wp, i) => (
          <MapboxGL.MarkerView
            key={`wp-${i}`}
            id={`wp-${i}`}
            coordinate={wp.coord}
            anchor={{ x: 0.5, y: 0.5 }}
          >
            <TouchableOpacity activeOpacity={0.8} style={styles.markerTouchArea}>
              <View style={[
                styles.markerOuter,
                { borderColor: STATUS_COLOR[wp.status] },
                wp.status === 'current' && styles.markerCurrent,
              ]}>
                <View style={[styles.markerInner, { backgroundColor: STATUS_COLOR[wp.status] }]} />
              </View>
              <View style={styles.markerLabelWrap}>
                <Text style={styles.markerLabel} numberOfLines={1}>{wp.name}</Text>
                <Text style={styles.markerElev}>{wp.elevation}</Text>
              </View>
            </TouchableOpacity>
          </MapboxGL.MarkerView>
        ))}
      </MapboxGL.MapView>

      {/* ── Floating header ───────────────────────────────────────── */}
      <View style={[styles.header, { paddingTop: headerTop }]}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.ctrlBtnSingle}>
          <ArrowLeft size={20} color={colors.text} strokeWidth={2.25} />
        </TouchableOpacity>

        <View style={styles.headerCenter}>
          <Text style={styles.headerTitle} numberOfLines={1}>{trail.name}</Text>
          {tracking ? (
            <View style={styles.trackingBadge}>
              <PulsingDot color={trackingActive ? colors.success : colors.warning} size={7} />
              <Text style={[styles.trackingLabel, { color: trackingActive ? colors.primary : colors.warning }]}>
                {trackingActive ? `TRACKING  ${elapsedLabel}` : `PAUSED  ${elapsedLabel}`}
              </Text>
            </View>
          ) : (
            <Text style={styles.headerSub}>{trail.region}</Text>
          )}
        </View>

        {/* Style toggle — same look as ExploreScreen layers button */}
        <TouchableOpacity
          style={[styles.ctrlBtnSingle, styleKey === 'Satellite' && styles.ctrlBtnActive]}
          onPress={() => setStyleKey((k) => k === 'Outdoors' ? 'Satellite' : 'Outdoors')}
        >
          <Layers size={18} color={styleKey === 'Satellite' ? '#fff' : colors.text} strokeWidth={2} />
        </TouchableOpacity>
      </View>

      {/* ── Right-side controls (matches ExploreScreen pill style) ── */}
      <View style={[styles.mapControls, { top: headerTop + 56 + 12 }]}>

        {/* Zoom group */}
        <TouchableOpacity style={[styles.ctrlBtn, styles.ctrlFirst]} onPress={zoomIn}>
          <Plus size={18} color={colors.text} strokeWidth={2.5} />
        </TouchableOpacity>
        <View style={styles.ctrlDivider} />
        <TouchableOpacity style={[styles.ctrlBtn, styles.ctrlLast]} onPress={zoomOut}>
          <Minus size={18} color={colors.text} strokeWidth={2.5} />
        </TouchableOpacity>

        {/* Recenter to trail */}
        <TouchableOpacity style={[styles.ctrlBtn, styles.ctrlFirst, styles.ctrlLast, styles.ctrlGap]} onPress={recenter}>
          <RotateCcw size={17} color={colors.primary} strokeWidth={2.25} />
        </TouchableOpacity>

        {/* Center on user */}
        <TouchableOpacity
          style={[styles.ctrlBtn, styles.ctrlFirst, styles.ctrlLast, styles.ctrlGap, !userLocation && styles.ctrlDisabled]}
          onPress={centerOnMe}
          disabled={!userLocation}
        >
          <Locate size={18} color={userLocation ? colors.primary : colors.textLight} strokeWidth={2} />
        </TouchableOpacity>

        {/* Pause / resume — only in tracking mode */}
        {tracking && (
          <TouchableOpacity
            style={[
              styles.ctrlBtn, styles.ctrlFirst, styles.ctrlLast, styles.ctrlGap,
              trackingActive ? styles.ctrlPause : styles.ctrlResume,
            ]}
            onPress={toggleTracking}
          >
            {trackingActive
              ? <Pause size={17} color={colors.warning} strokeWidth={2.25} />
              : <Play  size={17} color={colors.success} strokeWidth={2.25} />
            }
          </TouchableOpacity>
        )}
      </View>

      {/* ── SOS button (tracking only) ─────────────────────────────── */}
      {tracking && (
        <TouchableOpacity
          style={[styles.sosBtn, { bottom: sheetExpanded ? '70%' : 200 }]}
          onPress={handleSOS}
        >
          <AlertTriangle size={14} color="#fff" strokeWidth={2.5} />
          <Text style={styles.sosBtnText}>SOS</Text>
        </TouchableOpacity>
      )}

      {/* ── Bottom sheet ──────────────────────────────────────────── */}
      <View style={[
        styles.sheet,
        { paddingBottom: (insets.bottom || 0) + 8 },
        sheetExpanded && styles.sheetExpanded,
      ]}>
        <TouchableOpacity
          onPress={() => setSheetExpanded((e) => !e)}
          style={styles.handleRow}
          activeOpacity={0.7}
        >
          <View style={styles.handle} />
        </TouchableOpacity>

        {/* Stats */}
        <View style={styles.statsRow}>
          <StatItem value={trail.distance}            label="Distance" />
          <StatItem value={`${trail.maxElevation}m`}  label="Max Alt." />
          <StatItem value={trail.elevationGain}        label="Gain" />
          <StatItem value={trail.duration}             label="Duration" />
        </View>

        {/* Progress */}
        <View style={styles.progressRow}>
          <Text style={styles.progressLabel}>Trek Progress</Text>
          <Text style={styles.progressPct}>{progress}%</Text>
        </View>
        <View style={styles.progressBar}>
          <View style={[styles.progressFill, { width: `${progress}%` }]} />
        </View>

        {/* Expanded section */}
        {sheetExpanded && (
          <ScrollView style={styles.waypointScroll} showsVerticalScrollIndicator={false}>

            {trail.elevationProfile && trail.elevationProfile.length >= 2 && (
              <ElevationProfile profile={trail.elevationProfile} />
            )}

            {trail.pois && trail.pois.length > 0 && (
              <View style={styles.poiSection}>
                <Text style={styles.sectionTitle}>Points of Interest</Text>
                <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.poiRow}>
                  {trail.pois.map((poi, i) => (
                    <View key={i} style={styles.poiChip}>
                      <Text style={styles.poiChipEmoji}>{POI_EMOJI[poi.type] || '📍'}</Text>
                      <Text style={styles.poiChipText} numberOfLines={2}>{poi.name}</Text>
                    </View>
                  ))}
                </ScrollView>
              </View>
            )}

            <Text style={styles.sectionTitle}>Waypoints</Text>
            {trail.waypoints.map((wp, i) => (
              <View key={i} style={styles.waypointRow}>
                {i < trail.waypoints.length - 1 && (
                  <View style={[styles.connector, { backgroundColor: STATUS_COLOR[wp.status] }]} />
                )}
                <View style={[
                  styles.wpDot,
                  { backgroundColor: STATUS_COLOR[wp.status] },
                  wp.status === 'current' && styles.wpDotCurrent,
                ]} />
                <View style={styles.wpInfo}>
                  <Text style={[styles.wpName, wp.status === 'current' && styles.wpNameCurrent]}>
                    {wp.name}
                    {wp.status === 'current' && (
                      <Text style={styles.youAreHere}> ← you are here</Text>
                    )}
                  </Text>
                  <Text style={styles.wpElev}>{wp.elevation}</Text>
                </View>
                {wp.status === 'completed' && <Text style={styles.wpCheck}>✓</Text>}
              </View>
            ))}

            <View style={[styles.trailMeta, { borderTopColor: colors.border }]}>
              <MetaRow label="Difficulty" value={trail.difficulty} />
              <MetaRow label="Best Season" value={trail.bestSeason} />
              {trail.permits?.length > 0 && (
                <MetaRow label="Permits" value={trail.permits.join(', ')} />
              )}
              {trail.description && (
                <Text style={styles.trailDesc}>{trail.description}</Text>
              )}
            </View>

            <Text style={styles.osmAttr}>
              Trail data © OpenStreetMap contributors (ODbL)
            </Text>
            <View style={{ height: 24 }} />
          </ScrollView>
        )}
      </View>
    </View>
  );
}

// ── POI emoji ─────────────────────────────────────────────────────────
const POI_EMOJI = {
  lodge: '🏠', water: '💧', viewpoint: '🔭',
  junction: '🔀', rescue: '🆘', campsite: '⛺',
};

// ── Elevation Profile ─────────────────────────────────────────────────
function ElevationProfile({ profile }) {
  const GRAPH_W = SCREEN_W - 64;
  const GRAPH_H = 80;
  const PAD_L   = 36;
  const PAD_B   = 20;

  const maxE = Math.max(...profile.map((p) => p.e));
  const minE = Math.min(...profile.map((p) => p.e));
  const maxD = profile[profile.length - 1].d;
  const eRange = maxE - minE || 1;

  const pts = profile.map((p) => ({
    x: PAD_L + ((p.d / maxD) * (GRAPH_W - PAD_L)),
    y: GRAPH_H - PAD_B - ((p.e - minE) / eRange) * (GRAPH_H - PAD_B - 8),
    ...p,
  }));

  return (
    <View style={styles.elevSection}>
      <Text style={styles.sectionTitle}>Elevation Profile</Text>
      <View style={{ width: GRAPH_W + 8, height: GRAPH_H + 8 }}>
        <Text style={[styles.elevLabel, { position: 'absolute', left: 0, top: 4 }]}>
          {(maxE / 1000).toFixed(1)}k
        </Text>
        <Text style={[styles.elevLabel, { position: 'absolute', left: 0, bottom: PAD_B - 4 }]}>
          {(minE / 1000).toFixed(1)}k
        </Text>
        <View style={[styles.elevBaseline, { bottom: PAD_B, left: PAD_L, right: 0 }]} />

        {pts.slice(0, -1).map((p, i) => {
          const q = pts[i + 1];
          return (
            <View key={i} style={{
              position: 'absolute', left: p.x, top: Math.min(p.y, q.y),
              width: q.x - p.x, height: (GRAPH_H - PAD_B) - Math.min(p.y, q.y),
              backgroundColor: 'rgba(45,122,79,0.14)',
            }} />
          );
        })}

        {pts.slice(0, -1).map((p, i) => {
          const q    = pts[i + 1];
          const dx   = q.x - p.x;
          const dy   = q.y - p.y;
          const len  = Math.sqrt(dx * dx + dy * dy);
          const angle = (Math.atan2(dy, dx) * 180) / Math.PI;
          return (
            <View key={i} style={{
              position: 'absolute', left: p.x, top: p.y - 1.5,
              width: len, height: 3, backgroundColor: colors.primary,
              borderRadius: 2, transformOrigin: 'left center',
              transform: [{ rotate: `${angle}deg` }],
            }} />
          );
        })}

        {(() => {
          const peak = pts.reduce((a, b) => (b.e > a.e ? b : a), pts[0]);
          return (
            <View style={{ position: 'absolute', left: peak.x - 5, top: peak.y - 5 }}>
              <View style={styles.elevPeakDot} />
            </View>
          );
        })()}

        <Text style={[styles.elevLabel, { position: 'absolute', left: PAD_L, bottom: 0 }]}>0km</Text>
        <Text style={[styles.elevLabel, { position: 'absolute', left: PAD_L + (GRAPH_W - PAD_L) / 2 - 10, bottom: 0 }]}>
          {(maxD / 2).toFixed(0)}km
        </Text>
        <Text style={[styles.elevLabel, { position: 'absolute', right: 0, bottom: 0 }]}>{maxD}km</Text>
      </View>
    </View>
  );
}

const StatItem = ({ value, label }) => (
  <View style={styles.statItem}>
    <Text style={styles.statValue}>{value}</Text>
    <Text style={styles.statLabel}>{label}</Text>
  </View>
);

const MetaRow = ({ label, value }) => (
  <View style={styles.metaRow}>
    <Text style={styles.metaLabel}>{label}</Text>
    <Text style={styles.metaValue}>{value}</Text>
  </View>
);

// ── Styles ────────────────────────────────────────────────────────────
const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: '#000' },

  // ── Header (matches app-wide ScreenHeader style) ──
  header: {
    position: 'absolute', top: 0, left: 0, right: 0,
    flexDirection: 'row', alignItems: 'center',
    paddingHorizontal: 12, paddingBottom: 12,
    backgroundColor: 'rgba(255,255,255,0.96)',
    ...Platform.select({
      ios:     { shadowColor: '#000', shadowOpacity: 0.1, shadowRadius: 8, shadowOffset: { width: 0, height: 3 } },
      android: { elevation: 5 },
    }),
  },
  headerCenter: { flex: 1, alignItems: 'center', paddingHorizontal: 8 },
  headerTitle:  { fontSize: 16, fontWeight: '700', color: colors.text, letterSpacing: -0.2 },
  headerSub:    { fontSize: 11, color: colors.textSecondary, marginTop: 2 },

  trackingBadge: { flexDirection: 'row', alignItems: 'center', gap: 5, marginTop: 3 },
  trackingLabel: { fontSize: 10, fontWeight: '800', letterSpacing: 1.2, textTransform: 'uppercase' },

  // ── Map control buttons (exactly matches ExploreScreen style) ──
  mapControls: {
    position: 'absolute', right: 12, zIndex: 20,
    ...Platform.select({
      ios: { shadowColor: '#000', shadowOpacity: 0.14, shadowRadius: 6, shadowOffset: { width: 0, height: 2 } },
      android: {},
    }),
  },
  ctrlBtn: {
    width: 44, height: 44,
    backgroundColor: '#fff',
    alignItems: 'center', justifyContent: 'center',
    elevation: 4,
  },
  ctrlBtnSingle: {
    width: 40, height: 40, borderRadius: 10,
    backgroundColor: '#fff',
    alignItems: 'center', justifyContent: 'center',
    elevation: 3,
    ...Platform.select({
      ios: { shadowColor: '#000', shadowOpacity: 0.1, shadowRadius: 4, shadowOffset: { width: 0, height: 2 } },
      android: {},
    }),
  },
  ctrlBtnActive: { backgroundColor: colors.primary },
  ctrlFirst:  { borderTopLeftRadius: 10, borderTopRightRadius: 10 },
  ctrlLast:   { borderBottomLeftRadius: 10, borderBottomRightRadius: 10 },
  ctrlDivider: { height: StyleSheet.hairlineWidth, width: 44, backgroundColor: '#E0E0E0' },
  ctrlGap:    { marginTop: 8 },
  ctrlDisabled: { opacity: 0.4 },
  ctrlPause:  { backgroundColor: '#FFF8E8' },
  ctrlResume: { backgroundColor: '#F0FAF4' },

  // ── SOS ──
  sosBtn: {
    position: 'absolute', left: 16,
    flexDirection: 'row', alignItems: 'center', gap: 5,
    paddingHorizontal: 14, paddingVertical: 9,
    backgroundColor: colors.danger, borderRadius: 24,
    ...Platform.select({
      ios:     { shadowColor: colors.danger, shadowOpacity: 0.5, shadowRadius: 8, shadowOffset: { width: 0, height: 3 } },
      android: { elevation: 6 },
    }),
  },
  sosBtnText: { color: '#fff', fontWeight: '800', fontSize: 13, letterSpacing: 0.5 },

  // ── Waypoint markers ──
  markerTouchArea: { alignItems: 'center' },
  markerOuter: {
    width: 18, height: 18, borderRadius: 9,
    borderWidth: 2.5, backgroundColor: '#fff',
    alignItems: 'center', justifyContent: 'center',
  },
  markerCurrent: {
    width: 22, height: 22, borderRadius: 11,
    shadowColor: colors.primary, shadowOpacity: 0.5, shadowRadius: 6, elevation: 4,
  },
  markerInner: { width: 8, height: 8, borderRadius: 4 },
  markerLabelWrap: {
    alignItems: 'center', marginTop: 2,
    backgroundColor: 'rgba(255,255,255,0.9)',
    borderRadius: 5, paddingHorizontal: 5, paddingVertical: 1,
  },
  markerLabel: { fontSize: 9, fontWeight: '600', color: colors.text, maxWidth: 80 },
  markerElev:  { fontSize: 8, color: colors.textSecondary },

  // ── POI markers ──
  poiPin:  { alignItems: 'center' },
  poiEmoji: { fontSize: 16, lineHeight: 20 },

  // ── Bottom sheet ──
  sheet: {
    position: 'absolute', bottom: 0, left: 0, right: 0,
    backgroundColor: colors.white,
    borderTopLeftRadius: 22, borderTopRightRadius: 22,
    paddingHorizontal: 16,
    ...Platform.select({
      ios:     { shadowColor: '#000', shadowOpacity: 0.15, shadowRadius: 14, shadowOffset: { width: 0, height: -4 } },
      android: { elevation: 12 },
    }),
  },
  sheetExpanded: { maxHeight: '68%' },
  handleRow: { alignItems: 'center', paddingVertical: 10 },
  handle: { width: 40, height: 4, borderRadius: 2, backgroundColor: '#D0D4D8' },

  statsRow: {
    flexDirection: 'row', backgroundColor: '#F8FAF9',
    borderRadius: 14, paddingVertical: 14, paddingHorizontal: 8, marginBottom: 14,
  },
  statItem:  { flex: 1, alignItems: 'center', paddingHorizontal: 4 },
  statValue: { fontSize: 15, fontWeight: '800', color: colors.text, letterSpacing: -0.2 },
  statLabel: {
    fontSize: 10, color: colors.textSecondary, fontWeight: '600',
    textTransform: 'uppercase', letterSpacing: 0.8, marginTop: 3,
  },

  progressRow: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: 8,
  },
  progressLabel: {
    fontSize: 11, fontWeight: '700', color: colors.textSecondary,
    letterSpacing: 1.2, textTransform: 'uppercase',
  },
  progressPct:  { fontSize: 15, fontWeight: '800', color: colors.primary, letterSpacing: -0.3 },
  progressBar:  { height: 8, backgroundColor: '#EDF2EF', borderRadius: 4, overflow: 'hidden', marginBottom: 14 },
  progressFill: { height: '100%', backgroundColor: colors.primary, borderRadius: 4 },

  waypointScroll: { marginTop: 4 },
  sectionTitle: {
    fontSize: 11, fontWeight: '800', color: colors.primary,
    letterSpacing: 1.5, textTransform: 'uppercase', marginTop: 8, marginBottom: 12,
  },
  waypointRow:  { flexDirection: 'row', alignItems: 'center', paddingVertical: 10, position: 'relative' },
  connector:    { position: 'absolute', left: 9, top: 30, bottom: -10, width: 2, opacity: 0.5 },
  wpDot: {
    width: 20, height: 20, borderRadius: 10,
    borderWidth: 3, borderColor: '#fff',
    ...Platform.select({
      ios:     { shadowColor: '#000', shadowOpacity: 0.1, shadowRadius: 3, shadowOffset: { width: 0, height: 1 } },
      android: { elevation: 2 },
    }),
    zIndex: 2,
  },
  wpDotCurrent: {
    width: 24, height: 24, borderRadius: 12, borderWidth: 4,
    ...Platform.select({
      ios:     { shadowColor: colors.primary, shadowOpacity: 0.4, shadowRadius: 6 },
      android: { elevation: 4 },
    }),
  },
  wpInfo:       { flex: 1, marginLeft: 14 },
  wpName:       { fontSize: 14, fontWeight: '600', color: colors.text },
  wpNameCurrent:{ fontWeight: '800', color: colors.primary },
  youAreHere:   { fontSize: 11, fontWeight: '700', color: colors.primary, fontStyle: 'italic' },
  wpElev:       { fontSize: 12, color: colors.textSecondary, marginTop: 2, fontWeight: '500' },
  wpCheck:      { color: colors.success, fontWeight: '900', fontSize: 16, marginLeft: 8 },

  trailMeta:  { marginTop: 16, paddingTop: 14, borderTopWidth: 1 },
  metaRow:    { flexDirection: 'row', justifyContent: 'space-between', paddingVertical: 8 },
  metaLabel:  { fontSize: 13, color: colors.textSecondary, fontWeight: '500' },
  metaValue:  { fontSize: 13, color: colors.text, fontWeight: '700', maxWidth: '60%', textAlign: 'right' },
  trailDesc:  { fontSize: 13, color: colors.textSecondary, lineHeight: 20, marginTop: 12, fontStyle: 'italic' },

  elevSection: { marginBottom: 16 },
  elevLabel:   { fontSize: 9, color: colors.textSecondary, fontWeight: '600' },
  elevBaseline: { position: 'absolute', height: 1, backgroundColor: '#D0D4D8' },
  elevPeakDot: {
    width: 10, height: 10, borderRadius: 5,
    backgroundColor: colors.primary, borderWidth: 2, borderColor: '#fff',
  },

  poiSection:   { marginBottom: 16 },
  poiRow:       { gap: 8, paddingBottom: 4 },
  poiChip: {
    alignItems: 'center', backgroundColor: '#F0F6F2', borderRadius: 12,
    paddingHorizontal: 10, paddingVertical: 8, minWidth: 72, maxWidth: 90,
  },
  poiChipEmoji: { fontSize: 18, marginBottom: 4 },
  poiChipText:  { fontSize: 9, color: colors.text, fontWeight: '600', textAlign: 'center', lineHeight: 13 },

  osmAttr: { fontSize: 10, textAlign: 'center', marginTop: 8, opacity: 0.45, fontStyle: 'italic', color: colors.textLight },
});
