import { HugeiconsIcon } from '@hugeicons/react-native';
import React, { useState, useEffect, useCallback } from 'react';
import {
  View, Text, StyleSheet, ScrollView, StatusBar, ActivityIndicator, RefreshControl,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Compass01Icon, UserGroupIcon, Calendar01Icon, MapPinIcon, MountainIcon, Navigation03Icon, PlusSignIcon } from '@hugeicons/core-free-icons';
import { colors } from '../../constants/colors';
import { fontSize, fontWeight, radius, shadows, spacing } from '../../constants/theme';
import {
  Badge, Button, Chip, PressableScale, SlideUp, Stagger, EmptyState,
} from '../../components/ui';
import ScreenHeader from '../../components/ui/ScreenHeader';
import { EmptyTrailIllustration } from '../../assets/svg/Illustrations';
import MountainScene from '../../assets/svg/MountainScene';
import { groupsAPI, tripsAPI } from '../../services/api';
import { NEPAL_TRAILS } from '../../constants/kathmandu_trails';

const TABS = ['Upcoming', 'Planned Trips', 'Completed'];
const statusTone = { Upcoming: 'primary', Completed: 'neutral' };

// ── Map a DB group to display shape ───────────────────────────────
const VARIANT_MAP = Object.fromEntries(
  NEPAL_TRAILS.map((t) => [t.name.toLowerCase().trim(), t.variant ?? 'alpine']),
);
const TRAIL_ID_MAP = Object.fromEntries(
  NEPAL_TRAILS.map((t) => [t.name.toLowerCase().trim(), t.id]),
);

function groupStatus(g) {
  if (g.status === 'completed') return 'Completed';
  return 'Upcoming';
}

function formatDateRange(start, end) {
  if (!start) return '—';
  const fmt = (d) =>
    new Date(d).toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
  return end ? `${fmt(start)} – ${fmt(end)}` : fmt(start);
}

function buildTrip(g) {
  const trailNameKey = (g.trail_name || '').toLowerCase().trim();
  return {
    id:       TRAIL_ID_MAP[trailNameKey] ?? `group-${g.id}`,
    groupId:  g.id,
    name:     g.name,
    trailName: g.trail_name || null,
    date:     formatDateRange(g.start_date, g.end_date),
    status:   groupStatus(g),
    variant:  VARIANT_MAP[trailNameKey] ?? 'alpine',
    members:  g.current_members ?? 0,
    duration: g.trail_name ? '—' : '—',
    role:     g.member_role || 'member',
  };
}

