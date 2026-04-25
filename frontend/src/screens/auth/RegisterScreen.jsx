import { HugeiconsIcon } from '@hugeicons/react-native';
import React, { useState } from 'react';
import {
  View, Text, StyleSheet, ScrollView, StatusBar, Alert,
  KeyboardAvoidingView, Platform, Dimensions,
} from 'react-native';
import { UserIcon, Mail01Icon, CallIcon, LockIcon, Shield01Icon, ArrowRight01Icon, ArrowLeft02Icon } from '@hugeicons/core-free-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { colors } from '../../constants/colors';
import { fontSize, fontWeight, radius, shadows, spacing } from '../../constants/theme';
import { authAPI } from '../../services/api';
import { useAuth } from '../../context/AuthContext';
import MountainScene from '../../assets/svg/MountainScene';
import { Input, Button, PressableScale, SlideUp, FadeIn } from '../../components/ui';

const { width: W } = Dimensions.get('window');

const RegisterScreen = ({ navigation }) => {
  const { login } = useAuth();
  const [form, setForm] = useState({
    fullName: '', email: '', phone: '', password: '', confirmPassword: '',
  });
  const [loading, setLoading] = useState(false);
  const update = (k, v) => setForm((p) => ({ ...p, [k]: v }));

  const handleRegister = async () => {
    const { fullName, email, phone, password, confirmPassword } = form;
    if (!fullName || !email || !phone || !password) {
      Alert.alert('Error', 'Please fill in all fields.'); return;
    }
    if (password !== confirmPassword) {
      Alert.alert('Error', 'Passwords do not match.'); return;
    }
    if (password.length < 6) {
      Alert.alert('Error', 'Password must be at least 6 characters.'); return;
    }
    setLoading(true);
    try {
      const res = await authAPI.register({
        name: fullName.trim(),
        email: email.trim().toLowerCase(),
        phone: phone.trim(),
        password,
      });
      await login(res.data.user, res.data.token);
    } catch (err) {
      Alert.alert('Registration Failed', err.response?.data?.message || 'Something went wrong.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <KeyboardAvoidingView
      style={{ flex: 1, backgroundColor: colors.primaryDark }}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
    >
      <StatusBar barStyle="light-content" />
      <LinearGradient colors={colors.gradAlpine} style={StyleSheet.absoluteFill} />
      <View style={styles.hero}>
        <MountainScene width={W} height={200} variant="mist" />
        <LinearGradient
          colors={['rgba(15,44,32,0)', colors.primaryDark]}
          style={styles.heroFade}
        />
      </View>

      <ScrollView
        contentContainerStyle={{ flexGrow: 1 }}
        bounces={false}
        keyboardShouldPersistTaps="handled"
      >
        <View style={styles.topBar}>
          <PressableScale onPress={() => navigation.goBack()} style={styles.backBtn} scaleTo={0.9}>
            <HugeiconsIcon icon={ArrowLeft02Icon} size={22} color="#fff" strokeWidth={2.25} />
          </PressableScale>
        </View>

        <FadeIn delay={80} style={styles.brand}>
          <Text style={styles.header}>Join Treco</Text>
          <Text style={styles.sub}>Create your account and start exploring</Text>
        </FadeIn>

        <SlideUp delay={220} distance={40} style={styles.cardWrap}>
          <View style={styles.card}>
            <Input
              label="Full name"
              icon={UserIcon}
              placeholder="Ryan Khan"
              value={form.fullName}
              onChangeText={(v) => update('fullName', v)}
            />
            <Input
              label="Email"
              icon={Mail01Icon}
              placeholder="you@example.com"
              value={form.email}
              onChangeText={(v) => update('email', v)}
              keyboardType="email-address"
              autoCapitalize="none"
            />
            <Input
              label="Phone"
              icon={CallIcon}
              placeholder="+977 ..."
              value={form.phone}
              onChangeText={(v) => update('phone', v)}
              keyboardType="phone-pad"
            />
            <Input
              label="Password"
              icon={LockIcon}
              placeholder="At least 6 characters"
              value={form.password}
              onChangeText={(v) => update('password', v)}
              secureTextEntry
            />
            <Input
              label="Confirm password"
              icon={Shield01Icon}
              placeholder="Repeat your password"
              value={form.confirmPassword}
              onChangeText={(v) => update('confirmPassword', v)}
              secureTextEntry
            />

            <Button
              label="Create Account"
              iconRight={ArrowRight01Icon}
              onPress={handleRegister}
              loading={loading}
              size="lg"
              style={{ marginTop: spacing.sm }}
            />

            <View style={styles.signInRow}>
              <Text style={styles.signInSub}>Already have an account? </Text>
              <PressableScale onPress={() => navigation.navigate('Login')} hitSlop={8}>
                <Text style={styles.signInLink}>Sign in</Text>
              </PressableScale>
            </View>
          </View>
        </SlideUp>
      </ScrollView>
    </KeyboardAvoidingView>
  );
};

const styles = StyleSheet.create({
  hero: { position: 'absolute', top: 0, left: 0, right: 0, height: 240 },
  heroFade: { position: 'absolute', left: 0, right: 0, bottom: 0, height: 80 },
  topBar: {
    paddingTop: Platform.OS === 'ios' ? 56 : 40,
    paddingHorizontal: spacing.md,
    flexDirection: 'row',
  },
  backBtn: {
    width: 40, height: 40, borderRadius: 20,
    backgroundColor: 'rgba(255,255,255,0.12)',
    alignItems: 'center', justifyContent: 'center',
  },
  brand: { alignItems: 'center', marginTop: spacing.sm, marginBottom: spacing.lg },
  header: {
    color: '#fff', fontSize: fontSize.display, fontWeight: fontWeight.black, letterSpacing: -1,
  },
  sub: { color: 'rgba(255,255,255,0.78)', fontSize: fontSize.md, marginTop: 4 },
  cardWrap: { paddingHorizontal: spacing.md, flexGrow: 1 },
  card: {
    backgroundColor: colors.card,
    borderTopLeftRadius: radius.xxl,
    borderTopRightRadius: radius.xxl,
    padding: spacing.lg,
    paddingBottom: spacing.xxl,
    ...shadows.xl,
    minHeight: 500,
  },
  signInRow: {
    flexDirection: 'row', justifyContent: 'center',
    marginTop: spacing.lg,
  },
  signInSub: { color: colors.textSecondary, fontSize: fontSize.sm },
  signInLink: { color: colors.primary, fontSize: fontSize.sm, fontWeight: fontWeight.bold },
});

export default RegisterScreen;
