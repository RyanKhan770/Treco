import React, { useState } from 'react';
import {
  View, Text, StyleSheet, ScrollView, TouchableOpacity,
  TextInput, StatusBar, SafeAreaView,
} from 'react-native';
import { colors } from '../../constants/colors';

const trails = [
  { id: '1', name: 'Annapurna Base Camp', duration: '10-12 days', difficulty: 'Moderate', rating: 4.9, elevation: '4,130m' },
  { id: '2', name: 'Poon Hill Trek', duration: '4-5 days', difficulty: 'Easy', rating: 4.7, elevation: '3,210m' },
  { id: '3', name: 'Nagarkot Sunrise Hike', duration: '1 day', difficulty: 'Easy', rating: 4.5, elevation: '2,175m' },
  { id: '4', name: 'Langtang Valley Trek', duration: '7 days', difficulty: 'Moderate', rating: 4.8, elevation: '3,870m' },
  { id: '5', name: 'Everest Base Camp', duration: '14 days', difficulty: 'Hard', rating: 4.9, elevation: '5,364m' },
  { id: '6', name: 'Shivapuri Day Hike', duration: '1 day', difficulty: 'Easy', rating: 4.6, elevation: '2,732m' },
  { id: '7', name: 'Mardi Himal Trek', duration: '5-7 days', difficulty: 'Moderate', rating: 4.7, elevation: '4,500m' },
];

const filters = ['All', 'Easy', 'Moderate', 'Hard'];
const difficultyColor = { Easy: colors.tagEasy, Moderate: colors.tagModerate, Hard: colors.tagHard };

const ExploreScreen = ({ navigation }) => {
  const [activeFilter, setActiveFilter] = useState('All');
  const [search, setSearch] = useState('');

  const filtered = trails.filter((t) => {
    const matchDiff = activeFilter === 'All' || t.difficulty === activeFilter;
    const matchSearch = t.name.toLowerCase().includes(search.toLowerCase());
    return matchDiff && matchSearch;
  });

  return (
    <SafeAreaView style={styles.safe}>
      <StatusBar barStyle="dark-content" backgroundColor={colors.background} />
      <View style={styles.container}>
        <View style={styles.header}>
          <Text style={styles.title}>Explore Trails</Text>
          <TouchableOpacity>
            <Text style={styles.filterIcon}>⚙️</Text>
          </TouchableOpacity>
        </View>

        <TextInput
          style={styles.search}
          placeholder="Search trails in Nepal..."
          placeholderTextColor={colors.textMuted}
          value={search}
          onChangeText={setSearch}
        />

        {/* Difficulty filters */}
        <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.filters}>
          {filters.map((f) => (
            <TouchableOpacity
              key={f}
              style={[styles.filterBtn, activeFilter === f && styles.filterBtnActive]}
              onPress={() => setActiveFilter(f)}
            >
              <Text style={[styles.filterText, activeFilter === f && styles.filterTextActive]}>{f}</Text>
            </TouchableOpacity>
          ))}
        </ScrollView>

        <ScrollView showsVerticalScrollIndicator={false}>
          {filtered.map((trail) => (
            <TouchableOpacity
              key={trail.id}
              style={styles.trailCard}
              onPress={() => navigation.navigate('TrailDetail', { trailId: trail.id, trailName: trail.name })}
            >
              <View style={[styles.trailBanner, { backgroundColor: trail.difficulty === 'Hard' ? colors.primary : trail.difficulty === 'Moderate' ? colors.primaryLight : colors.accent }]}>
                <Text style={styles.trailBannerText}>{trail.name}</Text>
              </View>
              <View style={styles.trailMeta}>
                <View style={styles.metaTag}>
                  <Text style={styles.metaTagText}>{trail.duration}</Text>
                </View>
                <View style={[styles.metaTag, { backgroundColor: difficultyColor[trail.difficulty] + '20' }]}>
                  <Text style={[styles.metaTagText, { color: difficultyColor[trail.difficulty] }]}>{trail.difficulty}</Text>
                </View>
                <View style={styles.metaTag}>
                  <Text style={styles.metaTagText}>⭐ {trail.rating}</Text>
                </View>
              </View>
            </TouchableOpacity>
          ))}
          <View style={{ height: 100 }} />
        </ScrollView>
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: colors.background },
  container: { flex: 1, paddingHorizontal: 16, paddingTop: 16 },
  header: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 },
  title: { fontSize: 24, fontWeight: '700', color: colors.textPrimary },
  filterIcon: { fontSize: 20 },
  search: {
    backgroundColor: colors.white,
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 12,
    fontSize: 15,
    color: colors.textPrimary,
    marginBottom: 12,
    elevation: 1,
  },
  filters: { flexDirection: 'row', marginBottom: 16, flexGrow: 0 },
  filterBtn: {
    paddingHorizontal: 18,
    paddingVertical: 8,
    borderRadius: 20,
    backgroundColor: colors.white,
    marginRight: 8,
    borderWidth: 1,
    borderColor: colors.border,
  },
  filterBtnActive: { backgroundColor: colors.primary, borderColor: colors.primary },
  filterText: { fontSize: 13, color: colors.textSecondary, fontWeight: '500' },
  filterTextActive: { color: colors.white, fontWeight: '600' },
  trailCard: {
    backgroundColor: colors.white,
    borderRadius: 16,
    marginBottom: 16,
    overflow: 'hidden',
    elevation: 2,
    shadowColor: '#000',
    shadowOpacity: 0.06,
    shadowRadius: 4,
    shadowOffset: { width: 0, height: 2 },
  },
  trailBanner: {
    height: 80,
    justifyContent: 'center',
    paddingHorizontal: 16,
  },
  trailBannerText: { color: colors.white, fontSize: 17, fontWeight: '700' },
  trailMeta: { flexDirection: 'row', padding: 12, gap: 8, flexWrap: 'wrap' },
  metaTag: {
    backgroundColor: colors.inputBg,
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 20,
  },
  metaTagText: { fontSize: 12, color: colors.textSecondary, fontWeight: '500' },
});

export default ExploreScreen;
