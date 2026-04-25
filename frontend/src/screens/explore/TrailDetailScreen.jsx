import React, { useState, useEffect, useCallback } from 'react';
import {
  View, Text, StyleSheet, StatusBar, Dimensions,
  Animated, Platform,
} from 'react-native';
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import { HugeiconsIcon } from '@hugeicons/react-native';
import { ArrowLeft02Icon, FavouriteIcon, Share01Icon, MapPinIcon, Clock01Icon, ChartUpIcon, Calendar01Icon, Home02Icon, Task01Icon, StarIcon, UserGroupIcon, MapsIcon, Navigation03Icon, Alert01Icon } from '@hugeicons/core-free-icons';
import { colors } from '../../constants/colors';
import { fontSize, fontWeight, radius, shadows, spacing } from '../../constants/theme';
import {
  Badge, Button, Card, PressableScale, FadeIn, SlideUp, Stagger,
} from '../../components/ui';
import MountainScene from '../../assets/svg/MountainScene';
import { getTrailImage } from '../../assets/images/trailImages';
import { trailsAPI, savedTrailsAPI } from '../../services/api';
import { getTrailById, getTrailByName } from '../../constants/kathmandu_trails';

const { width: W } = Dimensions.get('window');
const HERO = 280;

const DIFF_TONE = { Easy: 'success', Moderate: 'warning', Hard: 'danger', Strenuous: 'danger' };

