import React from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, StatusBar, SafeAreaView } from 'react-native';
import { colors } from '../../constants/colors';

const notifications = [
  { id: '1', type: 'group', title: 'New Group Request', body: 'Hari Sharma wants to join your Langtang Valley Trek group.', time: '2m ago', read: false },
  { id: '2', type: 'message', title: 'New Message', body: 'Priya: "See you all at the meeting point!"', time: '1h ago', read: false },
  { id: '3', type: 'checklist', title: 'Checklist Updated', body: 'Ramesh checked off "Down Jacket" in Langtang checklist.', time: '3h ago', read: true },
  { id: '4', type: 'trail', title: 'Trail Recommendation', body: 'Based on your history, try the Mardi Himal Trek!', time: 'Yesterday', read: true },
];

const iconMap = { group: '👥', message: '💬', checklist: '✅', trail: '🏔️' };

const NotificationsScreen = ({ navigation }) => (
  <SafeAreaView style={styles.safe}>
    <StatusBar barStyle="dark-content" backgroundColor={colors.white} />
    <View style={styles.header}>
      <TouchableOpacity onPress={() => navigation.goBack()}>
        <Text style={styles.back}>←</Text>
      </TouchableOpacity>
      <Text style={styles.title}>Notifications</Text>
      <View style={{ width: 40 }} />
    </View>
    <ScrollView>
      {notifications.map((n) => (
        <View key={n.id} style={[styles.notifRow, !n.read && styles.notifUnread]}>
          <View style={styles.notifIcon}>
            <Text style={styles.notifIconText}>{iconMap[n.type]}</Text>
          </View>
          <View style={styles.notifContent}>
            <Text style={styles.notifTitle}>{n.title}</Text>
            <Text style={styles.notifBody}>{n.body}</Text>
            <Text style={styles.notifTime}>{n.time}</Text>
          </View>
          {!n.read && <View style={styles.unreadDot} />}
        </View>
      ))}
      <View style={{ height: 40 }} />
    </ScrollView>
  </SafeAreaView>
);

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: colors.background },
  header: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
    padding: 16, backgroundColor: colors.white,
    borderBottomWidth: 1, borderBottomColor: colors.border,
  },
  back: { fontSize: 22, color: colors.textPrimary },
  title: { fontSize: 17, fontWeight: '700', color: colors.textPrimary },
  notifRow: {
    flexDirection: 'row', alignItems: 'flex-start',
    padding: 16, backgroundColor: colors.white,
    borderBottomWidth: 1, borderBottomColor: colors.border,
  },
  notifUnread: { backgroundColor: colors.accentVeryLight },
  notifIcon: {
    width: 44, height: 44, borderRadius: 22,
    backgroundColor: colors.white, alignItems: 'center', justifyContent: 'center',
    marginRight: 12, borderWidth: 1, borderColor: colors.border,
  },
  notifIconText: { fontSize: 20 },
  notifContent: { flex: 1 },
  notifTitle: { fontSize: 14, fontWeight: '700', color: colors.textPrimary, marginBottom: 3 },
  notifBody: { fontSize: 13, color: colors.textSecondary, lineHeight: 19, marginBottom: 4 },
  notifTime: { fontSize: 11, color: colors.textMuted },
  unreadDot: { width: 8, height: 8, borderRadius: 4, backgroundColor: colors.primary, marginTop: 6 },
});

export default NotificationsScreen;
