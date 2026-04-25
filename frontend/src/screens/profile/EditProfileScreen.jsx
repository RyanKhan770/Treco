import { HugeiconsIcon } from '@hugeicons/react-native';
import { useState } from 'react';
import {
  View, Text, StyleSheet, ScrollView, TextInput,
  TouchableOpacity, Alert, KeyboardAvoidingView, Platform, Image,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import * as ImagePicker from 'expo-image-picker';
import { UserIcon, Mail01Icon, CallIcon, MapPinIcon, File02Icon, Camera01Icon } from '@hugeicons/core-free-icons';
import { colors } from '../../constants/colors';
import { fontSize, fontWeight, radius, spacing } from '../../constants/theme';
import ScreenHeader from '../../components/ui/ScreenHeader';
import { PressableScale } from '../../components/ui';
import { useSelector, useDispatch } from 'react-redux';
import { userAPI, BASE_URL } from '../../services/api';
import { setUser } from '../../store/slices/authSlice';

export default function EditProfileScreen({ navigation }) {
  const dispatch = useDispatch();
  const { user } = useSelector((s) => s.auth);

  const [name,      setName]      = useState(user?.name      ?? '');
  const [email,     setEmail]     = useState(user?.email     ?? '');
  const [phone,     setPhone]     = useState(user?.phone     ?? '');
  const [location,  setLocation]  = useState(user?.location  ?? 'Kathmandu, Nepal');
  const [bio,       setBio]       = useState(user?.bio       ?? '');
  const [emergency, setEmergency] = useState(user?.emergency ?? '');
  const [photo,     setPhoto]     = useState(user?.profile_photo ?? null);
  const [saving,    setSaving]    = useState(false);
  const [uploading, setUploading] = useState(false);

  const pickPhoto = async () => {
    const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (status !== 'granted') {
      Alert.alert('Permission needed', 'Please allow access to your photo library.');
      return;
    }
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ['images'],
      allowsEditing: true,
      aspect: [1, 1],
      quality: 0.8,
    });
    if (result.canceled) return;
    const uri = result.assets[0].uri;
    setUploading(true);
    try {
      const res = await userAPI.uploadPhoto(uri);
      setPhoto(res.data.profile_photo);
      dispatch(setUser({ ...user, profile_photo: res.data.profile_photo }));
    } catch {
      Alert.alert('Upload failed', 'Could not upload photo. Please try again.');
    } finally {
      setUploading(false);
    }
  };

  const handleSave = async () => {
    if (!name.trim()) {
      Alert.alert('Name required', 'Please enter your display name.');
      return;
    }
    setSaving(true);
    try {
      const res = await userAPI.updateProfile({ name, phone, bio, location });
      dispatch(setUser({ ...user, ...res.data }));
      Alert.alert('Profile updated', 'Your changes have been saved.', [
        { text: 'OK', onPress: () => navigation.goBack() },
      ]);
    } catch (err) {
      Alert.alert('Error', err?.response?.data?.message || 'Could not save. Please try again.');
    } finally {
      setSaving(false);
    }
  };

  const initial = name.slice(0, 2).toUpperCase() || 'T';
  const photoUri = photo
    ? photo.startsWith('http') ? photo : `${BASE_URL.replace('/api', '')}${photo}`
    : null;

  return (
    <SafeAreaView style={styles.safe}>
      <ScreenHeader
        title="Edit Profile"
        subtitle="Personal info"
        onBack={() => navigation.goBack()}
        right={
          <PressableScale onPress={handleSave} style={styles.saveBtn} scaleTo={0.95}>
            <Text style={styles.saveBtnText}>{saving ? 'Saving…' : 'Save'}</Text>
          </PressableScale>
        }
      />

      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        style={{ flex: 1 }}
      >
        <ScrollView
          showsVerticalScrollIndicator={false}
          contentContainerStyle={styles.content}
          keyboardShouldPersistTaps="handled"
        >
          {/* Avatar */}
          <View style={styles.avatarSection}>
            <TouchableOpacity onPress={pickPhoto} activeOpacity={0.8}>
              {photoUri ? (
                <Image source={{ uri: photoUri }} style={styles.avatarImg} />
              ) : (
                <View style={styles.avatar}>
                  <Text style={styles.avatarText}>{initial}</Text>
                </View>
              )}
              <View style={styles.avatarEdit}>
                <HugeiconsIcon icon={Camera01Icon} size={16} color="#fff" strokeWidth={2.5} />
              </View>
            </TouchableOpacity>
            <Text style={styles.avatarHint}>
              {uploading ? 'Uploading…' : 'Tap to change photo'}
            </Text>
          </View>

          {/* Fields */}
          <Section label="Basic info">
            <Field
              icon={<HugeiconsIcon icon={UserIcon} size={16} color={colors.primary} strokeWidth={2.25} />}
              label="Display name"
              value={name}
              onChangeText={setName}
              placeholder="Your full name"
            />
            <Field
              icon={<HugeiconsIcon icon={Mail01Icon} size={16} color={colors.primary} strokeWidth={2.25} />}
              label="Email"
              value={email}
              onChangeText={setEmail}
              placeholder="you@email.com"
              keyboardType="email-address"
              autoCapitalize="none"
              editable={false}
              isLast
            />
          </Section>

          <Section label="Contact">
            <Field
              icon={<HugeiconsIcon icon={CallIcon} size={16} color={colors.primary} strokeWidth={2.25} />}
              label="Phone"
              value={phone}
              onChangeText={setPhone}
              placeholder="+977 …"
              keyboardType="phone-pad"
              isLast
            />
          </Section>

          <Section label="About">
            <Field
              icon={<HugeiconsIcon icon={MapPinIcon} size={16} color={colors.primary} strokeWidth={2.25} />}
              label="Location"
              value={location}
              onChangeText={setLocation}
              placeholder="City, Country"
            />
            <Field
              icon={<HugeiconsIcon icon={File02Icon} size={16} color={colors.primary} strokeWidth={2.25} />}
              label="Bio"
              value={bio}
              onChangeText={setBio}
              placeholder="Tell other trekkers about yourself…"
              multiline
              numberOfLines={3}
              isLast
            />
          </Section>

          <Section label="Safety">
            <Field
              icon={<HugeiconsIcon icon={CallIcon} size={16} color={colors.error} strokeWidth={2.25} />}
              label="Emergency contact"
              value={emergency}
              onChangeText={setEmergency}
              placeholder="Name & phone number"
              isLast
            />
            <Text style={styles.hint}>
              This contact is notified if you trigger an SOS alert on a trek.
            </Text>
          </Section>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

function Section({ label, children }) {
  return (
    <View style={styles.section}>
      <Text style={styles.sectionLabel}>{label}</Text>
      <View style={styles.sectionCard}>{children}</View>
    </View>
  );
}

function Field({ icon, label, value, onChangeText, placeholder, isLast, multiline, editable = true, ...rest }) {
  const [focused, setFocused] = useState(false);
  return (
    <View style={[styles.field, !isLast && styles.fieldDivider, focused && styles.fieldFocused, !editable && styles.fieldDisabled]}>
      <View style={styles.fieldIcon}>{icon}</View>
      <View style={{ flex: 1 }}>
        <Text style={styles.fieldLabel}>{label}</Text>
        <TextInput
          style={[styles.fieldInput, multiline && styles.fieldInputMulti]}
          value={value}
          onChangeText={onChangeText}
          placeholder={placeholder}
          placeholderTextColor={colors.textMuted}
          onFocus={() => setFocused(true)}
          onBlur={() => setFocused(false)}
          multiline={multiline}
          textAlignVertical={multiline ? 'top' : 'center'}
          editable={editable}
          {...rest}
        />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: colors.background },
  content: { padding: spacing.md, paddingBottom: 48 },

  saveBtn: {
    backgroundColor: colors.primary,
    paddingHorizontal: 16, paddingVertical: 7,
    borderRadius: radius.round,
  },
  saveBtnText: { color: '#fff', fontSize: fontSize.sm, fontWeight: fontWeight.bold },

  avatarSection: { alignItems: 'center', marginVertical: 24 },
  avatar: {
    width: 84, height: 84, borderRadius: 42,
    backgroundColor: colors.primary,
    alignItems: 'center', justifyContent: 'center',
  },
  avatarImg: { width: 84, height: 84, borderRadius: 42 },
  avatarText: { color: '#fff', fontSize: 28, fontWeight: fontWeight.black },
  avatarEdit: {
    position: 'absolute', bottom: 0, right: 0,
    width: 28, height: 28, borderRadius: 14,
    backgroundColor: colors.accent,
    alignItems: 'center', justifyContent: 'center',
    borderWidth: 2, borderColor: '#fff',
  },
  avatarHint: { marginTop: 8, fontSize: fontSize.xs, color: colors.textLight },

  section: { marginBottom: 20 },
  sectionLabel: {
    fontSize: fontSize.xs, fontWeight: fontWeight.bold,
    color: colors.primaryLight, letterSpacing: 2,
    textTransform: 'uppercase', marginBottom: spacing.sm, paddingLeft: 4,
  },
  sectionCard: {
    backgroundColor: colors.card,
    borderRadius: radius.lg,
    overflow: 'hidden',
    borderWidth: 1, borderColor: colors.border,
  },

  field: {
    flexDirection: 'row', alignItems: 'flex-start',
    paddingHorizontal: 16, paddingVertical: 12, gap: 12,
  },
  fieldDivider: { borderBottomWidth: 1, borderBottomColor: colors.border },
  fieldFocused: { backgroundColor: colors.primaryPale + '30' },
  fieldDisabled: { opacity: 0.5 },
  fieldIcon: { marginTop: 2 },
  fieldLabel: {
    fontSize: 11, fontWeight: fontWeight.bold,
    color: colors.textLight, letterSpacing: 0.5,
    textTransform: 'uppercase', marginBottom: 4,
  },
  fieldInput: {
    fontSize: fontSize.md, color: colors.text,
    fontWeight: fontWeight.medium, paddingVertical: 0,
  },
  fieldInputMulti: { minHeight: 60, lineHeight: 22 },
  hint: {
    fontSize: fontSize.xs, color: colors.textLight,
    paddingHorizontal: 16, paddingBottom: 12, lineHeight: 18,
  },
});
