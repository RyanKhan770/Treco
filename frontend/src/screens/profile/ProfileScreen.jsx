import React from 'react';
import {
  View, Text, StyleSheet, ScrollView, TouchableOpacity,
  StatusBar, SafeAreaView,
} from 'react-native';
import { colors } from '../../constants/colors';
import { useAuth } from '../../context/AuthContext';

const ProfileScreen = ({ navigation }) => {
  const { user } = useAuth();
  const name = user?.fullName || 'Ryan Khan';
  const initial = name[0]?.toUpperCase() || 'R';

  const menuItems = [
    { label: 'My Trips', icon: '🏔️', screen: 'MyTrips' },
    { label: 'Saved Trails', icon: '🔖', screen: 'Explore' },
    { label: 'My Reviews', icon: '⭐', screen: 'Reviews' },
    { label: 'Verify Identity', icon: '🪪', screen: 'VerifyIdentity', badge: 'Pending' },
  ];

  return (
    <SafeAreaView style={styles.safe}>
      <StatusBar barStyle="light-content" backgroundColor={colors.primary} />
      <ScrollView showsVerticalScrollIndicator={false}>
        {/* Header banner */}
        <View style={styles.banner}>
          <TouchableOpacity
            style={styles.settingsBtn}
            onPress={() => navigation.navigate('Settings')}
          >
            <Text style={styles.settingsIcon}>⚙️</Text>
          </TouchableOpacity>
          <View style={styles.avatarContainer}>
            <View style={styles.avatar}>
              <Text style={styles.avatarText}>{initial}</Text>
            </View>
            <View style={styles.verifiedDot} />
          </View>
          <Text style={styles.name}>{name}</Text>
          <Text style={styles.location}>📍 Kathmandu, Nepal</Text>
          <View style={styles.ratingRow}>
            <Text style={styles.ratingText}>⭐ 4.8 Rating</Text>
          </View>
        </View>

        {/* Stats */}
        <View style={styles.statsCard}>
          <StatItem value="12" label="Treks" />
          <View style={styles.statDivider} />
          <StatItem value="8" label="Groups" />
          <View style={styles.statDivider} />
          <StatItem value="23" label="Reviews" />
        </View>

        {/* Menu items */}
        <View style={styles.menu}>
          {menuItems.map((item) => (
            <TouchableOpacity
              key={item.label}
              style={styles.menuItem}
              onPress={() => navigation.navigate(item.screen)}
            >
              <Text style={styles.menuIcon}>{item.icon}</Text>
              <Text style={styles.menuLabel}>{item.label}</Text>
              <View style={styles.menuRight}>
                {item.badge && (
                  <View style={styles.badge}>
                    <Text style={styles.badgeText}>{item.badge}</Text>
                  </View>
                )}
                <Text style={styles.chevron}>→</Text>
              </View>
            </TouchableOpacity>
          ))}
        </View>

        <View style={{ height: 100 }} />
      </ScrollView>
    </SafeAreaView>
  );
};

const StatItem = ({ value, label }) => (
  <View style={styles.statItem}>
    <Text style={styles.statValue}>{value}</Text>
    <Text style={styles.statLabel}>{label}</Text>
  </View>
);

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: colors.background },
  banner: {
    backgroundColor: colors.primary,
    paddingTop: 20,
    paddingBottom: 40,
    alignItems: 'center',
    position: 'relative',
  },
  settingsBtn: { position: 'absolute', top: 16, right: 16, padding: 4 },
  settingsIcon: { fontSize: 22 },
  avatarContainer: { position: 'relative', marginBottom: 12 },
  avatar: {
    width: 80, height: 80, borderRadius: 40,
    backgroundColor: colors.accent,
    alignItems: 'center', justifyContent: 'center',
    borderWidth: 3, borderColor: colors.white,
  },
  avatarText: { color: colors.white, fontSize: 32, fontWeight: '700' },
  verifiedDot: {
    position: 'absolute', bottom: 2, right: 2,
    width: 20, height: 20, borderRadius: 10,
    backgroundColor: colors.accent,
    borderWidth: 2, borderColor: colors.white,
  },
  name: { fontSize: 22, fontWeight: '700', color: colors.white, marginBottom: 4 },
  location: { fontSize: 13, color: 'rgba(255,255,255,0.8)', marginBottom: 8 },
  ratingRow: {
    backgroundColor: 'rgba(255,255,255,0.15)',
    paddingHorizontal: 14,
    paddingVertical: 5,
    borderRadius: 20,
  },
  ratingText: { color: colors.white, fontSize: 13, fontWeight: '600' },
  statsCard: {
    flexDirection: 'row',
    backgroundColor: colors.white,
    borderRadius: 16,
    marginHorizontal: 16,
    marginTop: -20,
    padding: 20,
    elevation: 4,
    shadowColor: '#000',
    shadowOpacity: 0.1,
    shadowRadius: 6,
    shadowOffset: { width: 0, height: 3 },
  },
  statItem: { flex: 1, alignItems: 'center' },
  statValue: { fontSize: 22, fontWeight: '700', color: colors.textPrimary },
  statLabel: { fontSize: 12, color: colors.textMuted, marginTop: 2 },
  statDivider: { width: 1, backgroundColor: colors.border },
  menu: {
    backgroundColor: colors.white,
    borderRadius: 16,
    margin: 16,
    elevation: 2,
    shadowColor: '#000',
    shadowOpacity: 0.05,
    shadowRadius: 4,
    shadowOffset: { width: 0, height: 2 },
  },
  menuItem: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  menuIcon: { fontSize: 20, marginRight: 12 },
  menuLabel: { flex: 1, fontSize: 15, color: colors.textPrimary, fontWeight: '500' },
  menuRight: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  badge: {
    backgroundColor: colors.warning + '25',
    paddingHorizontal: 10,
    paddingVertical: 3,
    borderRadius: 20,
  },
  badgeText: { fontSize: 11, color: colors.warning, fontWeight: '600' },
  chevron: { fontSize: 16, color: colors.textMuted },
});

export default ProfileScreen;
