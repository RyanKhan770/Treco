import { HugeiconsIcon } from '@hugeicons/react-native';
import React, { useState } from 'react';
import {
  View, Text, StyleSheet, ScrollView, TextInput, StatusBar, Alert,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Award01Icon, CheckmarkCircle01Icon, Clock01Icon } from '@hugeicons/core-free-icons';
import { colors } from '../../constants/colors';
import { fontSize, fontWeight, radius, spacing } from '../../constants/theme';
import { Button, Card, Input, Stagger } from '../../components/ui';
import ScreenHeader from '../../components/ui/ScreenHeader';
import { organizerAPI } from '../../services/api';

export default function OrganizerRequestScreen({ navigation }) {
  const [form, setForm] = useState({ reason: '', experience: '', previous_treks: '' });
  const [loading, setLoading] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [isPending, setIsPending] = useState(false);

  const update = (field, value) => setForm(p => ({ ...p, [field]: value }));

  const handleSubmit = async () => {
    if (!form.reason.trim() || !form.experience.trim()) {
      Alert.alert('Missing info', 'Please fill in the reason and experience fields.');
      return;
    }
    setLoading(true);
    try {
      await organizerAPI.submitRequest({
        reason:          form.reason.trim(),
        experience:      form.experience.trim(),
        previous_treks:  parseInt(form.previous_treks) || 0,
      });
      setSubmitted(true);
    } catch (err) {
      if (err?.response?.status === 409) {
        setIsPending(true);
      } else {
        Alert.alert('Error', err?.response?.data?.message || 'Could not submit request. Please try again.');
      }
    } finally {
      setLoading(false);
    }
  };

  if (submitted || isPending) {
    return (
      <SafeAreaView style={styles.safe}>
        <StatusBar barStyle="dark-content" backgroundColor={colors.background} />
        <ScreenHeader title="Organizer Request" onBack={() => navigation.goBack()} />
        <View style={styles.successWrap}>
          {isPending
            ? <HugeiconsIcon icon={Clock01Icon} size={64} color={colors.warning} strokeWidth={1.5} />
            : <HugeiconsIcon icon={CheckmarkCircle01Icon} size={64} color={colors.success} strokeWidth={1.5} />
          }
          <Text style={styles.successTitle}>
            {isPending ? 'Request Already Submitted' : 'Application Sent!'}
          </Text>
          <Text style={styles.successSub}>
            {isPending
              ? 'You already have a pending organizer request. Our team will review it shortly and notify you of the decision.'
              : 'Your application is under review. We\'ll notify you once a decision has been made — usually within 2–3 business days.'
            }
          </Text>
          <Button
            label="Back to Profile"
            onPress={() => navigation.goBack()}
            style={{ marginTop: spacing.xl }}
          />
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.safe}>
      <StatusBar barStyle="dark-content" backgroundColor={colors.background} />
      <ScreenHeader
        title="Become an Organizer"
        subtitle="Apply for Group Manager role"
        onBack={() => navigation.goBack()}
      />
      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ padding: spacing.md, paddingBottom: spacing.xxl }}
      >
        <Stagger initialDelay={80} step={40} distance={12}>

          <Card style={styles.infoCard} elevation="xs">
            <HugeiconsIcon icon={Award01Icon} size={20} color={colors.primary} strokeWidth={2.25} />
            <View style={{ flex: 1 }}>
              <Text style={styles.infoTitle}>Group Organizer Role</Text>
              <Text style={styles.infoBody}>
                Organizers can create and lead group treks, manage members, and build community trips on Treco.
              </Text>
            </View>
          </Card>

          <Text style={styles.label}>Why do you want to become an organizer? *</Text>
          <Card style={{ marginBottom: spacing.md }}>
            <TextInput
              style={styles.textarea}
              placeholder="Describe why you'd like to organise group treks…"
              placeholderTextColor={colors.textMuted}
              value={form.reason}
              onChangeText={v => update('reason', v)}
              multiline
              numberOfLines={4}
              textAlignVertical="top"
            />
          </Card>

          <Text style={styles.label}>Your trekking experience *</Text>
          <Card style={{ marginBottom: spacing.md }}>
            <TextInput
              style={styles.textarea}
              placeholder="Describe your experience — trails completed, leadership roles, first aid training…"
              placeholderTextColor={colors.textMuted}
              value={form.experience}
              onChangeText={v => update('experience', v)}
              multiline
              numberOfLines={4}
              textAlignVertical="top"
            />
          </Card>

          <Input
            label="Approximate total treks completed"
            placeholder="e.g. 12"
            value={form.previous_treks}
            onChangeText={v => update('previous_treks', v)}
            keyboardType="numeric"
          />

          <Button
            label="Submit Application"
            icon={Award01Icon}
            loading={loading}
            onPress={handleSubmit}
            fullWidth
            size="lg"
            style={{ marginTop: spacing.md }}
          />

        </Stagger>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: colors.background },

  infoCard: {
    flexDirection: 'row', alignItems: 'flex-start',
    gap: spacing.sm, marginBottom: spacing.lg,
    backgroundColor: colors.primaryPale,
  },
  infoTitle: {
    fontSize: fontSize.sm, fontWeight: fontWeight.bold,
    color: colors.primary, marginBottom: 3,
  },
  infoBody: {
    fontSize: fontSize.sm, color: colors.primaryLight, lineHeight: 20,
  },

  label: {
    fontSize: fontSize.xs, color: colors.textSecondary,
    fontWeight: fontWeight.semiBold,
    marginBottom: spacing.xs, marginTop: spacing.xs,
  },
  textarea: {
    minHeight: 100, fontSize: fontSize.md,
    color: colors.text, lineHeight: 22,
  },

  successWrap: {
    flex: 1, alignItems: 'center', justifyContent: 'center',
    padding: spacing.xl, gap: spacing.md,
  },
  successTitle: {
    fontSize: fontSize.xxl, fontWeight: fontWeight.bold,
    color: colors.text, textAlign: 'center', letterSpacing: -0.3,
  },
  successSub: {
    fontSize: fontSize.md, color: colors.textSecondary,
    textAlign: 'center', lineHeight: 26,
  },
});
