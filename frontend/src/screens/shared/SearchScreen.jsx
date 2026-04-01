import React, { useState } from 'react';
import {
  View, Text, StyleSheet, ScrollView, TouchableOpacity,
  TextInput, StatusBar, SafeAreaView,
} from 'react-native';
import { colors } from '../../constants/colors';

const searchResults = {
  trails: [
    { id: '5', name: 'Everest Base Camp', meta: '14 days • Challenging • 4.9★' },
    { id: '6', name: 'Everest Three Passes', meta: '18 days • Difficult • 4.8★' },
  ],
  groups: [
    { id: '3', name: 'EBC Jan 2026', meta: '4/6 members • Jan 15-28' },
    { id: '7', name: 'Everest View Trek', meta: '2/4 members • Feb 5-12' },
  ],
  users: [
    { id: 'u1', name: 'Suman (EBC Guide)', meta: '12 Everest treks • 4.9★' },
    { id: 'u2', name: 'Anita (Everest Enthusiast)', meta: '5 treks • 4.7★' },
  ],
};

const tabs = ['All', 'Trails', 'Groups', 'Users'];

const SearchScreen = ({ navigation }) => {
  const [query, setQuery] = useState('');
  const [activeTab, setActiveTab] = useState('All');
  const hasResults = query.length > 0;

  const showTrails = activeTab === 'All' || activeTab === 'Trails';
  const showGroups = activeTab === 'All' || activeTab === 'Groups';
  const showUsers = activeTab === 'All' || activeTab === 'Users';

  return (
    <SafeAreaView style={styles.safe}>
      <StatusBar barStyle="dark-content" backgroundColor={colors.white} />
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <Text style={styles.back}>←</Text>
        </TouchableOpacity>
        <TextInput
          style={styles.searchInput}
          placeholder="Search trails, groups, users..."
          placeholderTextColor={colors.textMuted}
          value={query}
          onChangeText={setQuery}
          autoFocus
        />
        {query.length > 0 && (
          <TouchableOpacity onPress={() => setQuery('')}>
            <Text style={styles.clearBtn}>✕</Text>
          </TouchableOpacity>
        )}
      </View>

      {/* Tabs */}
      <View style={styles.tabs}>
        {tabs.map((t) => (
          <TouchableOpacity
            key={t}
            style={[styles.tab, activeTab === t && styles.tabActive]}
            onPress={() => setActiveTab(t)}
          >
            <Text style={[styles.tabText, activeTab === t && styles.tabTextActive]}>{t}</Text>
          </TouchableOpacity>
        ))}
      </View>

      <ScrollView showsVerticalScrollIndicator={false} style={styles.results}>
        {hasResults ? (
          <>
            {showTrails && (
              <>
                <Text style={styles.sectionTitle}>Trails</Text>
                {searchResults.trails.map((t) => (
                  <TouchableOpacity
                    key={t.id}
                    style={styles.resultRow}
                    onPress={() => navigation.navigate('TrailDetail', { trailId: t.id, trailName: t.name })}
                  >
                    <View style={styles.resultIcon}>
                      <Text style={styles.resultIconText}>🏔️</Text>
                    </View>
                    <View>
                      <Text style={styles.resultName}>{t.name}</Text>
                      <Text style={styles.resultMeta}>{t.meta}</Text>
                    </View>
                  </TouchableOpacity>
                ))}
              </>
            )}
            {showGroups && (
              <>
                <Text style={styles.sectionTitle}>Groups</Text>
                {searchResults.groups.map((g) => (
                  <TouchableOpacity
                    key={g.id}
                    style={styles.resultRow}
                    onPress={() => navigation.navigate('GroupDetail', { groupId: g.id })}
                  >
                    <View style={[styles.resultIcon, { backgroundColor: colors.primary }]}>
                      <Text style={styles.resultIconTextWhite}>{g.name.slice(0, 2)}</Text>
                    </View>
                    <View>
                      <Text style={styles.resultName}>{g.name}</Text>
                      <Text style={styles.resultMeta}>{g.meta}</Text>
                    </View>
                  </TouchableOpacity>
                ))}
              </>
            )}
            {showUsers && (
              <>
                <Text style={styles.sectionTitle}>Trekkers</Text>
                {searchResults.users.map((u) => (
                  <TouchableOpacity key={u.id} style={styles.resultRow}>
                    <View style={[styles.resultIcon, { backgroundColor: colors.accent }]}>
                      <Text style={styles.resultIconTextWhite}>{u.name[0]}</Text>
                    </View>
                    <View>
                      <Text style={styles.resultName}>{u.name}</Text>
                      <Text style={styles.resultMeta}>{u.meta}</Text>
                    </View>
                  </TouchableOpacity>
                ))}
              </>
            )}
          </>
        ) : (
          <View style={styles.placeholder}>
            <Text style={styles.placeholderIcon}>🔍</Text>
            <Text style={styles.placeholderText}>Search for trails, groups, or trekkers</Text>
          </View>
        )}
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
    padding: 12,
    gap: 10,
    backgroundColor: colors.white,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  back: { fontSize: 22, color: colors.textPrimary, padding: 4 },
  searchInput: {
    flex: 1,
    backgroundColor: colors.inputBg,
    borderRadius: 12,
    paddingHorizontal: 14,
    paddingVertical: 10,
    fontSize: 15,
    color: colors.textPrimary,
  },
  clearBtn: { fontSize: 16, color: colors.textMuted, padding: 4 },
  tabs: {
    flexDirection: 'row',
    backgroundColor: colors.white,
    paddingHorizontal: 12,
    paddingBottom: 8,
    gap: 8,
  },
  tab: {
    paddingHorizontal: 16,
    paddingVertical: 6,
    borderRadius: 20,
    backgroundColor: colors.inputBg,
  },
  tabActive: { backgroundColor: colors.primary },
  tabText: { fontSize: 13, color: colors.textSecondary, fontWeight: '500' },
  tabTextActive: { color: colors.white, fontWeight: '600' },
  results: { flex: 1, padding: 16 },
  sectionTitle: { fontSize: 14, fontWeight: '700', color: colors.textMuted, marginBottom: 8, marginTop: 8, textTransform: 'uppercase' },
  resultRow: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.white,
    borderRadius: 12,
    padding: 12,
    marginBottom: 8,
    gap: 12,
    elevation: 1,
  },
  resultIcon: {
    width: 44, height: 44, borderRadius: 12,
    backgroundColor: colors.accentVeryLight,
    alignItems: 'center', justifyContent: 'center',
  },
  resultIconText: { fontSize: 22 },
  resultIconTextWhite: { color: colors.white, fontSize: 14, fontWeight: '700' },
  resultName: { fontSize: 14, fontWeight: '600', color: colors.textPrimary },
  resultMeta: { fontSize: 12, color: colors.textMuted, marginTop: 2 },
  placeholder: { flex: 1, alignItems: 'center', paddingTop: 80 },
  placeholderIcon: { fontSize: 48, marginBottom: 16 },
  placeholderText: { fontSize: 14, color: colors.textMuted, textAlign: 'center' },
});

export default SearchScreen;
