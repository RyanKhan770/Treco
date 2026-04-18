import React, { useState, useEffect, useCallback } from 'react';
import {
  View, Text, StyleSheet, ScrollView, TextInput, StatusBar,
  ActivityIndicator, TouchableOpacity, RefreshControl,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import {
  Search, Plus, Calendar, Users, Star, MessageCircle,
  UserCheck, MapPin, Compass,
} from 'lucide-react-native';
import { colors } from '../../constants/colors';
import { fontSize, fontWeight, radius, shadows, spacing } from '../../constants/theme';
import {
  Badge, Card, Chip, PressableScale, Stagger, FadeIn, SlideUp, EmptyState,
} from '../../components/ui';
import { EmptyMessagesIllustration } from '../../assets/svg/Illustrations';
import { groupsAPI, userAPI } from '../../services/api';

const TABS = ['All groups', 'My groups', 'Connect'];
const DIFF_TONE = { Easy: 'success', Moderate: 'warning', Hard: 'danger' };
const AVATAR_COLORS = ['#40916C', '#457B9D', '#E76F51', '#6B4423', '#52B788', '#8B5CF6'];

function avatarColor(str = '') {
  let h = 0;
  for (let i = 0; i < str.length; i++) h = (h * 31 + str.charCodeAt(i)) >>> 0;
  return AVATAR_COLORS[h % AVATAR_COLORS.length];
}

function initials(name = '') {
  return name.split(' ').map((w) => w[0]).join('').slice(0, 2).toUpperCase();
}

function formatDate(start, end) {
  if (!start) return 'TBD';
  const s = new Date(start).toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
  if (!end) return s;
  const e = new Date(end).toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
  return `${s} – ${e}`;
}

function GroupCard({ group, onPress }) {
  const memberCount = group.current_members ?? group.members?.length ?? 0;
  const maxMembers  = group.max_members ?? 10;
  const diff        = group.difficulty ?? group.trail_difficulty ?? 'Moderate';
  const spotsLeft   = maxMembers - memberCount;

  return (
    <Card style={styles.groupCard} onPress={onPress}>
      <View style={styles.cardTop}>
        <View style={{ flex: 1 }}>
          <Text style={styles.groupName} numberOfLines={1}>{group.name}</Text>
          <View style={styles.dateRow}>
            <Calendar size={12} color={colors.primary} strokeWidth={2.25} />
            <Text style={styles.dateText}>{formatDate(group.start_date, group.end_date)}</Text>
          </View>
        </View>
        <Badge label={diff} tone={DIFF_TONE[diff] ?? 'warning'} />
      </View>
      {!!group.description && (
        <Text style={styles.groupDesc} numberOfLines={2}>{group.description}</Text>
      )}
      {!!group.trail_name && (
        <View style={styles.trailRow}>
          <MapPin size={11} color={colors.primaryLight} strokeWidth={2} />
          <Text style={styles.trailText} numberOfLines={1}>{group.trail_name}</Text>
        </View>
      )}
      <View style={styles.cardBottom}>
        <View style={styles.avatarRow}>
          {Array.from({ length: Math.min(memberCount, 4) }).map((_, i) => (
            <View key={i} style={[styles.memberDot, { backgroundColor: AVATAR_COLORS[i % AVATAR_COLORS.length], marginLeft: i > 0 ? -8 : 0 }]} />
          ))}
          {memberCount > 4 && (
            <View style={[styles.memberDot, styles.memberDotMore, { marginLeft: -8 }]}>
              <Text style={styles.memberDotMoreText}>+{memberCount - 4}</Text>
            </View>
          )}
        </View>
        <Text style={styles.spotsText}>
          {spotsLeft > 0 ? `${spotsLeft} spot${spotsLeft !== 1 ? 's' : ''} left` : 'Full'}
        </Text>
      </View>
    </Card>
  );
}

function ConnectCard({ person, onMessage, onPress }) {
  const color = avatarColor(person.name);
  const isOrg = person.role === 'organizer' || person.role === 'admin';

  return (
    <PressableScale style={styles.connectCard} onPress={onPress} scaleTo={0.98}>
      <View style={[styles.connectAvatar, { backgroundColor: color }]}>
        <Text style={styles.connectAvatarText}>{initials(person.name)}</Text>
      </View>
      <View style={{ flex: 1 }}>
        <View style={styles.connectNameRow}>
          <Text style={styles.connectName} numberOfLines={1}>{person.name}</Text>
          {!!person.is_verified && <UserCheck size={13} color={colors.info} strokeWidth={2.5} />}
          {isOrg && (
            <View style={styles.orgBadge}>
              <Text style={styles.orgBadgeText}>Organizer</Text>
            </View>
          )}
        </View>
        <View style={styles.connectMeta}>
          {!!person.overall_rating && (
            <View style={styles.metaChip}>
              <Star size={10} color={colors.warning} fill={colors.warning} strokeWidth={0} />
              <Text style={styles.metaChipText}>{Number(person.overall_rating).toFixed(1)}</Text>
            </View>
          )}
          {!!person.total_treks && (
            <View style={styles.metaChip}>
              <Compass size={10} color={colors.primaryLight} strokeWidth={2} />
              <Text style={styles.metaChipText}>{person.total_treks} treks</Text>
            </View>
          )}
          {!!person.location && (
            <View style={styles.metaChip}>
              <MapPin size={10} color={colors.textLight} strokeWidth={2} />
              <Text style={styles.metaChipText} numberOfLines={1}>{person.location}</Text>
            </View>
          )}
        </View>
        {!!person.bio && <Text style={styles.connectBio} numberOfLines={1}>{person.bio}</Text>}
      </View>
      <TouchableOpacity style={styles.msgBtn} onPress={onMessage} hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}>
        <MessageCircle size={18} color={colors.primary} strokeWidth={2.25} />
      </TouchableOpacity>
    </PressableScale>
  );
}