export default function TrailDetailScreen({ route, navigation }) {
  const { trailId, trailName, trailData } = route.params;
  const [liked, setLiked] = useState(false);
  const [reviews, setReviews] = useState([]);
  const [reviewStats, setReviewStats] = useState({ avg_rating: 0, total: 0 });
  const insets = useSafeAreaInsets();

  // Use local constants for rich display data, but always layer in DB coordinates when
  // available — they contain the real geojson_path GPS data from the database.
  const localTrail = getTrailById(trailId) || getTrailByName(trailName);
  const real = localTrail
    ? {
        ...localTrail,
        ...(trailData?.coordinates?.length >= 2 ? {
          coordinates: trailData.coordinates,
          startCoord: trailData.startCoord || trailData.coordinates[0],
        } : {}),
      }
    : (trailData || null);

  // Check if trail is saved
  useEffect(() => {
    const dbId = real?.dbId || real?.id || trailId;
    if (!dbId) return;
    savedTrailsAPI.check(dbId)
      .then(r => setLiked(r.data?.saved || false))
      .catch(() => {});
  }, [real?.id, trailId]);

  const toggleSaved = async () => {
    const dbId = real?.dbId || real?.id || trailId;
    if (!dbId) return;
    try {
      if (liked) {
        await savedTrailsAPI.unsave(dbId);
        setLiked(false);
      } else {
        await savedTrailsAPI.save(dbId);
        setLiked(true);
      }
    } catch {
      // silently fail
    }
  };

  const loadReviews = useCallback(async () => {
    const id = real?.id;
    if (!id) return;
    try {
      const res = await trailsAPI.getReviews(id);
      setReviews(res.data.reviews || []);
      setReviewStats({ avg_rating: res.data.avg_rating || 0, total: res.data.total || 0 });
    } catch {
      // no reviews in DB yet
    }
  }, [real?.id]);

  useEffect(() => { loadReviews(); }, [loadReviews]);

  if (!real) {
    return (
      <SafeAreaView style={styles.safe}>
        <View style={styles.notFound}>
          <HugeiconsIcon icon={Alert01Icon} size={48} color={colors.warning} strokeWidth={1.5} />
          <Text style={styles.notFoundTitle}>Trail not found</Text>
          <Text style={styles.notFoundSub}>ID: {trailId || 'unknown'}</Text>
          <PressableScale onPress={() => navigation.goBack()} style={styles.notFoundBtn}>
            <Text style={styles.notFoundBtnText}>← Go back</Text>
          </PressableScale>
        </View>
      </SafeAreaView>
    );
  }

  const maxElev = real.maxElevation ?? real.max_elevation ?? real.max_altitude_m ?? 0;

  const trail = {
    id:          real.id,
    name:        real.name,
    region:      real.region,
    duration:    real.duration || (real.duration_days ? `${real.duration_days} days` : 'N/A'),
    difficulty:  real.difficulty,
    elevation:   `${Number(maxElev).toLocaleString()}m`,
    elevGain:    real.elevationGain || real.elevation_gain || (real.elevation_gain_m ? `+${real.elevation_gain_m}m` : 'N/A'),
    distance:    real.distance || (real.distance_km ? `${real.distance_km}km` : 'N/A'),
    description: real.description,
    bestSeason:  real.bestSeason || real.best_season || 'N/A',
    permits:     real.permits || [],
    waypoints:   real.waypoints || [],
    pois:        real.pois || [],
    rating:      reviewStats.avg_rating,
    reviewCount: reviewStats.total,
    teaHouses:   real.teaHouses || (real.tea_houses_available ? 'Available throughout' : 'Check locally'),
    variant:     real.variant || 'alpine',
    reviews,
  };

  const scrollY = React.useRef(new Animated.Value(0)).current;

  const heroScale = scrollY.interpolate({ inputRange: [-HERO, 0, HERO], outputRange: [2, 1, 1], extrapolateRight: 'clamp' });
  const heroTranslate = scrollY.interpolate({ inputRange: [0, HERO], outputRange: [0, HERO / 2], extrapolate: 'clamp' });
  const titleOpacity = scrollY.interpolate({ inputRange: [0, 120, 180], outputRange: [0, 0, 1] });

  const handleViewMap = () => {
    navigation.navigate('TrailMap', {
      trailId: real.id,
      trailName: real.name,
      trailData: real,
      tracking: false,
    });
  };

  return (
    <SafeAreaView style={styles.safe} edges={['bottom']}>
      <StatusBar barStyle="light-content" />
      <Animated.View style={[styles.stickyHeader, { opacity: titleOpacity }]}>
        <Text style={styles.stickyTitle} numberOfLines={1}>{trail.name}</Text>
      </Animated.View>
      <View style={styles.topActions}>
        <PressableScale onPress={() => navigation.goBack()} style={styles.iconBtn} scaleTo={0.9}>
          <HugeiconsIcon icon={ArrowLeft02Icon} size={22} color="#fff" strokeWidth={2.25} />
        </PressableScale>
        <View style={{ flexDirection: 'row', gap: 10 }}>
          <PressableScale style={styles.iconBtn} scaleTo={0.9} onPress={toggleSaved}>
            <HugeiconsIcon icon={FavouriteIcon} size={20} color="#fff" fill={liked ? '#fff' : 'transparent'} strokeWidth={2.25} />
          </PressableScale>
          <PressableScale style={styles.iconBtn} scaleTo={0.9}>
            <HugeiconsIcon icon={Share01Icon} size={20} color="#fff" strokeWidth={2.25} />
          </PressableScale>
        </View>
      </View>

      <Animated.ScrollView
        showsVerticalScrollIndicator={false}
        onScroll={Animated.event([{ nativeEvent: { contentOffset: { y: scrollY } } }], { useNativeDriver: true })}
        scrollEventThrottle={16}
        contentContainerStyle={{ paddingBottom: 120 }}
      >
        <Animated.View style={[styles.hero, { transform: [{ scale: heroScale }, { translateY: heroTranslate }] }]}>
          <MountainScene width={W} height={HERO} variant={trail.variant} uri={getTrailImage(real.id)} />
          <LinearGradient colors={['rgba(15,44,32,0.15)', 'rgba(15,44,32,0.88)']} style={StyleSheet.absoluteFill} />
        </Animated.View>

        <View style={styles.heroCaption}>
          <FadeIn delay={80}>
            <View style={{ flexDirection: 'row', gap: 5, alignItems: 'center' }}>
              <HugeiconsIcon icon={MapPinIcon} size={12} color="rgba(255,255,255,0.85)" strokeWidth={2.25} />
              <Text style={styles.heroLoc}>{trail.region}</Text>
            </View>
          </FadeIn>
          <SlideUp delay={120}>
            <Text style={styles.heroTitle}>{trail.name}</Text>
          </SlideUp>
          <SlideUp delay={200} style={{ flexDirection: 'row', alignItems: 'center', gap: 8, marginTop: 6 }}>
            <Badge label={trail.difficulty} tone={DIFF_TONE[trail.difficulty]} />
            <View style={styles.heroRating}>
              <HugeiconsIcon icon={StarIcon} size={12} color="#FBBF24" fill="#FBBF24" strokeWidth={0} />
              <Text style={styles.heroRatingText}>{trail.rating > 0 ? trail.rating.toFixed(1) : '–'}</Text>
              <Text style={styles.heroRatingCount}>· {trail.reviewCount} reviews</Text>
            </View>
          </SlideUp>
        </View>

        <View style={styles.body}>
          <SlideUp delay={240}>
            <Card style={styles.statsCard} elevation="lg" padding={spacing.md}>
              <StatBox Icon={Clock01Icon}      label="Duration"  value={trail.duration} />
              <View style={styles.divider} />
              <StatBox Icon={ChartUpIcon} label="Max Elev."  value={trail.elevation} />
              <View style={styles.divider} />
              <StatBox Icon={MapsIcon}        label="Distance"  value={trail.distance} />
            </Card>
          </SlideUp>

          <Stagger initialDelay={200} step={40} distance={14}>
            <View>
              <Text style={styles.sectionTitle}>About</Text>
              <Text style={styles.desc}>{trail.description}</Text>
            </View>
            <View>
              <Text style={styles.sectionTitle}>Trail info</Text>
              <InfoRow Icon={Calendar01Icon}  label="Best season" value={trail.bestSeason} />
              <InfoRow Icon={ChartUpIcon} label="Elev. gain" value={trail.elevGain || 'See profile'} />
              <InfoRow Icon={Home02Icon}      label="Teahouses"   value={trail.teaHouses} />
              <InfoRow Icon={Task01Icon} label="Permits"     value={trail.permits.length ? trail.permits.join(', ') : 'None required'} isLast />
            </View>
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
            <View>
              <Text style={styles.sectionTitle}>Route map</Text>
              <PressableScale onPress={handleViewMap} scaleTo={0.98} style={styles.mapCard}>
                <LinearGradient
                  colors={[colors.primaryDark, colors.primary]}
                  style={[StyleSheet.absoluteFill, { borderRadius: radius.lg }]}
                />
                <View style={styles.mapGrid}>
                  {[0.25, 0.5, 0.75].map((v) => (
                    <View key={v} style={[styles.mapGridH, { top: `${v * 100}%` }]} />
                  ))}
                  {[0.33, 0.66].map((v) => (
                    <View key={v} style={[styles.mapGridV, { left: `${v * 100}%` }]} />
                  ))}
                </View>
                <View style={styles.mapRouteLine} />
                <View style={styles.mapStartPin}>
                  <View style={styles.mapStartDot} />
                  <Text style={styles.mapPinLabel}>Start</Text>
                </View>
                <View style={styles.mapEndPin}>
                  <View style={[styles.mapStartDot, { backgroundColor: colors.accent }]} />
                  <Text style={styles.mapPinLabel}>End</Text>
                </View>
                <View style={styles.mapCardContent}>
                  <HugeiconsIcon icon={Navigation03Icon} size={16} color="#fff" strokeWidth={2.5} />
                  <Text style={styles.mapCardText}>View full route map</Text>
                </View>
                <View style={styles.mapDistanceBadge}>
                  <Text style={styles.mapDistanceText}>{trail.distance}</Text>
                </View>
              </PressableScale>
            </View>
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
            <View>
              <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: spacing.sm }}>
                <Text style={styles.sectionTitle}>Conditions & Reviews ({trail.reviewCount})</Text>
                <PressableScale onPress={() => navigation.navigate('WriteTrailReview', { trailId: trail.id, trailName: trail.name })} hitSlop={8}>
                  <Text style={{ color: colors.primary, fontWeight: 'bold' }}>+ Report Condition</Text>
                </PressableScale>
              </View>
              {trail.reviews.length === 0 ? (
                <Text style={styles.noReviews}>No conditions reported yet. Be the first!</Text>
              ) : (
                trail.reviews.map((r, i) => {
                  const name = r.reviewer_name || r.name || 'Trekker';
                  const stars = Math.round(r.overall_rating ?? r.rating ?? 0);
                  const date = r.created_at ? new Date(r.created_at).toLocaleDateString('en-US', { month: 'short', year: 'numeric' }) : r.date || '';
                  return (
                    <Card key={i} style={{ marginBottom: spacing.sm }} elevation="xs">
                      <View style={styles.reviewHeader}>
                        <View style={styles.reviewAvatar}>
                          <Text style={styles.reviewInitial}>{name[0]}</Text>
                        </View>
                        <View style={{ flex: 1 }}>
                          <Text style={styles.reviewName}>{name}</Text>
                          <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6, marginTop: 2 }}>
                            <View style={{ flexDirection: 'row', gap: 2 }}>
                              {Array.from({ length: stars }).map((_, j) => (
                                <HugeiconsIcon icon={StarIcon} key={j} size={11} color="#FBBF24" fill="#FBBF24" strokeWidth={0} />
                              ))}
                            </View>
                            {r.condition_status && (
                              <View style={{ backgroundColor: 'rgba(0,0,0,0.05)', paddingHorizontal: 6, paddingVertical: 2, borderRadius: 4 }}>
                                <Text style={{ fontSize: 10, fontWeight: 'bold', color: colors.text }}>{r.condition_status}</Text>
                              </View>
                            )}
                          </View>
                        </View>
                        <Text style={styles.reviewDate}>{date}</Text>
                      </View>
                      <Text style={styles.reviewComment}>{r.comment}</Text>
                    </Card>
                  );
                })
              )}
            </View>
          </Stagger>
        </View>
      </Animated.ScrollView>
      <View style={[styles.ctaBar, { paddingBottom: Math.max(insets.bottom, spacing.md) }]}>
        <Button
          label="Find group"
          variant="outline"
          icon={UserGroupIcon}
          onPress={() => navigation.navigate('MainTabs', { screen: 'Groups', params: { filterTrailId: real.id, filterTrailName: real.name } })}
          style={{ flex: 1 }}
        />
        <View style={{ width: 8 }} />
        <Button
          label="View map"
          icon={MapsIcon}
          onPress={handleViewMap}
          style={{ flex: 1 }}
        />
      </View>
    </SafeAreaView>
  );
}

