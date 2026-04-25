import { useState, useEffect, useCallback } from 'react';
import { useFocusEffect } from '@react-navigation/native';
import {
  View, Text, StyleSheet, ScrollView, StatusBar, Dimensions,
  ActivityIndicator, Image, TouchableOpacity, Alert
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { HugeiconsIcon } from '@hugeicons/react-native';
import { Search01Icon, MapsIcon, UserGroupIcon, PlusSignIcon, Notification01Icon, Compass01Icon, StarIcon, Clock01Icon, ChartUpIcon, MapPinIcon, FavouriteIcon, BubbleChatIcon, MoreVerticalIcon } from '@hugeicons/core-free-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { colors } from '../../constants/colors';
import { fontSize, fontWeight, radius, shadows, spacing } from '../../constants/theme';
import { useAuth } from '../../context/AuthContext';
import {
  Badge, Card, PressableScale, SlideUp, FadeIn, Stagger,
} from '../../components/ui';
import MountainScene from '../../assets/svg/MountainScene';
import TopoPattern from '../../assets/svg/TopoPattern';
import { getTrailImage } from '../../assets/images/trailImages';
import { NEPAL_TRAILS } from '../../constants/kathmandu_trails';
import { trailsAPI, notificationsAPI, postsAPI, BASE_URL } from '../../services/api';

const { width: W } = Dimensions.get('window');
const HERO_H = 270;

// ── Variant lookup from local constants ────────────────────────────
const VARIANT_MAP = Object.fromEntries(
  NEPAL_TRAILS.map((t) => [t.name.toLowerCase().trim(), t]),
);

function buildTrailRow(apiRow) {
  const local = VARIANT_MAP[apiRow.name.toLowerCase().trim()];
  const maxAlt = apiRow.max_altitude_m;
  const elevStr = maxAlt ? `${Number(maxAlt).toLocaleString()}m` : '—';
  const durStr  = apiRow.duration_days
    ? (apiRow.duration_days === 1 ? '1 day' : `${apiRow.duration_days}–${apiRow.duration_days + 1} days`)
    : '—';
  const diffRaw = apiRow.difficulty || '';
  const diff    = diffRaw.charAt(0).toUpperCase() + diffRaw.slice(1).toLowerCase();

  return {
    id:         local?.id ?? `api-${apiRow.id}`,
    dbId:       apiRow.id,
    name:       apiRow.name,
    duration:   local?.duration  ?? durStr,
    difficulty: local?.difficulty ?? diff,
    rating:     (local ? (RATINGS[local.id] ?? 4.5) : 4.5).toFixed(1),
    variant:    local?.variant   ?? 'alpine',
    elevation:  local ? `${local.maxElevation.toLocaleString()}m` : elevStr,
  };
}

const RATINGS = {
  'langtang-valley': 4.8, 'shivapuri': 4.6,
  'annapurna-base-camp': 4.9, 'poon-hill': 4.8,
  'sundarijal-chisapani': 4.4, 'nagarkot-changu': 4.5,
  'phulchowki': 4.8, 'champadevi': 4.5, 'nagarjun': 4.3,
  'chandragiri': 4.5, 'helambu': 4.6, 'mardi-himal': 4.7,
  'everest-base-camp': 4.9, 'gosaikunda': 4.7,
};

const quickActions = [
  { label: 'Explore', icon: MapsIcon,   screen: 'Explore' },
  { label: 'Groups',  icon: UserGroupIcon, screen: 'Groups'  },
  { label: 'Create',  icon: PlusSignIcon,  screen: 'CreateTrip' },
];

const difficultyTone = { Easy: 'success', Moderate: 'warning', Hard: 'danger' };

const HomeScreen = ({ navigation }) => {
  const { user } = useAuth();
  const insets = useSafeAreaInsets();
  const firstName = user?.name?.split(' ')[0] || 'Trekker';
  const heroHeight = HERO_H + insets.top;

  const [popularTrails, setPopularTrails] = useState([]);
  const [loadingTrails, setLoadingTrails] = useState(true);
  const [unreadCount, setUnreadCount] = useState(0);
  const [feed, setFeed] = useState([]);
  const [loadingFeed, setLoadingFeed] = useState(true);

  useEffect(() => {
    notificationsAPI.getUnreadCount()
      .then(r => setUnreadCount(r.data?.count || 0))
      .catch(() => {});
  }, []);

  useEffect(() => {
    trailsAPI.getAll()
      .then((res) => {
        const rows = res.data || [];
        if (rows.length > 0) {
          // Deduplicate by name, prefer trails with local constants (richer data)
          const seenNames = new Set();
          const unique = rows.filter((r) => {
            const key = r.name.toLowerCase().trim();
            if (seenNames.has(key)) return false;
            seenNames.add(key);
            return true;
          });
          const sorted = [...unique].sort((a, b) => {
            const aLocal = VARIANT_MAP[a.name.toLowerCase().trim()];
            const bLocal = VARIANT_MAP[b.name.toLowerCase().trim()];
            if (aLocal && !bLocal) return -1;
            if (!aLocal && bLocal) return 1;
            return a.name.localeCompare(b.name);
          });
          setPopularTrails(sorted.slice(0, 4).map(buildTrailRow));
        }
      })
      .catch(() => { /* keep fallback */ })
      .finally(() => setLoadingTrails(false));
  }, []);

  useFocusEffect(
    useCallback(() => {
      postsAPI.getFeed()
        .then(res => setFeed(res.data || []))
        .catch(() => {})
        .finally(() => setLoadingFeed(false));
    }, [])
  );

  const handleLike = async (postId, isLiked) => {
    // Optimistic UI update
    setFeed(prev => prev.map(p => {
      if (p.id === postId) {
        return {
          ...p,
          is_liked: !isLiked,
          likes_count: isLiked ? Math.max(p.likes_count - 1, 0) : p.likes_count + 1
        };
      }
      return p;
    }));
    
    try {
      await postsAPI.like(postId);
    } catch (err) {
      // Revert if failed
      setFeed(prev => prev.map(p => {
        if (p.id === postId) {
          return {
            ...p,
            is_liked: isLiked,
            likes_count: isLiked ? p.likes_count + 1 : Math.max(p.likes_count - 1, 0)
          };
        }
        return p;
      }));
    }
  };

  const confirmDeletePost = (postId) => {
    Alert.alert('Delete Post', 'Are you sure you want to delete this post?', [
      { text: 'Cancel', style: 'cancel' },
      { 
        text: 'Delete', 
        style: 'destructive', 
        onPress: async () => {
          try {
            await postsAPI.deletePost(postId);
            setFeed(prev => prev.filter(p => p.id !== postId));
          } catch (err) {
            Alert.alert('Error', 'Failed to delete post.');
          }
        } 
      }
    ]);
  };

  const handlePostOptions = (post) => {
    Alert.alert('Post Options', 'What would you like to do?', [
      { text: 'Edit', onPress: () => navigation.navigate('CreatePost', { editPostId: post.id, initialContent: post.content, initialImage: post.image_url ? (post.image_url.startsWith('http') ? post.image_url : BASE_URL.replace('/api', '') + post.image_url) : null }) },
      { text: 'Delete', style: 'destructive', onPress: () => confirmDeletePost(post.id) },
      { text: 'Cancel', style: 'cancel' }
    ]);
  };

  return (
    <View style={styles.safe}>
      <StatusBar barStyle="light-content" translucent backgroundColor="transparent" />

      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingBottom: 32 }}>

        {/* ── Hero: full-bleed mountain photo + greeting ── */}
        <View style={[styles.hero, { height: heroHeight }]}>
          {/* Gradient bg visible while image loads */}
          <LinearGradient colors={colors.gradAlpine} style={StyleSheet.absoluteFill} />
          <View style={StyleSheet.absoluteFill}>
            <TopoPattern width={W} height={heroHeight} color="#fff" opacity={0.05} />
          </View>

          {/* Mountain photo – fills entire hero */}
          <View style={StyleSheet.absoluteFillObject}>
            <MountainScene width={W} height={heroHeight} variant="alpine" overlay={false} />
          </View>

          {/* Scrim: dark fade at bottom for text legibility */}
          <LinearGradient
            colors={['transparent', 'rgba(8,30,20,0.5)', 'rgba(8,30,20,0.88)']}
            locations={[0, 0.5, 1]}
            style={styles.heroScrim}
          />

          {/*Notification01Icononly – no username in top-right */}
          <PressableScale
            style={[styles.bellBtn, { top: insets.top + 10 }]}
            onPress={() => { setUnreadCount(0); navigation.navigate('Notifications'); }}
            scaleTo={0.9}
          >
            <HugeiconsIcon icon={Notification01Icon} size={20} color="#fff" strokeWidth={2} />
            {unreadCount > 0 && (
              <View style={styles.notifBadge}>
                <Text style={styles.notifBadgeText}>{unreadCount > 99 ? '99+' : unreadCount}</Text>
              </View>
            )}
          </PressableScale>

          {/* Greeting text anchored to bottom of hero */}
          <View style={styles.heroContent}>
            <FadeIn delay={60}>
              <Text style={styles.greeting}>Namaste, {firstName} 👋</Text>
            </FadeIn>
            <SlideUp delay={120}>
              <Text style={styles.heroTag}>Where to next?</Text>
            </SlideUp>
          </View>
        </View>

        {/* ──Search01Iconbar – floats below hero ── */}
        <SlideUp delay={160} style={styles.searchWrap}>
          <TouchableOpacity
            style={styles.searchBar}
            activeOpacity={0.8}
            onPress={() => navigation.navigate('Search')}
          >
            <HugeiconsIcon icon={Search01Icon} size={18} color={colors.textLight} strokeWidth={2.25} />
            <Text style={styles.searchPlaceholder}>Search trails, groups, places…</Text>
          </TouchableOpacity>
        </SlideUp>

        {/* ── Body ── */}
        <View style={styles.body}>

          {/* Quick actions */}
          <Stagger initialDelay={180} step={40}>
            <Text style={styles.sectionTitle}>Quick actions</Text>
            <View style={styles.quickRow}>
              {quickActions.map((a) => (
                <PressableScale
                  key={a.label}
                  style={styles.actionCard}
                  onPress={() => navigation.navigate(a.screen)}
                  scaleTo={0.95}
                >
                  <View style={styles.actionIconWrap}>
                    <HugeiconsIcon icon={a.icon} size={22} color={colors.primary} strokeWidth={2.25} />
                  </View>
                  <Text style={styles.actionLabel}>{a.label}</Text>
                </PressableScale>
              ))}
            </View>
          </Stagger>

          {/* Community Feed Header */}
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>Community Feed</Text>
            <PressableScale onPress={() => navigation.navigate('CreatePost')} hitSlop={8}>
              <Text style={styles.seeAll}>+ New Post</Text>
            </PressableScale>
          </View>

          {loadingFeed ? (
            <View style={styles.trailsLoading}>
              <ActivityIndicator color={colors.primary} size="small" />
              <Text style={styles.trailsLoadingText}>Loading feed…</Text>
            </View>
          ) : feed.length === 0 ? (
            <Card style={styles.emptyFeedCard}>
              <Text style={styles.emptyFeedText}>No posts yet. Be the first to share your journey!</Text>
            </Card>
          ) : (
            <Stagger initialDelay={100} step={40}>
              {feed.map((post) => (
                <Card key={post.id} style={styles.postCard} padding={0}>
                  <View style={styles.postHeader}>
                    <View style={styles.postAvatar}>
                      <Text style={styles.postAvatarText}>{post.user_name?.[0]?.toUpperCase()}</Text>
                    </View>
                    <View style={{ flex: 1 }}>
                      <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6 }}>
                        <Text style={styles.postAuthor}>{post.user_name}</Text>
                        {(post.user_role === 'organizer' || post.user_role === 'admin') && (
                          <View style={styles.postOrgBadge}>
                            <Text style={styles.postOrgBadgeText}>ORGANIZER</Text>
                          </View>
                        )}
                      </View>
                      {post.trail_name && (
                        <Text style={styles.postTrailLoc}>📍 {post.trail_name}</Text>
                      )}
                    </View>
                    <Text style={styles.postTime}>
                      {new Date(post.created_at).toLocaleDateString()}
                    </Text>
                    {post.user_id === user?.id && (
                      <PressableScale onPress={() => handlePostOptions(post)} style={{ padding: 4, marginLeft: 4 }}>
                        <HugeiconsIcon icon={MoreVerticalIcon} size={16} color={colors.textLight} />
                      </PressableScale>
                    )}
                  </View>
                  <Text style={styles.postContent}>{post.content}</Text>
                  
                  {post.image_url && (
                    <View style={styles.postImageWrap}>
                      <Image 
                        source={{ uri: post.image_url.startsWith('http') ? post.image_url : BASE_URL.replace('/api', '') + post.image_url }} 
                        style={styles.postImage} 
                      />
                    </View>
                  )}

                  <View style={styles.postActions}>
                    <PressableScale style={styles.postActionBtn} onPress={() => handleLike(post.id, post.is_liked)}>
                      <HugeiconsIcon icon={FavouriteIcon} size={20} color={post.is_liked ? colors.danger : colors.textLight} fill={post.is_liked ? colors.danger : 'transparent'} />
                      <Text style={[styles.postActionText, post.is_liked && { color: colors.danger }]}>{post.likes_count || 0}</Text>
                    </PressableScale>
                    
                    <PressableScale style={styles.postActionBtn} onPress={() => navigation.navigate('PostDetail', { post })}>
                      <HugeiconsIcon icon={BubbleChatIcon} size={20} color={colors.textLight} />
                      <Text style={styles.postActionText}>{post.comments_count || 0}</Text>
                    </PressableScale>
                  </View>
                </Card>
              ))}
            </Stagger>
          )}

        </View>
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: colors.background },

  /* ── Hero ── */
  hero: {
    width: '100%',
    overflow: 'hidden',
    position: 'relative',
  },
  heroScrim: {
    position: 'absolute', left: 0, right: 0, bottom: 0, height: 160,
  },
  bellBtn: {
    position: 'absolute',
    right: spacing.md,
    width: 40, height: 40, borderRadius: 20,
    backgroundColor: 'rgba(0,0,0,0.28)',
    alignItems: 'center', justifyContent: 'center',
    zIndex: 20,
  },
  notifBadge: {
    position: 'absolute', top: -4, right: -4,
    minWidth: 18, height: 18, borderRadius: 9,
    backgroundColor: colors.accent,
    alignItems: 'center', justifyContent: 'center',
    paddingHorizontal: 4,
    borderWidth: 1.5, borderColor: '#fff',
  },
  notifBadgeText: {
    color: '#fff', fontSize: 10, fontWeight: fontWeight.bold,
  },
  heroContent: {
    position: 'absolute',
    bottom: 26,
    left: spacing.md,
    right: 60,
  },
  greeting: {
    color: 'rgba(255,255,255,0.82)',
    fontSize: fontSize.md,
    fontWeight: fontWeight.medium,
  },
  heroTag: {
    color: '#fff',
    fontSize: fontSize.display,
    fontWeight: fontWeight.black,
    letterSpacing: -1.0,
    marginTop: 2,
  },

  /* ──Search01Icon── */
  searchWrap: {
    paddingHorizontal: spacing.lg,
    marginTop: -28,
    marginBottom: spacing.sm,
    zIndex: 99,
  },
  searchBar: {
    flexDirection: 'row', alignItems: 'center',
    backgroundColor: colors.card,
    borderRadius: radius.round,
    paddingVertical: 16, paddingHorizontal: spacing.lg,
    gap: 12,
    ...shadows.lg,
  },
  searchPlaceholder: { color: colors.textLight, fontSize: fontSize.md, flex: 1 },

  /* ── Body ── */
  body: { paddingHorizontal: spacing.lg, marginTop: spacing.md },

  sectionTitle: {
    fontSize: fontSize.lg, fontWeight: fontWeight.bold, color: colors.text,
    marginBottom: spacing.sm, letterSpacing: -0.2,
  },
  sectionHeader: {
    flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center',
    marginTop: spacing.lg, marginBottom: spacing.sm,
  },
  seeAll: { color: colors.primary, fontSize: fontSize.sm, fontWeight: fontWeight.semiBold },

  quickRow: { flexDirection: 'row', gap: spacing.md, marginBottom: spacing.md },
  actionCard: {
    flex: 1,
    backgroundColor: colors.surface,
    borderRadius: radius.xl,
    padding: spacing.md,
    alignItems: 'center',
  },
  actionIconWrap: {
    width: 48, height: 48, borderRadius: 24,
    backgroundColor: colors.card,
    alignItems: 'center', justifyContent: 'center',
    marginBottom: 10,
    ...shadows.xs,
  },
  actionLabel: { fontSize: fontSize.sm, fontWeight: fontWeight.semiBold, color: colors.text },

  featuredCard: {
    borderRadius: radius.xl,
    overflow: 'hidden',
    height: 180,
    marginBottom: spacing.sm,
    ...shadows.lg,
  },
  featuredContent: {
    flex: 1, justifyContent: 'flex-end', padding: spacing.md,
  },
  featuredTitle: {
    color: '#fff', fontSize: fontSize.xxl, fontWeight: fontWeight.bold,
    marginTop: 6, letterSpacing: -0.3,
  },
  featuredMeta: { flexDirection: 'row', gap: spacing.md, marginTop: 6 },
  metaItem: { flexDirection: 'row', alignItems: 'center', gap: 4 },
  metaText: { color: 'rgba(255,255,255,0.9)', fontSize: fontSize.xs, fontWeight: fontWeight.medium },

  trailsLoading: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 10, paddingVertical: 32 },
  trailsLoadingText: { fontSize: fontSize.sm, color: colors.textSecondary },

  trailCard: { marginBottom: spacing.sm, overflow: 'hidden' },
  trailCover: { height: 110, backgroundColor: colors.primary },
  trailBody: {
    flexDirection: 'row', alignItems: 'center',
    padding: spacing.md, gap: spacing.sm,
  },
  trailName: { fontSize: fontSize.md, fontWeight: fontWeight.bold, color: colors.text, marginBottom: 4 },
  trailMetaRow: { flexDirection: 'row', alignItems: 'center', gap: 4 },
  trailMeta: { fontSize: fontSize.xs, color: colors.textLight, fontWeight: fontWeight.medium },
  postCard: { marginBottom: spacing.lg, padding: spacing.lg, borderRadius: radius.xxl, backgroundColor: colors.card, ...shadows.sm },
  postHeader: { flexDirection: 'row', alignItems: 'center', gap: spacing.md, marginBottom: spacing.md },
  postAvatar: {
    width: 42, height: 42, borderRadius: 21,
    backgroundColor: colors.primaryLight,
    alignItems: 'center', justifyContent: 'center',
  },
  postAvatarText: { color: '#fff', fontSize: fontSize.lg, fontWeight: fontWeight.bold },
  postAuthor: { fontSize: fontSize.md, fontWeight: fontWeight.bold, color: colors.text },
  postTrailLoc: { fontSize: fontSize.xs, color: colors.primary, fontWeight: fontWeight.semiBold, marginTop: 2 },
  postTime: { fontSize: fontSize.xs, color: colors.textLight },
  postContent: { fontSize: fontSize.md, color: colors.text, lineHeight: 24, marginBottom: spacing.md },
  postImageWrap: { borderRadius: radius.xl, overflow: 'hidden', marginBottom: spacing.md },
  postImage: { width: '100%', height: 240, resizeMode: 'cover' },
  postActions: { flexDirection: 'row', gap: spacing.lg, borderTopWidth: 1, borderTopColor: colors.border, paddingTop: spacing.sm },
  postActionBtn: { flexDirection: 'row', alignItems: 'center', gap: 6, paddingVertical: 4 },
  postActionText: { fontSize: fontSize.sm, color: colors.textLight, fontWeight: fontWeight.bold },
  postOrgBadge: { backgroundColor: colors.accent, paddingHorizontal: 6, paddingVertical: 2, borderRadius: 8 },
  postOrgBadgeText: { color: '#fff', fontSize: 9, fontWeight: fontWeight.bold, letterSpacing: 0.5 },
  emptyFeedCard: { padding: spacing.xl, alignItems: 'center', justifyContent: 'center' },
  emptyFeedText: { color: colors.textLight, textAlign: 'center' },
});

export default HomeScreen;
