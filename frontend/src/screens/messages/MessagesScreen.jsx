import { HugeiconsIcon } from '@hugeicons/react-native';
import React, { useState, useEffect, useCallback } from 'react';
import {
  View, Text, StyleSheet, ScrollView, StatusBar, TextInput,
  ActivityIndicator, TouchableOpacity, RefreshControl,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Search01Icon, Edit02Icon, UserGroupIcon, BubbleChatIcon } from '@hugeicons/core-free-icons';
import { colors } from '../../constants/colors';
import { fontSize, fontWeight, radius, shadows, spacing } from '../../constants/theme';
import {
  Badge, PressableScale, Stagger, FadeIn, SlideUp, EmptyState,
} from '../../components/ui';
import { EmptyMessagesIllustration } from '../../assets/svg/Illustrations';
import { groupsAPI, dmAPI } from '../../services/api';

const AVATAR_COLORS = ['#40916C', '#457B9D', '#E76F51', '#6B4423', '#52B788', '#8B5CF6'];

function avatarColor(str = '') {
  let h = 0;
  for (let i = 0; i < str.length; i++) h = (h * 31 + str.charCodeAt(i)) >>> 0;
  return AVATAR_COLORS[h % AVATAR_COLORS.length];
}

function initials(name = '') {
  return name.split(' ').map((w) => w[0]).join('').slice(0, 2).toUpperCase();
}

function timeAgo(dateStr) {
  if (!dateStr) return '';
  const diff = Date.now() - new Date(dateStr).getTime();
  const m = Math.floor(diff / 60000);
  if (m < 1) return 'now';
  if (m < 60) return `${m}m`;
  const h = Math.floor(m / 60);
  if (h < 24) return `${h}h`;
  return `${Math.floor(h / 24)}d`;
}