export default function GroupsScreen({ navigation }) {
  const [activeTab,  setActiveTab]  = useState('All groups');
  const [search,     setSearch]     = useState('');
  const [allGroups,  setAllGroups]  = useState([]);
  const [myGroups,   setMyGroups]   = useState([]);
  const [people,     setPeople]     = useState([]);
  const [loading,    setLoading]    = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error,      setError]      = useState(null);

  const fetchData = useCallback(async (silent = false) => {
    if (!silent) setLoading(true);
    setError(null);
    try {
      if (activeTab === 'All groups') {
        const res = await groupsAPI.getAll();
        setAllGroups(res.data);
      } else if (activeTab === 'My groups') {
        const res = await groupsAPI.getMyGroups();
        setMyGroups(res.data);
      } else {
        const res = await userAPI.getOrganizers();
        setPeople(res.data);
      }
    } catch {
      setError('Could not load data. Check your connection.');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, [activeTab]);

  useEffect(() => { fetchData(); }, [fetchData]);

  const onRefresh = () => { setRefreshing(true); fetchData(true); };

  const baseList = activeTab === 'My groups' ? myGroups : allGroups;
  const filtered = baseList.filter((g) => g.name.toLowerCase().includes(search.toLowerCase()));
  const filteredPeople = people.filter((p) => p.name.toLowerCase().includes(search.toLowerCase()));

  const renderContent = () => {
    if (loading) return (
      <View style={styles.centered}>
        <ActivityIndicator color={colors.primary} size="large" />
        <Text style={styles.loadingText}>Loading…</Text>
      </View>
    );

    if (error) return (
      <View style={styles.centered}>
        <Text style={styles.errorText}>{error}</Text>
        <PressableScale style={styles.retryBtn} onPress={() => fetchData()} scaleTo={0.96}>
          <Text style={styles.retryBtnText}>Try again</Text>
        </PressableScale>
      </View>
    );

    if (activeTab === 'Connect') {
      if (filteredPeople.length === 0) return (
        <EmptyState
          illustration={<EmptyMessagesIllustration size={160} />}
          title="No organizers found"
          subtitle="Check back soon — organizers are joining Treco every day."
        />
      );
      return (
        <Stagger initialDelay={100} step={35} distance={14}>
          {filteredPeople.map((p) => (
            <ConnectCard
              key={p.id}
              person={p}
              onMessage={() => navigation.navigate('Chat', {
                isDM: true,
                receiverId: p.id,
                receiverName: p.name,
                groupName: p.name,
              })}
              onPress={() => {}}
            />
          ))}
        </Stagger>
      );
    }

    if (filtered.length === 0) return (
      <EmptyState
        illustration={<EmptyMessagesIllustration size={160} />}
        title={activeTab === 'My groups' ? "You haven't joined any groups" : 'No groups found'}
        subtitle={activeTab === 'My groups' ? 'Browse "All groups" and request to join a trek.' : 'Be the first to plan a trip in this area.'}
      />
    );

    return (
      <Stagger initialDelay={100} step={40} distance={16}>
        {filtered.map((g) => (
          <GroupCard key={g.id} group={g} onPress={() => navigation.navigate('GroupDetail', { groupId: g.id })} />
        ))}
      </Stagger>
    );
  };

  return (
    <SafeAreaView style={styles.safe}>
      <StatusBar barStyle="dark-content" backgroundColor={colors.background} />
      <View style={styles.header}>
        <FadeIn>
          <Text style={styles.overline}>Community</Text>
          <Text style={styles.title}>Groups</Text>
        </FadeIn>
        <PressableScale style={styles.createBtn} onPress={() => navigation.navigate('CreateTrip')} scaleTo={0.9}>
          <Plus size={22} color="#fff" strokeWidth={2.5} />
        </PressableScale>
      </View>

      <SlideUp delay={100} style={{ paddingHorizontal: spacing.md, marginBottom: spacing.sm }}>
        <View style={styles.search}>
          <Search size={18} color={colors.textLight} strokeWidth={2.25} />
          <TextInput
            style={styles.searchInput}
            placeholder={activeTab === 'Connect' ? 'Search organizers, trekkers…' : 'Search groups, destinations…'}
            placeholderTextColor={colors.textMuted}
            value={search}
            onChangeText={setSearch}
          />
        </View>
      </SlideUp>

      <SlideUp delay={160} style={{ paddingHorizontal: spacing.md, marginBottom: spacing.sm }}>
        <ScrollView horizontal showsHorizontalScrollIndicator={false}>
          {TABS.map((t) => (
            <Chip key={t} label={t} selected={activeTab === t} onPress={() => { setActiveTab(t); setSearch(''); }} />
          ))}
        </ScrollView>
      </SlideUp>

      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.listContent}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={colors.primary} />}
      >
        {renderContent()}
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: colors.background },
  header: {
    flexDirection: 'row', alignItems: 'flex-end', justifyContent: 'space-between',
    paddingHorizontal: spacing.md, paddingTop: spacing.sm, paddingBottom: spacing.sm,
  },
  overline: { fontSize: fontSize.xs, letterSpacing: 2, color: colors.primaryLight, fontWeight: fontWeight.bold, textTransform: 'uppercase' },
  title: { fontSize: fontSize.xxxl, fontWeight: fontWeight.bold, color: colors.text, letterSpacing: -0.5, marginTop: 2 },
  createBtn: { width: 44, height: 44, borderRadius: 22, backgroundColor: colors.primary, alignItems: 'center', justifyContent: 'center', ...shadows.md },
  search: { flexDirection: 'row', alignItems: 'center', gap: spacing.sm, backgroundColor: colors.card, borderRadius: radius.round, paddingVertical: 12, paddingHorizontal: spacing.md, ...shadows.sm },
  searchInput: { flex: 1, fontSize: fontSize.md, color: colors.text, paddingVertical: 0 },
  listContent: { paddingHorizontal: spacing.md, paddingTop: spacing.sm, paddingBottom: 100 },
  centered: { alignItems: 'center', justifyContent: 'center', paddingTop: 60, gap: 12 },
  loadingText: { color: colors.textSecondary, fontSize: fontSize.sm, marginTop: 8 },
  errorText: { color: colors.danger, fontSize: fontSize.sm, textAlign: 'center', paddingHorizontal: 24 },
  retryBtn: { paddingHorizontal: 20, paddingVertical: 10, backgroundColor: colors.primaryPale, borderRadius: radius.round },
  retryBtnText: { color: colors.primary, fontWeight: fontWeight.bold, fontSize: fontSize.sm },
  groupCard: { marginBottom: spacing.sm },
  cardTop: { flexDirection: 'row', alignItems: 'flex-start', marginBottom: 6 },
  groupName: { fontSize: fontSize.md, fontWeight: fontWeight.bold, color: colors.text, flex: 1, marginRight: 8, letterSpacing: -0.2 },
  dateRow: { flexDirection: 'row', alignItems: 'center', gap: 4, marginTop: 3 },
  dateText: { fontSize: fontSize.xs, color: colors.primary, fontWeight: fontWeight.semiBold },
  groupDesc: { fontSize: fontSize.sm, color: colors.textSecondary, lineHeight: 20, marginBottom: 6 },
  trailRow: { flexDirection: 'row', alignItems: 'center', gap: 4, marginBottom: 8 },
  trailText: { fontSize: 11, color: colors.primaryLight, fontWeight: fontWeight.medium, flex: 1 },
  cardBottom: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginTop: 4 },
  avatarRow: { flexDirection: 'row', alignItems: 'center' },
  memberDot: { width: 22, height: 22, borderRadius: 11, borderWidth: 2, borderColor: '#fff' },
  memberDotMore: { backgroundColor: colors.stone, alignItems: 'center', justifyContent: 'center' },
  memberDotMoreText: { color: '#fff', fontSize: 8, fontWeight: fontWeight.bold },
  spotsText: { fontSize: fontSize.xs, color: colors.textLight, fontWeight: fontWeight.medium },
  connectCard: { flexDirection: 'row', alignItems: 'center', gap: spacing.sm, backgroundColor: colors.card, borderRadius: radius.lg, padding: spacing.md, marginBottom: spacing.sm, ...shadows.xs },
  connectAvatar: { width: 48, height: 48, borderRadius: 24, alignItems: 'center', justifyContent: 'center', flexShrink: 0 },
  connectAvatarText: { color: '#fff', fontWeight: fontWeight.bold, fontSize: fontSize.sm, letterSpacing: 0.5 },
  connectNameRow: { flexDirection: 'row', alignItems: 'center', gap: 5, marginBottom: 4 },
  connectName: { fontSize: fontSize.md, fontWeight: fontWeight.bold, color: colors.text, flexShrink: 1 },
  orgBadge: { backgroundColor: colors.primaryPale, borderRadius: 6, paddingHorizontal: 6, paddingVertical: 2 },
  orgBadgeText: { fontSize: 9, color: colors.primary, fontWeight: fontWeight.bold, letterSpacing: 0.5 },
  connectMeta: { flexDirection: 'row', alignItems: 'center', flexWrap: 'wrap', gap: 6, marginBottom: 3 },
  metaChip: { flexDirection: 'row', alignItems: 'center', gap: 3 },
  metaChipText: { fontSize: 11, color: colors.textSecondary, fontWeight: fontWeight.medium },
  connectBio: { fontSize: 11, color: colors.textLight, lineHeight: 16 },
  msgBtn: { width: 36, height: 36, borderRadius: 18, backgroundColor: colors.primaryPale, alignItems: 'center', justifyContent: 'center' },
});
