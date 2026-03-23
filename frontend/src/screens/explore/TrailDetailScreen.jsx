import React, { useState } from 'react';
import {
  View, Text, StyleSheet, ScrollView, TouchableOpacity,
  StatusBar, SafeAreaView,
} from 'react-native';
import { colors } from '../../constants/colors';

const trailData = {
  '1': {
    name: 'Annapurna Base Camp', duration: '10-12 days', difficulty: 'Moderate',
    elevation: '4,130m', distance: '115km', rating: 4.9, reviewCount: 312,
    description: 'The Annapurna Base Camp trek is one of the most scenic treks in Nepal, passing through diverse landscapes from subtropical forests to alpine meadows.',
    bestSeason: 'March–May, Sept–Nov',
    permits: ['ACAP Permit', 'TIMS Card'],
    teaHouses: 'Available throughout',
    reviews: [
      { name: 'Priya T.', rating: 5, comment: 'Absolutely breathtaking! The views from base camp are incredible.', date: 'Nov 2025' },
      { name: 'Suman KC', rating: 5, comment: 'Well-marked trails, great tea houses. Highly recommend!', date: 'Oct 2025' },
    ],
  },
  '5': {
    name: 'Everest Base Camp', duration: '14 days', difficulty: 'Hard',
    elevation: '5,364m', distance: '130km', rating: 4.9, reviewCount: 580,
    description: 'The ultimate trekking destination. Trek through the Khumbu region to the base of the world\'s highest mountain.',
    bestSeason: 'March–May, Oct–Nov',
    permits: ['Sagarmatha NP Permit', 'TIMS Card'],
    teaHouses: 'Available throughout',
    reviews: [
      { name: 'Anita R.', rating: 5, comment: 'Life-changing experience. Challenging but worth every step.', date: 'Oct 2025' },
    ],
  },
};

const difficultyColor = { Easy: colors.tagEasy, Moderate: colors.tagModerate, Hard: colors.tagHard };

