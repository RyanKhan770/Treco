import React, { useState } from 'react';
import {
  View, Text, StyleSheet, TouchableOpacity, TextInput,
  ScrollView, Alert, ActivityIndicator,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { colors } from '../../constants/colors';

const REASONS = [
  { id: 'behavior', label: 'Inappropriate behavior' },
  { id: 'trail', label: 'Inaccurate trail information' },
  { id: 'fake', label: 'Fake profile or scam' },
  { id: 'safety', label: 'Safety concern' },
  { id: 'other', label: 'Other' },
];

export default function ReportIssueScreen({ navigation }) {
  const [selected, setSelected] = useState('behavior');
  const [details, setDetails] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async () => {
    if (!details.trim()) {
      Alert.alert('Required', 'Please describe the issue before submitting.');
      return;
    }
    setLoading(true);
    setTimeout(() => {
      setLoading(false);
      Alert.alert(
        'Report Submitted',
        'Thank you. Our team will review your report within 24 hours.',
        [{ text: 'OK', onPress: () => navigation.goBack() }]
      );
    }, 1200);
  };

  return (
    <SafeAreaView style={styles.safe}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <Text style={styles.cancelText}>Cancel</Text>
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Report Issue</Text>
        <View style={{ width: 60 }} />
      </View>

      <ScrollView style={styles.scroll} showsVerticalScrollIndicator={false}>
        {/* Warning banner */}
        <View style={styles.warningBanner}>
          <Text style={styles.warningTitle}>Help us keep Treco safe</Text>
          <Text style={styles.warningBody}>
            All reports are anonymous and reviewed within 24 hours by our moderation team.
          </Text>
        </View>

        {/* Reason selector */}
        <Text style={styles.sectionLabel}>What are you reporting?</Text>
        <View style={styles.reasonsCard}>
          {REASONS.map((reason, idx) => (
            <TouchableOpacity
              key={reason.id}
              style={[styles.reasonRow, idx < REASONS.length - 1 && styles.reasonDivider]}
              onPress={() => setSelected(reason.id)}
              activeOpacity={0.7}
            >
              <View style={[styles.radio, selected === reason.id && styles.radioSelected]}>
                {selected === reason.id && <View style={styles.radioDot} />}
              </View>
              <Text style={[styles.reasonText, selected === reason.id && styles.reasonTextSelected]}>
                {reason.label}
              </Text>
            </TouchableOpacity>
          ))}
        </View>

        {/* Details */}
        <Text style={styles.sectionLabel}>Additional Details</Text>
        <View style={styles.detailsCard}>
          <TextInput
            style={styles.detailsInput}
            placeholder="Describe the issue in detail..."
            placeholderTextColor={colors.textLight}
            multiline
            numberOfLines={5}
            value={details}
            onChangeText={setDetails}
            textAlignVertical="top"
          />
        </View>

        <TouchableOpacity
          style={[styles.submitBtn, loading && styles.submitBtnDisabled]}
          onPress={handleSubmit}
          disabled={loading}
          activeOpacity={0.8}
        >
          {loading
            ? <ActivityIndicator color={colors.white} />
            : <Text style={styles.submitText}>Submit Report</Text>}
        </TouchableOpacity>

        <View style={{ height: 40 }} />
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: colors.background },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 14,
    backgroundColor: colors.white,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  cancelText: { fontSize: 16, color: colors.textSecondary },
  headerTitle: { fontSize: 17, fontWeight: '700', color: colors.text },
  scroll: { flex: 1, padding: 16 },
  warningBanner: {
    backgroundColor: '#FEF9C3',
    borderLeftWidth: 4,
    borderLeftColor: colors.warning,
    borderRadius: 10,
    padding: 14,
    marginBottom: 20,
  },
  warningTitle: { fontSize: 14, fontWeight: '700', color: '#92400E', marginBottom: 4 },
  warningBody: { fontSize: 13, color: '#78350F', lineHeight: 19 },
  sectionLabel: {
    fontSize: 13,
    fontWeight: '600',
    color: colors.textSecondary,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
    marginBottom: 8,
    marginTop: 4,
  },
  reasonsCard: {
    backgroundColor: colors.white,
    borderRadius: 14,
    marginBottom: 20,
    overflow: 'hidden',
  },
  reasonRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 14,
  },
  reasonDivider: {
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  radio: {
    width: 20,
    height: 20,
    borderRadius: 10,
    borderWidth: 2,
    borderColor: colors.border,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  radioSelected: { borderColor: colors.primary },
  radioDot: {
    width: 10,
    height: 10,
    borderRadius: 5,
    backgroundColor: colors.primary,
  },
  reasonText: { fontSize: 15, color: colors.text },
  reasonTextSelected: { fontWeight: '600', color: colors.primary },
  detailsCard: {
    backgroundColor: colors.white,
    borderRadius: 14,
    padding: 14,
    marginBottom: 24,
  },
  detailsInput: {
    fontSize: 14,
    color: colors.text,
    minHeight: 100,
    lineHeight: 22,
  },
  submitBtn: {
    backgroundColor: colors.error,
    borderRadius: 50,
    paddingVertical: 16,
    alignItems: 'center',
  },
  submitBtnDisabled: { opacity: 0.7 },
  submitText: { fontSize: 16, fontWeight: '700', color: colors.white },
});
