import React, { useState } from 'react';
import {
  View, Text, StyleSheet, ScrollView, TouchableOpacity,
  StatusBar, SafeAreaView, Alert,
} from 'react-native';
import { colors } from '../../constants/colors';

const groupDetails = {
  '1': {
    name: 'Langtang Valley Trek', dates: 'Dec 28–Jan 3', difficulty: 'Moderate',
    organizer: { name: 'Hari Sharma', rating: 4.9, initial: 'H', verified: true },
    members: [
      { name: 'Hari Sharma', role: 'Organizer', rating: 4.9, initial: 'H', verified: true },
      { name: 'Priya Thapa', role: 'Member', rating: 4.7, initial: 'P', verified: false },
      { name: 'Ramesh KC', role: 'Member', rating: 4.5, initial: 'R', verified: false },
      { name: 'Sita Gurung', role: 'Member', rating: 4.6, initial: 'S', verified: false },
      { name: 'Anuj Shrestha', role: 'Member', rating: 4.8, initial: 'A', verified: false },
    ],
    maxMembers: 8,
    budget: 'NPR 25,000',
    meetingPoint: 'Kathmandu',
    hasChecklist: true,
  },
};

const avatarColors = ['#1B4D3E', '#2196F3', '#FF5722', '#9C27B0', '#FF9800'];

