import React from 'react';
import {
  View, Text, StyleSheet, ScrollView, TouchableOpacity,
  StatusBar, SafeAreaView,
} from 'react-native';
import { colors } from '../../constants/colors';
import { useAuth } from '../../context/AuthContext';

const reviews = [
  { id: '1', name: 'Priya Thapa', trek: 'Langtang Trek', date: 'Dec 2025', rating: 5, comment: 'Amazing trek partner! Very helpful and experienced. Would trek again!' },
  { id: '2', name: 'Suman KC', trek: 'EBC Trek', date: 'Nov 2025', rating: 5, comment: 'Great leader, always kept the group motivated and safe. Highly recommend!' },
  { id: '3', name: 'Anita Rai', trek: 'Poon Hill', date: 'Oct 2025', rating: 4, comment: 'Good experience overall, very punctual.' },
];

const ratingBreakdown = [
  { label: 'Reliability', score: 4.9 },
  { label: 'Cooperation', score: 5.0 },
  { label: 'Experience', score: 4.8 },
];

const ReviewsScreen = ({ navigation }) => {
  const { user } = useAuth();
  const name = user?.fullName || 'Ryan Khan';
  const initial = name[0]?.toUpperCase() || 'R';
  const avgRating = 4.9;

  return (
    <SafeAreaView style={styles.safe}>
      <StatusBar barStyle="dark-content" backgroundColor={colors.white} />
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <Text style={styles.back}>←</Text>
        </TouchableOpacity>
        <Text style={styles.title}>Reviews</Text>
        <View style={{ width: 40 }} />
      </View>

      <ScrollView showsVerticalScrollIndicator={false}>
        {/* User summary */}
        <View style={styles.summary}>
          <View style={styles.avatar}>
            <Text style={styles.avatarText}>{initial}</Text>
          </View>
          <View style={styles.summaryInfo}>
            <Text style={styles.summaryName}>{name}</Text>
            <Text style={styles.summaryTreks}>{reviews.length * 5} treks completed</Text>
          </View>
          <View style={styles.ratingBox}>
            <Text style={styles.ratingBig}>{avgRating}</Text>
            <Text style={styles.ratingStars}>{'★'.repeat(5)}</Text>
          </View>
        </View>

        {/* Rating breakdown */}
        <View style={styles.card}>
          <Text style={styles.sectionTitle}>Rating Breakdown</Text>
          {ratingBreakdown.map((r) => (
            <View key={r.label} style={styles.breakdownRow}>
              <Text style={styles.breakdownLabel}>{r.label}</Text>
              <View style={styles.barContainer}>
                <View style={[styles.bar, { width: `${(r.score / 5) * 100}%` }]} />
              </View>
              <Text style={styles.breakdownScore}>{r.score}</Text>
            </View>
          ))}
        </View>

        {/* Reviews list */}
        <Text style={styles.recentTitle}>Recent Reviews ({reviews.length})</Text>
        {reviews.map((r) => (
          <View key={r.id} style={styles.reviewCard}>
            <View style={styles.reviewHeader}>
              <View style={styles.reviewAvatar}>
                <Text style={styles.reviewAvatarText}>{r.name[0]}</Text>
              </View>
              <View style={styles.reviewMeta}>
                <Text style={styles.reviewName}>{r.name}</Text>
                <Text style={styles.reviewTrek}>{r.trek} • {r.date}</Text>
              </View>
              <Text style={styles.reviewStars}>{'★'.repeat(r.rating)}</Text>
            </View>
            <Text style={styles.reviewComment}>{r.comment}</Text>
          </View>
        ))}
        <View style={{ height: 40 }} />
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: colors.background },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 16,
    backgroundColor: colors.white,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  back: { fontSize: 22, color: colors.textPrimary },
  title: { fontSize: 17, fontWeight: '700', color: colors.textPrimary },
  summary: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.white,
    margin: 16,
    borderRadius: 16,
    padding: 16,
    elevation: 2,
  },
  avatar: {
    width: 52, height: 52, borderRadius: 26,
    backgroundColor: colors.primary,
    alignItems: 'center', justifyContent: 'center',
    marginRight: 12,
  },
  avatarText: { color: colors.white, fontSize: 20, fontWeight: '700' },
  summaryInfo: { flex: 1 },
  summaryName: { fontSize: 16, fontWeight: '700', color: colors.textPrimary },
  summaryTreks: { fontSize: 12, color: colors.textSecondary },
  ratingBox: { alignItems: 'center' },
  ratingBig: { fontSize: 24, fontWeight: '700', color: colors.textPrimary },
  ratingStars: { fontSize: 12, color: colors.warning },
  card: {
    backgroundColor: colors.white,
    marginHorizontal: 16,
    borderRadius: 16,
    padding: 16,
    marginBottom: 16,
    elevation: 1,
  },
  sectionTitle: { fontSize: 15, fontWeight: '700', color: colors.textPrimary, marginBottom: 12 },
  breakdownRow: { flexDirection: 'row', alignItems: 'center', marginBottom: 10 },
  breakdownLabel: { width: 90, fontSize: 13, color: colors.textSecondary },
  barContainer: { flex: 1, height: 6, backgroundColor: colors.border, borderRadius: 3, marginHorizontal: 10, overflow: 'hidden' },
  bar: { height: '100%', backgroundColor: colors.primary, borderRadius: 3 },
  breakdownScore: { width: 32, fontSize: 13, color: colors.textPrimary, fontWeight: '600', textAlign: 'right' },
  recentTitle: { fontSize: 16, fontWeight: '700', color: colors.textPrimary, marginHorizontal: 16, marginBottom: 8 },
  reviewCard: {
    backgroundColor: colors.white,
    marginHorizontal: 16,
    borderRadius: 16,
    padding: 14,
    marginBottom: 10,
    elevation: 1,
  },
  reviewHeader: { flexDirection: 'row', alignItems: 'center', marginBottom: 8 },
  reviewAvatar: {
    width: 36, height: 36, borderRadius: 18,
    backgroundColor: colors.primary,
    alignItems: 'center', justifyContent: 'center',
    marginRight: 10,
  },
  reviewAvatarText: { color: colors.white, fontSize: 14, fontWeight: '700' },
  reviewMeta: { flex: 1 },
  reviewName: { fontSize: 14, fontWeight: '600', color: colors.textPrimary },
  reviewTrek: { fontSize: 12, color: colors.textMuted },
  reviewStars: { fontSize: 14, color: colors.warning },
  reviewComment: { fontSize: 13, color: colors.textSecondary, lineHeight: 20 },
});

export default ReviewsScreen;
