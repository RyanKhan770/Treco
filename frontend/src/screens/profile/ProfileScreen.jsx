import { HugeiconsIcon } from '@hugeicons/react-native';
import { useEffect, useState } from 'react';
import {
  View, Text, StyleSheet, ScrollView, StatusBar, Dimensions, Image, Alert,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Settings01Icon, MapPinIcon, StarIcon, MountainIcon, Bookmark02Icon, Message01Icon, CheckmarkBadge01Icon, ArrowRight01Icon, Logout01Icon, Notification01Icon, HelpCircleIcon, Award01Icon, Shield01Icon } from '@hugeicons/core-free-icons';
import { LinearGradient } from 'expo-linear-gradient';
import * as Location from 'expo-location';
import api from '../../services/api';
import { colors } from '../../constants/colors';
import { fontSize, fontWeight, radius, shadows, spacing } from '../../constants/theme';
import { useAuth } from '../../context/AuthContext';
import { authAPI, BASE_URL } from '../../services/api';
import {
  Badge, Card, PressableScale, FadeIn, SlideUp, Stagger, ScaleIn,
} from '../../components/ui';
import MountainScene from '../../assets/svg/MountainScene';
import TopoPattern from '../../assets/svg/TopoPattern';

const { width: W } = Dimensions.get('window');