const GroupDetailScreen = ({ route, navigation }) => {
  const { groupId } = route.params;
  const group = groupDetails[groupId] || {
    name: 'Trek Group', dates: 'TBD', difficulty: 'Moderate',
    organizer: { name: 'Organizer', rating: 4.5, initial: 'O', verified: false },
    members: [], maxMembers: 8, budget: 'TBD', meetingPoint: 'TBD', hasChecklist: false,
  };
  const [joined, setJoined] = useState(false);

  const handleJoin = () => {
    Alert.alert(
      'Join Group',
      `Send a request to join "${group.name}"?`,
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Send Request', onPress: () => {
            setJoined(true);
            Alert.alert('Request Sent!', 'The group organizer will review your request.');
          }
        },
      ]
    );
  };

  return (
    <SafeAreaView style={styles.safe}>
      <StatusBar barStyle="dark-content" backgroundColor={colors.background} />
      <ScrollView showsVerticalScrollIndicator={false}>
        <View style={styles.header}>
          <TouchableOpacity onPress={() => navigation.goBack()}>
            <Text style={styles.backText}>←</Text>
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Group Details</Text>
          <TouchableOpacity>
            <Text style={styles.moreIcon}>⋮</Text>
          </TouchableOpacity>
        </View>

        <View style={styles.body}>
          {/* Group info */}
          <View style={styles.card}>
            <Text style={styles.groupName}>{group.name}</Text>
            <View style={styles.tagRow}>
              <View style={styles.dateBadge}>
                <Text style={styles.dateBadgeText}>{group.dates}</Text>
              </View>
              <View style={styles.diffBadge}>
                <Text style={styles.diffBadgeText}>{group.difficulty}</Text>
              </View>
            </View>
            <Text style={styles.organizedBy}>Organized by: {group.organizer.name}</Text>
          </View>

          {/* Members */}
          <Text style={styles.sectionTitle}>Members ({group.members.length}/{group.maxMembers})</Text>
          <View style={styles.card}>
            {group.members.map((m, i) => (
              <View key={i} style={[styles.memberRow, i < group.members.length - 1 && styles.memberRowBorder]}>
                <View style={[styles.avatar, { backgroundColor: avatarColors[i % avatarColors.length] }]}>
                  <Text style={styles.avatarText}>{m.initial}</Text>
                </View>
                <View style={styles.memberInfo}>
                  <Text style={styles.memberName}>{m.name}</Text>
                  <Text style={styles.memberMeta}>{m.role} • {m.rating} ★</Text>
                </View>
                {m.verified && (
                  <View style={styles.verifiedBadge}>
                    <Text style={styles.verifiedText}>Verified</Text>
                  </View>
                )}
              </View>
            ))}
            <TouchableOpacity style={styles.viewAllBtn}>
              <Text style={styles.viewAllText}>View all {group.members.length} members</Text>
            </TouchableOpacity>
          </View>

          {/* Trip Logistics */}
          <Text style={styles.sectionTitle}>Trip Logistics</Text>
          <View style={styles.card}>
            <View style={styles.logisticsRow}>
              <View style={styles.logisticsItem}>
                <Text style={styles.logisticsLabel}>Budget</Text>
                <Text style={styles.logisticsValue}>{group.budget}</Text>
              </View>
              <View style={styles.logisticsItem}>
                <Text style={styles.logisticsLabel}>Meeting Point</Text>
                <Text style={styles.logisticsValue}>{group.meetingPoint}</Text>
              </View>
            </View>
            {group.hasChecklist && (
              <TouchableOpacity
                style={styles.checklistRow}
                onPress={() => navigation.navigate('Checklist', { groupId })}
              >
                <Text style={styles.checklistLabel}>Gear Checklist</Text>
                <Text style={styles.checklistView}>View</Text>
              </TouchableOpacity>
            )}
          </View>

          {/* Action buttons */}
          <View style={styles.actions}>
            <TouchableOpacity
              style={styles.messageBtn}
              onPress={() => navigation.navigate('Chat', { groupId, groupName: group.name })}
            >
              <Text style={styles.messageBtnText}>Message</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[styles.joinBtn, joined && styles.joinBtnDisabled]}
              onPress={!joined ? handleJoin : undefined}
            >
              <Text style={styles.joinBtnText}>{joined ? 'Request Sent' : 'Join Group'}</Text>
            </TouchableOpacity>
          </View>
        </View>
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
  backText: { fontSize: 22, color: colors.textPrimary, padding: 4 },
  headerTitle: { fontSize: 17, fontWeight: '700', color: colors.textPrimary },
  moreIcon: { fontSize: 22, color: colors.textPrimary, padding: 4 },
  body: { padding: 16 },
  card: {
    backgroundColor: colors.white,
    borderRadius: 16,
    padding: 16,
    marginBottom: 16,
    elevation: 2,
    shadowColor: '#000',
    shadowOpacity: 0.05,
    shadowRadius: 4,
    shadowOffset: { width: 0, height: 2 },
  },
  groupName: { fontSize: 20, fontWeight: '700', color: colors.textPrimary, marginBottom: 8 },
  tagRow: { flexDirection: 'row', gap: 8, marginBottom: 8 },
  dateBadge: {
    backgroundColor: colors.accentVeryLight,
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 20,
  },
  dateBadgeText: { fontSize: 12, color: colors.primary, fontWeight: '500' },
  diffBadge: {
    backgroundColor: colors.tagModerate + '20',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 20,
  },
  diffBadgeText: { fontSize: 12, color: colors.tagModerate, fontWeight: '500' },
  organizedBy: { fontSize: 13, color: colors.textSecondary },
  sectionTitle: { fontSize: 16, fontWeight: '700', color: colors.textPrimary, marginBottom: 8 },
  memberRow: { flexDirection: 'row', alignItems: 'center', paddingVertical: 10 },
  memberRowBorder: { borderBottomWidth: 1, borderBottomColor: colors.border },
  avatar: {
    width: 40, height: 40, borderRadius: 20,
    alignItems: 'center', justifyContent: 'center', marginRight: 12,
  },
  avatarText: { color: colors.white, fontSize: 15, fontWeight: '700' },
  memberInfo: { flex: 1 },
  memberName: { fontSize: 14, fontWeight: '600', color: colors.textPrimary },
  memberMeta: { fontSize: 12, color: colors.textSecondary },
  verifiedBadge: {
    backgroundColor: colors.warning + '20',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 20,
  },
  verifiedText: { fontSize: 11, color: colors.warning, fontWeight: '600' },
  viewAllBtn: { marginTop: 8, alignItems: 'center' },
  viewAllText: { color: colors.primary, fontSize: 13, fontWeight: '500' },
  logisticsRow: { flexDirection: 'row', marginBottom: 12 },
  logisticsItem: { flex: 1 },
  logisticsLabel: { fontSize: 12, color: colors.textMuted, marginBottom: 4 },
  logisticsValue: { fontSize: 16, fontWeight: '700', color: colors.textPrimary },
  checklistRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: colors.border,
  },
  checklistLabel: { fontSize: 14, color: colors.textSecondary },
  checklistView: { fontSize: 14, color: colors.primary, fontWeight: '600' },
  actions: { flexDirection: 'row', gap: 12, marginBottom: 32 },
  messageBtn: {
    flex: 1,
    borderWidth: 1.5,
    borderColor: colors.primary,
    paddingVertical: 14,
    borderRadius: 50,
    alignItems: 'center',
  },
  messageBtnText: { color: colors.primary, fontSize: 15, fontWeight: '600' },
  joinBtn: {
    flex: 2,
    backgroundColor: colors.primary,
    paddingVertical: 14,
    borderRadius: 50,
    alignItems: 'center',
  },
  joinBtnDisabled: { backgroundColor: colors.textMuted },
  joinBtnText: { color: colors.white, fontSize: 15, fontWeight: '600' },
});

export default GroupDetailScreen;
