import { HugeiconsIcon } from '@hugeicons/react-native';
import React, { useState } from 'react';
import {
  View, Text, StyleSheet, ScrollView, Switch, Alert,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Globe02Icon, UserGroupIcon, MapPinIcon, ChartHistogramIcon, Notification01Icon, ViewIcon, Delete02Icon } from '@hugeicons/core-free-icons';
import { colors } from '../../constants/colors';
import { fontSize, fontWeight, radius, spacing } from '../../constants/theme';
import ScreenHeader from '../../components/ui/ScreenHeader';
import { PressableScale, Card } from '../../components/ui';

export default function PrivacyScreen({ navigation }) {
  const [publicProfile,     setPublicProfile]     = useState(true);
  const [activityVisible,   setActivityVisible]   = useState(true);
  const [locationShare,     setLocationShare]     = useState(false);
  const [analytics,         setAnalytics]         = useState(true);
  const [emailNotif,        setEmailNotif]        = useState(true);
  const [showOnLeaderboard, setShowOnLeaderboard] = useState(true);

  const handleDeleteAccount = () => {
    Alert.alert(
      'Delete account',
      'This will permanently delete your profile, trips, and data. This cannot be undone.',
      [
        { text: 'Cancel', style: 'cancel' },
        { text: 'Delete', style: 'destructive', onPress: () => Alert.alert('Request sent', 'Your deletion request has been submitted. You will receive an email within 30 days.') },
      ],
    );
  };

  return (
    <SafeAreaView style={styles.safe}>
      <ScreenHeader title="Privacy" subtitle="Data & visibility" onBack={() => navigation.goBack()} />

      <ScrollView
        contentContainerStyle={styles.content}
        showsVerticalScrollIndicator={false}
      >
        <Section label="Profile visibility">
          <ToggleRow
            Icon={Globe02Icon}
            color="#457B9D"
            title="Public profile"
            sub="Anyone can see your profile, bio, and completed trails."
            value={publicProfile}
            onChange={setPublicProfile}
          />
          <ToggleRow
            Icon={UserGroupIcon}
            color="#40916C"
            title="Show activity to followers"
            sub="Followers can see your recent hikes and treks."
            value={activityVisible}
            onChange={setActivityVisible}
          />
          <ToggleRow
            Icon={ViewIcon}
            color="#8B5CF6"
            title="Show on leaderboard"
            sub="Appear in regional distance and summit leaderboards."
            value={showOnLeaderboard}
            onChange={setShowOnLeaderboard}
            isLast
          />
        </Section>

        <Section label="Location & data">
          <ToggleRow
            Icon={MapPinIcon}
            color="#E76F51"
            title="Live location sharing"
            sub="Share your real-time GPS position with trusted trekking partners during active treks."
            value={locationShare}
            onChange={setLocationShare}
          />
          <ToggleRow
            Icon={ChartHistogramIcon}
            color="#52B788"
            title="Usage analytics"
            sub="Help improve Treco by sharing anonymised usage patterns."
            value={analytics}
            onChange={setAnalytics}
            isLast
          />
        </Section>

        <Section label="Communications">
          <ToggleRow
            Icon={Notification01Icon}
            color="#F59E0B"
            title="Marketing emails"
            sub="Receive trail recommendations, new features, and Treco news."
            value={emailNotif}
            onChange={setEmailNotif}
            isLast
          />
        </Section>

        {/* Data rights */}
        <View style={styles.dataCard}>
          <Text style={styles.dataTitle}>Your data rights</Text>
          <Text style={styles.dataSub}>
            Under GDPR and applicable laws, you can request a copy of your personal data or ask us to delete your account entirely.
          </Text>
          <PressableScale style={styles.dataBtn} scaleTo={0.97}
            onPress={() => Alert.alert('Data export', 'A copy of your data will be emailed to you within 48 hours.')}
          >
            <Text style={styles.dataBtnText}>Request data export</Text>
          </PressableScale>
        </View>

        {/* Delete account */}
        <PressableScale style={styles.deleteBtn} onPress={handleDeleteAccount} scaleTo={0.97}>
          <HugeiconsIcon icon={Delete02Icon} size={16} color={colors.danger} strokeWidth={2.25} />
          <Text style={styles.deleteBtnText}>Delete my account</Text>
        </PressableScale>

        <Text style={styles.footer}>
          Treco does not sell your personal data to third parties.{'\n'}
          Last updated: April 2026
        </Text>
      </ScrollView>
    </SafeAreaView>
  );
}

function Section({ label, children }) {
  return (
    <View style={styles.section}>
      <Text style={styles.sectionLabel}>{label}</Text>
      <Card style={styles.sectionCard} padding={0}>{children}</Card>
    </View>
  );
}

function ToggleRow({ Icon, color, title, sub, value, onChange, isLast }) {
  return (
    <View style={[styles.row, !isLast && styles.rowDivider]}>
      <View style={[styles.rowIcon, { backgroundColor: `${color}22` }]}>
        <HugeiconsIcon icon={Icon} size={16} color={color} strokeWidth={2.25} />
      </View>
      <View style={styles.rowText}>
        <Text style={styles.rowTitle}>{title}</Text>
        <Text style={styles.rowSub}>{sub}</Text>
      </View>
      <Switch
        value={value}
        onValueChange={onChange}
        trackColor={{ false: colors.border, true: colors.primaryLight }}
        thumbColor={value ? colors.primary : '#fff'}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: colors.background },
  content: { padding: spacing.md, paddingBottom: 48 },

  section: { marginBottom: 20 },
  sectionLabel: {
    fontSize: fontSize.xs, fontWeight: fontWeight.bold,
    color: colors.primaryLight, letterSpacing: 2,
    textTransform: 'uppercase', marginBottom: spacing.sm, paddingLeft: 4,
  },
  sectionCard: { overflow: 'hidden' },

  row: {
    flexDirection: 'row', alignItems: 'center',
    paddingHorizontal: spacing.md, paddingVertical: 14, gap: 12,
  },
  rowDivider: { borderBottomWidth: 1, borderBottomColor: colors.border },
  rowIcon: {
    width: 36, height: 36, borderRadius: 10,
    alignItems: 'center', justifyContent: 'center',
    flexShrink: 0,
  },
  rowText: { flex: 1 },
  rowTitle: { fontSize: fontSize.sm, fontWeight: fontWeight.semiBold, color: colors.text, marginBottom: 2 },
  rowSub: { fontSize: 12, color: colors.textLight, lineHeight: 17 },

  dataCard: {
    backgroundColor: colors.primaryPale,
    borderRadius: radius.lg,
    padding: spacing.md,
    marginBottom: 16,
  },
  dataTitle: { fontSize: fontSize.md, fontWeight: fontWeight.bold, color: colors.primaryDark, marginBottom: 6 },
  dataSub: { fontSize: fontSize.sm, color: colors.primaryLight, lineHeight: 20, marginBottom: 14 },
  dataBtn: {
    backgroundColor: colors.primary,
    borderRadius: radius.round,
    paddingVertical: 10,
    alignItems: 'center',
  },
  dataBtnText: { color: '#fff', fontSize: fontSize.sm, fontWeight: fontWeight.bold },

  deleteBtn: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 8,
    borderWidth: 1, borderColor: `${colors.danger}40`,
    borderRadius: radius.round, paddingVertical: 13,
    marginBottom: 24, backgroundColor: colors.card,
  },
  deleteBtnText: { color: colors.danger, fontSize: fontSize.sm, fontWeight: fontWeight.bold },

  footer: {
    textAlign: 'center', fontSize: 11,
    color: colors.textLight, lineHeight: 18,
  },
});
