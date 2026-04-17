import { useState, useRef, useMemo, useCallback } from 'react';
import {
  View, Text, StyleSheet, TouchableOpacity, StatusBar,
  FlatList, TextInput, ScrollView, Platform, Dimensions,
  Animated, PanResponder, Image,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import Constants from 'expo-constants';
import MapboxMock from '../../utils/MapboxMock';
const isExpoGo = Constants.executionEnvironment === 'storeClient';
const MapboxGL = isExpoGo ? MapboxMock : require('@rnmapbox/maps').default;

import {
  Search, Layers, Plus, Minus, Locate, Star, Clock,
  TrendingUp, MapPin, ChevronRight, X,
} from 'lucide-react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { colors } from '../../constants/colors';
import { fontSize, fontWeight, radius, shadows, spacing } from '../../constants/theme';
import { PressableScale, Chip } from '../../components/ui';
import { getTrailImage } from '../../assets/images/trailImages';
import { NEPAL_TRAILS } from '../../constants/kathmandu_trails';

const { width: W, height: H } = Dimensions.get('window');

// ── Kathmandu Valley trails only ───────────────────────────────────
const KV_IDS = [
  'sundarijal-chisapani', 'shivapuri', 'nagarkot-changu', 'phulchowki',
  'champadevi', 'nagarjun', 'chandragiri', 'helambu', 'langtang-valley',
];
const KV_TRAILS = NEPAL_TRAILS.filter((t) => KV_IDS.includes(t.id));

// Map centre for Kathmandu Valley
const KV_CENTER = [85.3240, 27.7000];
const KV_ZOOM   = 10.5;

const MAP_STYLES = {
  Outdoors:  'mapbox://styles/mapbox/outdoors-v12',
  Satellite: 'mapbox://styles/mapbox/satellite-streets-v12',
};

const isMultiDay = (t) => !/day|half|hr/i.test(t.duration);
const SEL_COLOR  = '#F4A261';

// OSM sac_scale → map pin colour (mirrors AllTrails difficulty colours)
// sac_scale values: hiking | mountain_hiking | demanding_mountain_hiking | alpine_hiking
const SAC_COLORS = {
  hiking:                    '#22c55e', // green  — Easy
  mountain_hiking:           '#f97316', // orange — Moderate
  demanding_mountain_hiking: '#ef4444', // red    — Hard
  alpine_hiking:             '#8b5cf6', // purple — Alpine/Strenuous
};
// Fallback by difficulty string when sac_scale not set
const DIFF_COLORS = {
  Easy:      '#22c55e',
  Moderate:  '#f97316',
  Hard:      '#ef4444',
  Strenuous: '#8b5cf6',
};
function trailColor(trail) {
  if (trail.osmTags?.sac_scale) return SAC_COLORS[trail.osmTags.sac_scale] || '#2D7A4F';
  return DIFF_COLORS[trail.difficulty] || '#2D7A4F';
}
const HIKE_COLOR = '#2D7A4F';
const TREK_COLOR = '#1A6FA8';

const FILTERS = ['All', 'Hikes', 'Treks', 'Easy', 'Moderate', 'Hard'];

// Ratings for new trails
const RATINGS = {
  'sundarijal-chisapani': 4.4,
  shivapuri: 4.6, 'nagarkot-changu': 4.5, phulchowki: 4.5,
  champadevi: 4.4, nagarjun: 4.3, chandragiri: 4.5,
  helambu: 4.6, 'langtang-valley': 4.8,
};

// ── Bottom-sheet snap points ────────────────────────────────────────
//  EXPANDED  → most of panel visible (top 35% of screen)
//  MID       → cards + search visible
//  PEEK      → just handle + search bar
const SHEET_EXPANDED = H * 0.35;
const SHEET_MID      = H * 0.58;
const SHEET_PEEK     = H * 0.80;
const SNAPS = [SHEET_EXPANDED, SHEET_MID, SHEET_PEEK];

function snapValue(val) {
  return SNAPS.reduce((prev, curr) =>
    Math.abs(curr - val) < Math.abs(prev - val) ? curr : prev,
  );
}

// ── Component ───────────────────────────────────────────────────────
export default function ExploreScreen({ navigation }) {
  const insets     = useSafeAreaInsets();
  const cameraRef  = useRef(null);
  const zoomLvl    = useRef(KV_ZOOM);

  const [styleKey, setStyleKey] = useState('Outdoors');
  const [selected, setSelected] = useState(null);
  const [filter,   setFilter]   = useState('All');
  const [search,   setSearch]   = useState('');

  // ── Sheet animation ─────────────────────────────────────────────
  const sheetTop    = useRef(new Animated.Value(SHEET_MID)).current;
  const lastTop     = useRef(SHEET_MID);

  const snapTo = useCallback((target, velocity = 0) => {
    lastTop.current = target;
    Animated.spring(sheetTop, {
      toValue: target,
      useNativeDriver: false,
      damping: 22,
      stiffness: 260,
      mass: 0.9,
      velocity,
    }).start();
  }, [sheetTop]);

  const panResponder = useRef(
    PanResponder.create({
      onMoveShouldSetPanResponder: (_, g) => Math.abs(g.dy) > 6,
      onPanResponderGrant: () => {
        sheetTop.stopAnimation((val) => { lastTop.current = val; });
      },
      onPanResponderMove: (_, g) => {
        const next = Math.min(Math.max(lastTop.current + g.dy, SHEET_EXPANDED - 20), SHEET_PEEK + 20);
        sheetTop.setValue(next);
      },
      onPanResponderRelease: (_, g) => {
        const cur = lastTop.current + g.dy;
        const vy  = g.vy;
        let target;
        if (vy > 0.8)       target = SHEET_PEEK;
        else if (vy < -0.8) target = SHEET_EXPANDED;
        else                 target = snapValue(cur);
        snapTo(target, vy);
      },
    }),
  ).current;

  // ── Filter ──────────────────────────────────────────────────────
  const filtered = useMemo(() => KV_TRAILS.filter((t) => {
    const multi = isMultiDay(t);
    if (filter === 'Hikes'    && multi)  return false;
    if (filter === 'Treks'    && !multi) return false;
    if (['Easy','Moderate','Hard'].includes(filter) && t.difficulty !== filter) return false;
    if (search && !t.name.toLowerCase().includes(search.toLowerCase())) return false;
    return true;
  }), [filter, search]);

  const selectedTrail = useMemo(() => KV_TRAILS.find((t) => t.id === selected), [selected]);

  // ── Map camera ──────────────────────────────────────────────────
  const flyTo = useCallback((trail) => {
    cameraRef.current?.setCamera({
      centerCoordinate: trail.center,
      zoomLevel: trail.zoom,
      animationMode: 'flyTo',
      animationDuration: 700,
    });
    zoomLvl.current = trail.zoom;
  }, []);

  const zoomIn = () => {
    zoomLvl.current = Math.min(zoomLvl.current + 1, 20);
    cameraRef.current?.setCamera({ zoomLevel: zoomLvl.current, animationDuration: 250 });
  };
  const zoomOut = () => {
    zoomLvl.current = Math.max(zoomLvl.current - 1, 5);
    cameraRef.current?.setCamera({ zoomLevel: zoomLvl.current, animationDuration: 250 });
  };
  const recenter = () => {
    cameraRef.current?.setCamera({
      centerCoordinate: KV_CENTER,
      zoomLevel: KV_ZOOM,
      animationMode: 'flyTo',
      animationDuration: 600,
    });
    zoomLvl.current = KV_ZOOM;
    setSelected(null);
  };

  const handleSelect = useCallback((trail) => {
    setSelected(trail.id);
    flyTo(trail);
    snapTo(SHEET_MID); // pull sheet to mid when a trail is selected
  }, [flyTo, snapTo]);

  return (
    <View style={styles.root}>
      <StatusBar barStyle="dark-content" translucent backgroundColor="transparent" />

      {/* ══ Mapbox map (full-screen) ══════════════════════════════ */}
      <MapboxGL.MapView
        style={StyleSheet.absoluteFill}
        styleURL={MAP_STYLES[styleKey]}
        compassEnabled={false}
        attributionPosition={{ bottom: 8, left: 8 }}
        logoPosition={{ bottom: 8, left: 100 }}
        onPress={() => setSelected(null)}
      >
        <MapboxGL.Camera
          ref={cameraRef}
          zoomLevel={KV_ZOOM}
          centerCoordinate={KV_CENTER}
          animationMode="flyTo"
          animationDuration={600}
        />

        {/* ── Unselected trails: dot-pin only, no route line ── */}
        {KV_TRAILS.filter((t) => t.id !== selected).map((trail) => {
          const color = trailColor(trail);
          return (
            <MapboxGL.MarkerView
              key={trail.id}
              id={`pin-${trail.id}`}
              coordinate={trail.center}
              anchor={{ x: 0.5, y: 0.5 }}
            >
              <TouchableOpacity
                onPress={() => handleSelect(trail)}
                activeOpacity={0.75}
                style={[styles.dotPin, { backgroundColor: color }]}
              />
            </MapboxGL.MarkerView>
          );
        })}

        {/* ── Selected trail: full route line + start marker ── */}
        {selectedTrail && (() => {
          const shape = {
            type: 'Feature',
            geometry: { type: 'LineString', coordinates: selectedTrail.coordinates },
          };
          return (
            <>
              <MapboxGL.ShapeSource
                id="sel-src"
                shape={shape}
                onPress={() => {/* already selected */}}
              >
                {/* White halo for legibility */}
                <MapboxGL.LineLayer
                  id="sel-halo"
                  style={{ lineColor: '#fff', lineWidth: 9, lineOpacity: 0.5, lineCap: 'round' }}
                />
                {/* Coloured route */}
                <MapboxGL.LineLayer
                  id="sel-line"
                  style={{
                    lineColor: SEL_COLOR,
                    lineWidth: 5,
                    lineOpacity: 1,
                    lineCap: 'round',
                    lineJoin: 'round',
                  }}
                />
              </MapboxGL.ShapeSource>

              {/* Start marker */}
              <MapboxGL.MarkerView
                id="sel-start"
                coordinate={selectedTrail.startCoord ?? selectedTrail.center}
                anchor={{ x: 0.5, y: 1 }}
              >
                <View style={styles.selMarker}>
                  <View style={styles.selMarkerDot} />
                </View>
              </MapboxGL.MarkerView>
            </>
          );
        })()}
      </MapboxGL.MapView>

      {/* ══ Right-side map controls (AllTrails style) ═════════════ */}
      <View style={[styles.mapControls, { top: insets.top + 12 }]}>
        <TouchableOpacity
          style={[styles.ctrlBtn, styles.ctrlFirst, styleKey === 'Satellite' && styles.ctrlActive]}
          onPress={() => setStyleKey((k) => k === 'Outdoors' ? 'Satellite' : 'Outdoors')}
        >
          <Layers size={18} color={styleKey === 'Satellite' ? '#fff' : colors.text} strokeWidth={2} />
        </TouchableOpacity>
        <View style={styles.ctrlDivider} />
        <TouchableOpacity style={styles.ctrlBtn} onPress={zoomIn}>
          <Plus size={18} color={colors.text} strokeWidth={2.5} />
        </TouchableOpacity>
        <View style={styles.ctrlDivider} />
        <TouchableOpacity style={[styles.ctrlBtn, styles.ctrlLast]} onPress={zoomOut}>
          <Minus size={18} color={colors.text} strokeWidth={2.5} />
        </TouchableOpacity>

        {/* Recenter — separate pill below */}
        <TouchableOpacity style={[styles.ctrlBtn, styles.ctrlFirst, styles.ctrlLast, { marginTop: 8 }]} onPress={recenter}>
          <Locate size={18} color={colors.primary} strokeWidth={2} />
        </TouchableOpacity>
      </View>

      {/* ══ Draggable bottom sheet ════════════════════════════════ */}
      <Animated.View style={[styles.sheet, { top: sheetTop }]}>

        {/* Drag handle */}
        <View style={styles.handleZone} {...panResponder.panHandlers}>
          <View style={styles.handle} />
        </View>

        {/* Search bar */}
        <View style={styles.searchRow}>
          <View style={styles.searchBox}>
            <Search size={16} color={colors.textLight} strokeWidth={2.25} />
            <TextInput
              style={styles.searchInput}
              placeholder="Search trails…"
              placeholderTextColor={colors.textMuted}
              value={search}
              onChangeText={setSearch}
            />
            {search.length > 0 && (
              <TouchableOpacity onPress={() => setSearch('')}>
                <X size={14} color={colors.textLight} strokeWidth={2.5} />
              </TouchableOpacity>
            )}
          </View>
        </View>

        {/* Filter chips */}
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.chipsRow}
        >
          {FILTERS.map((f) => (
            <Chip key={f} label={f} selected={filter === f} onPress={() => setFilter(f)} />
          ))}
        </ScrollView>

        {/* Trail count */}
        <Text style={styles.countLabel}>
          {filtered.length} trail{filtered.length !== 1 ? 's' : ''} near Kathmandu
        </Text>

        {/* Trail cards */}
        <FlatList
          data={filtered}
          keyExtractor={(t) => t.id}
          horizontal
          showsHorizontalScrollIndicator={false}
          snapToInterval={W * 0.75 + 12}
          decelerationRate="fast"
          contentContainerStyle={styles.cardList}
          keyboardShouldPersistTaps="handled"
          renderItem={({ item: trail }) => (
            <TrailCard
              trail={trail}
              isSelected={selected === trail.id}
              onSelect={() => handleSelect(trail)}
              onDetail={() =>
                navigation.navigate('TrailDetail', { trailId: trail.id, trailName: trail.name })
              }
            />
          )}
          ListEmptyComponent={
            <View style={styles.emptyWrap}>
              <Text style={styles.emptyText}>No trails match</Text>
            </View>
          }
        />
      </Animated.View>
    </View>
  );
}