const MessagesScreen = ({ navigation }) => {
  const [groupConvos, setGroupConvos] = useState([]);
  const [dmConvos, setDmConvos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [search, setSearch] = useState('');

  const fetchAll = useCallback(async (isRefresh = false) => {
    try {
      if (isRefresh) setRefreshing(true);
      else setLoading(true);

      const [groupsRes, dmRes] = await Promise.allSettled([
        groupsAPI.getMyGroups(),
        dmAPI.getInbox(),
      ]);

      if (groupsRes.status === 'fulfilled') {
        setGroupConvos(groupsRes.value.data || []);
      }
      if (dmRes.status === 'fulfilled') {
        setDmConvos(dmRes.value.data || []);
      }
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  useEffect(() => { fetchAll(); }, [fetchAll]);

  const q = search.toLowerCase();
  const filteredGroups = groupConvos.filter((g) =>
    (g.name || '').toLowerCase().includes(q) || (g.trail_name || '').toLowerCase().includes(q),
  );
  const filteredDMs = dmConvos.filter((d) =>
    (d.partner_name || '').toLowerCase().includes(q),
  );
  // Split DMs by connection status
  const connectedDMs = filteredDMs.filter(d => d.is_connected);
  const requestDMs = filteredDMs.filter(d => !d.is_connected);

  const hasContent = filteredGroups.length > 0 || filteredDMs.length > 0;

  return (
    <SafeAreaView style={styles.safe}>
      <StatusBar barStyle="dark-content" backgroundColor={colors.background} />

      {/* ── Header ─────────────────────────────────────────────────────────── */}
      <View style={styles.header}>
        <FadeIn>
          <Text style={styles.overline}>Chat</Text>
          <Text style={styles.title}>Messages</Text>
        </FadeIn>
        <PressableScale
          style={styles.composeBtn}
          scaleTo={0.9}
          onPress={() => navigation.navigate('Groups')}
        >
          <HugeiconsIcon icon={Edit02Icon} size={20} color="#fff" strokeWidth={2.25} />
        </PressableScale>
      </View>

      {/* ── Search ─────────────────────────────────────────────────────────── */}
      <SlideUp delay={100} style={{ paddingHorizontal: spacing.md, marginBottom: spacing.sm }}>
        <View style={styles.search}>
          <HugeiconsIcon icon={Search01Icon} size={18} color={colors.textLight} strokeWidth={2.25} />
          <TextInput
            style={styles.searchInput}
            placeholder="Search conversations…"
            placeholderTextColor={colors.textMuted}
            value={search}
            onChangeText={setSearch}
          />
        </View>
      </SlideUp>

      {loading ? (
        <View style={styles.center}>
          <ActivityIndicator color={colors.primary} size="large" />
          <Text style={styles.loadingText}>Loading messages…</Text>
        </View>
      ) : (
        <ScrollView
          showsVerticalScrollIndicator={false}
          contentContainerStyle={{ paddingBottom: spacing.xxl }}
          refreshControl={
            <RefreshControl
              refreshing={refreshing}
              onRefresh={() => fetchAll(true)}
              tintColor={colors.primary}
              colors={[colors.primary]}
            />
          }
        >
          {!hasContent ? (
            <EmptyState
              illustration={<EmptyMessagesIllustration size={180} />}
              title="No messages"
              subtitle="Join a group or connect with someone to start chatting."
            />
          ) : (
            <>
              {/* ── Group conversations ──────────────────────────────────── */}
              {filteredGroups.length > 0 && (
                <>
                  <Text style={styles.sectionLabel}>Groups</Text>
                  <Stagger initialDelay={100} step={35} distance={12}>
                    {filteredGroups.map((g) => {
                      const color = avatarColor(g.name);
                      const abbr = initials(g.name);
                      return (
                        <PressableScale
                          key={`group-${g.id}`}
                          style={styles.row}
                          onPress={() => navigation.navigate('Chat', {
                            groupId: g.id,
                            groupName: g.name,
                          })}
                          scaleTo={0.99}
                        >
                          <View style={[styles.avatar, { backgroundColor: color }]}>
                            <Text style={styles.avatarText}>{abbr}</Text>
                          </View>
                          <View style={{ flex: 1 }}>
                            <View style={styles.rowTop}>
                              <Text style={styles.name} numberOfLines={1}>{g.name}</Text>
                              <View style={styles.memBadge}>
                                <HugeiconsIcon icon={UserGroupIcon} size={10} color={colors.textLight} strokeWidth={2.5} />
                                <Text style={styles.memText}>{g.current_members ?? 0}</Text>
                              </View>
                            </View>
                            <Text style={styles.preview} numberOfLines={1}>
                              {g.trail_name ? `Trail: ${g.trail_name}` : 'Tap to open chat'}
                            </Text>
                          </View>
                        </PressableScale>
                      );
                    })}
                  </Stagger>
                </>
              )}

              {/* ── Connected DMs ────────────────────────────────────── */}
              {connectedDMs.length > 0 && (
                <>
                  <Text style={styles.sectionLabel}>Direct Messages</Text>
                  <Stagger initialDelay={filteredGroups.length * 35 + 100} step={35} distance={12}>
                    {connectedDMs.map((d) => {
                      const color = avatarColor(d.partner_name);
                      const abbr = initials(d.partner_name);
                      const unread = parseInt(d.unread_count || '0', 10);
                      return (
                        <PressableScale
                          key={`dm-${d.partner_id}`}
                          style={styles.row}
                          onPress={() => navigation.navigate('Chat', {
                            isDM: true,
                            receiverId: d.partner_id,
                            receiverName: d.partner_name,
                            groupName: d.partner_name,
                          })}
                          scaleTo={0.99}
                        >
                          <View style={[styles.avatar, { backgroundColor: color }]}>
                            <Text style={styles.avatarText}>{abbr}</Text>
                          </View>
                          <View style={{ flex: 1 }}>
                            <View style={styles.rowTop}>
                              <Text style={styles.name} numberOfLines={1}>{d.partner_name}</Text>
                              <Text style={styles.time}>{timeAgo(d.last_at)}</Text>
                            </View>
                            <View style={styles.rowBottom}>
                              <Text
                                style={[styles.preview, unread > 0 && styles.previewUnread]}
                                numberOfLines={1}
                              >
                                {d.last_message || 'Start a conversation'}
                              </Text>
                              {unread > 0 && (
                                <View style={styles.unreadBadge}>
                                  <Text style={styles.unreadText}>{unread > 99 ? '99+' : unread}</Text>
                                </View>
                              )}
                            </View>
                          </View>
                        </PressableScale>
                      );
                    })}
                  </Stagger>
                </>
              )}

              {/* ── Message requests from non-connected users ─────────── */}
              {requestDMs.length > 0 && (
                <>
                  <Text style={[styles.sectionLabel, { color: colors.textLight }]}>Message Requests</Text>
                  <Stagger initialDelay={200} step={35} distance={12}>
                    {requestDMs.map((d) => {
                      const color = avatarColor(d.partner_name);
                      const abbr = initials(d.partner_name);
                      const unread = parseInt(d.unread_count || '0', 10);
                      return (
                        <PressableScale
                          key={`req-${d.partner_id}`}
                          style={[styles.row, { opacity: 0.75, borderLeftWidth: 3, borderLeftColor: colors.warning }]}
                          onPress={() => navigation.navigate('Chat', {
                            isDM: true,
                            receiverId: d.partner_id,
                            receiverName: d.partner_name,
                            groupName: d.partner_name,
                          })}
                          scaleTo={0.99}
                        >
                          <View style={[styles.avatar, { backgroundColor: color }]}>
                            <Text style={styles.avatarText}>{abbr}</Text>
                          </View>
                          <View style={{ flex: 1 }}>
                            <View style={styles.rowTop}>
                              <Text style={styles.name} numberOfLines={1}>{d.partner_name}</Text>
                              <Text style={styles.time}>{timeAgo(d.last_at)}</Text>
                            </View>
                            <View style={styles.rowBottom}>
                              <Text
                                style={[styles.preview, unread > 0 && styles.previewUnread]}
                                numberOfLines={1}
                              >
                                {d.last_message || 'Message request'}
                              </Text>
                              {unread > 0 && (
                                <View style={styles.unreadBadge}>
                                  <Text style={styles.unreadText}>{unread > 99 ? '99+' : unread}</Text>
                                </View>
                              )}
                            </View>
                          </View>
                        </PressableScale>
                      );
                    })}
                  </Stagger>
                </>
              )}
            </>
          )}
        </ScrollView>
      )}
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: colors.background },
  center: { flex: 1, alignItems: 'center', justifyContent: 'center', gap: spacing.sm },
  loadingText: { fontSize: fontSize.sm, color: colors.textSecondary },

  header: {
    flexDirection: 'row', alignItems: 'flex-end', justifyContent: 'space-between',
    paddingHorizontal: spacing.md, paddingTop: spacing.sm, paddingBottom: spacing.sm,
  },
  overline: {
    fontSize: fontSize.xs, letterSpacing: 2, color: colors.primaryLight,
    fontWeight: fontWeight.bold, textTransform: 'uppercase',
  },
  title: { fontSize: fontSize.xxxl, fontWeight: fontWeight.bold, color: colors.text, letterSpacing: -0.5, marginTop: 2 },
  composeBtn: {
    width: 48, height: 48, borderRadius: 24,
    backgroundColor: colors.primary,
    alignItems: 'center', justifyContent: 'center', ...shadows.md,
  },

  search: {
    flexDirection: 'row', alignItems: 'center', gap: spacing.sm,
    backgroundColor: colors.surface, borderRadius: radius.round,
    paddingVertical: 12, paddingHorizontal: spacing.md,
  },
  searchInput: { flex: 1, fontSize: fontSize.md, color: colors.text, paddingVertical: 0 },

  sectionLabel: {
    fontSize: fontSize.xs, fontWeight: fontWeight.bold,
    color: colors.primaryLight, letterSpacing: 2, textTransform: 'uppercase',
    marginLeft: spacing.md, marginTop: spacing.md, marginBottom: spacing.xs,
  },

  row: {
    flexDirection: 'row', alignItems: 'center',
    backgroundColor: colors.card,
    paddingHorizontal: spacing.md, paddingVertical: spacing.md,
    marginHorizontal: spacing.md, marginBottom: spacing.sm,
    borderRadius: radius.xl,
    gap: spacing.sm,
    ...shadows.xs,
  },
  avatar: {
    width: 48, height: 48, borderRadius: 24,
    alignItems: 'center', justifyContent: 'center',
  },
  avatarText: { color: '#fff', fontWeight: fontWeight.bold, fontSize: fontSize.sm, letterSpacing: 0.5 },
  rowTop: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 4, alignItems: 'center' },
  name: { fontSize: fontSize.md, fontWeight: fontWeight.bold, color: colors.text, flex: 1, marginRight: 8 },
  time: { fontSize: fontSize.xs, color: colors.textLight, fontWeight: fontWeight.medium },
  rowBottom: { flexDirection: 'row', alignItems: 'center' },
  preview: { flex: 1, fontSize: fontSize.sm, color: colors.textSecondary },
  previewUnread: { color: colors.text, fontWeight: fontWeight.semiBold },
  unreadBadge: {
    backgroundColor: colors.primary, minWidth: 22, height: 22, borderRadius: 11,
    paddingHorizontal: 6,
    alignItems: 'center', justifyContent: 'center',
  },
  unreadText: { color: '#fff', fontSize: 11, fontWeight: fontWeight.bold },
  memBadge: {
    flexDirection: 'row', alignItems: 'center', gap: 3,
    paddingHorizontal: 8, paddingVertical: 2,
  },
  memText: { fontSize: 11, color: colors.textLight, fontWeight: fontWeight.medium },
});

export default MessagesScreen;
