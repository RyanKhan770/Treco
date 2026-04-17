import React, { useState } from 'react';
import {
  View, Text, StyleSheet, ScrollView, TextInput,
  TouchableOpacity, Alert, KeyboardAvoidingView, Platform,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { User, Mail, Phone, MapPin, FileText, Camera } from 'lucide-react-native';
import { colors } from '../../constants/colors';
import { fontSize, fontWeight, radius, spacing } from '../../constants/theme';
import ScreenHeader from '../../components/ui/ScreenHeader';
import { PressableScale } from '../../components/ui';
import { useSelector } from 'react-redux';

export default function EditProfileScreen({ navigation }) {
  const { user } = useSelector((s) => s.auth);

  const [name,      setName]      = useState(user?.name      ?? 'Ryan Khan');
  const [username,  setUsername]  = useState(user?.username  ?? 'ryankhan');
  const [email,     setEmail]     = useState(user?.email     ?? 'ryankhan770@gmail.com');
  const [phone,     setPhone]     = useState(user?.phone     ?? '');
  const [location,  setLocation]  = useState(user?.location  ?? 'Kathmandu, Nepal');
  const [bio,       setBio]       = useState(user?.bio       ?? 'Trekking enthusiast exploring Nepal\'s trails one summit at a time. 🏔️');
  const [emergency, setEmergency] = useState(user?.emergency ?? '');
  const [saving,    setSaving]    = useState(false);

  const handleSave = async () => {
    if (!name.trim()) {
      Alert.alert('Name required', 'Please enter your display name.');
      return;
    }
    setSaving(true);
    // TODO: wire to API  —  PUT /api/users/profile
    await new Promise((r) => setTimeout(r, 800));
    setSaving(false);
    Alert.alert('Profile updated', 'Your changes have been saved.', [
      { text: 'OK', onPress: () => navigation.goBack() },
    ]);
  };

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
            <View style={styles.avatar}>
              <Text style={styles.avatarText}>
                {name.slice(0, 2).toUpperCase()}
              </Text>
            </View>
            <TouchableOpacity style={styles.avatarEdit} activeOpacity={0.8}>
              <Camera size={16} color="#fff" strokeWidth={2.5} />
            </TouchableOpacity>
            <Text style={styles.avatarHint}>Tap to change photo</Text>
          </View>

          {/* Fields */}
          <Section label="Basic info">
            <Field
              icon={<User size={16} color={colors.primary} strokeWidth={2.25} />}
              label="Display name"
              value={name}
              onChangeText={setName}
              placeholder="Your full name"
            />
            <Field
              icon={<Text style={styles.atSign}>@</Text>}
              label="Username"
              value={username}
              onChangeText={(t) => setUsername(t.toLowerCase().replace(/\s/g, ''))}
              placeholder="username"
              autoCapitalize="none"
              isLast
            />
          </Section>

          <Section label="Contact">
            <Field
              icon={<Mail size={16} color={colors.primary} strokeWidth={2.25} />}
              label="Email"
              value={email}
              onChangeText={setEmail}
              placeholder="you@email.com"
              keyboardType="email-address"
              autoCapitalize="none"
            />
            <Field
              icon={<Phone size={16} color={colors.primary} strokeWidth={2.25} />}
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
              icon={<MapPin size={16} color={colors.primary} strokeWidth={2.25} />}
              label="Location"
              value={location}
              onChangeText={setLocation}
              placeholder="City, Country"
            />
            <Field
              icon={<FileText size={16} color={colors.primary} strokeWidth={2.25} />}
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
              icon={<Phone size={16} color={colors.error} strokeWidth={2.25} />}
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

function Field({ icon, label, value, onChangeText, placeholder, isLast, multiline, ...rest }) {
  const [focused, setFocused] = useState(false);
  return (
    <View style={[styles.field, !isLast && styles.fieldDivider, focused && styles.fieldFocused]}>
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

  /* Avatar */
  avatarSection: { alignItems: 'center', marginVertical: 24 },
  avatar: {
    width: 84, height: 84, borderRadius: 42,
    backgroundColor: colors.primary,
    alignItems: 'center', justifyContent: 'center',
  },
  avatarText: { color: '#fff', fontSize: 28, fontWeight: fontWeight.black },
  avatarEdit: {
    position: 'absolute', bottom: 26, right: '33%',
    width: 28, height: 28, borderRadius: 14,
    backgroundColor: colors.accent,
    alignItems: 'center', justifyContent: 'center',
    borderWidth: 2, borderColor: '#fff',
  },
  avatarHint: { marginTop: 8, fontSize: fontSize.xs, color: colors.textLight },

  /* Section */
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

  /* Field */
  field: {
    flexDirection: 'row', alignItems: 'flex-start',
    paddingHorizontal: 16, paddingVertical: 12, gap: 12,
  },
  fieldDivider: { borderBottomWidth: 1, borderBottomColor: colors.border },
  fieldFocused: { backgroundColor: colors.primaryPale + '30' },
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
  atSign: {
    fontSize: 17, fontWeight: fontWeight.black,
    color: colors.primary, lineHeight: 22,
  },
  hint: {
    fontSize: fontSize.xs, color: colors.textLight,
    paddingHorizontal: 16, paddingBottom: 12, lineHeight: 18,
  },
});
