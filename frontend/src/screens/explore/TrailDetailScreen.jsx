import React, { useState } from 'react';
import {
  View, Text, StyleSheet, StatusBar, Dimensions,
  Animated, Platform, TouchableOpacity,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import {
  ChevronLeft, Heart, Share2, MapPin, Clock, TrendingUp, Calendar, Tent,
  FileCheck, Star, Users, Map, Play, Navigation, AlertTriangle,
} from 'lucide-react-native';
import { colors } from '../../constants/colors';
import { fontSize, fontWeight, radius, shadows, spacing } from '../../constants/theme';
import {
  Badge, Button, Card, PressableScale, FadeIn, SlideUp, Stagger,
} from '../../components/ui';
import MountainScene from '../../assets/svg/MountainScene';
import { getTrailImage } from '../../assets/images/trailImages';
import { getTrailById, getTrailByName } from '../../constants/kathmandu_trails';

const { width: W } = Dimensions.get('window');
const HERO = 280;

// ── Supplement data (reviews / ratings) not in OSM trail constants ────
// OSM/Nepal Tourism Board data covers: name, distance, duration, elevation,
// difficulty, description, permits, bestSeason, waypoints, pois.
// Only ratings, review text, and teahouse notes live here.
const SUPPLEMENT = {
  'sundarijal-chisapani': {
    rating: 4.4, reviewCount: 142, variant: 'alpine',
    teaHouses: 'Mulkharka teahouse, Chisapani lodge',
    reviews: [
      { name: 'Aarav S.', rating: 5, comment: 'Stunning ridge views of Langtang. Steep but totally worth it.', date: 'Mar 2026' },
      { name: 'Meera T.', rating: 4, comment: 'Start early to beat the clouds. Chisapani sunrise is magical.', date: 'Jan 2026' },
    ],
  },
  shivapuri: {
    rating: 4.7, reviewCount: 148, variant: 'mist',
    teaHouses: 'Basic shelters near summit',
    reviews: [
      { name: 'Rohan S.', rating: 5, comment: 'Perfect day hike. Summit views of the Himalayas are worth every step!', date: 'Mar 2026' },
      { name: 'Sita M.', rating: 4, comment: 'Trail is well-marked. Get an early start to avoid afternoon haze.', date: 'Feb 2026' },
    ],
  },
  'nagarkot-changu': {
    rating: 4.6, reviewCount: 203, variant: 'sunrise',
    teaHouses: 'Available in villages along the ridge',
    reviews: [
      { name: 'Priya K.', rating: 5, comment: 'Stunning ridge views and a great finish at the ancient temple!', date: 'Jan 2026' },
      { name: 'Arjun T.', rating: 4, comment: 'Easy enough for beginners. Changu Narayan temple is the reward.', date: 'Dec 2025' },
    ],
  },
  phulchowki: {
    rating: 4.8, reviewCount: 91, variant: 'alpine',
    teaHouses: 'None — carry your own food',
    reviews: [
      { name: 'Maya G.', rating: 5, comment: 'Rhododendrons in full bloom — absolutely magical in March!', date: 'Mar 2026' },
      { name: 'Kiran B.', rating: 5, comment: 'Best birding trail near Kathmandu. Saw 30+ species on the way up.', date: 'Nov 2025' },
    ],
  },
  champadevi: {
    rating: 4.5, reviewCount: 74, variant: 'mist',
    teaHouses: 'Teashops in Pharping village',
    reviews: [
      { name: 'Binita R.', rating: 5, comment: 'Great half-day option. The Buddhist caves add a spiritual element.', date: 'Feb 2026' },
    ],
  },
  nagarjun: {
    rating: 4.3, reviewCount: 58, variant: 'alpine',
    teaHouses: 'None inside the park',
    reviews: [
      { name: 'Deepak M.', rating: 4, comment: 'Peaceful forest trail, great for a quiet morning hike.', date: 'Jan 2026' },
    ],
  },
  chandragiri: {
    rating: 4.5, reviewCount: 112, variant: 'sunrise',
    teaHouses: 'Small cafes near cable car upper station',
    reviews: [
      { name: 'Sunil P.', rating: 5, comment: 'Best 360° panorama in the valley. On a clear day you see Everest!', date: 'Nov 2025' },
    ],
  },
  helambu: {
    rating: 4.6, reviewCount: 89, variant: 'alpine',
    teaHouses: 'Tea houses in every village',
    reviews: [
      { name: 'Claire F.', rating: 5, comment: 'Closest serious trek to Kathmandu. Tamang culture is wonderful.', date: 'Oct 2025' },
    ],
  },
  'poon-hill': {
    rating: 4.8, reviewCount: 411, variant: 'alpine',
    teaHouses: 'Abundant throughout',
    reviews: [
      { name: 'James O.', rating: 5, comment: 'Poon Hill sunrise is one of the best views on earth. Do it!', date: 'Mar 2026' },
      { name: 'Anita L.', rating: 5, comment: 'Well-marked, comfortable lodges, friendly locals. Perfect intro trek.', date: 'Nov 2025' },
    ],
  },
  'annapurna-base-camp': {
    rating: 4.9, reviewCount: 312, variant: 'alpine',
    teaHouses: 'Available throughout',
    reviews: [
      { name: 'Priya T.', rating: 5, comment: 'Absolutely breathtaking! The views from base camp are incredible.', date: 'Nov 2025' },
      { name: 'Suman KC', rating: 5, comment: 'Well-marked trails, great tea houses. Highly recommend!', date: 'Oct 2025' },
    ],
  },
  'mardi-himal': {
    rating: 4.7, reviewCount: 176, variant: 'dusk',
    teaHouses: 'Lodges up to High Camp',
    reviews: [
      { name: 'Tom B.', rating: 5, comment: 'Quieter than ABC but the Fishtail close-up is unreal.', date: 'Apr 2026' },
    ],
  },
  'everest-base-camp': {
    rating: 4.9, reviewCount: 580, variant: 'dusk',
    teaHouses: 'Tea houses throughout the Khumbu',
    reviews: [
      { name: 'Anita R.', rating: 5, comment: 'Life-changing experience. Challenging but worth every step.', date: 'Oct 2025' },
      { name: 'Mark W.',  rating: 5, comment: 'Kala Patthar at sunrise is something else entirely.', date: 'Mar 2026' },
    ],
  },
  'langtang-valley': {
    rating: 4.8, reviewCount: 224, variant: 'alpine',
    teaHouses: 'Tea houses throughout',
    reviews: [
      { name: 'Sofia B.', rating: 5, comment: 'Valley of glaciers — the most underrated trek in Nepal!', date: 'Nov 2025' },
    ],
  },
  gosaikunda: {
    rating: 4.7, reviewCount: 147, variant: 'dusk',
    teaHouses: 'Lodges up to Laurebina',
    reviews: [
      { name: 'Raj K.', rating: 5, comment: 'Sacred and dramatic. The lake at sunrise is surreal.', date: 'Oct 2025' },
    ],
  },
};

const DEFAULT_REVIEWS = [
  { name: 'Alex P.',  rating: 5, comment: 'Unforgettable trek — pristine views and friendly locals all the way.', date: 'Feb 2026' },
  { name: 'Nisha R.', rating: 5, comment: 'Trail was well-marked and the scenery exceeded expectations.', date: 'Nov 2025' },
];

const DIFF_TONE = { Easy: 'success', Moderate: 'warning', Hard: 'danger', Strenuous: 'danger' };

export default function TrailDetailScreen({ route, navigation }) {
  const { trailId, trailName } = route.params;
  const [liked, setLiked] = useState(false);

  // Live source of truth: real trail constants
  const real = getTrailById(trailId) || getTrailByName(trailName);
  const sup  = SUPPLEMENT[trailId] || SUPPLEMENT[real?.id] || {};

  // If we can't find the trail at all, show a fallback
  if (!real) {
    return (
      <SafeAreaView style={styles.safe}>
        <View style={styles.notFound}>
          <AlertTriangle size={48} color={colors.warning} strokeWidth={1.5} />
          <Text style={styles.notFoundTitle}>Trail not found</Text>
          <Text style={styles.notFoundSub}>ID: {trailId || 'unknown'}</Text>
          <PressableScale onPress={() => navigation.goBack()} style={styles.notFoundBtn}>
            <Text style={styles.notFoundBtnText}>← Go back</Text>
          </PressableScale>
        </View>
      </SafeAreaView>
    );
  }

  // Merge live + supplement
  const trail = {
    id:          real.id,
    name:        real.name,
    region:      real.region,
    duration:    real.duration,
    difficulty:  real.difficulty,
    elevation:   `${real.maxElevation.toLocaleString()}m`,
    elevGain:    real.elevationGain,
    distance:    real.distance,
    description: real.description,
    bestSeason:  real.bestSeason,
    permits:     real.permits || [],
    waypoints:   real.waypoints || [],
    pois:        real.pois || [],
    rating:      sup.rating      ?? 4.7,
    reviewCount: sup.reviewCount ?? 120,
    teaHouses:   sup.teaHouses   ?? (real.duration?.includes('day') || real.duration === 'Half day' ? 'Seasonal shelters near summit' : 'Tea houses along the route'),
    variant:     sup.variant      ?? 'alpine',
    reviews:     sup.reviews      ?? DEFAULT_REVIEWS,
  };

  const scrollY = React.useRef(new Animated.Value(0)).current;

  const heroScale = scrollY.interpolate({ inputRange: [-HERO, 0, HERO], outputRange: [2, 1, 1], extrapolateRight: 'clamp' });
  const heroTranslate = scrollY.interpolate({ inputRange: [0, HERO], outputRange: [0, HERO / 2], extrapolate: 'clamp' });
  const titleOpacity = scrollY.interpolate({ inputRange: [0, 120, 180], outputRange: [0, 0, 1] });

  const handleStartTrek = () => {
    navigation.navigate('TrailMap', {
      trailId: real.id,
      trailName: real.name,
      tracking: true,   // ← activates GPS live-tracking mode
    });
  };

  const handleViewMap = () => {
    navigation.navigate('TrailMap', {
      trailId: real.id,
      trailName: real.name,
      tracking: false,
    });
  };

  return (
    <SafeAreaView style={styles.safe} edges={['bottom']}>
      <StatusBar barStyle="light-content" />

      {/* Sticky title on scroll */}
      <Animated.View style={[styles.stickyHeader, { opacity: titleOpacity }]}>
        <Text style={styles.stickyTitle} numberOfLines={1}>{trail.name}</Text>
      </Animated.View>

      {/* Back & actions */}
      <View style={styles.topActions}>
        <PressableScale onPress={() => navigation.goBack()} style={styles.iconBtn} scaleTo={0.9}>
          <ChevronLeft size={22} color="#fff" strokeWidth={2.25} />
        </PressableScale>
        <View style={{ flexDirection: 'row', gap: 10 }}>
          <PressableScale style={styles.iconBtn} scaleTo={0.9} onPress={() => setLiked((v) => !v)}>
            <Heart size={20} color="#fff" fill={liked ? '#fff' : 'transparent'} strokeWidth={2.25} />
          </PressableScale>
          <PressableScale style={styles.iconBtn} scaleTo={0.9}>
            <Share2 size={20} color="#fff" strokeWidth={2.25} />
          </PressableScale>
        </View>
      </View>

      <Animated.ScrollView
        showsVerticalScrollIndicator={false}
        onScroll={Animated.event([{ nativeEvent: { contentOffset: { y: scrollY } } }], { useNativeDriver: true })}
        scrollEventThrottle={16}
        contentContainerStyle={{ paddingBottom: 120 }}
      >
        {/* Hero photo */}
        <Animated.View style={[styles.hero, { transform: [{ scale: heroScale }, { translateY: heroTranslate }] }]}>
          <MountainScene width={W} height={HERO} variant={trail.variant} uri={getTrailImage(real.id)} />
          <LinearGradient colors={['rgba(15,44,32,0.15)', 'rgba(15,44,32,0.88)']} style={StyleSheet.absoluteFill} />
        </Animated.View>

        <View style={styles.heroCaption}>
          <FadeIn delay={80}>
            <View style={{ flexDirection: 'row', gap: 5, alignItems: 'center' }}>
              <MapPin size={12} color="rgba(255,255,255,0.85)" strokeWidth={2.25} />
              <Text style={styles.heroLoc}>{trail.region}</Text>
            </View>
          </FadeIn>
          <SlideUp delay={120}>
            <Text style={styles.heroTitle}>{trail.name}</Text>
          </SlideUp>
          <SlideUp delay={200} style={{ flexDirection: 'row', alignItems: 'center', gap: 8, marginTop: 6 }}>
            <Badge label={trail.difficulty} tone={DIFF_TONE[trail.difficulty]} />
            <View style={styles.heroRating}>
              <Star size={12} color="#FBBF24" fill="#FBBF24" strokeWidth={0} />
              <Text style={styles.heroRatingText}>{trail.rating.toFixed(1)}</Text>
              <Text style={styles.heroRatingCount}>· {trail.reviewCount} reviews</Text>
            </View>
          </SlideUp>
        </View>

        <View style={styles.body}>
          {/* Stat cards */}
          <SlideUp delay={240}>
            <Card style={styles.statsCard} elevation="lg" padding={spacing.md}>
              <StatBox Icon={Clock}      label="Duration"  value={trail.duration} />
              <View style={styles.divider} />
              <StatBox Icon={TrendingUp} label="Max Elev."  value={trail.elevation} />
              <View style={styles.divider} />
              <StatBox Icon={Map}        label="Distance"  value={trail.distance} />
            </Card>
          </SlideUp>

          <Stagger initialDelay={200} step={40} distance={14}>

            {/* About */}
            <View>
              <Text style={styles.sectionTitle}>About</Text>
              <Text style={styles.desc}>{trail.description}</Text>
            </View>

            {/* Trail info */}
            <View>
              <Text style={styles.sectionTitle}>Trail info</Text>
              <InfoRow Icon={Calendar}  label="Best season" value={trail.bestSeason} />
              <InfoRow Icon={TrendingUp} label="Elev. gain" value={trail.elevGain || 'See profile'} />
              <InfoRow Icon={Tent}      label="Teahouses"   value={trail.teaHouses} />
              <InfoRow Icon={FileCheck} label="Permits"     value={trail.permits.length ? trail.permits.join(', ') : 'None required'} isLast />
            </View>

            {/* Waypoints */}
            {trail.waypoints.length > 0 && (
              <View>
                <Text style={styles.sectionTitle}>Waypoints</Text>
                <Card padding={spacing.sm} elevation="xs">
                  {trail.waypoints.map((wp, i) => (
                    <View key={i} style={[styles.wpRow, i < trail.waypoints.length - 1 && styles.wpRowDivider]}>
                      <View style={styles.wpDotWrap}>
                        <View style={[
                          styles.wpDot,
                          { backgroundColor: i === 0 ? colors.success : i === trail.waypoints.length - 1 ? colors.primary : colors.accent },
                        ]} />
                        {i < trail.waypoints.length - 1 && <View style={styles.wpLine} />}
                      </View>
                      <View style={styles.wpInfo}>
                        <Text style={styles.wpName}>{wp.name}</Text>
                        <Text style={styles.wpElev}>{wp.elevation}</Text>
                      </View>
                    </View>
                  ))}
                </Card>
              </View>
            )}

            {/* Map preview — route thumbnail (distinct from hero) */}
            <View>
              <Text style={styles.sectionTitle}>Route map</Text>
              <PressableScale onPress={handleViewMap} scaleTo={0.98} style={styles.mapCard}>
                <LinearGradient
                  colors={[colors.primaryDark, colors.primary]}
                  style={[StyleSheet.absoluteFill, { borderRadius: radius.lg }]}
                />
                {/* Grid lines to suggest map */}
                <View style={styles.mapGrid}>
                  {[0.25, 0.5, 0.75].map((v) => (
                    <View key={v} style={[styles.mapGridH, { top: `${v * 100}%` }]} />
                  ))}
                  {[0.33, 0.66].map((v) => (
                    <View key={v} style={[styles.mapGridV, { left: `${v * 100}%` }]} />
                  ))}
                </View>
                {/* Simulated route line */}
                <View style={styles.mapRouteLine} />
                <View style={styles.mapStartPin}>
                  <View style={styles.mapStartDot} />
                  <Text style={styles.mapPinLabel}>Start</Text>
                </View>
                <View style={styles.mapEndPin}>
                  <View style={[styles.mapStartDot, { backgroundColor: colors.accent }]} />
                  <Text style={styles.mapPinLabel}>End</Text>
                </View>
                {/* CTA */}
                <View style={styles.mapCardContent}>
                  <Navigation size={16} color="#fff" strokeWidth={2.5} />
                  <Text style={styles.mapCardText}>View full route map</Text>
                </View>
                <View style={styles.mapDistanceBadge}>
                  <Text style={styles.mapDistanceText}>{trail.distance}</Text>
                </View>
              </PressableScale>
            </View>

            {/* POIs */}
            {trail.pois.length > 0 && (
              <View>
                <Text style={styles.sectionTitle}>Points of interest</Text>
                <View style={styles.poisGrid}>
                  {trail.pois.slice(0, 6).map((poi, i) => (
                    <View key={i} style={styles.poiChip}>
                      <Text style={styles.poiEmoji}>{POI_EMOJI[poi.type] || '📍'}</Text>
                      <Text style={styles.poiName} numberOfLines={2}>{poi.name}</Text>
                    </View>
                  ))}
                </View>
              </View>
            )}

            {/* Reviews */}
            <View>
              <Text style={styles.sectionTitle}>Reviews ({trail.reviewCount})</Text>
              {trail.reviews.map((r, i) => (
                <Card key={i} style={{ marginBottom: spacing.sm }} elevation="xs">
                  <View style={styles.reviewHeader}>
                    <View style={styles.reviewAvatar}>
                      <Text style={styles.reviewInitial}>{r.name[0]}</Text>
                    </View>
                    <View style={{ flex: 1 }}>
                      <Text style={styles.reviewName}>{r.name}</Text>
                      <View style={{ flexDirection: 'row', gap: 2, marginTop: 2 }}>
                        {Array.from({ length: r.rating }).map((_, j) => (
                          <Star key={j} size={11} color="#FBBF24" fill="#FBBF24" strokeWidth={0} />
                        ))}
                      </View>
                    </View>
                    <Text style={styles.reviewDate}>{r.date}</Text>
                  </View>
                  <Text style={styles.reviewComment}>{r.comment}</Text>
                </Card>
              ))}
            </View>
          </Stagger>
        </View>
      </Animated.ScrollView>

      {/* CTA bar */}
      <View style={styles.ctaBar}>
        <Button
          label="Find group"
          variant="outline"
          icon={Users}
          onPress={() => navigation.navigate('Groups')}
          style={{ flex: 1 }}
        />
        <View style={{ width: 8 }} />
        <Button
          label="View map"
          variant="outline"
          icon={Map}
          onPress={handleViewMap}
          style={{ flex: 1 }}
        />
        <View style={{ width: 8 }} />
        <PressableScale onPress={handleStartTrek} style={styles.startBtn} scaleTo={0.97}>
          <Play size={16} color="#fff" fill="#fff" strokeWidth={0} />
          <Text style={styles.startBtnText}>Start</Text>
        </PressableScale>
      </View>
    </SafeAreaView>
  );
}

const POI_EMOJI = { lodge: '🏠', water: '💧', viewpoint: '🔭', junction: '🔀', rescue: '🆘', campsite: '⛺' };

const StatBox = ({ Icon, label, value }) => (
  <View style={styles.statBox}>
    <Icon size={18} color={colors.primary} strokeWidth={2.25} />
    <Text style={styles.statValue}>{value}</Text>
    <Text style={styles.statLabel}>{label}</Text>
  </View>
);

const InfoRow = ({ Icon, label, value, isLast }) => (
  <View style={[styles.infoRow, isLast && { borderBottomWidth: 0 }]}>
    <View style={styles.infoIcon}><Icon size={15} color={colors.primary} strokeWidth={2.25} /></View>
    <Text style={styles.infoLabel}>{label}</Text>
    <Text style={styles.infoValue} numberOfLines={2}>{value}</Text>
  </View>
);

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: colors.background },

  notFound: { flex: 1, alignItems: 'center', justifyContent: 'center', gap: 12, padding: 32 },
  notFoundTitle: { fontSize: fontSize.xl, fontWeight: fontWeight.bold, color: colors.text },
  notFoundSub: { fontSize: fontSize.sm, color: colors.textLight },
  notFoundBtn: { marginTop: 8, paddingVertical: 10, paddingHorizontal: 24, backgroundColor: colors.primary, borderRadius: radius.round },
  notFoundBtnText: { color: '#fff', fontWeight: fontWeight.bold, fontSize: fontSize.sm },

  stickyHeader: {
    position: 'absolute', top: 0, left: 0, right: 0, zIndex: 10,
    paddingTop: Platform.OS === 'ios' ? 56 : 40, paddingBottom: 12,
    paddingHorizontal: 56, backgroundColor: colors.card,
    alignItems: 'center', ...shadows.sm,
  },
  stickyTitle: { fontSize: fontSize.md, fontWeight: fontWeight.bold, color: colors.text },

  topActions: {
    position: 'absolute', top: Platform.OS === 'ios' ? 56 : 44, left: 0, right: 0,
    paddingHorizontal: spacing.md,
    flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center',
    zIndex: 11,
  },
  iconBtn: {
    width: 40, height: 40, borderRadius: 20,
    backgroundColor: 'rgba(0,0,0,0.35)',
    alignItems: 'center', justifyContent: 'center',
  },

  hero: { width: W, height: HERO, backgroundColor: colors.primaryDark },
  heroCaption: { position: 'absolute', top: HERO - 110, left: spacing.md, right: spacing.md },
  heroLoc: { color: 'rgba(255,255,255,0.85)', fontWeight: fontWeight.medium, fontSize: fontSize.xs, letterSpacing: 0.5 },
  heroTitle: { color: '#fff', fontSize: fontSize.display, fontWeight: fontWeight.black, letterSpacing: -1, marginTop: 4 },
  heroRating: {
    flexDirection: 'row', alignItems: 'center', gap: 4,
    backgroundColor: 'rgba(255,255,255,0.18)', paddingHorizontal: 10, paddingVertical: 4, borderRadius: 99,
  },
  heroRatingText: { color: '#fff', fontSize: fontSize.sm, fontWeight: fontWeight.bold },
  heroRatingCount: { color: 'rgba(255,255,255,0.7)', fontSize: fontSize.xs },

  body: { paddingHorizontal: spacing.md, paddingTop: spacing.xl },
  statsCard: { flexDirection: 'row', alignItems: 'center', marginTop: -spacing.xl, marginBottom: spacing.lg },
  statBox: { flex: 1, alignItems: 'center', gap: 4 },
  statValue: { fontSize: fontSize.md, fontWeight: fontWeight.bold, color: colors.text },
  statLabel: { fontSize: fontSize.xs, color: colors.textLight, fontWeight: fontWeight.medium },
  divider: { width: 1, height: 36, backgroundColor: colors.border },

  sectionTitle: {
    fontSize: fontSize.lg, fontWeight: fontWeight.bold,
    color: colors.text, marginTop: spacing.md, marginBottom: spacing.sm, letterSpacing: -0.2,
  },
  desc: { fontSize: fontSize.md, color: colors.textSecondary, lineHeight: 24 },

  infoRow: {
    flexDirection: 'row', alignItems: 'center',
    paddingVertical: 11, borderBottomWidth: 1, borderBottomColor: colors.divider, gap: spacing.sm,
  },
  infoIcon: { width: 30, height: 30, borderRadius: 15, backgroundColor: colors.primaryPale, alignItems: 'center', justifyContent: 'center' },
  infoLabel: { fontSize: fontSize.sm, color: colors.textSecondary, fontWeight: fontWeight.medium, flex: 1 },
  infoValue: { fontSize: fontSize.sm, color: colors.text, fontWeight: fontWeight.semiBold, maxWidth: '55%', textAlign: 'right' },

  // Waypoints
  wpRow: { flexDirection: 'row', alignItems: 'flex-start', paddingVertical: 8, gap: 12 },
  wpRowDivider: { borderBottomWidth: 0 },
  wpDotWrap: { alignItems: 'center', width: 16, paddingTop: 3 },
  wpDot: { width: 10, height: 10, borderRadius: 5, backgroundColor: colors.primary },
  wpLine: { width: 2, flex: 1, backgroundColor: colors.border, marginTop: 4, minHeight: 20 },
  wpInfo: { flex: 1 },
  wpName: { fontSize: fontSize.sm, fontWeight: fontWeight.semiBold, color: colors.text },
  wpElev: { fontSize: 12, color: colors.textLight, marginTop: 2 },

  // Route map thumbnail (visually distinct from hero photo)
  mapCard: {
    height: 150, borderRadius: radius.lg, overflow: 'hidden',
    marginBottom: spacing.sm, ...shadows.md,
  },
  mapGrid: { ...StyleSheet.absoluteFillObject },
  mapGridH: {
    position: 'absolute', left: 0, right: 0,
    height: 1, backgroundColor: 'rgba(255,255,255,0.06)',
  },
  mapGridV: {
    position: 'absolute', top: 0, bottom: 0,
    width: 1, backgroundColor: 'rgba(255,255,255,0.06)',
  },
  mapRouteLine: {
    position: 'absolute', left: '15%', right: '15%',
    top: '40%', height: 3, borderRadius: 2,
    backgroundColor: colors.accent, opacity: 0.9,
    transform: [{ rotate: '-8deg' }],
  },
  mapStartPin: {
    position: 'absolute', left: '13%', top: '38%',
    alignItems: 'center',
  },
  mapEndPin: {
    position: 'absolute', right: '13%', top: '28%',
    alignItems: 'center',
  },
  mapStartDot: {
    width: 10, height: 10, borderRadius: 5,
    backgroundColor: colors.success, borderWidth: 2, borderColor: '#fff',
  },
  mapPinLabel: { fontSize: 8, color: 'rgba(255,255,255,0.8)', marginTop: 2, fontWeight: fontWeight.bold },
  mapCardContent: {
    position: 'absolute', bottom: spacing.md, left: spacing.md,
    flexDirection: 'row', alignItems: 'center', gap: 7,
  },
  mapCardText: { color: '#fff', fontSize: fontSize.sm, fontWeight: fontWeight.bold },
  mapDistanceBadge: {
    position: 'absolute', bottom: spacing.md, right: spacing.md,
    backgroundColor: 'rgba(255,255,255,0.15)',
    paddingHorizontal: 10, paddingVertical: 4, borderRadius: 99,
  },
  mapDistanceText: { color: '#fff', fontSize: 12, fontWeight: fontWeight.bold },

  // POI grid
  poisGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
  poiChip: {
    flexDirection: 'row', alignItems: 'center', gap: 6,
    backgroundColor: colors.surface,
    borderRadius: radius.md, paddingHorizontal: 10, paddingVertical: 7,
    borderWidth: 1, borderColor: colors.border,
  },
  poiEmoji: { fontSize: 14 },
  poiName: { fontSize: 12, color: colors.text, fontWeight: fontWeight.medium, maxWidth: 120 },

  // Reviews
  reviewHeader: { flexDirection: 'row', alignItems: 'center', marginBottom: 8, gap: 10 },
  reviewAvatar: {
    width: 36, height: 36, borderRadius: 18,
    backgroundColor: colors.primaryPale, alignItems: 'center', justifyContent: 'center',
  },
  reviewInitial: { color: colors.primary, fontWeight: fontWeight.bold, fontSize: fontSize.md },
  reviewName: { fontSize: fontSize.sm, fontWeight: fontWeight.bold, color: colors.text },
  reviewDate: { fontSize: fontSize.xs, color: colors.textLight },
  reviewComment: { fontSize: fontSize.sm, color: colors.textSecondary, lineHeight: 22 },

  // CTA bar
  ctaBar: {
    position: 'absolute', left: 0, right: 0, bottom: 0,
    flexDirection: 'row', alignItems: 'center',
    padding: spacing.md, paddingBottom: spacing.lg,
    backgroundColor: colors.card,
    borderTopWidth: 1, borderTopColor: colors.divider,
    ...shadows.lg,
  },
  startBtn: {
    flexDirection: 'row', alignItems: 'center', gap: 6,
    backgroundColor: colors.primary,
    paddingVertical: 13, paddingHorizontal: 20,
    borderRadius: radius.round,
  },
  startBtnText: { color: '#fff', fontSize: fontSize.sm, fontWeight: fontWeight.bold },
});
