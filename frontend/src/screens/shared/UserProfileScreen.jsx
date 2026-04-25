import { HugeiconsIcon } from '@hugeicons/react-native';
import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, ScrollView, StatusBar, Image, Alert } from 'react-native';
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import { ArrowLeft02Icon, MapPinIcon, StarIcon, MountainIcon, Message01Icon, CheckmarkBadge01Icon, Flag01Icon, MoreVerticalCircle01Icon, UserAdd01Icon, Tick01Icon, Clock01Icon } from '@hugeicons/core-free-icons';
import { colors } from '../../constants/colors';
import { fontSize, fontWeight, radius, shadows, spacing } from '../../constants/theme';
import { Card, PressableScale, FadeIn, SlideUp, Button } from '../../components/ui';
import MountainScene from '../../assets/svg/MountainScene';
import TopoPattern from '../../assets/svg/TopoPattern';
import api, { BASE_URL, connectionsAPI } from '../../services/api';

const UserProfileScreen = ({ route, navigation }) => {
  const { userId } = route.params;
  const insets = useSafeAreaInsets();
  
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [connStatus, setConnStatus] = useState('none'); // none | pending | accepted | received
  const [connId, setConnId] = useState(null);
  const [connecting, setConnecting] = useState(false);

  useEffect(() => {
    api.get(`/users/${userId}`)
      .then(res => setProfile(res.data))
      .catch(() => Alert.alert('Error', 'Could not load user profile.'))
      .finally(() => setLoading(false));
    // Check connection status
    connectionsAPI.getStatus(userId)
      .then(res => {
        setConnStatus(res.data?.status === 'accepted' ? 'accepted' : res.data?.status === 'pending' ? (res.data?.direction === 'sent' ? 'pending' : 'received') : 'none');
        setConnId(res.data?.connectionId || null);
      })
      .catch(() => {});
  }, [userId]);

  const handleReport = () => {
    Alert.prompt('Report User', 'Why are you reporting this user?', async (reason) => {
      if (!reason) return;
      try {
        await api.post('/reports', { type: 'user', targetId: userId, reason });
        Alert.alert('Report Submitted', 'Our moderation team will review this report.');
      } catch (err) {
        Alert.alert('Error', 'Could not submit report.');
      }
    });
  };

  if (loading) {
    return (
      <View style={[styles.safe, { justifyContent: 'center', alignItems: 'center' }]}>
        <Text>Loading profile...</Text>
      </View>
    );
  }

  if (!profile) {
    return (
      <View style={[styles.safe, { justifyContent: 'center', alignItems: 'center' }]}>
        <Text>Profile not found.</Text>
        <Button label="Go Back" onPress={() => navigation.goBack()} style={{ marginTop: 20 }} />
      </View>
    );
  }

  const name = profile.name || 'Trekker';
  const initial = name[0]?.toUpperCase() || 'T';
  const rawPhoto = profile.profile_photo;
  const photoUri = rawPhoto
    ? rawPhoto.startsWith('http') ? rawPhoto : `${BASE_URL.replace('/api', '')}${rawPhoto}`
    : null;

  const treks = profile.total_treks ?? 0;
  const groups = profile.total_groups ?? 0;
  const reviews = profile.total_reviews ?? 0;
  const rating = profile.overall_rating ? Number(profile.overall_rating).toFixed(1) : null;
  const location = profile.location || 'Nepal';

  return (
    <SafeAreaView style={styles.safe} edges={['bottom']}>
      <StatusBar barStyle="light-content" />

      <ScrollView showsVerticalScrollIndicator={false} bounces={false}>
        {/* ── Hero ── */}
        <View style={[styles.hero, { paddingTop: insets.top + 12 }]}>
          <LinearGradient colors={colors.gradAlpine} style={StyleSheet.absoluteFill} />
          <View style={StyleSheet.absoluteFill}>
            <TopoPattern width="100%" height={300} color="#fff" opacity={0.05} />
          </View>
          <View style={styles.heroMountains}>
            <MountainScene width="100%" height={140} variant="alpine" overlay={false} />
          </View>
          <LinearGradient
            colors={['transparent', 'rgba(10,36,26,0.72)']}
            style={styles.heroMountainScrim}
          />

          {/* Top Bar */}
          <View style={styles.heroTopRow}>
            <PressableScale style={styles.iconBtn} onPress={() => navigation.goBack()} scaleTo={0.9}>
              <HugeiconsIcon icon={ArrowLeft02Icon} size={24} color="#fff" strokeWidth={2.5} />
            </PressableScale>
            <View style={{ flex: 1 }} />
            <PressableScale style={styles.iconBtn} onPress={handleReport} scaleTo={0.9}>
              <HugeiconsIcon icon={Flag01Icon} size={20} color={colors.dangerLight} strokeWidth={2.5} />
            </PressableScale>
          </View>

          {/* Avatar + name */}
          <View style={styles.avatarWrap}>
            <View style={styles.avatar}>
              {photoUri
                ? <Image source={{ uri: photoUri }} style={styles.avatarImg} />
                : <Text style={styles.avatarText}>{initial}</Text>}
            </View>
            {!!profile.is_verified && (
              <View style={styles.verifiedDot}>
                <HugeiconsIcon icon={CheckmarkBadge01Icon} size={14} color="#fff" strokeWidth={2.5} />
              </View>
            )}
          </View>

          <Text style={styles.name}>{name}</Text>
          <View style={styles.locRow}>
            <HugeiconsIcon icon={MapPinIcon} size={13} color="rgba(255,255,255,0.85)" strokeWidth={2.25} />
            <Text style={styles.loc}>{location}</Text>
          </View>
          
          <View style={{ flexDirection: 'row', gap: 8, marginBottom: 12 }}>
            {(profile.role === 'organizer' || profile.role === 'admin') && (
              <View style={styles.orgBadge}>
                <Text style={styles.orgBadgeText}>ORGANIZER</Text>
              </View>
            )}
            {!!rating && (
              <View style={[styles.ratingPill, { marginBottom: 0 }]}>
                <HugeiconsIcon icon={StarIcon} size={14} color={colors.warning} fill={colors.warning} strokeWidth={2} />
                <Text style={styles.ratingText}>{rating} rating</Text>
              </View>
            )}
          </View>
        </View>

        {/* ── Stats card ── */}
        <View style={styles.statsWrap}>
          <Card style={styles.statsCard} elevation="lg" padding={spacing.md}>
            <StatItem value={String(treks)}   label="Treks"   icon={MountainIcon} />
            <View style={styles.statDivider} />
            <StatItem value={String(groups)}  label="Groups"  icon={Message01Icon} />
            <View style={styles.statDivider} />
            <StatItem value={String(reviews)} label="Reviews" icon={StarIcon} />
          </Card>
        </View>

        {/* Bio Section */}
        {profile.bio && (
          <SlideUp delay={200} style={styles.bioSection}>
            <Text style={styles.sectionTitle}>About {name}</Text>
            <Text style={styles.bioText}>{profile.bio}</Text>
          </SlideUp>
        )}

        <View style={styles.actions}>
          {/* Connect Button */}
          {connStatus === 'none' && (
            <Button
              label="Connect"
              icon={UserAdd01Icon}
              variant="solid"
              loading={connecting}
              onPress={async () => {
                try {
                  setConnecting(true);
                  await connectionsAPI.sendRequest(userId);
                  setConnStatus('pending');
                  Alert.alert('Sent!', 'Connection request sent.');
                } catch (err) {
                  Alert.alert('Error', err.response?.data?.message || 'Could not send request.');
                } finally {
                  setConnecting(false);
                }
              }}
            />
          )}
          {connStatus === 'pending' && (
            <Button
              label="Request Pending"
              icon={Clock01Icon}
              variant="outline"
              disabled
            />
          )}
          {connStatus === 'received' && (
            <Button
              label="Accept Connection"
              icon={Tick01Icon}
              variant="solid"
              loading={connecting}
              onPress={async () => {
                try {
                  setConnecting(true);
                  await connectionsAPI.respond(connId, 'accepted');
                  setConnStatus('accepted');
                  Alert.alert('Connected!', `You are now connected with ${name}.`);
                } catch {
                  Alert.alert('Error', 'Could not accept request.');
                } finally {
                  setConnecting(false);
                }
              }}
            />
          )}
          {connStatus === 'accepted' && (
            <Button
              label="Connected ✓"
              icon={CheckmarkBadge01Icon}
              variant="outline"
              disabled
            />
          )}

          <Button 
            label={`Message ${name}`} 
            icon={Message01Icon}
            onPress={() => navigation.navigate('Chat', {
              isDM: true, receiverId: userId, receiverName: name, groupName: name,
            })}
            style={{ marginTop: 12 }}
          />
          <Button 
            label="Write a Review" 
            icon={StarIcon}
            variant="outline"
            style={{ marginTop: 12 }}
            onPress={() => navigation.navigate('WriteReview', { userId, userName: name })}
          />
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};

const StatItem = ({ value, label, icon: Icon }) => (
  <View style={styles.statItem}>
    <HugeiconsIcon icon={Icon} size={16} color={colors.primary} strokeWidth={2.25} />
    <Text style={styles.statValue}>{value}</Text>
    <Text style={styles.statLabel}>{label}</Text>
  </View>
);

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: colors.background },
  hero: {
    alignItems: 'center',
    paddingBottom: 50,
    borderBottomLeftRadius: radius.xxl,
    borderBottomRightRadius: radius.xxl,
    overflow: 'hidden',
    position: 'relative',
  },
  heroMountains: { position: 'absolute', left: 0, right: 0, bottom: 0 },
  heroMountainScrim: { position: 'absolute', left: 0, right: 0, bottom: 0, height: 120 },
  heroTopRow: {
    width: '100%', flexDirection: 'row', alignItems: 'center',
    paddingHorizontal: spacing.md, marginBottom: spacing.lg,
  },
  iconBtn: {
    width: 40, height: 40, borderRadius: 20,
    backgroundColor: 'rgba(255,255,255,0.2)',
    alignItems: 'center', justifyContent: 'center',
  },
  avatarWrap: { marginBottom: 12 },
  avatar: {
    width: 92, height: 92, borderRadius: 46,
    backgroundColor: colors.accent,
    alignItems: 'center', justifyContent: 'center',
    borderWidth: 3, borderColor: '#fff',
    ...shadows.lg,
  },
  avatarImg: { width: 92, height: 92, borderRadius: 46 },
  avatarText: { color: '#fff', fontSize: 36, fontWeight: fontWeight.black },
  verifiedDot: {
    position: 'absolute', bottom: 2, right: 2,
    width: 26, height: 26, borderRadius: 13,
    backgroundColor: colors.accent,
    alignItems: 'center', justifyContent: 'center',
    borderWidth: 2, borderColor: '#fff',
  },
  name: { fontSize: 24, fontWeight: fontWeight.black, color: '#fff', letterSpacing: -0.5, marginBottom: 4 },
  locRow: { flexDirection: 'row', alignItems: 'center', gap: 4, marginBottom: 12 },
  loc: { color: 'rgba(255,255,255,0.85)', fontSize: fontSize.sm, fontWeight: fontWeight.medium },
  ratingPill: {
    flexDirection: 'row', alignItems: 'center', gap: 4,
    backgroundColor: 'rgba(0,0,0,0.3)', paddingHorizontal: 12, paddingVertical: 4,
    borderRadius: 12,
  },
  ratingText: { color: '#fff', fontSize: fontSize.xs, fontWeight: fontWeight.bold },
  orgBadge: {
    backgroundColor: colors.accent, paddingHorizontal: 12, paddingVertical: 4,
    borderRadius: 12, justifyContent: 'center', alignItems: 'center',
  },
  orgBadgeText: { color: '#fff', fontSize: 10, fontWeight: fontWeight.bold, letterSpacing: 0.5 },
  
  statsWrap: { paddingHorizontal: spacing.md, marginTop: -32, zIndex: 10, marginBottom: spacing.xl },
  statsCard: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  statItem: { flex: 1, alignItems: 'center', gap: 2 },
  statDivider: { width: 1, height: 32, backgroundColor: colors.border },
  statValue: { fontSize: fontSize.xl, fontWeight: fontWeight.black, color: colors.text, marginTop: 2 },
  statLabel: { fontSize: 10, fontWeight: fontWeight.bold, color: colors.textLight, textTransform: 'uppercase', letterSpacing: 0.5 },

  bioSection: { paddingHorizontal: spacing.xl, marginBottom: spacing.xl },
  sectionTitle: { fontSize: fontSize.lg, fontWeight: fontWeight.bold, color: colors.text, marginBottom: spacing.sm },
  bioText: { fontSize: fontSize.md, color: colors.textSecondary, lineHeight: 22 },

  actions: { paddingHorizontal: spacing.xl, paddingBottom: spacing.xxl },
});

export default UserProfileScreen;