/* ── Trail card ──────────────────────────────────────────────────── */
function TrailCard({ trail, isSelected, onSelect, onDetail }) {
  const multi   = isMultiDay(trail);
  const rating  = RATINGS[trail.id] ?? 4.5;
  const imgUri  = getTrailImage(trail.id);

  return (
    <PressableScale style={[styles.card, isSelected && styles.cardSel]} onPress={onSelect} scaleTo={0.97}>
      {/* Photo */}
      <View style={styles.cardImg}>
        <Image
          source={{ uri: imgUri }}
          style={StyleSheet.absoluteFill}
          resizeMode="cover"
        />
        {/* Gradient overlay so text is always readable */}
        <LinearGradient
          colors={['transparent', 'rgba(0,0,0,0.45)']}
          style={StyleSheet.absoluteFill}
        />
        {/* Type badge */}
        <View style={[styles.typeBadge, multi ? styles.typeTrek : styles.typeHike]}>
          <Text style={styles.badgeText}>{multi ? 'Trek' : 'Hike'}</Text>
        </View>
        {/* Difficulty badge */}
        <View style={[
          styles.diffBadge,
          trail.difficulty === 'Easy'      && styles.diffEasy,
          trail.difficulty === 'Moderate'  && styles.diffMod,
          trail.difficulty === 'Hard'      && styles.diffHard,
          trail.difficulty === 'Strenuous' && styles.diffStrenuous,
        ]}>
          <Text style={styles.badgeText}>{trail.difficulty}</Text>
        </View>
      </View>

      {/* Body */}
      <View style={styles.cardBody}>
        <Text style={styles.cardName} numberOfLines={1}>{trail.name}</Text>
        <View style={styles.locRow}>
          <MapPin size={11} color={colors.textLight} strokeWidth={2} />
          <Text style={styles.locText} numberOfLines={1}>{trail.region}</Text>
        </View>

        <View style={styles.statsRow}>
          <View style={styles.statItem}>
            <TrendingUp size={12} color={colors.textSecondary} strokeWidth={2} />
            <Text style={styles.statText}>{trail.distance}</Text>
          </View>
          <View style={styles.statItem}>
            <Clock size={12} color={colors.textSecondary} strokeWidth={2} />
            <Text style={styles.statText}>{trail.duration}</Text>
          </View>
          <View style={[styles.statItem, { marginLeft: 'auto' }]}>
            <Star size={12} color="#F59E0B" fill="#F59E0B" strokeWidth={0} />
            <Text style={[styles.statText, { fontWeight: fontWeight.bold, color: colors.text }]}>
              {rating.toFixed(1)}
            </Text>
          </View>
        </View>

        <TouchableOpacity style={styles.detailBtn} onPress={onDetail}>
          <Text style={styles.detailBtnText}>Show more details</Text>
        </TouchableOpacity>
      </View>
    </PressableScale>
  );
}

