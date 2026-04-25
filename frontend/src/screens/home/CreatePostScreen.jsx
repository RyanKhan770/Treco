import React, { useState } from 'react';
import { View, Text, StyleSheet, TextInput, Image, KeyboardAvoidingView, Platform, ScrollView } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { HugeiconsIcon } from '@hugeicons/react-native';
import { Camera01Icon, Cancel01Icon, ImageIcon } from '@hugeicons/core-free-icons';
import * as ImagePicker from 'expo-image-picker';
import { colors } from '../../constants/colors';
import { fontSize, fontWeight, radius, spacing } from '../../constants/theme';
import { Button, PressableScale } from '../../components/ui';
import { postsAPI } from '../../services/api';

const CreatePostScreen = ({ navigation, route }) => {
  const [content, setContent] = useState(route.params?.initialContent || '');
  const [imageUri, setImageUri] = useState(route.params?.initialImage || null);
  const [loading, setLoading] = useState(false);
  const editPostId = route.params?.editPostId;

  // Optional trail context passed from TrailDetailScreen
  const trailId = route.params?.trailId;
  const trailName = route.params?.trailName;

  const pickImage = async () => {
    const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (status !== 'granted') {
      alert('Sorry, we need camera roll permissions to make this work!');
      return;
    }
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      quality: 0.8,
    });
    if (!result.canceled) {
      setImageUri(result.assets[0].uri);
    }
  };

  const handlePost = async () => {
    if (!content.trim()) return;
    setLoading(true);
    try {
      if (editPostId) {
        await postsAPI.updatePost(editPostId, content);
      } else {
        await postsAPI.create(content, trailId, imageUri);
      }
      navigation.goBack();
    } catch (err) {
      alert(editPostId ? 'Failed to update post.' : 'Failed to create post. Please try again.');
      setLoading(false);
    }
  };

  return (
    <SafeAreaView style={styles.safe} edges={['top', 'bottom']}>
      <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : undefined} style={{ flex: 1 }}>
        <View style={styles.header}>
          <PressableScale onPress={() => navigation.goBack()} style={styles.closeBtn}>
            <HugeiconsIcon icon={Cancel01Icon} size={24} color={colors.text} />
          </PressableScale>
          <Text style={styles.headerTitle}>{editPostId ? 'Edit Post' : 'Create Post'}</Text>
          <Button 
            label={editPostId ? 'Update' : 'Post'} 
            onPress={handlePost} 
            loading={loading}
            disabled={!content.trim() || loading}
            size="sm"
            style={styles.postBtn}
          />
        </View>

        <ScrollView style={styles.content} keyboardShouldPersistTaps="handled">
          {trailName && (
            <View style={styles.trailBadge}>
              <Text style={styles.trailBadgeText}>📍 at {trailName}</Text>
            </View>
          )}

          <TextInput
            style={styles.input}
            placeholder="Share your trek experience..."
            placeholderTextColor={colors.textMuted}
            multiline
            autoFocus
            value={content}
            onChangeText={setContent}
          />

          {imageUri && (
            <View style={styles.imagePreviewWrap}>
              <Image source={{ uri: imageUri }} style={styles.imagePreview} />
              <PressableScale style={styles.removeImageBtn} onPress={() => setImageUri(null)}>
                <HugeiconsIcon icon={Cancel01Icon} size={16} color="#fff" />
              </PressableScale>
            </View>
          )}
        </ScrollView>

        {!editPostId && (
          <View style={styles.toolbar}>
            <PressableScale style={styles.toolbarBtn} onPress={pickImage}>
              <HugeiconsIcon icon={ImageIcon} size={24} color={colors.primary} />
              <Text style={styles.toolbarBtnText}>Photo</Text>
            </PressableScale>
          </View>
        )}
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
  closeBtn: { padding: 8, marginLeft: -8 },
  headerTitle: { fontSize: fontSize.lg, fontWeight: fontWeight.bold, color: colors.text },
  postBtn: { minWidth: 80 },
  content: { flex: 1, padding: spacing.lg },
  trailBadge: {
    backgroundColor: colors.primaryLight, alignSelf: 'flex-start',
    paddingHorizontal: 12, paddingVertical: 6, borderRadius: radius.full,
    marginBottom: spacing.md,
  },
  trailBadgeText: { color: colors.primaryDark, fontSize: fontSize.sm, fontWeight: fontWeight.bold },
  input: {
    fontSize: fontSize.xl, color: colors.text,
    minHeight: 120, textAlignVertical: 'top',
    marginBottom: spacing.xl,
  },
  imagePreviewWrap: { position: 'relative', borderRadius: radius.xl, overflow: 'hidden' },
  imagePreview: { width: '100%', height: 300, resizeMode: 'cover' },
  removeImageBtn: {
    position: 'absolute', top: 12, right: 12,
    backgroundColor: 'rgba(0,0,0,0.6)',
    width: 32, height: 32, borderRadius: 16,
    alignItems: 'center', justifyContent: 'center',
  },
  toolbar: {
    flexDirection: 'row', padding: spacing.md,
    borderTopWidth: 1, borderTopColor: colors.border,
    backgroundColor: colors.surface,
  },
  toolbarBtn: { flexDirection: 'row', alignItems: 'center', gap: 8, padding: 8 },
  toolbarBtnText: { color: colors.primary, fontSize: fontSize.md, fontWeight: fontWeight.bold },
});

export default CreatePostScreen;
