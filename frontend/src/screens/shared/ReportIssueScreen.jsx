import { HugeiconsIcon } from '@hugeicons/react-native';
import React, { useState } from 'react';
import {
  View, Text, StyleSheet, TextInput, ScrollView, Alert, StatusBar,
} from 'react-native';
import api from '../../services/api';
import { SafeAreaView } from 'react-native-safe-area-context';
import { ArrowLeft02Icon, Shield01Icon, UserRemove01Icon, LocationOffline01Icon, Flag01Icon, Alert01Icon, HelpCircleIcon } from '@hugeicons/core-free-icons';
import { colors } from '../../constants/colors';
import { fontSize, fontWeight, radius, shadows, spacing } from '../../constants/theme';
import {
  Button, Card, PressableScale, FadeIn, SlideUp, Stagger,
} from '../../components/ui';
import ScreenHeader from '../../components/ui/ScreenHeader';

const REASONS = [
  { id: 'behavior', label: 'Inappropriate behavior', Icon: UserRemove01Icon },
  { id: 'trail', label: 'Inaccurate trail info', Icon: LocationOffline01Icon },
  { id: 'fake', label: 'Fake profile or scam', Icon: Flag01Icon },
  { id: 'safety', label: 'Safety concern', Icon: Alert01Icon },
  { id: 'other', label: 'Something else', Icon: HelpCircleIcon },
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
    try {
      await api.post('/reports', { reason: selected, description: details });
      Alert.alert(
        'Report submitted',
        'Thank you. Our team will review your report within 24 hours.',
        [{ text: 'OK', onPress: () => navigation.goBack() }],
      );
    } catch {
      Alert.alert('Error', 'Could not submit report. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <SafeAreaView style={styles.safe} edges={['top']}>
      <StatusBar barStyle="dark-content" backgroundColor={colors.background} />
      <ScreenHeader
        title="Report Issue"
        subtitle="Help"
        onBack={() => navigation.goBack()}
      />

      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{ padding: spacing.md, paddingBottom: spacing.xxl }}>
        <SlideUp delay={100}>
          <Card style={styles.banner}>
            <View style={styles.bannerIcon}>
              <HugeiconsIcon icon={Shield01Icon} size={20} color={colors.warning} strokeWidth={2.25} />
            </View>
            <View style={{ flex: 1 }}>
              <Text style={styles.bannerTitle}>Help us keep Treco safe</Text>
              <Text style={styles.bannerBody}>
                Reports are anonymous and reviewed by our moderation team within 24 hours.
              </Text>
            </View>
          </Card>
        </SlideUp>

        <Text style={styles.section}>What are you reporting?</Text>
        <Stagger initialDelay={180} step={50} distance={12}>
          {REASONS.map((reason) => {
            const active = selected === reason.id;
            return (
              <PressableScale
                key={reason.id}
                style={[styles.reasonRow, active && styles.reasonRowActive]}
                onPress={() => setSelected(reason.id)}
                scaleTo={0.98}
              >
                <View style={[styles.reasonIcon, active && { backgroundColor: colors.primaryPale }]}>
                  <HugeiconsIcon icon={reason.Icon} size={18} color={active ? colors.primary : colors.textSecondary} strokeWidth={2.25} />
                </View>
                <Text style={[styles.reasonText, active && styles.reasonTextActive]}>{reason.label}</Text>
                <View style={[styles.radio, active && styles.radioActive]}>
                  {active && <View style={styles.radioDot} />}
                </View>
              </PressableScale>
            );
          })}
        </Stagger>

        <Text style={styles.section}>Details</Text>
        <SlideUp delay={240}>
          <Card>
            <TextInput
              style={styles.detailsInput}
              placeholder="Describe the issue in detail…"
              placeholderTextColor={colors.textMuted}
              multiline
              numberOfLines={6}
              value={details}
              onChangeText={setDetails}
              textAlignVertical="top"
            />
          </Card>
        </SlideUp>

        <SlideUp delay={240}>
          <View style={{ marginTop: spacing.lg }}>
            <Button
              label="Submit report"
              variant="danger"
              loading={loading}
              onPress={handleSubmit}
              fullWidth
              size="lg"
            />
          </View>
        </SlideUp>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: colors.background },



  title: { fontSize: fontSize.xl, fontWeight: fontWeight.bold, color: colors.text, letterSpacing: -0.3, marginTop: 2 },

  banner: {
    flexDirection: 'row', gap: spacing.sm,
    backgroundColor: '#FEF3C7',
    borderLeftWidth: 3, borderLeftColor: colors.warning,
  },
  bannerIcon: {
    width: 36, height: 36, borderRadius: 18,
    backgroundColor: '#FDE68A',
    alignItems: 'center', justifyContent: 'center',
  },
  bannerTitle: { fontSize: fontSize.md, fontWeight: fontWeight.bold, color: '#92400E', marginBottom: 2 },
  bannerBody: { fontSize: fontSize.xs, color: '#78350F', lineHeight: 17 },

  section: {
    fontSize: fontSize.xs, fontWeight: fontWeight.bold,
    color: colors.primaryLight, letterSpacing: 2,
    textTransform: 'uppercase', marginTop: spacing.lg, marginBottom: spacing.sm,
  },

  reasonRow: {
    flexDirection: 'row', alignItems: 'center', gap: spacing.sm,
    backgroundColor: colors.card, borderRadius: radius.lg,
    padding: spacing.md, marginBottom: spacing.sm,
    ...shadows.xs,
  },
  reasonRowActive: { borderWidth: 1.5, borderColor: colors.primary, ...shadows.sm },
  reasonIcon: {
    width: 36, height: 36, borderRadius: 18,
    backgroundColor: colors.surface,
    alignItems: 'center', justifyContent: 'center',
  },
  reasonText: { flex: 1, fontSize: fontSize.md, color: colors.text, fontWeight: fontWeight.medium },
  reasonTextActive: { fontWeight: fontWeight.bold, color: colors.primary },
  radio: {
    width: 22, height: 22, borderRadius: 11,
    borderWidth: 2, borderColor: colors.border,
    alignItems: 'center', justifyContent: 'center',
  },
  radioActive: { borderColor: colors.primary },
  radioDot: { width: 10, height: 10, borderRadius: 5, backgroundColor: colors.primary },

  detailsInput: {
    fontSize: fontSize.md, color: colors.text,
    minHeight: 120, lineHeight: 22,
  },
});
