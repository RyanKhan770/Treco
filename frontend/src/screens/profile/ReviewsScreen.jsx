import { HugeiconsIcon } from '@hugeicons/react-native';
import React, { useEffect, useState, useCallback } from 'react';
import {
  View, Text, StyleSheet, ScrollView, StatusBar, ActivityIndicator, TouchableOpacity,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { StarIcon } from '@hugeicons/core-free-icons';
import { colors } from '../../constants/colors';
import { fontSize, fontWeight, radius, shadows, spacing } from '../../constants/theme';
import { useAuth } from '../../context/AuthContext';
import { Card, FadeIn, SlideUp, Stagger } from '../../components/ui';
import ScreenHeader from '../../components/ui/ScreenHeader';
import { reviewsAPI } from '../../services/api';

const AVATAR_COLORS = ['#40916C', '#457B9D', '#E76F51', '#6B4423', '#52B788', '#8B5CF6'];
function avatarColor(str = '') {
  let h = 0;
  for (let i = 0; i < str.length; i++) h = (h * 31 + str.charCodeAt(i)) >>> 0;
  return AVATAR_COLORS[h % AVATAR_COLORS.length];
}

const Stars = ({ value, size = 13 }) => (
  <View style={{ flexDirection: 'row', gap: 1 }}>
    {[1, 2, 3, 4, 5].map((i) => (
      <HugeiconsIcon icon={StarIcon}
        key={i} size={size}
        color={i <= value ? colors.warning : colors.border}
        fill={i <= value ? colors.warning : 'transparent'}
        strokeWidth={2}
      />
    ))}
  </View>
);

const ReviewsScreen = ({ navigation }) => {
  const { user } = useAuth();
  const [tab, setTab] = useState('received');
  const [reviews, setReviews]       = useState([]);
  const [givenReviews, setGivenReviews] = useState([]);
  const [stats, setStats]           = useState(null);
  const [loading, setLoading]       = useState(true);
  const [loadingGiven, setLoadingGiven] = useState(true);

  useEffect(() => {
    if (!user?.id) return;
    reviewsAPI.getUserReviews(user.id)
      .then(r => { setReviews(r.data.reviews || []); setStats(r.data.stats || null); })
      .catch(() => {})
      .finally(() => setLoading(false));

    reviewsAPI.getReviewsBy(user.id)
      .then(r => setGivenReviews(r.data || []))
      .catch(() => {})
      .finally(() => setLoadingGiven(false));
  }, [user?.id]);

  const name    = user?.name || 'Trekker';
  const initial = name[0]?.toUpperCase() || 'T';
  const avgRating = stats?.avg_overall ? Number(stats.avg_overall).toFixed(1) : '—';
  const total     = stats?.total ? Number(stats.total) : 0;

  const breakdown = [
    { label: 'Reliability',  score: stats?.avg_reliability  ? Number(stats.avg_reliability).toFixed(1)  : null },
    { label: 'Cooperation',  score: stats?.avg_cooperation  ? Number(stats.avg_cooperation).toFixed(1)  : null },
    { label: 'Experience',   score: stats?.avg_experience   ? Number(stats.avg_experience).toFixed(1)   : null },
  ];

  const currentReviews = tab === 'received' ? reviews : givenReviews;
  const isLoading = tab === 'received' ? loading : loadingGiven;

  return (
    <SafeAreaView style={styles.safe}>
      <StatusBar barStyle="dark-content" backgroundColor={colors.background} />
      <ScreenHeader title="My Reviews" subtitle="Feedback" onBack={() => navigation.goBack()} />

      {/* ── Tab bar ── */}
      <View style={styles.tabBar}>
        <TouchableOpacity
          style={[styles.tab, tab === 'received' && styles.tabActive]}
          onPress={() => setTab('received')}
        >
          <Text style={[styles.tabText, tab === 'received' && styles.tabTextActive]}>
            Received ({reviews.length})
          </Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.tab, tab === 'given' && styles.tabActive]}
          onPress={() => setTab('given')}
        >
          <Text style={[styles.tabText, tab === 'given' && styles.tabTextActive]}>
            Given ({givenReviews.length})
          </Text>
        </TouchableOpacity>
      </View>

      {isLoading ? (
        <View style={styles.centered}>
          <ActivityIndicator color={colors.primary} size="large" />
        </View>
      ) : (
        <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{ padding: spacing.md, paddingBottom: 80 }}>

          {/* Summary card — only on Received tab */}
          {tab === 'received' && (
            <>
              <SlideUp delay={100}>
                <Card style={styles.summary} elevation="md">
                  <View style={styles.avatar}>
                    <Text style={styles.avatarText}>{initial}</Text>
                  </View>
                  <View style={{ flex: 1 }}>
                    <Text style={styles.summaryName}>{name}</Text>
                    <Text style={styles.summaryTreks}>{total} review{total !== 1 ? 's' : ''} received</Text>
                  </View>
                  <View style={styles.ratingBox}>
                    <Text style={styles.ratingBig}>{avgRating}</Text>
                    <Stars value={Math.round(Number(stats?.avg_overall || 0))} size={12} />
                  </View>
                </Card>
              </SlideUp>

              {stats && (
                <SlideUp delay={160}>
                  <Card style={{ marginBottom: spacing.md }}>
                    <Text style={styles.section}>Rating breakdown</Text>
                    {breakdown.map((r) => r.score && (
                      <View key={r.label} style={styles.breakdownRow}>
                        <Text style={styles.breakdownLabel}>{r.label}</Text>
                        <View style={styles.barContainer}>
                          <View style={[styles.bar, { width: `${(Number(r.score) / 5) * 100}%` }]} />
                        </View>
                        <Text style={styles.breakdownScore}>{r.score}</Text>
                      </View>
                    ))}
                  </Card>
                </SlideUp>
              )}
            </>
          )}

          {/* Review cards */}
          {currentReviews.length > 0 ? (
            <>
              <Text style={styles.section}>
                {tab === 'received' ? `Recent reviews · ${currentReviews.length}` : `Reviews you wrote · ${currentReviews.length}`}
              </Text>
              <Stagger initialDelay={200} step={40} distance={14}>
                {currentReviews.map((r) => {
                  const personName = tab === 'received'
                    ? (r.reviewer_name || 'Trekker')
                    : (r.reviewed_name || 'Trekker');
                  const personPhoto = tab === 'received' ? r.reviewer_photo : r.reviewed_photo;
                  return (
                    <Card key={r.id} style={{ marginBottom: spacing.sm }}>
                      <View style={styles.reviewHeader}>
                        <View style={[styles.reviewAvatar, { backgroundColor: avatarColor(personName) }]}>
                          <Text style={styles.reviewAvatarText}>{personName[0]}</Text>
                        </View>
                        <View style={{ flex: 1 }}>
                          <Text style={styles.reviewName}>
                            {tab === 'received' ? personName : `To: ${personName}`}
                          </Text>
                          <Text style={styles.reviewDate}>
                            {r.group_name ? `${r.group_name} · ` : ''}
                            {new Date(r.created_at).toLocaleDateString('en-US', { month: 'short', year: 'numeric' })}
                          </Text>
                        </View>
                        <Stars value={Math.round(Number(r.overall_rating || 0))} />
                      </View>
                      {!!r.comment && <Text style={styles.reviewComment}>{r.comment}</Text>}
                    </Card>
                  );
                })}
              </Stagger>
            </>
          ) : (
            <FadeIn>
              <View style={styles.empty}>
                <HugeiconsIcon icon={StarIcon} size={40} color={colors.border} strokeWidth={1.5} />
                <Text style={styles.emptyText}>
                  {tab === 'received' ? 'No reviews yet' : 'You haven\'t written any reviews'}
                </Text>
                <Text style={styles.emptySub}>
                  {tab === 'received'
                    ? 'Complete trips with groups to receive reviews from fellow trekkers.'
                    : 'Rate your fellow trekkers after completing a group trip.'}
                </Text>
              </View>
            </FadeIn>
          )}
        </ScrollView>
      )}
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safe:    { flex: 1, backgroundColor: colors.background },
  centered:{ flex: 1, alignItems: 'center', justifyContent: 'center' },

  tabBar: {
    flexDirection: 'row', paddingHorizontal: spacing.md,
    gap: spacing.sm, paddingTop: spacing.sm, paddingBottom: spacing.xs,
  },
  tab: {
    flex: 1, paddingVertical: spacing.sm, borderRadius: radius.lg,
    alignItems: 'center', backgroundColor: colors.surface,
  },
  tabActive: { backgroundColor: colors.primary },
  tabText: { fontSize: fontSize.sm, fontWeight: fontWeight.semiBold, color: colors.textSecondary },
  tabTextActive: { color: '#fff' },

  summary: { flexDirection: 'row', alignItems: 'center', gap: spacing.sm, marginBottom: spacing.md },
  avatar:  { width: 56, height: 56, borderRadius: 28, backgroundColor: colors.primary, alignItems: 'center', justifyContent: 'center' },
  avatarText: { color: '#fff', fontSize: fontSize.xl, fontWeight: fontWeight.bold },
  summaryName: { fontSize: fontSize.lg, fontWeight: fontWeight.bold, color: colors.text },
  summaryTreks:{ fontSize: fontSize.xs, color: colors.textSecondary, marginTop: 2 },
  ratingBox:   { alignItems: 'flex-end', gap: 3 },
  ratingBig:   { fontSize: fontSize.xl, fontWeight: fontWeight.bold, color: colors.text, letterSpacing: -0.5 },
  section: { fontSize: fontSize.xs, fontWeight: fontWeight.bold, color: colors.primaryLight, letterSpacing: 2, textTransform: 'uppercase', marginBottom: spacing.sm },
  breakdownRow:   { flexDirection: 'row', alignItems: 'center', marginBottom: 10 },
  breakdownLabel: { width: 100, fontSize: fontSize.xs, color: colors.textSecondary, fontWeight: fontWeight.medium },
  barContainer:   { flex: 1, height: 6, backgroundColor: colors.surface, borderRadius: 3, marginHorizontal: 10, overflow: 'hidden' },
  bar:            { height: '100%', backgroundColor: colors.primary, borderRadius: 3 },
  breakdownScore: { width: 32, fontSize: fontSize.xs, color: colors.text, fontWeight: fontWeight.bold, textAlign: 'right' },
  reviewHeader:   { flexDirection: 'row', alignItems: 'center', gap: spacing.sm, marginBottom: 8 },
  reviewAvatar:   { width: 40, height: 40, borderRadius: 20, alignItems: 'center', justifyContent: 'center' },
  reviewAvatarText: { color: '#fff', fontSize: fontSize.md, fontWeight: fontWeight.bold },
  reviewName:  { fontSize: fontSize.md, fontWeight: fontWeight.bold, color: colors.text },
  reviewDate:  { fontSize: fontSize.xs, color: colors.textLight, marginTop: 1 },
  reviewComment: { fontSize: fontSize.sm, color: colors.textSecondary, lineHeight: 20 },
  empty:     { alignItems: 'center', paddingTop: 60, gap: 12 },
  emptyText: { fontSize: fontSize.lg, fontWeight: fontWeight.bold, color: colors.textSecondary },
  emptySub:  { fontSize: fontSize.sm, color: colors.textLight, textAlign: 'center', maxWidth: 260, lineHeight: 20 },
});

export default ReviewsScreen;
