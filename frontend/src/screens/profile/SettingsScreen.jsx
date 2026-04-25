import { HugeiconsIcon } from '@hugeicons/react-native';
import React, { useState, useEffect } from 'react';
import {
  View, Text, StyleSheet, ScrollView, Switch, StatusBar, Alert,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { ArrowLeft02Icon, ArrowRight01Icon, UserIcon, LockIcon, Shield01Icon, Notification01Icon, MapPinIcon, Download01Icon, HelpCircleIcon, Message01Icon, Logout01Icon } from '@hugeicons/core-free-icons';
import { colors } from '../../constants/colors';
import { fontSize, fontWeight, radius, shadows, spacing } from '../../constants/theme';
import { useAuth } from '../../context/AuthContext';
import { Card, PressableScale, FadeIn, Stagger } from '../../components/ui';
import ScreenHeader from '../../components/ui/ScreenHeader';
import { settingsAPI } from '../../services/api';

const SettingsScreen = ({ navigation }) => {
  const { logout } = useAuth();
  const [notifications, setNotifications] = useState(true);
  const [location, setLocation] = useState(true);

  // Load persisted settings from DB
  useEffect(() => {
    settingsAPI.get()
      .then(r => {
        if (r.data) {
          setNotifications(r.data.notifications_enabled ?? true);
          setLocation(r.data.location_enabled ?? true);
        }
      })
      .catch(() => {});
  }, []);

  const updateSetting = (key, val) => {
    const updates = { notifications_enabled: notifications, location_enabled: location, [key]: val };
    settingsAPI.update(updates).catch(() => {});
  };

  const handleNotifToggle = (val) => { setNotifications(val); updateSetting('notifications_enabled', val); };
  const handleLocToggle = (val) => { setLocation(val); updateSetting('location_enabled', val); };

  const handleLogout = () => {
    Alert.alert('Log out', 'Are you sure you want to log out?', [
      { text: 'Cancel', style: 'cancel' },
      { text: 'Log out', style: 'destructive', onPress: logout },
    ]);
  };

  return (
    <SafeAreaView style={styles.safe}>
      <StatusBar barStyle="dark-content" backgroundColor={colors.background} />
      <ScreenHeader
        title="Settings"
        subtitle="Account"
        onBack={() => navigation.goBack()}
      />

      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{ padding: spacing.md, paddingBottom: spacing.xxl }}>
        <Stagger initialDelay={120} step={40} distance={14}>
          <Section label="Account">
            <MenuItem Icon={UserIcon} label="Edit profile" color="#40916C" onPress={() => navigation.navigate('EditProfile')} />
            <MenuItem Icon={LockIcon} label="Change password" color="#457B9D" onPress={() => navigation.navigate('ChangePassword')} />
            <MenuItem Icon={Shield01Icon} label="Privacy" color="#8B5CF6" onPress={() => navigation.navigate('Privacy')} isLast />
          </Section>

          <Section label="Preferences">
            <ToggleItem Icon={Notification01Icon} label="Notifications" color="#E76F51" value={notifications} onChange={handleNotifToggle} />
            <ToggleItem Icon={MapPinIcon} label="Location services" color="#52B788" value={location} onChange={handleLocToggle} />
            <MenuItem Icon={Download01Icon} label="Offline maps" color="#6B4423" onPress={() => navigation.navigate('OfflineMaps')} isLast />
          </Section>

          <Section label="Support">
            <MenuItem Icon={HelpCircleIcon} label="Help center" color="#40916C" onPress={() => navigation.navigate('HelpCenter')} />
            <MenuItem Icon={Message01Icon} label="Report a problem" color="#E76F51" onPress={() => navigation.navigate('ReportIssue')} isLast />
          </Section>

          <PressableScale style={styles.logoutBtn} onPress={handleLogout} scaleTo={0.98}>
            <HugeiconsIcon icon={Logout01Icon} size={18} color={colors.danger} strokeWidth={2.25} />
            <Text style={styles.logoutText}>Log out</Text>
          </PressableScale>

          <Text style={styles.version}>Treco v1.0 · Nepal</Text>
        </Stagger>
      </ScrollView>
    </SafeAreaView>
  );
};

const Section = ({ label, children }) => (
  <View style={styles.section}>
    <Text style={styles.sectionLabel}>{label}</Text>
    <Card style={styles.sectionCard} padding={0}>{children}</Card>
  </View>
);

const MenuItem = ({ Icon, label, color, onPress, isLast }) => (
  <PressableScale onPress={onPress} style={[styles.row, !isLast && styles.rowDivider]} scaleTo={0.99}>
    <View style={[styles.rowIcon, { backgroundColor: `${color}22` }]}>
      <HugeiconsIcon icon={Icon} size={16} color={color} strokeWidth={2.25} />
    </View>
    <Text style={styles.rowLabel}>{label}</Text>
    <HugeiconsIcon icon={ArrowRight01Icon} size={18} color={colors.textLight} strokeWidth={2.25} />
  </PressableScale>
);

const ToggleItem = ({ Icon, label, color, value, onChange, isLast }) => (
  <View style={[styles.row, !isLast && styles.rowDivider]}>
    <View style={[styles.rowIcon, { backgroundColor: `${color}22` }]}>
      <HugeiconsIcon icon={Icon} size={16} color={color} strokeWidth={2.25} />
    </View>
    <Text style={styles.rowLabel}>{label}</Text>
    <Switch
      value={value}
      onValueChange={onChange}
      trackColor={{ false: colors.border, true: colors.primaryLight }}
      thumbColor={value ? colors.primary : '#fff'}
    />
  </View>
);

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: colors.background },



  title: { fontSize: fontSize.xl, fontWeight: fontWeight.bold, color: colors.text, letterSpacing: -0.3, marginTop: 2 },

  section: { marginBottom: spacing.lg },
  sectionLabel: {
    fontSize: fontSize.xs, fontWeight: fontWeight.bold,
    color: colors.primaryLight, letterSpacing: 2, textTransform: 'uppercase',
    marginBottom: spacing.sm, paddingLeft: 4,
  },
  sectionCard: { overflow: 'hidden' },

  row: {
    flexDirection: 'row', alignItems: 'center', gap: spacing.sm,
    paddingHorizontal: spacing.md, paddingVertical: 14,
  },
  rowDivider: { borderBottomWidth: 1, borderBottomColor: colors.border },
  rowIcon: {
    width: 32, height: 32, borderRadius: 10,
    alignItems: 'center', justifyContent: 'center',
  },
  rowLabel: { flex: 1, fontSize: fontSize.md, color: colors.text, fontWeight: fontWeight.medium },

  logoutBtn: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: spacing.sm,
    backgroundColor: colors.card, borderRadius: radius.round,
    paddingVertical: 14, marginTop: spacing.sm,
    borderWidth: 1, borderColor: colors.danger + '40',
  },
  logoutText: { color: colors.danger, fontSize: fontSize.md, fontWeight: fontWeight.bold },
  version: { textAlign: 'center', color: colors.textLight, fontSize: fontSize.xs, marginTop: spacing.lg, fontWeight: fontWeight.medium },
});

export default SettingsScreen;
