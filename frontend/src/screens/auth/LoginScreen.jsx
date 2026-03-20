import React, { useState } from 'react';
import {
  View, Text, StyleSheet, TouchableOpacity, TextInput,
  ScrollView, StatusBar, ActivityIndicator, Alert, KeyboardAvoidingView, Platform,
} from 'react-native';
import { colors } from '../../constants/colors';
import { authAPI } from '../../services/api';
import { useAuth } from '../../context/AuthContext';

const LoginScreen = ({ navigation }) => {
  const { login } = useAuth();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  const handleLogin = async () => {
    if (!email.trim() || !password.trim()) {
      Alert.alert('Error', 'Please enter email and password.');
      return;
    }
    setLoading(true);
    try {
      const res = await authAPI.login({ email: email.trim().toLowerCase(), password });
      await login(res.data.user, res.data.token);
    } catch (err) {
      Alert.alert('Login Failed', err.response?.data?.message || 'Invalid credentials.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <KeyboardAvoidingView style={{ flex: 1 }} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
      <StatusBar barStyle="light-content" backgroundColor={colors.primary} />
      <ScrollView style={styles.container} bounces={false}>
        {/* Header */}
        <View style={styles.header}>
          <Text style={styles.logo}>Treco</Text>
          <Text style={styles.tagline}>Welcome Back</Text>
        </View>

        {/* Form card */}
        <View style={styles.card}>
          <Text style={styles.cardTitle}>Sign In</Text>

          <Text style={styles.label}>Email</Text>
          <TextInput
            style={styles.input}
            placeholder="Enter your email"
            placeholderTextColor={colors.textMuted}
            value={email}
            onChangeText={setEmail}
            keyboardType="email-address"
            autoCapitalize="none"
          />

          <Text style={styles.label}>Password</Text>
          <View style={styles.passwordRow}>
            <TextInput
              style={[styles.input, { flex: 1, marginBottom: 0 }]}
              placeholder="Enter your password"
              placeholderTextColor={colors.textMuted}
              value={password}
              onChangeText={setPassword}
              secureTextEntry={!showPassword}
            />
            <TouchableOpacity style={styles.eyeBtn} onPress={() => setShowPassword(!showPassword)}>
              <Text style={{ fontSize: 18 }}>{showPassword ? '🙈' : '👁️'}</Text>
            </TouchableOpacity>
          </View>

          <TouchableOpacity style={styles.forgotBtn}>
            <Text style={styles.forgotText}>Forgot Password?</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.signInBtn, loading && { opacity: 0.7 }]}
            onPress={handleLogin}
            disabled={loading}
          >
            {loading ? (
              <ActivityIndicator color={colors.white} />
            ) : (
              <Text style={styles.signInText}>Sign In</Text>
            )}
          </TouchableOpacity>

          <View style={styles.divider}>
            <View style={styles.dividerLine} />
            <Text style={styles.dividerText}>or</Text>
            <View style={styles.dividerLine} />
          </View>

          <TouchableOpacity onPress={() => navigation.navigate('Register')}>
            <Text style={styles.signUpText}>Sign Up</Text>
            <Text style={styles.signUpSub}>Don't have an account?</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.primary },
  header: {
    paddingTop: 60,
    paddingHorizontal: 24,
    paddingBottom: 40,
    alignItems: 'center',
  },
  logo: {
    fontSize: 40,
    fontWeight: '700',
    color: colors.white,
    letterSpacing: 1,
  },
  tagline: { fontSize: 15, color: 'rgba(255,255,255,0.8)', marginTop: 4 },
  card: {
    backgroundColor: colors.white,
    borderTopLeftRadius: 32,
    borderTopRightRadius: 32,
    padding: 28,
    minHeight: 480,
  },
  cardTitle: {
    fontSize: 24,
    fontWeight: '700',
    color: colors.textPrimary,
    textAlign: 'center',
    marginBottom: 24,
  },
  label: { fontSize: 13, fontWeight: '600', color: colors.textPrimary, marginBottom: 6 },
  input: {
    backgroundColor: colors.inputBg,
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 14,
    fontSize: 15,
    color: colors.textPrimary,
    marginBottom: 16,
  },
  passwordRow: { flexDirection: 'row', alignItems: 'center', marginBottom: 4, gap: 8 },
  eyeBtn: { padding: 14, backgroundColor: colors.inputBg, borderRadius: 12 },
  forgotBtn: { alignSelf: 'flex-end', marginBottom: 24, marginTop: 4 },
  forgotText: { color: colors.primary, fontSize: 13 },
  signInBtn: {
    backgroundColor: colors.primary,
    paddingVertical: 16,
    borderRadius: 50,
    alignItems: 'center',
  },
  signInText: { color: colors.white, fontSize: 16, fontWeight: '600' },
  divider: {
    flexDirection: 'row',
    alignItems: 'center',
    marginVertical: 20,
    gap: 12,
  },
  dividerLine: { flex: 1, height: 1, backgroundColor: colors.border },
  dividerText: { color: colors.textMuted, fontSize: 13 },
  signUpText: {
    color: colors.primary,
    fontSize: 16,
    fontWeight: '600',
    textAlign: 'center',
  },
  signUpSub: { color: colors.textMuted, fontSize: 13, textAlign: 'center', marginTop: 2 },
});

export default LoginScreen;