const ProfileScreen = ({ navigation }) => {
  const { user, logout } = useAuth();
  const insets = useSafeAreaInsets();
  const [profile, setProfile] = useState(null);

  useEffect(() => {
    authAPI.getMe().then(r => setProfile(r.data)).catch(() => {});
  }, []);

  const name    = profile?.name    || user?.name    || 'Trekker';
  const initial = name[0]?.toUpperCase() || 'T';
  const rawPhoto = profile?.profile_photo || user?.profile_photo || null;
  const photoUri = rawPhoto
    ? rawPhoto.startsWith('http') ? rawPhoto : `${BASE_URL.replace('/api', '')}${rawPhoto}`
    : null;
  const treks   = profile?.total_treks  ?? 0;
  const groups  = profile?.total_groups ?? 0;
  const reviews = profile?.total_reviews ?? 0;
  const rating  = profile?.overall_rating ? Number(profile.overall_rating).toFixed(1) : null;
  const location = profile?.location || user?.location || 'Nepal';

  const verifyBadge = profile?.is_verified
    ? { label: 'Verified', tone: 'success' }
    : profile?.verification_status === 'pending'
      ? { label: 'Pending', tone: 'warning' }
      : null;

  const role = profile?.role || user?.role;

  const adventure = [
    { label: 'My Posts',       icon: Message01Icon,screen: 'MyPosts' },
    { label: 'My trips',       icon: MountainIcon,   screen: 'MyTrips' },
    { label: 'Saved trails',   icon: Bookmark02Icon,   screen: 'SavedTrails' },
    { label: 'My reviews',     icon: StarIcon,       screen: 'Reviews' },
    { label: 'Verify identity',icon: CheckmarkBadge01Icon, screen: 'VerifyIdentity', badge: verifyBadge },
    ...(role === 'user' ? [{ label: 'Become an Organizer', icon: Award01Icon, screen: 'OrganizerRequest' }] : []),
  ];
  const account = [
    { label: 'Emergency Contacts', icon: Shield01Icon, screen: 'EmergencyContacts' },
    { label: 'Notifications', icon: Notification01Icon,      screen: 'Notifications' },
    { label: 'Settings',      icon: Settings01Icon,  screen: 'Settings' },
    { label: 'Help & feedback',icon: HelpCircleIcon,screen: 'ReportIssue' },
  ];

  return (
    /* edges={['bottom']} – we handle top padding manually inside the hero */
    <SafeAreaView style={styles.safe} edges={['bottom']}>
      <StatusBar barStyle="light-content" />

      <ScrollView showsVerticalScrollIndicator={false}>

        {/* ── Hero ── */}
        <View style={[styles.hero, { paddingTop: insets.top + 12 }]}>
          {/* Alpine background */}
          <LinearGradient colors={colors.gradAlpine} style={StyleSheet.absoluteFill} />
          <View style={StyleSheet.absoluteFill}>
            <TopoPattern width={W} height={300} color="#fff" opacity={0.05} />
          </View>
          {/* Mountain photo at the bottom of the hero */}
          <View style={styles.heroMountains}>
            <MountainScene width={W} height={140} variant="alpine" overlay={false} />
          </View>
          {/* Scrim so avatar/text are readable over the mountain photo */}
          <LinearGradient
            colors={['transparent', 'rgba(10,36,26,0.72)']}
            style={styles.heroMountainScrim}
          />

          {/* ── Top bar: settings button clearly in top-right ── */}
          <View style={styles.heroTopRow}>
            <View style={{ flex: 1 }} />
            <PressableScale
              style={styles.settingsBtn}
              onPress={() => navigation.navigate('Settings')}
              scaleTo={0.9}
            >
              <HugeiconsIcon icon={Settings01Icon} size={20} color="#fff" strokeWidth={2} />
            </PressableScale>
          </View>

          {/* ── Avatar + name ── */}
          <ScaleIn delay={80} style={styles.avatarWrap}>
            <View style={styles.avatar}>
              {photoUri
                ? <Image source={{ uri: photoUri }} style={styles.avatarImg} />
                : <Text style={styles.avatarText}>{initial}</Text>}
            </View>
            {!!profile?.is_verified && (
              <View style={styles.verifiedDot}>
                <HugeiconsIcon icon={CheckmarkBadge01Icon} size={14} color="#fff" strokeWidth={2.5} />
              </View>
            )}
          </ScaleIn>

          <SlideUp delay={160}>
            <Text style={styles.name}>{name}</Text>
          </SlideUp>
          <FadeIn delay={200} style={styles.locRow}>
            <HugeiconsIcon icon={MapPinIcon} size={13} color="rgba(255,255,255,0.85)" strokeWidth={2.25} />
            <Text style={styles.loc}>{location}</Text>
          </FadeIn>
          {!!rating && (
            <SlideUp delay={220} style={styles.ratingPill}>
              <HugeiconsIcon icon={StarIcon} size={14} color={colors.warning} fill={colors.warning} strokeWidth={2} />
              <Text style={styles.ratingText}>{rating} rating</Text>
            </SlideUp>
          )}
        </View>

        {/* ── Stats card (overlaps hero bottom) ── */}
        <SlideUp delay={220} style={styles.statsWrap}>
          <Card style={styles.statsCard} elevation="lg" padding={spacing.md}>
            <StatItem value={String(treks)}   label="Treks"   icon={MountainIcon} />
            <View style={styles.statDivider} />
            <StatItem value={String(groups)}  label="Groups"  icon={Message01Icon} />
            <View style={styles.statDivider} />
            <StatItem value={String(reviews)} label="Reviews" icon={StarIcon} />
          </Card>
        </SlideUp>

        {/* ── Menu ── */}
        <View style={{ paddingHorizontal: spacing.md, paddingBottom: spacing.xl }}>

          <Text style={styles.section}>Adventure</Text>
          <Stagger initialDelay={180} step={40} distance={14}>
            {adventure.map((item) => (
              <MenuItem
                key={item.label}
                item={item}
                onPress={() => navigation.navigate(item.screen)}
              />
            ))}
          </Stagger>

          <Text style={styles.section}>Account</Text>
          <Stagger initialDelay={180} step={40} distance={14}>
            {account.map((item) => (
              <MenuItem
                key={item.label}
                item={item}
                onPress={() => navigation.navigate(item.screen)}
              />
            ))}
          </Stagger>

          <SlideUp delay={220}>
            <PressableScale style={styles.logoutBtn} onPress={logout} scaleTo={0.97}>
              <HugeiconsIcon icon={Logout01Icon} size={18} color={colors.error} strokeWidth={2.25} />
              <Text style={styles.logoutText}>Sign out</Text>
            </PressableScale>
          </SlideUp>

          <SlideUp delay={260} style={{ marginTop: 24 }}>
            <PressableScale 
              style={styles.sosBtn} 
              scaleTo={0.95}
              onPress={async () => {
                Alert.alert('SOS Emergency', 'This will alert all your emergency contacts with your live location. Proceed?', [
                  { text: 'Cancel', style: 'cancel' },
                  { text: 'SEND SOS', style: 'destructive', onPress: async () => {
                    try {
                      let { status } = await Location.requestForegroundPermissionsAsync();
                      if (status !== 'granted') return Alert.alert('Error', 'Location permission required for SOS.');
                      const loc = await Location.getCurrentPositionAsync({});
                      await api.post('/sos/trigger', { latitude: loc.coords.latitude, longitude: loc.coords.longitude });
                      Alert.alert('SOS Sent', 'Your emergency contacts have been alerted.');
                    } catch (e) {
                      Alert.alert('Error', 'Could not send SOS. Check connection.');
                    }
                  }}
                ]);
              }}
            >
              <HugeiconsIcon icon={Shield01Icon} size={24} color="#fff" strokeWidth={2.5} />
              <Text style={styles.sosText}>SOS PANIC BUTTON</Text>
            </PressableScale>
          </SlideUp>

        </View>
      </ScrollView>
    </SafeAreaView>
  );
};

