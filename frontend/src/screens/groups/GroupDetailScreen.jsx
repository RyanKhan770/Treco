import { HugeiconsIcon } from '@hugeicons/react-native';
import React, { useState, useEffect, useCallback } from 'react';
import {
  View, Text, StyleSheet, ScrollView, StatusBar, Alert,
  Dimensions, ActivityIndicator, TouchableOpacity, Image,
} from 'react-native';
import * as ImagePicker from 'expo-image-picker';
import { SafeAreaView } from 'react-native-safe-area-context';
import { ArrowLeft02Icon, MoreVerticalCircle01Icon, Calendar01Icon, UserGroupIcon, Wallet02Icon, MapPinIcon, Tick02Icon, Message01Icon, UserAdd01Icon, CheckmarkBadge01Icon, StarIcon, ReloadIcon, Alert01Icon, UserRemove01Icon, Navigation03Icon, Tick01Icon } from '@hugeicons/core-free-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { colors } from '../../constants/colors';
import { fontSize, fontWeight, radius, shadows, spacing } from '../../constants/theme';
import {
  Badge, Button, Card, PressableScale, FadeIn, SlideUp, Stagger,
} from '../../components/ui';
import MountainScene from '../../assets/svg/MountainScene';
import TopoPattern from '../../assets/svg/TopoPattern';
import { groupsAPI } from '../../services/api';
import { useAuth } from '../../context/AuthContext';

const { width: W } = Dimensions.get('window');

const DIFF_TONE = { Easy: 'success', Moderate: 'warning', Hard: 'danger', Challenging: 'danger', Difficult: 'danger' };
const AVATAR_COLORS = ['#40916C', '#457B9D', '#E76F51', '#6B4423', '#52B788', '#8B5CF6'];
const HERO_VARIANTS = ['alpine', 'mist', 'sunset', 'dawn', 'valley'];

function avatarColor(str = '') {
  let h = 0;
  for (let i = 0; i < str.length; i++) h = (h * 31 + str.charCodeAt(i)) >>> 0;
  return AVATAR_COLORS[h % AVATAR_COLORS.length];
}

function initials(name = '') {
  return name.split(' ').map((w) => w[0]).join('').slice(0, 2).toUpperCase();
}

function heroVariant(name = '') {
  let h = 0;
  for (let i = 0; i < name.length; i++) h = (h * 31 + name.charCodeAt(i)) >>> 0;
  return HERO_VARIANTS[h % HERO_VARIANTS.length];
}

function formatDate(start, end) {
  if (!start) return 'TBD';
  const s = new Date(start).toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
  if (!end) return s;
  const e = new Date(end).toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
  return `${s} – ${e}`;
}

function formatBudget(val) {
  if (!val) return 'TBD';
  const n = parseFloat(val);
  if (isNaN(n)) return val;
  return `NPR ${n.toLocaleString()}`;
}

