import { HugeiconsIcon } from '@hugeicons/react-native';
import React, { useState, useEffect, useRef, useCallback } from 'react';
import {
  View, Text, StyleSheet, ScrollView, TextInput, StatusBar,
  ActivityIndicator, Image,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Search01Icon, Cancel01Icon, MountainIcon, UserGroupIcon, UserIcon, ArrowRight01Icon } from '@hugeicons/core-free-icons';
import { colors } from '../../constants/colors';
import { fontSize, fontWeight, radius, shadows, spacing } from '../../constants/theme';
import {
  Chip, PressableScale, Stagger, SlideUp, EmptyState,
} from '../../components/ui';
import ScreenHeader from '../../components/ui/ScreenHeader';
import { EmptyTrailIllustration } from '../../assets/svg/Illustrations';
import { trailsAPI, groupsAPI, userAPI, BASE_URL } from '../../services/api';
import { getTrailImage } from '../../assets/images/trailImages';

const tabs = ['All', 'Trails', 'Groups', 'Trekkers'];

function formatTrailMeta(t) {
  const dur  = t.duration_days ? `${t.duration_days}d` : '—';
  const diff = t.difficulty
    ? t.difficulty.charAt(0).toUpperCase() + t.difficulty.slice(1).toLowerCase()
    : '—';
  return `${dur} · ${diff}`;
}

function formatGroupMeta(g) {
  const members = g.current_members ?? 0;
  const max     = g.max_members ?? '?';
  return `${members}/${max} members${g.trail_name ? ` · ${g.trail_name}` : ''}`;
}

function formatUserMeta(u) {
  const treks  = u.total_treks ? `${u.total_treks} treks` : '';
  const rating = u.overall_rating ? `${parseFloat(u.overall_rating).toFixed(1)}★` : '';
  return [treks, rating].filter(Boolean).join(' · ') || u.role || 'Trekker';
}

