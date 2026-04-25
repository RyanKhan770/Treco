import { useState } from 'react';
import {
  View, Text, TextInput, TouchableOpacity,
  StyleSheet, ActivityIndicator, KeyboardAvoidingView, Platform,
} from 'react-native';
import { useDispatch } from 'react-redux';
import { loginUser, clearSessionExpired } from '../store/slices/authSlice';
import { colors } from '../constants/colors';

export default function SessionExpiredModal() {
  const dispatch = useDispatch();
  const [email, setEmail]       = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading]   = useState(false);
  const [error, setError]       = useState('');

  const handleSignIn = async () => {
    if (!email.trim() || !password) {
      setError('Please enter your email and password.');
      return;
    }
    setLoading(true);
    setError('');
    const result = await dispatch(loginUser({ email: email.trim().toLowerCase(), password }));
    setLoading(false);
    if (loginUser.rejected.match(result)) {
      setError(result.payload || 'Sign in failed. Please try again.');
    }
    // On success, loginUser.fulfilled sets isSessionExpired = false via authSlice,
    // so this modal unmounts automatically — user stays on the same screen.
  };

  return (
    <View style={styles.overlay}>
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={styles.center}
      >
        <View style={styles.card}>
          <View style={styles.iconWrap}>
            <Text style={styles.icon}>🔒</Text>
          </View>

          <Text style={styles.title}>Session Expired</Text>
          <Text style={styles.subtitle}>
            Your session has timed out. Sign in to continue where you left off.
          </Text>

          {error ? <Text style={styles.error}>{error}</Text> : null}

          <TextInput
            style={styles.input}
            placeholder="Email"
            placeholderTextColor={colors.textSecondary}
            value={email}
            onChangeText={setEmail}
            keyboardType="email-address"
            autoCapitalize="none"
            autoCorrect={false}
          />
          <TextInput
            style={styles.input}
            placeholder="Password"
            placeholderTextColor={colors.textSecondary}
            value={password}
            onChangeText={setPassword}
            secureTextEntry
          />

          <TouchableOpacity
            style={[styles.btn, loading && styles.btnDisabled]}
            onPress={handleSignIn}
            disabled={loading}
            activeOpacity={0.8}
          >
            {loading ? (
              <ActivityIndicator color={colors.white} size="small" />
            ) : (
              <Text style={styles.btnText}>Sign in to continue</Text>
            )}
          </TouchableOpacity>

          <TouchableOpacity
            onPress={() => dispatch(clearSessionExpired())}
            style={styles.cancelBtn}
          >
            <Text style={styles.cancelText}>Sign out instead</Text>
          </TouchableOpacity>
        </View>
      </KeyboardAvoidingView>
    </View>
  );
}

const styles = StyleSheet.create({
  overlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(0,0,0,0.65)',
    zIndex: 999,
    justifyContent: 'center',
    alignItems: 'center',
  },
  center: { width: '100%', alignItems: 'center', paddingHorizontal: 24 },
  card: {
    width: '100%',
    backgroundColor: colors.white,
    borderRadius: 20,
    padding: 24,
    alignItems: 'center',
  },
  iconWrap: {
    width: 56, height: 56,
    borderRadius: 28,
    backgroundColor: colors.primaryPale,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 16,
  },
  icon: { fontSize: 26 },
  title: {
    fontSize: 20, fontWeight: '700',
    color: colors.text, marginBottom: 8,
  },
  subtitle: {
    fontSize: 14, color: colors.textSecondary,
    textAlign: 'center', lineHeight: 20,
    marginBottom: 20,
  },
  error: {
    fontSize: 13, color: colors.error,
    marginBottom: 12, textAlign: 'center',
  },
  input: {
    width: '100%',
    backgroundColor: colors.inputBg,
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 13,
    fontSize: 15,
    color: colors.text,
    marginBottom: 12,
  },
  btn: {
    width: '100%',
    backgroundColor: colors.primary,
    borderRadius: 50,
    paddingVertical: 14,
    alignItems: 'center',
    marginTop: 4,
  },
  btnDisabled: { opacity: 0.65 },
  btnText: { color: colors.white, fontSize: 15, fontWeight: '700' },
  cancelBtn: { marginTop: 14, paddingVertical: 4 },
  cancelText: { fontSize: 13, color: colors.textSecondary },
});