const TrailDetailScreen = ({ route, navigation }) => {
  const { trailId, trailName } = route.params;
  const trail = trailData[trailId] || {
    name: trailName, duration: 'N/A', difficulty: 'Moderate',
    elevation: 'N/A', distance: 'N/A', rating: 4.5, reviewCount: 0,
    description: 'A beautiful trail in Nepal.', bestSeason: 'March-May', permits: [], teaHouses: 'Available', reviews: [],
  };

  const dColor = difficultyColor[trail.difficulty] || colors.textSecondary;

  return (
    <SafeAreaView style={styles.safe}>
      <StatusBar barStyle="light-content" backgroundColor={colors.primary} />
      <ScrollView showsVerticalScrollIndicator={false}>
        {/* Banner */}
        <View style={styles.banner}>
          <TouchableOpacity style={styles.backBtn} onPress={() => navigation.goBack()}>
            <Text style={styles.backText}>← Back</Text>
          </TouchableOpacity>
          <Text style={styles.bannerTitle}>{trail.name}</Text>
          <View style={styles.bannerMeta}>
            <Text style={styles.bannerMetaText}>{trail.duration}</Text>
            <View style={[styles.diffTag, { backgroundColor: dColor }]}>
              <Text style={styles.diffTagText}>{trail.difficulty}</Text>
            </View>
            <Text style={styles.bannerMetaText}>⭐ {trail.rating}</Text>
          </View>
        </View>

        <View style={styles.body}>
          {/* Stats row */}
          <View style={styles.statsRow}>
            <StatBox label="Elevation" value={trail.elevation} />
            <StatBox label="Distance" value={trail.distance} />
            <StatBox label="Rating" value={`${trail.rating}★`} />
          </View>

          {/* Description */}
          <Text style={styles.sectionTitle}>About</Text>
          <Text style={styles.description}>{trail.description}</Text>

          {/* Info */}
          <Text style={styles.sectionTitle}>Trail Info</Text>
          <InfoRow label="Best Season" value={trail.bestSeason} />
          <InfoRow label="Tea Houses" value={trail.teaHouses} />
          <InfoRow label="Permits" value={trail.permits.join(', ') || 'None required'} />

          {/* Map placeholder */}
          <Text style={styles.sectionTitle}>Map</Text>
          <TouchableOpacity
            style={styles.mapPlaceholder}
            onPress={() => navigation.navigate('MapView', { trailName: trail.name })}
          >
            <Text style={styles.mapIcon}>🗺️</Text>
            <Text style={styles.mapText}>View Trail Map</Text>
          </TouchableOpacity>

          {/* Reviews */}
          <Text style={styles.sectionTitle}>Reviews ({trail.reviewCount})</Text>
          {trail.reviews.map((r, i) => (
            <View key={i} style={styles.reviewCard}>
              <View style={styles.reviewHeader}>
                <Text style={styles.reviewName}>{r.name}</Text>
                <Text style={styles.reviewDate}>{r.date}</Text>
              </View>
              <Text style={styles.reviewStars}>{'⭐'.repeat(r.rating)}</Text>
              <Text style={styles.reviewComment}>{r.comment}</Text>
            </View>
          ))}

          {/* Action buttons */}
          <View style={styles.actions}>
            <TouchableOpacity
              style={styles.findGroupBtn}
              onPress={() => navigation.navigate('Groups')}
            >
              <Text style={styles.findGroupText}>Find Group</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={styles.viewMapBtn}
              onPress={() => navigation.navigate('MapView', { trailName: trail.name })}
            >
              <Text style={styles.viewMapText}>View Map</Text>
            </TouchableOpacity>
          </View>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};

const StatBox = ({ label, value }) => (
  <View style={styles.statBox}>
    <Text style={styles.statValue}>{value}</Text>
    <Text style={styles.statLabel}>{label}</Text>
  </View>
);

const InfoRow = ({ label, value }) => (
  <View style={styles.infoRow}>
    <Text style={styles.infoLabel}>{label}</Text>
    <Text style={styles.infoValue}>{value}</Text>
  </View>
);

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: colors.background },
  banner: {
    backgroundColor: colors.primary,
    padding: 20,
    paddingTop: 16,
    paddingBottom: 32,
  },
  backBtn: { marginBottom: 16 },
  backText: { color: 'rgba(255,255,255,0.8)', fontSize: 15 },
  bannerTitle: { fontSize: 24, fontWeight: '700', color: colors.white, marginBottom: 12 },
  bannerMeta: { flexDirection: 'row', alignItems: 'center', gap: 12 },
  bannerMetaText: { color: 'rgba(255,255,255,0.85)', fontSize: 13 },
  diffTag: { paddingHorizontal: 10, paddingVertical: 4, borderRadius: 20 },
  diffTagText: { color: colors.white, fontSize: 12, fontWeight: '600' },
  body: { padding: 16 },
  statsRow: {
    flexDirection: 'row',
    backgroundColor: colors.white,
    borderRadius: 16,
    padding: 16,
    marginTop: -20,
    marginBottom: 20,
    elevation: 4,
    shadowColor: '#000',
    shadowOpacity: 0.1,
    shadowRadius: 6,
    shadowOffset: { width: 0, height: 3 },
  },
  statBox: { flex: 1, alignItems: 'center' },
  statValue: { fontSize: 16, fontWeight: '700', color: colors.primary, marginBottom: 4 },
  statLabel: { fontSize: 11, color: colors.textMuted },
  sectionTitle: { fontSize: 17, fontWeight: '700', color: colors.textPrimary, marginBottom: 10, marginTop: 4 },
  description: { fontSize: 14, color: colors.textSecondary, lineHeight: 22, marginBottom: 16 },
  infoRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: 10,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  infoLabel: { fontSize: 14, color: colors.textSecondary },
  infoValue: { fontSize: 14, color: colors.textPrimary, fontWeight: '500', maxWidth: '60%', textAlign: 'right' },
  mapPlaceholder: {
    backgroundColor: colors.accentVeryLight,
    borderRadius: 16,
    height: 120,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 20,
    borderWidth: 1,
    borderColor: colors.accentLight,
    borderStyle: 'dashed',
  },
  mapIcon: { fontSize: 32, marginBottom: 8 },
  mapText: { fontSize: 14, color: colors.primary, fontWeight: '600' },
  reviewCard: {
    backgroundColor: colors.white,
    borderRadius: 12,
    padding: 14,
    marginBottom: 10,
    elevation: 1,
  },
  reviewHeader: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 4 },
  reviewName: { fontSize: 14, fontWeight: '600', color: colors.textPrimary },
  reviewDate: { fontSize: 12, color: colors.textMuted },
  reviewStars: { fontSize: 12, marginBottom: 6 },
  reviewComment: { fontSize: 13, color: colors.textSecondary, lineHeight: 20 },
  actions: { flexDirection: 'row', gap: 12, marginTop: 16, marginBottom: 32 },
  findGroupBtn: {
    flex: 1,
    borderWidth: 1.5,
    borderColor: colors.primary,
    paddingVertical: 14,
    borderRadius: 50,
    alignItems: 'center',
  },
  findGroupText: { color: colors.primary, fontSize: 15, fontWeight: '600' },
  viewMapBtn: {
    flex: 1,
    backgroundColor: colors.primary,
    paddingVertical: 14,
    borderRadius: 50,
    alignItems: 'center',
  },
  viewMapText: { color: colors.white, fontSize: 15, fontWeight: '600' },
});

export default TrailDetailScreen;