const SearchScreen = ({ navigation }) => {
  const [query,      setQuery]      = useState('');
  const [activeTab,  setActiveTab]  = useState('All');
  const [loading,    setLoading]    = useState(false);
  const [results,    setResults]    = useState({ trails: [], groups: [], users: [] });
  const debounceRef = useRef(null);

  const runSearch = useCallback(async (q) => {
    if (!q.trim()) {
      setResults({ trails: [], groups: [], users: [] });
      return;
    }
    setLoading(true);
    try {
      const [trailRes, groupRes, userRes] = await Promise.allSettled([
        trailsAPI.getAll({ search: q }),
        groupsAPI.getAll({ search: q }),
        userAPI.browseUsers(q),
      ]);
      setResults({
        trails: trailRes.status === 'fulfilled' ? (trailRes.value.data || []).slice(0, 5) : [],
        groups: groupRes.status === 'fulfilled' ? (groupRes.value.data || []).slice(0, 4) : [],
        users:  userRes.status  === 'fulfilled' ? (userRes.value.data  || []).slice(0, 4) : [],
      });
    } catch {
      // keep empty
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(() => runSearch(query), 350);
    return () => clearTimeout(debounceRef.current);
  }, [query, runSearch]);

  const hasResults = query.trim().length > 0;
  const showTrails   = activeTab === 'All' || activeTab === 'Trails';
  const showGroups   = activeTab === 'All' || activeTab === 'Groups';
  const showTrekkers = activeTab === 'All' || activeTab === 'Trekkers';

  const anyResults = results.trails.length > 0 || results.groups.length > 0 || results.users.length > 0;

  return (
    <SafeAreaView style={styles.safe}>
      <StatusBar barStyle="dark-content" backgroundColor={colors.background} />
      <ScreenHeader title="Search" onBack={() => navigation.goBack()} />

      {/* ── Search input ───────────────────────────────────────────── */}
      <SlideUp delay={80} style={styles.inputWrap}>
        <View style={styles.searchBox}>
          <HugeiconsIcon icon={Search01Icon} size={17} color={colors.textLight} strokeWidth={2.25} />
          <TextInput
            style={styles.searchInput}
            placeholder="Trails, groups, trekkers…"
            placeholderTextColor={colors.textMuted}
            value={query}
            onChangeText={setQuery}
            autoFocus
            returnKeyType="search"
          />
          {query.length > 0 && (
            <PressableScale onPress={() => setQuery('')} scaleTo={0.85}>
              <HugeiconsIcon icon={Cancel01Icon} size={15} color={colors.textLight} strokeWidth={2.5} />
            </PressableScale>
          )}
        </View>
      </SlideUp>

      {/* ── Filter tabs ────────────────────────────────────────────── */}
      <SlideUp delay={120} style={styles.tabs}>
        <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={{ paddingHorizontal: spacing.md, gap: 8 }}>
          {tabs.map((t) => (
            <Chip key={t} label={t} selected={activeTab === t} onPress={() => setActiveTab(t)} />
          ))}
        </ScrollView>
      </SlideUp>

      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ paddingHorizontal: spacing.md, paddingVertical: spacing.sm, paddingBottom: spacing.xxl }}
        keyboardShouldPersistTaps="handled"
      >
        {!hasResults ? (
          /* ── Empty / prompt state ──────────────────────────────── */
          <View style={{ marginTop: spacing.xl }}>
            <EmptyState
              illustration={<EmptyTrailIllustration size={160} />}
              title="Explore Nepal's trails"
              subtitle="Search destinations, groups, and fellow trekkers."
            />
          </View>
        ) : loading ? (
          <View style={styles.loadingWrap}>
            <ActivityIndicator color={colors.primary} size="small" />
            <Text style={styles.loadingText}>Searching…</Text>
          </View>
        ) : !anyResults ? (
          <View style={styles.loadingWrap}>
            <Text style={styles.noResultsText}>No results for "{query}"</Text>
          </View>
        ) : (
          <Stagger initialDelay={60} step={30} distance={10}>

            {/* ── Trails ──────────────────────────────────────────── */}
            {showTrails && results.trails.length > 0 && (
              <>
                <Text style={styles.sectionTitle}>Trails</Text>
                {results.trails.map((t) => (
                  <PressableScale
                    key={t.id}
                    style={styles.resultRow}
                    onPress={() => navigation.navigate('TrailDetail', { trailId: t.id, trailName: t.name })}
                    scaleTo={0.98}
                  >
                    <View style={styles.resultImageWrap}>
                      {t.cover_image ? (
                        <Image source={{ uri: t.cover_image.startsWith('http') ? t.cover_image : BASE_URL.replace('/api', '') + t.cover_image }} style={styles.resultImage} />
                      ) : (
                        <Image source={getTrailImage(t.id)} style={styles.resultImage} />
                      )}
                    </View>
                    <View style={{ flex: 1 }}>
                      <Text style={styles.resultName}>{t.name}</Text>
                      <Text style={styles.resultMeta}>{formatTrailMeta(t)}</Text>
                    </View>
                  </PressableScale>
                ))}
              </>
            )}

            {/* ── Groups ──────────────────────────────────────────── */}
            {showGroups && results.groups.length > 0 && (
              <>
                <Text style={styles.sectionTitle}>Groups</Text>
                {results.groups.map((g) => (
                  <PressableScale
                    key={g.id}
                    style={styles.resultRow}
                    onPress={() => navigation.navigate('GroupDetail', { groupId: g.id, groupName: g.name })}
                    scaleTo={0.98}
                  >
                    <View style={styles.resultImageWrap}>
                      {g.group_photo ? (
                        <Image source={{ uri: g.group_photo.startsWith('http') ? g.group_photo : BASE_URL.replace('/api', '') + g.group_photo }} style={styles.resultImage} />
                      ) : (
                        <View style={[styles.resultImage, { backgroundColor: '#E76F5122', alignItems: 'center', justifyContent: 'center' }]}>
                          <HugeiconsIcon icon={UserGroupIcon} size={18} color="#E76F51" strokeWidth={2.25} />
                        </View>
                      )}
                    </View>
                    <View style={{ flex: 1 }}>
                      <Text style={styles.resultName}>{g.name}</Text>
                      <Text style={styles.resultMeta}>{formatGroupMeta(g)}</Text>
                    </View>
                  </PressableScale>
                ))}
              </>
            )}

            {/* ── Trekkers ────────────────────────────────────────── */}
            {showTrekkers && results.users.length > 0 && (
              <>
                <Text style={styles.sectionTitle}>Trekkers</Text>
                {results.users.map((u) => (
                  <PressableScale
                    key={u.id}
                    style={styles.resultRow}
                    onPress={() => navigation.navigate('Chat', {
                      isDM: true,
                      receiverId: u.id,
                      receiverName: u.name,
                      groupName: u.name,
                    })}
                    scaleTo={0.98}
                  >
                    <View style={styles.resultImageWrap}>
                      {u.profile_photo ? (
                        <Image source={{ uri: u.profile_photo.startsWith('http') ? u.profile_photo : BASE_URL.replace('/api', '') + u.profile_photo }} style={[styles.resultImage, { borderRadius: 18 }]} />
                      ) : (
                        <View style={[styles.resultImage, { backgroundColor: '#457B9D22', alignItems: 'center', justifyContent: 'center', borderRadius: 18 }]}>
                          <HugeiconsIcon icon={UserIcon} size={18} color="#457B9D" strokeWidth={2.25} />
                        </View>
                      )}
                    </View>
                    <View style={{ flex: 1 }}>
                      <Text style={styles.resultName}>{u.name}</Text>
                      <Text style={styles.resultMeta}>{formatUserMeta(u)}</Text>
                    </View>
                  </PressableScale>
                ))}
              </>
            )}

          </Stagger>
        )}
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: colors.background },

  inputWrap: { paddingHorizontal: spacing.md, paddingTop: spacing.xs, paddingBottom: 2 },
  searchBox: {
    flexDirection: 'row', alignItems: 'center', gap: spacing.sm,
    backgroundColor: colors.card, borderRadius: radius.round,
    paddingVertical: 12, paddingHorizontal: spacing.md,
    ...shadows.sm,
  },
  searchInput: { flex: 1, fontSize: fontSize.md, color: colors.text, paddingVertical: 0 },

  tabs: { marginTop: spacing.sm, marginBottom: spacing.xs },

  loadingWrap:    { paddingTop: spacing.xxl, alignItems: 'center', gap: spacing.sm },
  loadingText:    { fontSize: fontSize.sm, color: colors.textSecondary },
  noResultsText:  { fontSize: fontSize.sm, color: colors.textMuted, fontStyle: 'italic' },

  sectionTitle: {
    fontSize: fontSize.xs, fontWeight: fontWeight.bold,
    color: colors.primaryLight, letterSpacing: 2,
    textTransform: 'uppercase',
    marginTop: spacing.md, marginBottom: spacing.sm,
  },
  resultRow: {
    flexDirection: 'row', alignItems: 'center', gap: spacing.sm,
    paddingVertical: spacing.sm, paddingHorizontal: spacing.sm,
    backgroundColor: colors.card, borderRadius: radius.lg,
    marginBottom: 8, ...shadows.sm,
  },
  resultImageWrap: { width: 36, height: 36, borderRadius: radius.md, overflow: 'hidden' },
  resultImage: { width: '100%', height: '100%', resizeMode: 'cover' },
  resultName: { fontSize: fontSize.md, fontWeight: fontWeight.bold, color: colors.text },
  resultMeta: { fontSize: fontSize.xs, color: colors.textSecondary, marginTop: 2 },
});

export default SearchScreen;
