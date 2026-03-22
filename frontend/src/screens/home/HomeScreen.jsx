import React from 'react';
import {
  View, Text, StyleSheet, ScrollView, TouchableOpacity,
  TextInput, StatusBar, SafeAreaView,
} from 'react-native';
import { colors } from '../../constants/colors';
import { useAuth } from '../../context/AuthContext';

const popularTrails = [
  { id: '1', name: 'Langtang Valley Trek', duration: '7 days', difficulty: 'Moderate', rating: '4.8' },
  { id: '2', name: 'Shivapuri Day Hike', duration: '1 day', difficulty: 'Easy', rating: '4.6' },
  { id: '3', name: 'Annapurna Base Camp', duration: '10-12 days', difficulty: 'Moderate', rating: '4.9' },
];

const quickActions = [
  { label: 'Explore', icon: '🗺️', screen: 'Explore' },
  { label: 'Find Group', icon: '👥', screen: 'Groups' },
  { label: 'Create Trip', icon: '➕', screen: 'CreateTrip' },
];

const difficultyColor = { Easy: colors.tagEasy, Moderate: colors.tagModerate, Hard: colors.tagHard };

const HomeScreen = ({ navigation }) => {
  const { user } = useAuth();
  const firstName = user?.fullName?.split(' ')[0] || 'Trekker';

  return (
    <SafeAreaView style={styles.safe}>
      <StatusBar barStyle="dark-content" backgroundColor={colors.background} />
      <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>

        {/* Top bar */}
        <View style={styles.topBar}>
          <View>
            <Text style={styles.greeting}>Hello, {firstName}</Text>
            <Text style={styles.headline}>Where to next?</Text>
          </View>
          <TouchableOpacity
            style={styles.avatar}
            onPress={() => navigation.navigate('Profile')}
          >
            <Text style={styles.avatarText}>{firstName[0]?.toUpperCase()}</Text>
          </TouchableOpacity>
        </View>

        {/* Search bar */}
        <TouchableOpacity
          style={styles.searchBar}
          onPress={() => navigation.navigate('Search')}
          activeOpacity={0.8}
        >
          <Text style={styles.searchIcon}>🔍</Text>
          <Text style={styles.searchPlaceholder}>Search trails, groups...</Text>
        </TouchableOpacity>

        {/* Quick Actions */}
        <Text style={styles.sectionTitle}>Quick Actions</Text>
        <View style={styles.quickActions}>
          {quickActions.map((a) => (
            <TouchableOpacity
              key={a.label}
              style={styles.actionCard}
              onPress={() => navigation.navigate(a.screen)}
            >
              <Text style={styles.actionIcon}>{a.icon}</Text>
              <Text style={styles.actionLabel}>{a.label}</Text>
            </TouchableOpacity>
          ))}
        </View>

        {/* Popular Trails */}
        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>Popular Trails</Text>
          <TouchableOpacity onPress={() => navigation.navigate('Explore')}>
            <Text style={styles.seeAll}>See all</Text>
          </TouchableOpacity>
        </View>

        {popularTrails.map((trail) => (
          <TouchableOpacity
            key={trail.id}
            style={styles.trailCard}
            onPress={() => navigation.navigate('TrailDetail', { trailId: trail.id, trailName: trail.name })}
          >
            <View style={styles.trailImgPlaceholder} />
            <View style={styles.trailInfo}>
              <Text style={styles.trailName}>{trail.name}</Text>
              <Text style={styles.trailMeta}>{trail.duration} • {trail.difficulty}</Text>
              <View style={[styles.difficultyTag, { backgroundColor: difficultyColor[trail.difficulty] + '20' }]}>
                <Text style={[styles.difficultyText, { color: difficultyColor[trail.difficulty] }]}>
                  {trail.rating} Rating
                </Text>
              </View>
            </View>
          </TouchableOpacity>
        ))}

        <View style={{ height: 24 }} />
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: colors.background },
  container: { flex: 1, paddingHorizontal: 16 },
  topBar: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 16,
    marginBottom: 16,
  },
  greeting: { fontSize: 14, color: colors.textSecondary },
  headline: { fontSize: 24, fontWeight: '700', color: colors.textPrimary },
  avatar: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
  },
  avatarText: { color: colors.white, fontSize: 18, fontWeight: '700' },
  searchBar: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.white,
    borderRadius: 12,
    padding: 14,
    marginBottom: 20,
    gap: 10,
    elevation: 2,
    shadowColor: '#000',
    shadowOpacity: 0.05,
    shadowRadius: 4,
    shadowOffset: { width: 0, height: 2 },
  },
  searchIcon: { fontSize: 16 },
  searchPlaceholder: { color: colors.textMuted, fontSize: 15 },
  sectionHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 },
  sectionTitle: { fontSize: 18, fontWeight: '700', color: colors.textPrimary, marginBottom: 12 },
  seeAll: { color: colors.primary, fontSize: 14 },
  quickActions: { flexDirection: 'row', gap: 12, marginBottom: 24 },
  actionCard: {
    flex: 1,
    backgroundColor: colors.white,
    borderRadius: 12,
    padding: 16,
    alignItems: 'center',
    elevation: 2,
    shadowColor: '#000',
    shadowOpacity: 0.05,
    shadowRadius: 4,
    shadowOffset: { width: 0, height: 2 },
  },
  actionIcon: { fontSize: 24, marginBottom: 8 },
  actionLabel: { fontSize: 12, fontWeight: '600', color: colors.textPrimary },
  trailCard: {
    flexDirection: 'row',
    backgroundColor: colors.white,
    borderRadius: 16,
    marginBottom: 12,
    overflow: 'hidden',
    elevation: 2,
    shadowColor: '#000',
    shadowOpacity: 0.05,
    shadowRadius: 4,
    shadowOffset: { width: 0, height: 2 },
  },
  trailImgPlaceholder: {
    width: 100,
    height: 90,
    backgroundColor: colors.primary,
  },
  trailInfo: { flex: 1, padding: 12, justifyContent: 'center' },
  trailName: { fontSize: 15, fontWeight: '700', color: colors.textPrimary, marginBottom: 4 },
  trailMeta: { fontSize: 12, color: colors.textSecondary, marginBottom: 8 },
  difficultyTag: { alignSelf: 'flex-start', paddingHorizontal: 10, paddingVertical: 4, borderRadius: 20 },
  difficultyText: { fontSize: 11, fontWeight: '600' },
});

export default HomeScreen;