/* ── Sub-components ── */
const StatItem = ({ value, label, icon: Icon }) => (
  <View style={styles.statItem}>
    <HugeiconsIcon icon={Icon} size={16} color={colors.primary} strokeWidth={2.25} />
    <Text style={styles.statValue}>{value}</Text>
    <Text style={styles.statLabel}>{label}</Text>
  </View>
);

const MenuItem = ({ item, onPress }) => (
  <PressableScale onPress={onPress} style={styles.menuItem} scaleTo={0.98}>
    <View style={styles.menuIcon}>
      <HugeiconsIcon icon={item.icon} size={18} color={colors.primary} strokeWidth={2.25} />
    </View>
    <Text style={styles.menuLabel}>{item.label}</Text>
    <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
      {item.badge ? <Badge label={item.badge.label} tone={item.badge.tone} size="xs" /> : null}
      <HugeiconsIcon icon={ArrowRight01Icon} size={18} color={colors.textLight} strokeWidth={2.25} />
    </View>
  </PressableScale>
);

/* ── Styles ── */
const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: colors.background },

  /* Hero */
  hero: {
    alignItems: 'center',
    paddingBottom: 50,
    borderBottomLeftRadius: radius.xxl,
    borderBottomRightRadius: radius.xxl,
    overflow: 'hidden',
    position: 'relative',
  },
  
  

  /* Top row: settings button top-right, no overlap with avatar */
  heroTopRow: {
    width: '100%',
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: spacing.md,
    marginBottom: spacing.lg,
  },
  settingsBtn: {
    width: 40, height: 40, borderRadius: 20,
    backgroundColor: 'rgba(255,255,255,0.2)',
    alignItems: 'center', justifyContent: 'center',
  },

  /* Avatar */
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
    borderWidth: 2.5, borderColor: '#fff',
    alignItems: 'center', justifyContent: 'center',
  },

  /* Name / location / rating */
  name: { fontSize: fontSize.xl, fontWeight: fontWeight.bold, color: '#fff', letterSpacing: -0.3 },
  locRow: { flexDirection: 'row', alignItems: 'center', gap: 4, marginTop: 4 },
  loc: { fontSize: fontSize.sm, color: 'rgba(255,255,255,0.85)', fontWeight: fontWeight.medium },
  ratingPill: {
    flexDirection: 'row', alignItems: 'center', gap: 4,
    backgroundColor: 'rgba(255,255,255,0.18)',
    paddingHorizontal: 12, paddingVertical: 6, borderRadius: 99,
    marginTop: 10,
  },
  ratingText: { color: '#fff', fontSize: fontSize.sm, fontWeight: fontWeight.semiBold },

  /* Stats */
  statsWrap: { paddingHorizontal: spacing.md, marginTop: -28, marginBottom: spacing.lg },
  statsCard: { flexDirection: 'row', alignItems: 'center' },
  statItem: { flex: 1, alignItems: 'center', gap: 4 },
  statValue: { fontSize: fontSize.xxl, fontWeight: fontWeight.bold, color: colors.text },
  statLabel: { fontSize: fontSize.xs, color: colors.textLight, fontWeight: fontWeight.medium },
  statDivider: { width: 1, height: 44, backgroundColor: colors.border },

  /* Menu */
  section: {
    fontSize: fontSize.xs, fontWeight: fontWeight.bold,
    color: colors.primaryLight, letterSpacing: 2,
    textTransform: 'uppercase',
    marginTop: spacing.md, marginBottom: spacing.sm,
  },
  menuItem: {
    flexDirection: 'row', alignItems: 'center',
    backgroundColor: colors.card, borderRadius: radius.lg,
    padding: spacing.md, marginBottom: spacing.sm,
    gap: spacing.sm, ...shadows.xs,
  },
  menuIcon: {
    width: 36, height: 36, borderRadius: 18,
    backgroundColor: colors.primaryPale,
    alignItems: 'center', justifyContent: 'center',
  },
  menuLabel: { flex: 1, fontSize: fontSize.md, fontWeight: fontWeight.semiBold, color: colors.text },

  /* Logout */
  logoutBtn: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'center',
    gap: spacing.sm, padding: spacing.md, borderRadius: radius.lg,
    backgroundColor: '#FEE2E2',
    marginTop: spacing.lg,
  },
  logoutText: { color: colors.error, fontWeight: fontWeight.bold, fontSize: fontSize.md },
  sosBtn: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: spacing.sm, paddingVertical: 18, borderRadius: radius.xl, backgroundColor: '#DC2626', shadowColor: '#DC2626', shadowOffset: { width: 0, height: 8 }, shadowOpacity: 0.3, shadowRadius: 12, elevation: 8, }, sosText: { fontSize: fontSize.lg, fontWeight: fontWeight.black, color: '#fff', letterSpacing: 1 },
});

export default ProfileScreen;
