import React, { useState } from 'react';
import {
  View, Text, StyleSheet, ScrollView, TouchableOpacity,
  Switch, StatusBar, SafeAreaView, Alert,
} from 'react-native';
import { colors } from '../../constants/colors';
import { useAuth } from '../../context/AuthContext';

const SettingsScreen = ({ navigation }) => {
  const { logout } = useAuth();
  const [notifications, setNotifications] = useState(true);
  const [location, setLocation] = useState(true);

  const handleLogout = () => {
    Alert.alert('Log Out', 'Are you sure you want to log out?', [
      { text: 'Cancel', style: 'cancel' },
      { text: 'Log Out', style: 'destructive', onPress: logout },
    ]);
  };

  return (
    <SafeAreaView style={styles.safe}>
      <StatusBar barStyle="dark-content" backgroundColor={colors.white} />
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <Text style={styles.back}>←</Text>
        </TouchableOpacity>
        <Text style={styles.title}>Settings</Text>
        <View style={{ width: 40 }} />
      </View>

      <ScrollView showsVerticalScrollIndicator={false}>
        <Section label="ACCOUNT">
          <MenuItem label="Edit Profile" onPress={() => {}} />
          <MenuItem label="Change Password" onPress={() => {}} />
          <MenuItem label="Privacy Settings" onPress={() => {}} />
        </Section>

        <Section label="PREFERENCES">
          <ToggleItem label="Notifications" value={notifications} onChange={setNotifications} />
          <ToggleItem label="Location Services" value={location} onChange={setLocation} />
          <MenuItem label="Offline Maps" onPress={() => navigation.navigate('OfflineMaps')} />
        </Section>

        <Section label="SUPPORT">
          <MenuItem label="Help Center" onPress={() => {}} />
          <MenuItem label="Report a Problem" onPress={() => navigation.navigate('ReportIssue')} />
        </Section>

        <TouchableOpacity style={styles.logoutBtn} onPress={handleLogout}>
          <Text style={styles.logoutText}>Log Out</Text>
        </TouchableOpacity>
        <View style={{ height: 40 }} />
      </ScrollView>
    </SafeAreaView>
  );
};

const Section = ({ label, children }) => (
  <View style={styles.section}>
    <Text style={styles.sectionLabel}>{label}</Text>
    <View style={styles.sectionCard}>{children}</View>
  </View>
);

const MenuItem = ({ label, onPress }) => (
  <TouchableOpacity style={styles.menuItem} onPress={onPress}>
    <Text style={styles.menuLabel}>{label}</Text>
    <Text style={styles.chevron}>→</Text>
  </TouchableOpacity>
);

const ToggleItem = ({ label, value, onChange }) => (
  <View style={styles.menuItem}>
    <Text style={styles.menuLabel}>{label}</Text>
    <Switch
      value={value}
      onValueChange={onChange}
      trackColor={{ false: colors.border, true: colors.primary }}
      thumbColor={colors.white}
    />
  </View>
);

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
  section: { marginTop: 24, paddingHorizontal: 16 },
  sectionLabel: { fontSize: 12, fontWeight: '600', color: colors.textMuted, marginBottom: 8, letterSpacing: 0.5 },
  sectionCard: {
    backgroundColor: colors.white,
    borderRadius: 16,
    elevation: 1,
    shadowColor: '#000',
    shadowOpacity: 0.04,
    shadowRadius: 3,
    shadowOffset: { width: 0, height: 1 },
  },
  menuItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  menuLabel: { fontSize: 15, color: colors.textPrimary },
  chevron: { fontSize: 16, color: colors.textMuted },
  logoutBtn: { margin: 24, padding: 16, alignItems: 'center' },
  logoutText: { color: colors.error, fontSize: 16, fontWeight: '600' },
});

export default SettingsScreen;
