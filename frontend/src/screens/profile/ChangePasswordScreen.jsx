import { HugeiconsIcon } from '@hugeicons/react-native';
import React, { useState } from 'react';
import {
  View, Text, StyleSheet, TextInput, TouchableOpacity,
  Alert, KeyboardAvoidingView, Platform, ScrollView,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { LockIcon, ViewIcon, ViewOffIcon, Shield01Icon } from '@hugeicons/core-free-icons';
import { authAPI } from '../../services/api';
import { colors } from '../../constants/colors';
import { fontSize, fontWeight, radius, spacing } from '../../constants/theme';
import ScreenHeader from '../../components/ui/ScreenHeader';
import { PressableScale } from '../../components/ui';

export default function ChangePasswordScreen({ navigation }) {
  const [current,  setCurrent]  = useState('');
  const [next,     setNext]     = useState('');
  const [confirm,  setConfirm]  = useState('');
  const [showCur,  setShowCur]  = useState(false);
  const [showNew,  setShowNew]  = useState(false);
  const [showCon,  setShowCon]  = useState(false);
  const [loading,  setLoading]  = useState(false);

  const strength = (() => {
    if (!next) return null;
    let s = 0;
    if (next.length >= 8)          s++;
    if (/[A-Z]/.test(next))        s++;
    if (/[0-9]/.test(next))        s++;
    if (/[^a-zA-Z0-9]/.test(next)) s++;
    return s; // 0–4
  })();

  const strengthLabel = ['Weak', 'Fair', 'Good', 'Strong'][strength - 1] ?? '';
  const strengthColor = ['#EF4444', '#F59E0B', '#22C55E', colors.primary][strength - 1] ?? colors.border;

  const handleSubmit = async () => {
    if (!current) { Alert.alert('Error', 'Enter your current password.'); return; }
    if (next.length < 8) { Alert.alert('Too short', 'New password must be at least 8 characters.'); return; }
    if (next !== confirm) { Alert.alert('Mismatch', 'New passwords don\'t match.'); return; }

    setLoading(true);
    try {
      await authAPI.changePassword({ currentPassword: current, newPassword: next });
      Alert.alert('Password changed', "You'll need to log in again on other devices.", [
        { text: 'OK', onPress: () => navigation.goBack() },
      ]);
    } catch (err) {
      Alert.alert('Error', err?.response?.data?.message || 'Could not change password. Try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <SafeAreaView style={styles.safe}>
      <ScreenHeader title="Change Password" subtitle="Security" onBack={() => navigation.goBack()} />

      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        style={{ flex: 1 }}
      >
        <ScrollView
          contentContainerStyle={styles.content}
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}
        >
          {/* Icon banner */}
          <View style={styles.banner}>
            <View style={styles.bannerIcon}>
              <HugeiconsIcon icon={Shield01Icon} size={32} color={colors.primary} strokeWidth={1.8} />
            </View>
            <Text style={styles.bannerTitle}>Update your password</Text>
            <Text style={styles.bannerSub}>
              Use a strong password with a mix of letters, numbers, and symbols.
            </Text>
          </View>

          <View style={styles.card}>
            <PasswordField
              label="Current password"
              value={current}
              onChange={setCurrent}
              show={showCur}
              onToggle={() => setShowCur((v) => !v)}
            />
            <View style={styles.divider} />
            <PasswordField
              label="New password"
              value={next}
              onChange={setNext}
              show={showNew}
              onToggle={() => setShowNew((v) => !v)}
            />
            {/* Strength bar */}
            {next.length > 0 && (
              <View style={styles.strengthWrap}>
                <View style={styles.strengthBarBg}>
                  <View style={[styles.strengthBarFill, { width: `${(strength / 4) * 100}%`, backgroundColor: strengthColor }]} />
                </View>
                <Text style={[styles.strengthLabel, { color: strengthColor }]}>{strengthLabel}</Text>
              </View>
            )}
            <View style={styles.divider} />
            <PasswordField
              label="Confirm new password"
              value={confirm}
              onChange={setConfirm}
              show={showCon}
              onToggle={() => setShowCon((v) => !v)}
              isLast
            />
            {confirm.length > 0 && next !== confirm && (
              <Text style={styles.mismatch}>Passwords don't match</Text>
            )}
          </View>

          <View style={styles.tips}>
            <Text style={styles.tipsTitle}>Password tips</Text>
            {[
              'At least 8 characters',
              'Mix of uppercase and lowercase',
              'Include numbers and symbols',
              'Don\'t reuse old passwords',
            ].map((tip, i) => (
              <View key={i} style={styles.tipRow}>
                <View style={styles.tipDot} />
                <Text style={styles.tipText}>{tip}</Text>
              </View>
            ))}
          </View>

          <PressableScale
            style={[styles.submitBtn, loading && styles.submitBtnDisabled]}
            onPress={handleSubmit}
            scaleTo={0.97}
          >
            <HugeiconsIcon icon={LockIcon} size={16} color="#fff" strokeWidth={2.5} />
            <Text style={styles.submitBtnText}>
              {loading ? 'Updating…' : 'Update password'}
            </Text>
          </PressableScale>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

function PasswordField({ label, value, onChange, show, onToggle, isLast }) {
  return (
    <View style={[styles.field, isLast && { borderBottomWidth: 0 }]}>
      <HugeiconsIcon icon={LockIcon} size={15} color={colors.textLight} strokeWidth={2.25} />
      <View style={{ flex: 1 }}>
        <Text style={styles.fieldLabel}>{label}</Text>
        <TextInput
          style={styles.fieldInput}
          value={value}
          onChangeText={onChange}
          secureTextEntry={!show}
          placeholder="••••••••"
          placeholderTextColor={colors.textMuted}
          autoCapitalize="none"
          autoCorrect={false}
        />
      </View>
      <TouchableOpacity onPress={onToggle} hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}>
        {show
          ? <HugeiconsIcon icon={ViewOffIcon} size={17} color={colors.textLight} strokeWidth={2} />
          : <HugeiconsIcon icon={ViewIcon}    size={17} color={colors.textLight} strokeWidth={2} />
        }
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: colors.background },
  content: { padding: spacing.md, paddingBottom: 48 },

  banner: { alignItems: 'center', paddingVertical: 28 },
  bannerIcon: {
    width: 72, height: 72, borderRadius: 36,
    backgroundColor: colors.primaryPale,
    alignItems: 'center', justifyContent: 'center',
    marginBottom: 14,
  },
  bannerTitle: { fontSize: fontSize.lg, fontWeight: fontWeight.bold, color: colors.text, marginBottom: 6 },
  bannerSub: {
    fontSize: fontSize.sm, color: colors.textSecondary,
    textAlign: 'center', maxWidth: 260, lineHeight: 20,
  },

  card: {
    backgroundColor: colors.card,
    borderRadius: radius.lg,
    borderWidth: 1, borderColor: colors.border,
    overflow: 'hidden', marginBottom: 20,
  },
  divider: { height: 1, backgroundColor: colors.border },

  field: {
    flexDirection: 'row', alignItems: 'center',
    paddingHorizontal: 16, paddingVertical: 14, gap: 12,
  },
  fieldLabel: {
    fontSize: 11, color: colors.textLight,
    fontWeight: fontWeight.bold, letterSpacing: 0.5,
    textTransform: 'uppercase', marginBottom: 3,
  },
  fieldInput: {
    fontSize: fontSize.md, color: colors.text,
    fontWeight: fontWeight.medium, letterSpacing: 1,
  },

  strengthWrap: {
    flexDirection: 'row', alignItems: 'center', gap: 10,
    paddingHorizontal: 16, paddingBottom: 10,
  },
  strengthBarBg: { flex: 1, height: 4, borderRadius: 2, backgroundColor: colors.border },
  strengthBarFill: { height: 4, borderRadius: 2 },
  strengthLabel: { fontSize: 11, fontWeight: fontWeight.bold, minWidth: 44 },
  mismatch: { fontSize: 11, color: colors.error, paddingHorizontal: 16, paddingBottom: 10 },

  tips: { marginBottom: 24 },
  tipsTitle: {
    fontSize: fontSize.sm, fontWeight: fontWeight.bold,
    color: colors.textSecondary, marginBottom: 10,
  },
  tipRow: { flexDirection: 'row', alignItems: 'center', gap: 8, marginBottom: 6 },
  tipDot: { width: 6, height: 6, borderRadius: 3, backgroundColor: colors.accent },
  tipText: { fontSize: fontSize.sm, color: colors.textSecondary },

  submitBtn: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 8,
    backgroundColor: colors.primary, borderRadius: radius.round,
    paddingVertical: 15,
  },
  submitBtnDisabled: { opacity: 0.6 },
  submitBtnText: { color: '#fff', fontSize: fontSize.md, fontWeight: fontWeight.bold },
});
