import React, { useState } from 'react';
import {
  View, Text, StyleSheet, TouchableOpacity, TextInput,
  ScrollView, StatusBar, ActivityIndicator, Alert, KeyboardAvoidingView, Platform,
} from 'react-native';
import { colors } from '../../constants/colors';
import { authAPI } from '../../services/api';
import { useAuth } from '../../context/AuthContext';

const RegisterScreen = ({ navigation }) => {
  const { login } = useAuth();
  const [form, setForm] = useState({ fullName: '', email: '', phone: '', password: '', confirmPassword: '' });
  const [loading, setLoading] = useState(false);

  const update = (field, val) => setForm((p) => ({ ...p, [field]: val }));

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
        fullName: fullName.trim(),
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
    <KeyboardAvoidingView style={{ flex: 1 }} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
      <StatusBar barStyle="light-content" backgroundColor={colors.primary} />
      <ScrollView style={styles.container} bounces={false}>
        {/* Header */}
        <View style={styles.header}>
          <TouchableOpacity style={styles.backBtn} onPress={() => navigation.goBack()}>
            <Text style={styles.backArrow}>←</Text>
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Create Account</Text>
        </View>

        {/* Wave bottom of header */}
        <View style={styles.wave} />

        {/* Form */}
        <View style={styles.formContainer}>
          <Field label="Full Name" placeholder="Enter your full name" value={form.fullName} onChangeText={(v) => update('fullName', v)} />
          <Field label="Email" placeholder="Enter your email" value={form.email} onChangeText={(v) => update('email', v)} keyboardType="email-address" autoCapitalize="none" />
          <Field label="Phone Number" placeholder="+977" value={form.phone} onChangeText={(v) => update('phone', v)} keyboardType="phone-pad" />
          <Field label="Password" placeholder="Create a password" value={form.password} onChangeText={(v) => update('password', v)} secureTextEntry />
          <Field label="Confirm Password" placeholder="Confirm your password" value={form.confirmPassword} onChangeText={(v) => update('confirmPassword', v)} secureTextEntry />

          <TouchableOpacity
            style={[styles.createBtn, loading && { opacity: 0.7 }]}
            onPress={handleRegister}
            disabled={loading}
          >
            {loading ? <ActivityIndicator color={colors.white} /> : <Text style={styles.createBtnText}>Create Account</Text>}
          </TouchableOpacity>

          <View style={styles.loginRow}>
            <Text style={styles.loginSub}>Already have an account? </Text>
            <TouchableOpacity onPress={() => navigation.navigate('Login')}>
              <Text style={styles.loginLink}>Sign In</Text>
            </TouchableOpacity>
          </View>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
};

const Field = ({ label, ...props }) => (
  <View style={{ marginBottom: 16 }}>
    <Text style={styles.label}>{label}</Text>
    <TextInput style={styles.input} placeholderTextColor={colors.textMuted} {...props} />
  </View>
);

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.primary },
  header: {
    paddingTop: 56,
    paddingHorizontal: 24,
    paddingBottom: 32,
  },
  backBtn: { marginBottom: 16 },
  backArrow: { fontSize: 24, color: colors.white },
  headerTitle: { fontSize: 30, fontWeight: '700', color: colors.white, textAlign: 'center' },
  wave: {
    backgroundColor: colors.white,
    height: 32,
    borderTopLeftRadius: 32,
    borderTopRightRadius: 32,
    marginTop: -8,
  },
  formContainer: {
    backgroundColor: colors.white,
    paddingHorizontal: 24,
    paddingBottom: 48,
  },
  label: { fontSize: 13, fontWeight: '600', color: colors.textPrimary, marginBottom: 6 },
  input: {
    backgroundColor: colors.inputBg,
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 14,
    fontSize: 15,
    color: colors.textPrimary,
  },
  createBtn: {
    backgroundColor: colors.primary,
    paddingVertical: 16,
    borderRadius: 50,
    alignItems: 'center',
    marginTop: 8,
    marginBottom: 20,
  },
  createBtnText: { color: colors.white, fontSize: 16, fontWeight: '600' },
  loginRow: { flexDirection: 'row', justifyContent: 'center' },
  loginSub: { color: colors.textSecondary, fontSize: 14 },
  loginLink: { color: colors.primary, fontSize: 14, fontWeight: '600' },
});

export default RegisterScreen;
