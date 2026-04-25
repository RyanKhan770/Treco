import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView, TextInput, KeyboardAvoidingView, Platform, ActivityIndicator, Image, Alert } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { HugeiconsIcon } from '@hugeicons/react-native';
import { ArrowLeft02Icon, FavouriteIcon, SentIcon, MoreVerticalIcon } from '@hugeicons/core-free-icons';
import { colors } from '../../constants/colors';
import { fontSize, fontWeight, radius, spacing } from '../../constants/theme';
import { PressableScale, Card, Stagger } from '../../components/ui';
import { postsAPI, BASE_URL } from '../../services/api';
import { useAuth } from '../../context/AuthContext';

const PostDetailScreen = ({ navigation, route }) => {
  const { user } = useAuth();
  const { post } = route.params;
  const [comments, setComments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [newComment, setNewComment] = useState('');
  const [submitting, setSubmitting] = useState(false);

  // Local state for like toggle
  const [isLiked, setIsLiked] = useState(post.is_liked);
  const [likesCount, setLikesCount] = useState(Number(post.likes_count) || 0);

  useEffect(() => {
    postsAPI.getComments(post.id)
      .then(res => setComments(res.data || []))
      .catch(() => {})
      .finally(() => setLoading(false));
  }, [post.id]);

  const handleLike = async () => {
    setIsLiked(!isLiked);
    setLikesCount(prev => isLiked ? Math.max(prev - 1, 0) : prev + 1);
    try {
      await postsAPI.like(post.id);
    } catch (err) {
      setIsLiked(isLiked);
      setLikesCount(isLiked ? likesCount : Math.max(likesCount - 1, 0));
    }
  };

  const handleComment = async () => {
    if (!newComment.trim()) return;
    setSubmitting(true);
    try {
      const res = await postsAPI.postComment(post.id, newComment);
      setComments(prev => [...prev, res.data]);
      setNewComment('');
    } catch (err) {
      alert('Failed to post comment.');
    } finally {
      setSubmitting(false);
    }
  };

  const confirmDeletePost = () => {
    Alert.alert('Delete Post', 'Are you sure you want to delete this post?', [
      { text: 'Cancel', style: 'cancel' },
      { 
        text: 'Delete', 
        style: 'destructive', 
        onPress: async () => {
          try {
            await postsAPI.deletePost(post.id);
            navigation.goBack();
          } catch (err) {
            Alert.alert('Error', 'Failed to delete post.');
          }
        } 
      }
    ]);
  };

  const handlePostOptions = () => {
    Alert.alert('Post Options', 'What would you like to do?', [
      { text: 'Edit', onPress: () => navigation.navigate('CreatePost', { editPostId: post.id, initialContent: post.content, initialImage: post.image_url ? (post.image_url.startsWith('http') ? post.image_url : BASE_URL.replace('/api', '') + post.image_url) : null }) },
      { text: 'Delete', style: 'destructive', onPress: confirmDeletePost },
      { text: 'Cancel', style: 'cancel' }
    ]);
  };

  return (
    <SafeAreaView style={styles.safe} edges={['top']}>
      <View style={styles.header}>
        <PressableScale onPress={() => navigation.goBack()} style={styles.backBtn}>
          <HugeiconsIcon icon={ArrowLeft02Icon} size={24} color={colors.text} />
        </PressableScale>
        <Text style={styles.headerTitle}>Post</Text>
        <View style={{ width: 40 }} />
      </View>

      <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : undefined} style={{ flex: 1 }}>
        <ScrollView style={styles.content} contentContainerStyle={{ paddingBottom: spacing.xxl }}>
          
          {/* Main Post Card */}
          <Card style={styles.postCard} padding={0}>
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
              {post.user_id === user?.id && (
                <PressableScale onPress={handlePostOptions} style={{ padding: 4, marginLeft: 4 }}>
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
              <PressableScale style={styles.postActionBtn} onPress={handleLike}>
                <HugeiconsIcon icon={FavouriteIcon} size={20} color={isLiked ? colors.danger : colors.textLight} fill={isLiked ? colors.danger : 'transparent'} />
                <Text style={[styles.postActionText, isLiked && { color: colors.danger }]}>{likesCount}</Text>
              </PressableScale>
              <View style={styles.postActionBtn}>
                <Text style={styles.postActionText}>{comments.length} Comments</Text>
              </View>
            </View>
          </Card>

          {/* Comments Section */}
          <Text style={styles.sectionTitle}>Comments</Text>
          
          {loading ? (
            <ActivityIndicator color={colors.primary} style={{ marginTop: spacing.xl }} />
          ) : comments.length === 0 ? (
            <Text style={styles.emptyText}>No comments yet.</Text>
          ) : (
            <Stagger initialDelay={100} step={40}>
              {comments.map((comment) => (
                <View key={comment.id} style={styles.commentRow}>
                  <View style={[styles.postAvatar, { width: 32, height: 32, borderRadius: 16 }]}>
                    <Text style={[styles.postAvatarText, { fontSize: 14 }]}>{comment.user_name?.[0]?.toUpperCase()}</Text>
                  </View>
                  <View style={styles.commentBubble}>
                    <Text style={styles.commentAuthor}>{comment.user_name}</Text>
                    <Text style={styles.commentText}>{comment.content}</Text>
                  </View>
                </View>
              ))}
            </Stagger>
          )}
        </ScrollView>

        {/* Comment Input */}
        <View style={styles.inputArea}>
          <TextInput
            style={styles.input}
            placeholder="Write a comment..."
            placeholderTextColor={colors.textMuted}
            value={newComment}
            onChangeText={setNewComment}
            multiline
          />
          <PressableScale 
            style={[styles.sendBtn, (!newComment.trim() || submitting) && { opacity: 0.5 }]} 
            onPress={handleComment}
            disabled={!newComment.trim() || submitting}
          >
            {submitting ? <ActivityIndicator size="small" color="#fff" /> : <HugeiconsIcon icon={SentIcon} size={18} color="#fff" />}
          </PressableScale>
        </View>
      </KeyboardAvoidingView>
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
  content: { padding: spacing.md },
  
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
  postContent: { fontSize: fontSize.md, color: colors.textSecondary, lineHeight: 22, marginBottom: spacing.sm },
  postImageWrap: { borderRadius: radius.lg, overflow: 'hidden', marginBottom: spacing.md },
  postImage: { width: '100%', height: 200, resizeMode: 'cover' },
  postActions: { flexDirection: 'row', gap: spacing.lg, borderTopWidth: 1, borderTopColor: colors.border, paddingTop: spacing.sm },
  postActionBtn: { flexDirection: 'row', alignItems: 'center', gap: 6, paddingVertical: 4 },
  postActionText: { fontSize: fontSize.sm, color: colors.textLight, fontWeight: fontWeight.bold },
  postOrgBadge: { backgroundColor: colors.accent, paddingHorizontal: 6, paddingVertical: 2, borderRadius: 8 },
  postOrgBadgeText: { color: '#fff', fontSize: 9, fontWeight: fontWeight.bold, letterSpacing: 0.5 },

  sectionTitle: { fontSize: fontSize.lg, fontWeight: fontWeight.bold, color: colors.text, marginBottom: spacing.md, paddingHorizontal: spacing.sm },
  emptyText: { color: colors.textLight, textAlign: 'center', marginTop: spacing.lg },
  
  commentRow: { flexDirection: 'row', gap: spacing.sm, marginBottom: spacing.md, paddingHorizontal: spacing.sm },
  commentBubble: { flex: 1, backgroundColor: colors.card, padding: spacing.md, borderRadius: radius.lg },
  commentAuthor: { fontSize: fontSize.sm, fontWeight: fontWeight.bold, color: colors.text, marginBottom: 2 },
  commentText: { fontSize: fontSize.md, color: colors.textSecondary },

  inputArea: {
    flexDirection: 'row', alignItems: 'flex-end', gap: spacing.sm,
    padding: spacing.md, backgroundColor: colors.surface,
    borderTopWidth: 1, borderTopColor: colors.border,
  },
  input: {
    flex: 1, backgroundColor: colors.background,
    borderWidth: 1, borderColor: colors.border,
    borderRadius: radius.xl, paddingHorizontal: spacing.md, paddingVertical: 12,
    fontSize: fontSize.md, color: colors.text, minHeight: 44, maxHeight: 100,
  },
  sendBtn: {
    width: 44, height: 44, borderRadius: 22,
    backgroundColor: colors.primary,
    alignItems: 'center', justifyContent: 'center',
  },
});

export default PostDetailScreen;