/* ── Styles ──────────────────────────────────────────────────────── */
const CARD_W = W * 0.75;

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: '#d4e3d4' },

  /* ── Map controls ── */
  mapControls: {
    position: 'absolute', right: 12,
    zIndex: 20,
    ...Platform.select({
      ios:     { shadowColor: '#000', shadowOpacity: 0.14, shadowRadius: 6, shadowOffset: { width: 0, height: 2 } },
      android: {},
    }),
  },
  ctrlBtn: {
    width: 44, height: 44,
    backgroundColor: '#fff',
    alignItems: 'center', justifyContent: 'center',
    elevation: 4,
  },
  ctrlFirst: { borderTopLeftRadius: 10, borderTopRightRadius: 10 },
  ctrlLast:  { borderBottomLeftRadius: 10, borderBottomRightRadius: 10 },
  ctrlActive: { backgroundColor: colors.primary },
  ctrlDivider: {
    height: StyleSheet.hairlineWidth,
    backgroundColor: colors.border,
    width: 44,
    backgroundColor: '#E0E0E0',
  },

  /* ── Dot pin (unselected trails) ── */
  dotPin: {
    width: 14, height: 14, borderRadius: 7,
    borderWidth: 2.5, borderColor: '#fff',
    elevation: 4,
    shadowColor: '#000', shadowOpacity: 0.25, shadowRadius: 3,
  },

  /* ── Selected marker ── */
  selMarker: {
    alignItems: 'center',
  },
  selMarkerDot: {
    width: 16, height: 16, borderRadius: 8,
    backgroundColor: SEL_COLOR,
    borderWidth: 3, borderColor: '#fff',
    elevation: 4,
    shadowColor: '#000', shadowOpacity: 0.3, shadowRadius: 4,
  },

  /* ── Bottom sheet ── */
  sheet: {
    position: 'absolute',
    left: 0, right: 0,
    bottom: -20, // extend slightly below safe area
    backgroundColor: '#fff',
    borderTopLeftRadius: 22, borderTopRightRadius: 22,
    ...Platform.select({
      ios:     { shadowColor: '#000', shadowOpacity: 0.18, shadowRadius: 16, shadowOffset: { width: 0, height: -4 } },
      android: { elevation: 16 },
    }),
  },

  /* Handle */
  handleZone: {
    alignItems: 'center',
    paddingVertical: 12,
  },
  handle: {
    width: 40, height: 4, borderRadius: 2,
    backgroundColor: '#D0D4D8',
  },

  /* Search */
  searchRow: { paddingHorizontal: spacing.md, marginBottom: spacing.xs },
  searchBox: {
    flexDirection: 'row', alignItems: 'center', gap: 8,
    backgroundColor: colors.surface,
    borderRadius: radius.round,
    paddingVertical: 11, paddingHorizontal: 14,
    borderWidth: 1, borderColor: colors.border,
  },
  searchInput: { flex: 1, fontSize: fontSize.sm, color: colors.text, paddingVertical: 0 },

  /* Chips */
  chipsRow: {
    paddingHorizontal: spacing.md,
    gap: 8,
    paddingBottom: 6,
  },

  /* Count */
  countLabel: {
    fontSize: fontSize.xs, fontWeight: fontWeight.semiBold,
    color: colors.textLight,
    paddingHorizontal: spacing.md,
    marginBottom: 10,
  },

  /* Card list */
  cardList: { paddingHorizontal: spacing.md, paddingBottom: 32, gap: 12 },

  /* Empty */
  emptyWrap: { width: W - 32, alignItems: 'center', paddingVertical: 24 },
  emptyText: { color: colors.textLight, fontSize: fontSize.sm },

  /* ── Trail card ── */
  card: {
    width: CARD_W,
    backgroundColor: '#fff',
    borderRadius: 18,
    overflow: 'hidden',
    ...Platform.select({
      ios:     { shadowColor: '#000', shadowOpacity: 0.1, shadowRadius: 8, shadowOffset: { width: 0, height: 3 } },
      android: { elevation: 4 },
    }),
  },
  cardSel: { borderWidth: 2.5, borderColor: colors.primary },

  /* Card photo */
  cardImg: {
    height: 140,
    backgroundColor: colors.primaryPale,
  },

  /* Badges */
  typeBadge: {
    position: 'absolute', top: 10, left: 10,
    paddingHorizontal: 8, paddingVertical: 3, borderRadius: 99,
  },
  typeHike: { backgroundColor: 'rgba(29,101,57,0.88)' },
  typeTrek: { backgroundColor: 'rgba(0,100,160,0.88)' },
  diffBadge: {
    position: 'absolute', top: 10, right: 10,
    paddingHorizontal: 8, paddingVertical: 3, borderRadius: 99,
  },
  diffEasy:      { backgroundColor: '#22c55e' }, // OSM hiking
  diffMod:       { backgroundColor: '#f97316' }, // OSM mountain_hiking
  diffHard:      { backgroundColor: '#ef4444' }, // OSM demanding_mountain_hiking
  diffStrenuous: { backgroundColor: '#8b5cf6' }, // OSM alpine_hiking
  badgeText: { color: '#fff', fontSize: 10, fontWeight: fontWeight.bold, letterSpacing: 0.3 },

  /* Card body */
  cardBody: { padding: 12 },
  cardName: {
    fontSize: fontSize.md, fontWeight: fontWeight.bold,
    color: colors.text, letterSpacing: -0.2, marginBottom: 3,
  },
  locRow: { flexDirection: 'row', alignItems: 'center', gap: 3, marginBottom: 10 },
  locText: { fontSize: 11, color: colors.textLight, flex: 1 },

  /* Stats */
  statsRow: { flexDirection: 'row', alignItems: 'center', gap: 10, marginBottom: 12 },
  statItem: { flexDirection: 'row', alignItems: 'center', gap: 4 },
  statText:  { fontSize: 12, color: colors.textSecondary, fontWeight: fontWeight.medium },

  /* Detail button */
  detailBtn: {
    backgroundColor: colors.primary,
    borderRadius: radius.md,
    paddingVertical: 10,
    alignItems: 'center',
  },
  detailBtnText: {
    color: '#fff', fontSize: fontSize.xs,
    fontWeight: fontWeight.bold, letterSpacing: 0.4,
  },
});
