import { HugeiconsIcon } from '@hugeicons/react-native';
import React, { useState, useEffect, useCallback } from 'react';
import {
  View, Text, StyleSheet, ScrollView, StatusBar, ActivityIndicator,
  RefreshControl,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Bookmark02Icon, MapPinIcon, MountainIcon, StarIcon } from '@hugeicons/core-free-icons';
import { colors } from '../../constants/colors';
import { fontSize, fontWeight, radius, shadows, spacing } from '../../constants/theme';
import {
  Badge, Card, PressableScale, FadeIn, SlideUp, Stagger, EmptyState,
} from '../../components/ui';
import ScreenHeader from '../../components/ui/ScreenHeader';
import { EmptyTrailIllustration } from '../../assets/svg/Illustrations';
import MountainScene from '../../assets/svg/MountainScene';
import { savedTrailsAPI } from '../../services/api';

const DIFF_TONE = { Easy: 'success', Moderate: 'warning', Hard: 'danger' };

const SavedTrailsScreen = ({ navigation }) => {
  const [trails, setTrails] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const fetchSaved = useCallback(async (isRefresh = false) => {
    try {
      if (isRefresh) setRefreshing(true);
      else setLoading(true);
      const res = await savedTrailsAPI.getAll();
      setTrails(res.data || []);
    } catch {
      // keep empty
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  useEffect(() => { fetchSaved(); }, [fetchSaved]);

  return (
    <SafeAreaView style={styles.safe}>
      <StatusBar barStyle="dark-content" backgroundColor={colors.background} />
      <ScreenHeader
        title="Saved Trails"
        subtitle="Adventure"
        onBack={() => navigation.goBack()}
      />

      {loading ? (
        <View style={styles.center}>
          <ActivityIndicator color={colors.primary} size="large" />
          <Text style={styles.loadingText}>Loading saved trails…</Text>
        </View>
      ) : trails.length === 0 ? (
        <View style={{ flex: 1, justifyContent: 'center' }}>
          <EmptyState
            illustration={<EmptyTrailIllustration size={190} />}
            title="No saved trails"
            subtitle="Bookmark trails you love from the Explore or Trail Detail screens and find them here."
          />
        </View>
      ) : (
        <ScrollView
          showsVerticalScrollIndicator={false}
          contentContainerStyle={{ padding: spacing.md, paddingBottom: spacing.xxl }}
          refreshControl={
            <RefreshControl
              refreshing={refreshing}
              onRefresh={() => fetchSaved(true)}
              tintColor={colors.primary}
              colors={[colors.primary]}
            />
          }
        >
          <FadeIn>
            <Text style={styles.count}>
              {trails.length} trail{trails.length !== 1 ? 's' : ''} saved
            </Text>
          </FadeIn>
          <Stagger initialDelay={120} step={40} distance={16}>
            {trails.map((trail) => {
              const diff = trail.difficulty || 'Moderate';
              return (
                <PressableScale
                  key={trail.id}
                  style={styles.card}
                  onPress={() => navigation.navigate('TrailDetail', { trailId: trail.id, trailName: trail.name })}
                  scaleTo={0.98}
                >
                  <View style={styles.cardHero}>
                    <MountainScene width={400} height={120} variant="alpine" />
                    <View style={styles.cardBadge}>
                      <Badge label={diff} tone={DIFF_TONE[diff] ?? 'warning'} size="sm" />
                    </View>
                    <View style={styles.bookmarkWrap}>
                      <HugeiconsIcon icon={Bookmark02Icon} size={18} color={colors.warning} fill={colors.warning} strokeWidth={0} />
                    </View>
                  </View>
                  <View style={styles.cardBody}>
                    <Text style={styles.cardName} numberOfLines={1}>{trail.name}</Text>
                    {!!trail.region && (
                      <View style={styles.metaItem}>
                        <HugeiconsIcon icon={MapPinIcon} size={12} color={colors.primaryLight} strokeWidth={2} />
                        <Text style={styles.metaText}>{trail.region}</Text>
                      </View>
                    )}
                    <View style={styles.metaRow}>
                      {!!trail.distance_km && (
                        <View style={styles.metaItem}>
                          <HugeiconsIcon icon={MountainIcon} size={12} color={colors.textSecondary} strokeWidth={2} />
                          <Text style={styles.metaText}>{trail.distance_km} km</Text>
                        </View>
                      )}
                      {!!trail.elevation_gain && (
                        <View style={styles.metaItem}>
                          <Text style={styles.metaText}>↑{trail.elevation_gain}m</Text>
                        </View>
                      )}
                    </View>
                  </View>
                </PressableScale>
              );
            })}
          </Stagger>
        </ScrollView>
      )}
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: colors.background },
  center: { flex: 1, alignItems: 'center', justifyContent: 'center', gap: spacing.sm },
  loadingText: { fontSize: fontSize.sm, color: colors.textSecondary },
  count: {
    fontSize: fontSize.sm, color: colors.textSecondary, fontWeight: fontWeight.medium,
    marginBottom: spacing.md,
  },
  card: {
    backgroundColor: colors.card, borderRadius: radius.xl,
    marginBottom: spacing.md, overflow: 'hidden', ...shadows.md,
  },
  cardHero: { height: 120, overflow: 'hidden' },
  cardBadge: { position: 'absolute', top: 10, right: 10 },
  bookmarkWrap: {
    position: 'absolute', top: 10, left: 10,
    width: 32, height: 32, borderRadius: 16,
    backgroundColor: 'rgba(255,255,255,0.9)',
    alignItems: 'center', justifyContent: 'center',
  },
  cardBody: { padding: spacing.md },
  cardName: { fontSize: fontSize.lg, fontWeight: fontWeight.bold, color: colors.text, letterSpacing: -0.3, marginBottom: 4 },
  metaRow: { flexDirection: 'row', gap: spacing.md, marginTop: spacing.xs },
  metaItem: { flexDirection: 'row', alignItems: 'center', gap: 4 },
  metaText: { fontSize: fontSize.xs, color: colors.textSecondary, fontWeight: fontWeight.medium },
});

export default SavedTrailsScreen;