const POI_EMOJI = { lodge: '🏠', water: '💧', viewpoint: '🔭', junction: '🔀', rescue: '🆘', campsite: '⛺' };

const StatBox = ({ Icon, label, value }) => (
  <View style={styles.statBox}>
    <HugeiconsIcon icon={Icon} size={18} color={colors.primary} strokeWidth={2.25} />
    <Text style={styles.statValue}>{value}</Text>
    <Text style={styles.statLabel}>{label}</Text>
  </View>
);

const InfoRow = ({ Icon, label, value, isLast }) => (
  <View style={[styles.infoRow, isLast && { borderBottomWidth: 0 }]}>
    <View style={styles.infoIcon}><HugeiconsIcon icon={Icon} size={15} color={colors.primary} strokeWidth={2.25} /></View>
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

  wpRow: { flexDirection: 'row', alignItems: 'flex-start', paddingVertical: 8, gap: 12 },
  wpRowDivider: { borderBottomWidth: 0 },
  wpDotWrap: { alignItems: 'center', width: 16, paddingTop: 3 },
  wpDot: { width: 10, height: 10, borderRadius: 5, backgroundColor: colors.primary },
  wpLine: { width: 2, flex: 1, backgroundColor: colors.border, marginTop: 4, minHeight: 20 },
  wpInfo: { flex: 1 },
  wpName: { fontSize: fontSize.sm, fontWeight: fontWeight.semiBold, color: colors.text },
  wpElev: { fontSize: 12, color: colors.textLight, marginTop: 2 },

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

  poisGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
  poiChip: {
    flexDirection: 'row', alignItems: 'center', gap: 6,
    backgroundColor: colors.surface,
    borderRadius: radius.md, paddingHorizontal: 10, paddingVertical: 7,
    borderWidth: 1, borderColor: colors.border,
  },
  poiEmoji: { fontSize: 14 },
  poiName: { fontSize: 12, color: colors.text, fontWeight: fontWeight.medium, maxWidth: 120 },

  reviewHeader: { flexDirection: 'row', alignItems: 'center', marginBottom: 8, gap: 10 },
  reviewAvatar: {
    width: 36, height: 36, borderRadius: 18,
    backgroundColor: colors.primaryPale, alignItems: 'center', justifyContent: 'center',
  },
  reviewInitial: { color: colors.primary, fontWeight: fontWeight.bold, fontSize: fontSize.md },
  reviewName: { fontSize: fontSize.sm, fontWeight: fontWeight.bold, color: colors.text },
  reviewDate: { fontSize: fontSize.xs, color: colors.textLight },
  reviewComment: { fontSize: fontSize.sm, color: colors.textSecondary, lineHeight: 22 },
  noReviews: { fontSize: fontSize.sm, color: colors.textLight, fontStyle: 'italic', paddingVertical: spacing.md, textAlign: 'center' },

  ctaBar: {
    position: 'absolute', left: 0, right: 0, bottom: 0,
    flexDirection: 'row', alignItems: 'center',
    padding: spacing.md, paddingBottom: spacing.lg,
    backgroundColor: colors.card,
    borderTopWidth: 1, borderTopColor: colors.divider,
    ...shadows.lg,
  },
});
