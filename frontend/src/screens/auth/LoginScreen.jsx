import { HugeiconsIcon } from '@hugeicons/react-native';
import React, { useState } from 'react';
import {
  View, Text, StyleSheet, ScrollView, StatusBar, Alert,
  KeyboardAvoidingView, Platform, Dimensions,
} from 'react-native';
import { Mail01Icon, LockIcon, ViewIcon, ViewOffIcon, ArrowRight01Icon } from '@hugeicons/core-free-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { colors } from '../../constants/colors';
import { fontSize, fontWeight, radius, spacing, shadows } from '../../constants/theme';
import { authAPI } from '../../services/api';
import { useAuth } from '../../context/AuthContext';
import Logo from '../../assets/svg/Logo';
import MountainScene from '../../assets/svg/MountainScene';
import { Input, Button, PressableScale, SlideUp, FadeIn, ScaleIn } from '../../components/ui';

const { width: W } = Dimensions.get('window');

const LoginScreen = ({ navigation }) => {
  const { login } = useAuth();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [showPw, setShowPw] = useState(false);

  const handleLogin = async () => {
    if (!email.trim() || !password.trim()) {
      Alert.alert('Error', 'Please enter email and password.');
      return;
    }
    setLoading(true);
    try {
      const res = await authAPI.login({ email: email.trim().toLowerCase(), password });
      await login(res.data.user, res.data.token, res.data.refreshToken);
    } catch (err) {
      Alert.alert('Login Failed', err.response?.data?.message || 'Invalid credentials.');
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
      <LinearGradient
        colors={colors.gradAlpine}
        style={styles.bgGradient}
      />
      {/* Decorative peaks */}
      <View style={styles.hero}>
        <MountainScene width={W} height={220} variant="alpine" />
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
        {/* Brand */}
        <ScaleIn delay={100} style={styles.brand}>
          <Logo size={64} color="#fff" accent={colors.accent} />
          <Text style={styles.logoText}>Treco</Text>
          <Text style={styles.tagline}>Welcome back, trekker</Text>
        </ScaleIn>

        {/* Card */}
        <SlideUp delay={240} distance={40} style={styles.cardWrap}>
          <View style={styles.card}>
            <Text style={styles.cardTitle}>Sign in</Text>
            <Text style={styles.cardSub}>Continue your adventure</Text>

            <View style={{ height: spacing.lg }} />

            <Input
              label="Email"
              icon={Mail01Icon}
              placeholder="you@example.com"
              value={email}
              onChangeText={setEmail}
              keyboardType="email-address"
              autoCapitalize="none"
              autoCorrect={false}
            />
            <Input
              label="Password"
              icon={LockIcon}
              placeholder="••••••••"
              value={password}
              onChangeText={setPassword}
              secureTextEntry={!showPw}
              trailing={
                <PressableScale onPress={() => setShowPw((v) => !v)} hitSlop={10}>
                  {showPw ? <HugeiconsIcon icon={ViewOffIcon} size={18} color={colors.textLight} /> : <HugeiconsIcon icon={ViewIcon} size={18} color={colors.textLight} />}
                </PressableScale>
              }
            />

            <PressableScale style={styles.forgotBtn} hitSlop={8}>
              <Text style={styles.forgotText}>Forgot password?</Text>
            </PressableScale>

            <Button
              label="Sign In"
              iconRight={ArrowRight01Icon}
              onPress={handleLogin}
              loading={loading}
              size="lg"
            />

            <View style={styles.divider}>
              <View style={styles.dividerLine} />
              <Text style={styles.dividerText}>or</Text>
              <View style={styles.dividerLine} />
            </View>

            <PressableScale onPress={() => navigation.navigate('Register')} style={styles.signUp}>
              <Text style={styles.signUpSub}>Don't have an account?</Text>
              <Text style={styles.signUpText}>Create account</Text>
            </PressableScale>
          </View>
        </SlideUp>
      </ScrollView>
    </KeyboardAvoidingView>
  );
};

const styles = StyleSheet.create({
  bgGradient: StyleSheet.absoluteFillObject,
  hero: { position: 'absolute', top: 0, left: 0, right: 0, height: 260 },
  heroFade: { position: 'absolute', left: 0, right: 0, bottom: 0, height: 80 },
  brand: {
    alignItems: 'center',
    paddingTop: Platform.OS === 'ios' ? 80 : 60,
    paddingBottom: spacing.lg,
  },
  logoText: {
    color: '#fff', fontSize: 36, fontWeight: fontWeight.black, letterSpacing: -0.8, marginTop: 12,
  },
  tagline: {
    color: 'rgba(255,255,255,0.75)',
    fontSize: fontSize.md,
    marginTop: 4,
    fontStyle: 'italic',
  },
  cardWrap: {
    marginTop: spacing.lg,
    paddingHorizontal: spacing.md,
    flexGrow: 1,
  },
  card: {
    backgroundColor: colors.card,
    borderTopLeftRadius: radius.xxl,
    borderTopRightRadius: radius.xxl,
    padding: spacing.lg,
    paddingBottom: spacing.xxl,
    ...shadows.xl,
    minHeight: 420,
  },
  cardTitle: {
    fontSize: fontSize.xxxl,
    fontWeight: fontWeight.bold,
    color: colors.text,
    letterSpacing: -0.6,
  },
  cardSub: {
    fontSize: fontSize.sm,
    color: colors.textSecondary,
    marginTop: 4,
  },
  forgotBtn: { alignSelf: 'flex-end', marginTop: -4, marginBottom: spacing.md, padding: 4 },
  forgotText: { color: colors.primary, fontSize: fontSize.sm, fontWeight: fontWeight.semiBold },
  divider: {
    flexDirection: 'row', alignItems: 'center', marginVertical: spacing.md, gap: spacing.sm,
  },
  dividerLine: { flex: 1, height: 1, backgroundColor: colors.border },
  dividerText: { color: colors.textLight, fontSize: fontSize.sm },
  signUp: { alignItems: 'center', padding: spacing.sm },
  signUpSub: { color: colors.textSecondary, fontSize: fontSize.sm },
  signUpText: {
    color: colors.primary,
    fontSize: fontSize.md,
    fontWeight: fontWeight.bold,
    marginTop: 2,
  },
});

export default LoginScreen;