const GroupDetailScreen = ({ route, navigation }) => {
  const { user } = useAuth();
  const { groupId } = route.params;
  const [group, setGroup] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [joining, setJoining] = useState(false);
  const [joined, setJoined] = useState(false);

  const fetchGroup = useCallback(async () => {
    try {
      setError(null);
      setLoading(true);
      const res = await groupsAPI.getById(groupId);
      setGroup(res.data);
    } catch (err) {
      setError(err?.response?.data?.message || 'Failed to load group');
    } finally {
      setLoading(false);
    }
  }, [groupId]);

  useEffect(() => { fetchGroup(); }, [fetchGroup]);

  const handleJoin = () => {
    if (!group) return;
    Alert.alert(
      'Join group',
      `Send a request to join "${group.name}"?`,
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Send request',
          onPress: async () => {
            try {
              setJoining(true);
              await groupsAPI.join(groupId, '');
              setJoined(true);
              Alert.alert('Request sent', 'The group organizer will review your request.');
            } catch (err) {
              const msg = err?.response?.data?.message || 'Could not send request';
              if (msg.toLowerCase().includes('already')) {
                setJoined(true);
                Alert.alert('Already requested', 'You already have a pending join request.');
              } else {
                Alert.alert('Error', msg);
              }
            } finally {
              setJoining(false);
            }
          },
        },
      ],
    );
  };

  // ── Loading ─────────────────────────────────────────────────────────────────
  if (loading) {
    return (
      <SafeAreaView style={styles.safe} edges={['bottom']}>
        <StatusBar barStyle="light-content" />
        <View style={[styles.hero, { alignItems: 'center', justifyContent: 'flex-end' }]}>
          <SafeAreaView edges={['top']} style={styles.heroHeader}>
            <PressableScale onPress={() => navigation.goBack()} style={styles.iconBtn} scaleTo={0.9}>
              <HugeiconsIcon icon={ArrowLeft02Icon} size={22} color="#fff" strokeWidth={2.25} />
            </PressableScale>
            <View />
          </SafeAreaView>
          <ActivityIndicator color="#fff" size="large" style={{ marginBottom: spacing.xl }} />
        </View>
        <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center' }}>
          <ActivityIndicator color={colors.primary} size="large" />
          <Text style={styles.loadingText}>Loading group…</Text>
        </View>
      </SafeAreaView>
    );
  }

  // ── Error ────────────────────────────────────────────────────────────────────
  if (error || !group) {
    return (
      <SafeAreaView style={styles.safe} edges={['bottom']}>
        <StatusBar barStyle="light-content" />
        <View style={styles.hero}>
          <SafeAreaView edges={['top']} style={styles.heroHeader}>
            <PressableScale onPress={() => navigation.goBack()} style={styles.iconBtn} scaleTo={0.9}>
              <HugeiconsIcon icon={ArrowLeft02Icon} size={22} color="#fff" strokeWidth={2.25} />
            </PressableScale>
          </SafeAreaView>
        </View>
        <View style={styles.errorContainer}>
          <HugeiconsIcon icon={Alert01Icon} size={48} color={colors.danger} strokeWidth={1.5} />
          <Text style={styles.errorTitle}>Couldn't load group</Text>
          <Text style={styles.errorSub}>{error}</Text>
          <TouchableOpacity style={styles.retryBtn} onPress={fetchGroup}>
            <HugeiconsIcon icon={ReloadIcon} size={16} color={colors.primary} strokeWidth={2.25} />
            <Text style={styles.retryText}>Try again</Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    );
  }

  const handleUploadPhoto = async () => {
    if (group.leader_id !== user?.id && user?.role !== 'admin') return;
    
    try {
      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        allowsEditing: true,
        aspect: [4, 3],
        quality: 0.8,
      });

      if (!result.canceled) {
        setLoading(true);
        const uploadRes = await groupsAPI.uploadPhoto(groupId, result.assets[0].uri);
        setGroup(prev => ({ ...prev, group_photo: uploadRes.data.group_photo }));
        Alert.alert('Success', 'Group photo updated successfully!');
      }
    } catch (err) {
      console.error(err);
      Alert.alert('Upload Failed', 'There was an error uploading the photo.');
    } finally {
      setLoading(false);
    }
  };

  // ── Derived fields ───────────────────────────────────────────────────────────
  const members = group.members || [];
  const memberCount = group.current_members ?? members.length ?? 0;
  const maxMembers = group.max_members ?? 10;
  const diff = group.difficulty ?? 'Moderate';
  const isMember = members.some(m => m.id === user?.id) || group.leader_id === user?.id;
  const variant = heroVariant(group.name);

  return (
    <SafeAreaView style={styles.safe} edges={['bottom']}>
      <StatusBar barStyle="light-content" />
      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingBottom: 120 }}>

        {/* ── Hero ─────────────────────────────────────────────────────────── */}
        <TouchableOpacity activeOpacity={0.9} onPress={handleUploadPhoto} style={styles.hero}>
          {group.group_photo ? (
            <Image 
              source={{ uri: group.group_photo.startsWith('http') ? group.group_photo : `http://10.0.2.2:5000${group.group_photo}` }} 
              style={{ width: W, height: 260, resizeMode: 'cover' }} 
            />
          ) : (
            <MountainScene width={W} height={260} variant={variant} />
          )}
          <LinearGradient
            colors={['rgba(15,44,32,0)', 'rgba(15,44,32,0.85)']}
            style={styles.heroFade}
          />
          {group.leader_id === user?.id && (
            <View style={{ position: 'absolute', right: spacing.md, bottom: 20, zIndex: 10, backgroundColor: 'rgba(0,0,0,0.5)', paddingHorizontal: 12, paddingVertical: 6, borderRadius: 20 }}>
              <Text style={{ color: '#fff', fontSize: 12, fontWeight: 'bold' }}>Tap to change cover</Text>
            </View>
          )}
          <TopoPattern width={W} height={260} color="#fff" opacity={0.08} />
          <SafeAreaView edges={['top']} style={styles.heroHeader}>
            <PressableScale onPress={() => navigation.goBack()} style={styles.iconBtn} scaleTo={0.9}>
              <HugeiconsIcon icon={ArrowLeft02Icon} size={22} color="#fff" strokeWidth={2.25} />
            </PressableScale>
            <PressableScale 
              style={styles.iconBtn} 
              scaleTo={0.9}
              onPress={() => {
                Alert.alert('Group Options', 'Choose an action', [
                  { text: 'Report Group', style: 'destructive', onPress: () => Alert.alert('Reported', 'Our team will review this group.') },
                  { text: 'Leave Group', style: 'destructive', onPress: () => Alert.alert('Error', 'Cannot leave group at this time.') },
                  { text: 'Cancel', style: 'cancel' }
                ]);
              }}
            >
              <HugeiconsIcon icon={MoreVerticalCircle01Icon} size={20} color="#fff" strokeWidth={2.25} />
            </PressableScale>
          </SafeAreaView>
          <FadeIn delay={150} style={styles.heroText}>
            <View style={{ flexDirection: 'row', gap: 8, marginBottom: spacing.sm }}>
              <Badge label={formatDate(group.start_date, group.end_date)} tone="dark" size="sm" />
              <Badge label={diff} tone={DIFF_TONE[diff] || 'warning'} size="sm" />
            </View>
            <Text style={styles.heroTitle}>{group.name}</Text>
            <Text style={styles.heroSub}>
              {group.trail_name ? `${group.trail_name} · ` : ''}Organized by {group.leader_name || 'Organizer'}
            </Text>
          </FadeIn>
        </TouchableOpacity>

        <View style={styles.body}>

          {/* ── Logistics strip ──────────────────────────────────────────────── */}
          <SlideUp delay={120}>
            <Card style={styles.logisticsCard} elevation="md">
              <View style={styles.logisticsRow}>
                <View style={styles.logisticsItem}>
                  <HugeiconsIcon icon={Wallet02Icon} size={16} color={colors.primary} strokeWidth={2.25} />
                  <Text style={styles.logisticsLabel}>Budget</Text>
                  <Text style={styles.logisticsValue}>{formatBudget(group.budget_estimate)}</Text>
                </View>
                <View style={styles.logisticsDivider} />
                <View style={styles.logisticsItem}>
                  <HugeiconsIcon icon={MapPinIcon} size={16} color={colors.primary} strokeWidth={2.25} />
                  <Text style={styles.logisticsLabel}>Meet at</Text>
                  <Text style={styles.logisticsValue} numberOfLines={1}>{group.meeting_point || 'TBD'}</Text>
                </View>
                <View style={styles.logisticsDivider} />
                <View style={styles.logisticsItem}>
                  <HugeiconsIcon icon={UserGroupIcon} size={16} color={colors.primary} strokeWidth={2.25} />
                  <Text style={styles.logisticsLabel}>Seats</Text>
                  <Text style={styles.logisticsValue}>{memberCount}/{maxMembers}</Text>
                </View>
              </View>
            </Card>
          </SlideUp>

          {/* ── Description ──────────────────────────────────────────────────── */}
          {!!group.description && (
            <SlideUp delay={160}>
              <Card style={styles.descCard}>
                <Text style={styles.descText}>{group.description}</Text>
              </Card>
            </SlideUp>
          )}

          {/* ── Members ──────────────────────────────────────────────────────── */}
          <Text style={styles.section}>Members · {memberCount}/{maxMembers}</Text>
          {members.length === 0 ? (
            <Card style={styles.emptyCard}>
              <Text style={styles.emptyText}>No members yet</Text>
            </Card>
          ) : (
            <Stagger initialDelay={200} step={40} distance={12}>
              {members.map((m) => (
                <PressableScale key={m.id} onPress={() => navigation.navigate('UserProfile', { userId: m.user_id || m.id })}>
                  <Card style={styles.memberCard}>
                    <View style={[styles.avatar, { backgroundColor: avatarColor(m.name) }]}>
                    <Text style={styles.avatarText}>{initials(m.name)}</Text>
                  </View>
                  <View style={{ flex: 1 }}>
                    <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6 }}>
                      <Text style={styles.memberName}>{m.name}</Text>
                      {m.is_verified && <HugeiconsIcon icon={CheckmarkBadge01Icon} size={14} color={colors.info} strokeWidth={2.5} />}
                    </View>
                    <View style={{ flexDirection: 'row', alignItems: 'center', gap: 4, marginTop: 2 }}>
                      <Text style={styles.memberMeta}>
                        {m.member_role === 'organizer' ? 'Organizer' : 'Member'}
                      </Text>
                      {m.overall_rating != null && (
                        <>
                          <Text style={[styles.memberMeta, { color: colors.textMuted }]}>·</Text>
                          <HugeiconsIcon icon={StarIcon} size={11} color={colors.warning} fill={colors.warning} strokeWidth={0} />
                          <Text style={styles.memberMeta}>{parseFloat(m.overall_rating).toFixed(1)}</Text>
                        </>
                      )}
                    </View>
                  </View>
                </Card>
              </PressableScale>
            ))}
            </Stagger>
          )}

          {/* ── Gear checklist shortcut ─────────────────────────────────────── */}
          <SlideUp delay={240}>
            <PressableScale
              style={styles.checklistCard}
              onPress={() => navigation.navigate('Checklist', { groupId })}
              scaleTo={0.98}
            >
              <View style={styles.checklistIcon}>
                <HugeiconsIcon icon={Tick02Icon} size={20} color={colors.primary} strokeWidth={2.25} />
              </View>
              <View style={{ flex: 1 }}>
                <Text style={styles.checklistTitle}>Gear checklist</Text>
                <Text style={styles.checklistSub}>Shared with group members</Text>
              </View>
              <Text style={styles.viewLink}>View</Text>
            </PressableScale>
          </SlideUp>

          {/* ── Trip budget shortcut ─────────────────────────────────────────── */}
          <SlideUp delay={280}>
            <PressableScale
              style={[styles.checklistCard, { marginTop: spacing.sm }]}
              onPress={() => navigation.navigate('TripBudget', {
                groupId,
                groupName: group.name,
                members:   group.member_count || group.members?.length || 1,
                dates:     group.start_date
                  ? `${new Date(group.start_date).toLocaleDateString('en-GB', { day: 'numeric', month: 'short' })}${group.end_date ? ' – ' + new Date(group.end_date).toLocaleDateString('en-GB', { day: 'numeric', month: 'short' }) : ''}`
                  : '',
              })}
              scaleTo={0.98}
            >
              <View style={[styles.checklistIcon, { backgroundColor: '#FFF7E6' }]}>
                <HugeiconsIcon icon={Wallet02Icon} size={20} color="#E76F51" strokeWidth={2.25} />
              </View>
              <View style={{ flex: 1 }}>
                <Text style={styles.checklistTitle}>Trip budget</Text>
                <Text style={styles.checklistSub}>Track shared expenses</Text>
              </View>
              <Text style={styles.viewLink}>View</Text>
            </PressableScale>
          </SlideUp>

          {/* ── Plan a trip shortcut ──────────────────────────────────────── */}
          <SlideUp delay={320}>
            <PressableScale
              style={[styles.checklistCard, { marginTop: spacing.sm, borderLeftColor: '#457B9D' }]}
              onPress={() => navigation.navigate('PlanTrip', {
                groupId,
                groupName: group.name,
                trailId: group.trail_id || null,
                trailName: group.trail_name || null,
              })}
              scaleTo={0.98}
            >
              <View style={[styles.checklistIcon, { backgroundColor: '#EBF5FB' }]}>
                <HugeiconsIcon icon={Navigation03Icon} size={20} color="#457B9D" strokeWidth={2.25} />
              </View>
              <View style={{ flex: 1 }}>
                <Text style={styles.checklistTitle}>Plan a trip</Text>
                <Text style={styles.checklistSub}>Invite friends & set schedule</Text>
              </View>
              <Text style={styles.viewLink}>Plan</Text>
            </PressableScale>
          </SlideUp>
        </View>
      </ScrollView>

      {/* ── CTA bar ─────────────────────────────────────────────────────────── */}
      <View style={styles.ctaBar}>
        <Button
          label="Message"
          variant="outline"
          icon={Message01Icon}
          onPress={() => navigation.navigate('Chat', { groupId, groupName: group.name })}
          fullWidth
        />
        <View style={{ flex: 1.2 }}>
          {isMember ? (
            <Button
              label="Already joined"
              variant="solid"
              icon={Tick01Icon}
              disabled={true}
              fullWidth
            />
          ) : (
            <Button
              label={joining ? 'Sending…' : joined ? 'Request sent' : 'Join group'}
              variant={joined ? 'solid' : 'primary'}
              icon={!joined && !joining ? UserPlus : null}
              onPress={!joined && !joining ? handleJoin : undefined}
              disabled={joined || joining}
              fullWidth
            />
          )}
        </View>
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: colors.background },
  hero: { height: 260, backgroundColor: colors.primaryDark, overflow: 'hidden' },
  heroFade: { position: 'absolute', left: 0, right: 0, bottom: 0, height: 200 },
  heroHeader: {
    position: 'absolute', top: 0, left: 0, right: 0,
    flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
    paddingHorizontal: spacing.md, paddingTop: spacing.md,
  },
  iconBtn: {
    width: 40, height: 40, borderRadius: 20,
    backgroundColor: 'rgba(0,0,0,0.35)',
    alignItems: 'center', justifyContent: 'center',
  },
  heroText: { position: 'absolute', bottom: spacing.lg, left: spacing.md, right: spacing.md },
  heroTitle: { fontSize: fontSize.xxl, fontWeight: fontWeight.bold, color: '#fff', letterSpacing: -0.5 },
  heroSub: { fontSize: fontSize.sm, color: 'rgba(255,255,255,0.8)', marginTop: 4, fontWeight: fontWeight.medium },

  body: { padding: spacing.md, marginTop: -30 },

  loadingText: { marginTop: spacing.md, fontSize: fontSize.sm, color: colors.textSecondary },
  errorContainer: { flex: 1, alignItems: 'center', justifyContent: 'center', padding: spacing.xl },
  errorTitle: { fontSize: fontSize.xl, fontWeight: fontWeight.bold, color: colors.text, marginTop: spacing.md },
  errorSub: { fontSize: fontSize.sm, color: colors.textSecondary, marginTop: spacing.xs, textAlign: 'center' },
  retryBtn: {
    flexDirection: 'row', alignItems: 'center', gap: spacing.xs,
    marginTop: spacing.lg, paddingHorizontal: spacing.lg, paddingVertical: spacing.sm,
    borderRadius: radius.round, borderWidth: 1.5, borderColor: colors.primary,
  },
  retryText: { fontSize: fontSize.sm, color: colors.primary, fontWeight: fontWeight.semiBold },

  logisticsCard: { marginBottom: spacing.md },
  logisticsRow: { flexDirection: 'row', alignItems: 'center' },
  logisticsItem: { flex: 1, alignItems: 'center', gap: 4 },
  logisticsDivider: { width: 1, height: 40, backgroundColor: colors.border },
  logisticsLabel: { fontSize: 10, color: colors.textLight, letterSpacing: 1, textTransform: 'uppercase', fontWeight: fontWeight.semiBold, marginTop: 2 },
  logisticsValue: { fontSize: fontSize.sm, color: colors.text, fontWeight: fontWeight.bold, textAlign: 'center' },

  descCard: { marginBottom: spacing.md },
  descText: { fontSize: fontSize.sm, color: colors.textSecondary, lineHeight: 20 },

  section: {
    fontSize: fontSize.xs, fontWeight: fontWeight.bold,
    color: colors.primaryLight, letterSpacing: 2, textTransform: 'uppercase',
    marginTop: spacing.sm, marginBottom: spacing.sm,
  },
  emptyCard: { paddingVertical: spacing.lg, alignItems: 'center' },
  emptyText: { fontSize: fontSize.sm, color: colors.textMuted },

  memberCard: { flexDirection: 'row', alignItems: 'center', gap: spacing.sm, marginBottom: spacing.sm },
  avatar: {
    width: 44, height: 44, borderRadius: 22,
    alignItems: 'center', justifyContent: 'center',
  },
  avatarText: { color: '#fff', fontSize: fontSize.md, fontWeight: fontWeight.bold },
  memberName: { fontSize: fontSize.md, fontWeight: fontWeight.bold, color: colors.text },
  memberMeta: { fontSize: fontSize.xs, color: colors.textSecondary, fontWeight: fontWeight.medium },

  checklistCard: {
    flexDirection: 'row', alignItems: 'center', gap: spacing.md,
    backgroundColor: colors.surface,
    borderRadius: radius.xl,
    padding: spacing.md, marginTop: spacing.md,
    borderLeftWidth: 0,
  },
  checklistIcon: {
    width: 44, height: 44, borderRadius: 22,
    backgroundColor: colors.card,
    alignItems: 'center', justifyContent: 'center',
    ...shadows.xs,
  },
  checklistTitle: { fontSize: fontSize.md, fontWeight: fontWeight.bold, color: colors.text },
  checklistSub: { fontSize: fontSize.xs, color: colors.textSecondary, marginTop: 2 },
  viewLink: { fontSize: fontSize.sm, color: colors.primary, fontWeight: fontWeight.bold },

  ctaBar: {
    position: 'absolute', left: 0, right: 0, bottom: 0,
    flexDirection: 'row', gap: spacing.sm,
    paddingHorizontal: spacing.md, paddingTop: spacing.sm, paddingBottom: spacing.lg,
    backgroundColor: colors.card,
    borderTopWidth: 1, borderTopColor: colors.border,
    ...shadows.lg,
  },
});

export default GroupDetailScreen;
