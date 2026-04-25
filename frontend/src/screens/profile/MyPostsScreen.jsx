import { HugeiconsIcon } from '@hugeicons/react-native';
import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView, ActivityIndicator, Alert, Dimensions, Image } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { ArrowLeft02Icon, MoreVerticalCircle01Icon, FavouriteIcon, BubbleChatIcon } from '@hugeicons/core-free-icons';
import { colors } from '../../constants/colors';
import { fontSize, fontWeight, radius, spacing } from '../../constants/theme';
import { Card, PressableScale, Stagger } from '../../components/ui';
import { postsAPI, BASE_URL } from '../../services/api';
import { useAuth } from '../../context/AuthContext';

const { width: W } = Dimensions.get('window');

const MyPostsScreen = ({ navigation }) => {
  const { user } = useAuth();
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchPosts();
  }, []);

  const fetchPosts = async () => {
    try {
      const res = await postsAPI.getUserPosts('me');
      setPosts(res.data || []);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
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
            setPosts(prev => prev.filter(p => p.id !== postId));
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
    <SafeAreaView style={styles.safe} edges={['top']}>
      <View style={styles.header}>
        <PressableScale onPress={() => navigation.goBack()} style={styles.backBtn}>
          <HugeiconsIcon icon={ArrowLeft02Icon} size={24} color={colors.text} />
        </PressableScale>
        <Text style={styles.headerTitle}>My Posts</Text>
        <View style={{ width: 40 }} />
      </View>

      {loading ? (
        <View style={styles.center}>
          <ActivityIndicator color={colors.primary} size="large" />
        </View>
      ) : posts.length === 0 ? (
        <View style={styles.center}>
          <Text style={styles.emptyText}>You haven't posted anything yet.</Text>
        </View>
      ) : (
        <ScrollView contentContainerStyle={styles.content}>
          <Stagger initialDelay={100} step={40}>
            {posts.map((post) => (
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
                    {post.trail_name && <Text style={styles.postTrailLoc}>📍 {post.trail_name}</Text>}
                  </View>
                  <Text style={styles.postTime}>{new Date(post.created_at).toLocaleDateString()}</Text>
                  <PressableScale onPress={() => handlePostOptions(post)} style={{ padding: 4, marginLeft: 4 }}>
                    <HugeiconsIcon icon={MoreVerticalCircle01Icon} size={16} color={colors.textLight} />
                  </PressableScale>
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
                  <PressableScale 
                    style={styles.postActionBtn} 
                    onPress={() => navigation.navigate('PostDetail', { post })}
                  >
                    <HugeiconsIcon icon={BubbleChatIcon} size={20} color={colors.textLight} />
                    <Text style={styles.postActionText}>{post.comments_count || 0}</Text>
                  </PressableScale>
                  <View style={styles.postActionBtn}>
                    <HugeiconsIcon icon={FavouriteIcon} size={20} color={post.is_liked ? colors.danger : colors.textLight} fill={post.is_liked ? colors.danger : 'transparent'} />
                    <Text style={[styles.postActionText, post.is_liked && { color: colors.danger }]}>{post.likes_count || 0}</Text>
                  </View>
                </View>
              </Card>
            ))}
          </Stagger>
        </ScrollView>
      )}
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: colors.background },
  header: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
    paddingHorizontal: spacing.md, paddingVertical: spacing.sm,
    borderBottomWidth: 1, borderBottomColor: colors.border,
  },
  backBtn: { padding: 8, marginLeft: -8 },
  headerTitle: { fontSize: fontSize.lg, fontWeight: fontWeight.bold, color: colors.text },
  center: { flex: 1, alignItems: 'center', justifyContent: 'center' },
  emptyText: { color: colors.textLight, fontSize: fontSize.md },
  content: { padding: spacing.md, paddingBottom: spacing.xxl },

  postCard: { marginBottom: spacing.xl, padding: spacing.lg, borderRadius: radius.xl },
  postHeader: { flexDirection: 'row', alignItems: 'center', gap: spacing.sm, marginBottom: spacing.sm },
  postAvatar: {
    width: 36, height: 36, borderRadius: 18,
    backgroundColor: colors.primary,
    alignItems: 'center', justifyContent: 'center',
  },
  postAvatarText: { color: '#fff', fontSize: fontSize.md, fontWeight: fontWeight.bold },
  postAuthor: { fontSize: fontSize.md, fontWeight: fontWeight.bold, color: colors.text },
  postTrailLoc: { fontSize: fontSize.xs, color: colors.primary, fontWeight: fontWeight.bold, marginTop: 2 },
  postTime: { fontSize: fontSize.xs, color: colors.textLight },
  postOrgBadge: { backgroundColor: colors.accent, paddingHorizontal: 6, paddingVertical: 2, borderRadius: 8 },
  postOrgBadgeText: { color: '#fff', fontSize: 9, fontWeight: fontWeight.bold, letterSpacing: 0.5 },
  postContent: { fontSize: fontSize.md, color: colors.textSecondary, lineHeight: 22, marginBottom: spacing.sm },
  postImageWrap: { borderRadius: radius.lg, overflow: 'hidden', marginBottom: spacing.md },
  postImage: { width: '100%', height: 200, resizeMode: 'cover' },
  postActions: { flexDirection: 'row', gap: spacing.lg, borderTopWidth: 1, borderTopColor: colors.border, paddingTop: spacing.sm },
  postActionBtn: { flexDirection: 'row', alignItems: 'center', gap: 6, paddingVertical: 4 },
  postActionText: { fontSize: fontSize.sm, color: colors.textLight, fontWeight: fontWeight.bold },
});

export default MyPostsScreen;
