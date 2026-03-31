import React, { useState } from 'react';
import {
  View, Text, StyleSheet, ScrollView, TouchableOpacity,
  TextInput, StatusBar, SafeAreaView, Alert, ActivityIndicator,
} from 'react-native';
import { colors } from '../../constants/colors';

const VerifyIdentityScreen = ({ navigation }) => {
  const [phone, setPhone] = useState('');
  const [docType, setDocType] = useState('Citizenship');
  const [docNumber, setDocNumber] = useState('');
  const [loading, setLoading] = useState(false);
  const docTypes = ['Citizenship', 'Passport', 'Driver License'];

  const handleSubmit = () => {
    if (!phone || !docNumber) {
      Alert.alert('Error', 'Please fill in all required fields.'); return;
    }
    setLoading(true);
    setTimeout(() => {
      setLoading(false);
      Alert.alert('Submitted!', 'Your verification is under review. We\'ll notify you within 24 hours.', [
        { text: 'OK', onPress: () => navigation.goBack() },
      ]);
    }, 1500);
  };

  return (
    <SafeAreaView style={styles.safe}>
      <StatusBar barStyle="dark-content" backgroundColor={colors.white} />
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <Text style={styles.back}>←</Text>
        </TouchableOpacity>
        <Text style={styles.title}>Verify Identity</Text>
        <View style={{ width: 40 }} />
      </View>

      <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
        <View style={styles.infoBox}>
          <Text style={styles.infoTitle}>Why verify?</Text>
          <Text style={styles.infoText}>
            Verified users build trust with trek partners. Complete your profile to let others know you're safe and reliable.
          </Text>
        </View>

        <Text style={styles.sectionTitle}>Contact Verification</Text>
        <Text style={styles.label}>Phone Number</Text>
        <TextInput
          style={styles.input}
          placeholder="+977 98XXXXXXXX"
          placeholderTextColor={colors.textMuted}
          value={phone}
          onChangeText={setPhone}
          keyboardType="phone-pad"
        />

        <Text style={styles.sectionTitle}>Government ID</Text>
        <Text style={styles.label}>Document Type</Text>
        <View style={styles.docTypes}>
          {docTypes.map((t) => (
            <TouchableOpacity
              key={t}
              style={[styles.docTypeBtn, docType === t && styles.docTypeBtnActive]}
              onPress={() => setDocType(t)}
            >
              <Text style={[styles.docTypeText, docType === t && styles.docTypeTextActive]}>{t}</Text>
            </TouchableOpacity>
          ))}
        </View>

        <Text style={styles.label}>Document Number</Text>
        <TextInput
          style={styles.input}
          placeholder="Enter document number"
          placeholderTextColor={colors.textMuted}
          value={docNumber}
          onChangeText={setDocNumber}
        />

        <Text style={styles.label}>Upload Government ID</Text>
        <TouchableOpacity style={styles.uploadBox}>
          <Text style={styles.uploadIcon}>📸</Text>
          <Text style={styles.uploadText}>Tap to upload photo</Text>
          <Text style={styles.uploadSub}>JPG, PNG up to 5MB</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.submitBtn, loading && { opacity: 0.7 }]}
          onPress={handleSubmit}
          disabled={loading}
        >
          {loading ? <ActivityIndicator color={colors.white} /> : <Text style={styles.submitBtnText}>Submit for Verification</Text>}
        </TouchableOpacity>
        <View style={{ height: 40 }} />
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: colors.background },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 16,
    backgroundColor: colors.white,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  back: { fontSize: 22, color: colors.textPrimary },
  title: { fontSize: 17, fontWeight: '700', color: colors.textPrimary },
  container: { padding: 16 },
  infoBox: {
    backgroundColor: colors.accentVeryLight,
    borderRadius: 12,
    padding: 16,
    marginBottom: 20,
    borderLeftWidth: 4,
    borderLeftColor: colors.primary,
  },
  infoTitle: { fontSize: 15, fontWeight: '700', color: colors.primary, marginBottom: 4 },
  infoText: { fontSize: 13, color: colors.textSecondary, lineHeight: 20 },
  sectionTitle: { fontSize: 16, fontWeight: '700', color: colors.textPrimary, marginBottom: 12, marginTop: 8 },
  label: { fontSize: 13, fontWeight: '600', color: colors.textPrimary, marginBottom: 8 },
  input: {
    backgroundColor: colors.white,
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 14,
    fontSize: 15,
    color: colors.textPrimary,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: colors.border,
  },
  docTypes: { flexDirection: 'row', gap: 8, marginBottom: 16, flexWrap: 'wrap' },
  docTypeBtn: {
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 20,
    backgroundColor: colors.white,
    borderWidth: 1,
    borderColor: colors.border,
  },
  docTypeBtnActive: { backgroundColor: colors.primary, borderColor: colors.primary },
  docTypeText: { fontSize: 13, color: colors.textSecondary },
  docTypeTextActive: { color: colors.white, fontWeight: '600' },
  uploadBox: {
    borderWidth: 1.5,
    borderColor: colors.border,
    borderStyle: 'dashed',
    borderRadius: 12,
    padding: 32,
    alignItems: 'center',
    marginBottom: 24,
    backgroundColor: colors.white,
  },
  uploadIcon: { fontSize: 32, marginBottom: 8 },
  uploadText: { fontSize: 14, color: colors.textPrimary, fontWeight: '500' },
  uploadSub: { fontSize: 12, color: colors.textMuted, marginTop: 4 },
  submitBtn: {
    backgroundColor: colors.primary,
    paddingVertical: 16,
    borderRadius: 50,
    alignItems: 'center',
  },
  submitBtnText: { color: colors.white, fontSize: 16, fontWeight: '600' },
});

export default VerifyIdentityScreen;