const MyTripsScreen = ({ navigation }) => {
  const [tab,        setTab]        = useState('Upcoming');
  const [allTrips,   setAllTrips]   = useState([]);
  const [loading,    setLoading]    = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const fetchTrips = useCallback(async (isRefresh = false) => {
    try {
      if (isRefresh) setRefreshing(true);
      else setLoading(true);
      const [groupsRes, tripsRes] = await Promise.allSettled([
        groupsAPI.getMyGroups(),
        tripsAPI.getAll(),
      ]);
      const groups = groupsRes.status === 'fulfilled' ? (groupsRes.value.data || []) : [];
      const trips = tripsRes.status === 'fulfilled' ? (tripsRes.value.data || []) : [];
      // Map groups to trip display
      const groupTrips = groups.map(buildTrip);
      // Map planned trips
      const plannedTrips = trips.map(t => ({
        id: t.id,
        groupId: t.group_id,
        name: t.name,
        trailName: t.trail_name || null,
        date: formatDateRange(t.start_date, t.end_date),
        status: t.status === 'completed' ? 'Completed' : t.status === 'active' ? 'Upcoming' : 'Planned Trips',
        variant: 'alpine',
        members: parseInt(t.participant_count || 0),
        duration: '—',
        role: 'planner',
        isTrip: true,
      }));
      setAllTrips([...groupTrips, ...plannedTrips]);
    } catch {
      // keep empty list
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  useEffect(() => { fetchTrips(); }, [fetchTrips]);

  const trips = allTrips.filter((t) => t.status === tab);

  return (
    <SafeAreaView style={styles.safe}>
      <StatusBar barStyle="dark-content" backgroundColor={colors.background} />
      <ScreenHeader
        title="My Trips"
        subtitle="Journeys"
        onBack={() => navigation.goBack()}
      />

      <SlideUp delay={100} style={styles.tabRow}>
        {TABS.map((t) => (
          <Chip key={t} label={t} selected={tab === t} onPress={() => setTab(t)} />
        ))}
      </SlideUp>

      {/* Plan trip FAB */}
      <SlideUp delay={120} style={{ paddingHorizontal: spacing.md, marginBottom: spacing.sm }}>
        <Button
          label="Plan a Trip"
          icon={Navigation03Icon}
          onPress={() => navigation.navigate('PlanTrip')}
          fullWidth
          size="sm"
        />
      </SlideUp>

      {loading ? (
        <View style={styles.center}>
          <ActivityIndicator color={colors.primary} size="large" />
          <Text style={styles.loadingText}>Loading trips…</Text>
        </View>
      ) : trips.length === 0 ? (
        <View style={{ flex: 1, justifyContent: 'center' }}>
          <EmptyState
            illustration={<EmptyTrailIllustration size={190} />}
            title={tab === 'Upcoming' ? 'No trips planned' : 'No past trips yet'}
            subtitle="Join a group or create your own trip to begin your adventure."
            action={
              <View style={{ flexDirection: 'row', gap: spacing.sm, marginTop: spacing.md }}>
                <Button
                  label="Plan a trip"
                  icon={Navigation03Icon}
                  onPress={() => navigation.navigate('PlanTrip')}
                />
                <Button
                  label="Find groups"
                  variant="outline"
                  icon={UserGroupIcon}
                  onPress={() => navigation.navigate('Groups')}
                />
              </View>
            }
          />
        </View>
      ) : (
        <ScrollView
          showsVerticalScrollIndicator={false}
          contentContainerStyle={{ padding: spacing.md, paddingBottom: spacing.xxl }}
          refreshControl={
            <RefreshControl
              refreshing={refreshing}
              onRefresh={() => fetchTrips(true)}
              tintColor={colors.primary}
              colors={[colors.primary]}
            />
          }
        >
          <Stagger initialDelay={180} step={40} distance={16}>
            {trips.map((trip) => (
              <PressableScale
                key={`${trip.groupId}`}
                style={styles.card}
                onPress={() =>
                  trip.trailName
                    ? navigation.navigate('TrailDetail', { trailId: trip.id, trailName: trip.trailName })
                    : navigation.navigate('GroupDetail', { groupId: trip.groupId, groupName: trip.name })
                }
                scaleTo={0.98}
              >
                <View style={styles.cardHero}>
                  <MountainScene width={400} height={130} variant={trip.variant} />
                  <View style={styles.cardBadge}>
                    <Badge label={trip.status} tone={statusTone[trip.status]} size="sm" />
                  </View>
                  {trip.role === 'organizer' && (
                    <View style={styles.roleChip}>
                      <Text style={styles.roleChipText}>Organizer</Text>
                    </View>
                  )}
                </View>
                <View style={styles.cardBody}>
                  <Text style={styles.cardName}>{trip.name}</Text>
                  {trip.trailName ? (
                    <View style={[styles.metaItem, { marginBottom: 6 }]}>
                      <HugeiconsIcon icon={MountainIcon} size={12} color={colors.primary} strokeWidth={2.25} />
                      <Text style={[styles.metaText, { color: colors.primary }]}>{trip.trailName}</Text>
                    </View>
                  ) : null}
                  <View style={styles.metaRow}>
                    <View style={styles.metaItem}>
                      <HugeiconsIcon icon={Calendar01Icon} size={13} color={colors.textSecondary} strokeWidth={2.25} />
                      <Text style={styles.metaText}>{trip.date}</Text>
                    </View>
                    <View style={styles.metaItem}>
                      <HugeiconsIcon icon={UserGroupIcon} size={13} color={colors.textSecondary} strokeWidth={2.25} />
                      <Text style={styles.metaText}>{trip.members} members</Text>
                    </View>
                  </View>
                </View>
              </PressableScale>
            ))}
          </Stagger>
        </ScrollView>
      )}
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safe:  { flex: 1, backgroundColor: colors.background },
  center:{ flex: 1, alignItems: 'center', justifyContent: 'center', gap: spacing.sm },
  loadingText: { fontSize: fontSize.sm, color: colors.textSecondary },

  tabRow: {
    flexDirection: 'row', gap: spacing.sm,
    paddingHorizontal: spacing.md, paddingVertical: spacing.sm,
  },

  card: {
    backgroundColor: colors.card,
    borderRadius: radius.xl,
    marginBottom: spacing.md,
    overflow: 'hidden',
    ...shadows.md,
  },
  cardHero:  { height: 130, overflow: 'hidden' },
  cardBadge: { position: 'absolute', top: 12, right: 12 },
  roleChip:  {
    position: 'absolute', top: 12, left: 12,
    backgroundColor: 'rgba(45,122,79,0.85)',
    paddingHorizontal: 8, paddingVertical: 3, borderRadius: 99,
  },
  roleChipText: { color: '#fff', fontSize: 10, fontWeight: fontWeight.bold, letterSpacing: 0.3 },
  cardBody:  { padding: spacing.md },
  cardName:  { fontSize: fontSize.lg, fontWeight: fontWeight.bold, color: colors.text, letterSpacing: -0.3, marginBottom: 4 },
  metaRow:   { flexDirection: 'row', gap: spacing.md, marginTop: spacing.xs },
  metaItem:  { flexDirection: 'row', alignItems: 'center', gap: 5 },
  metaText:  { fontSize: fontSize.xs, color: colors.textSecondary, fontWeight: fontWeight.medium },
});

export default MyTripsScreen;
