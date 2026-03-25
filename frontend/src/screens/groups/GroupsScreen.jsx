import React, { useState } from 'react';
import {
  View, Text, StyleSheet, ScrollView, TouchableOpacity,
  TextInput, StatusBar, SafeAreaView,
} from 'react-native';
import { colors } from '../../constants/colors';

const groups = [
  {
    id: '1', name: 'Langtang Valley Trek', dates: 'Dec 28–Jan 3',
    description: '7 days trek through beautiful Langtang valley with experienced guide.',
    members: 5, maxMembers: 8, difficulty: 'Moderate',
    memberAvatars: ['H', 'P', 'R', 'S', 'A'],
  },
  {
    id: '2', name: 'Shivapuri Day Hike', dates: 'Jan 1',
    description: 'New Year sunrise hike to Shivapuri peak. Beginners welcome!',
    members: 2, maxMembers: 6, difficulty: 'Easy',
    memberAvatars: ['M', 'K'],
  },
  {
    id: '3', name: 'Everest Base Camp', dates: 'Jan 15–28',
    description: 'Epic 14-day trek to EBC. Experienced trekkers only.',
    members: 4, maxMembers: 6, difficulty: 'Hard',
    memberAvatars: ['N', 'D', 'B', 'T'],
  },
  {
    id: '4', name: 'Poon Hill Trek', dates: 'Feb 3–7',
    description: 'Classic Poon Hill trek with stunning Annapurna views.',
    members: 3, maxMembers: 10, difficulty: 'Easy',
    memberAvatars: ['G', 'L', 'C'],
  },
];

const tabs = ['Upcoming', 'Near Me', 'My Groups'];
const avatarColors = ['#4CAF50', '#2196F3', '#FF5722', '#9C27B0', '#FF9800'];

const GroupsScreen = ({ navigation }) => {
  const [activeTab, setActiveTab] = useState('Upcoming');
  const [search, setSearch] = useState('');

  const filtered = groups.filter((g) =>
    g.name.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <SafeAreaView style={styles.safe}>
      <StatusBar barStyle="dark-content" backgroundColor={colors.background} />
      <View style={styles.container}>
        <View style={styles.header}>
          <Text style={styles.title}>Find Groups</Text>
          <TouchableOpacity
            style={styles.createBtn}
            onPress={() => navigation.navigate('CreateTrip')}
          >
            <Text style={styles.createBtnText}>+</Text>
          </TouchableOpacity>
        </View>

        <TextInput
          style={styles.search}
          placeholder="Search groups or destinations..."
          placeholderTextColor={colors.textMuted}
          value={search}
          onChangeText={setSearch}
        />

        {/* Tabs */}
        <View style={styles.tabs}>
          {tabs.map((t) => (
            <TouchableOpacity
              key={t}
              style={[styles.tab, activeTab === t && styles.tabActive]}
              onPress={() => setActiveTab(t)}
            >
              <Text style={[styles.tabText, activeTab === t && styles.tabTextActive]}>{t}</Text>
            </TouchableOpacity>
          ))}
        </View>

        <ScrollView showsVerticalScrollIndicator={false}>
          {filtered.map((group) => (
            <TouchableOpacity
              key={group.id}
              style={styles.groupCard}
              onPress={() => navigation.navigate('GroupDetail', { groupId: group.id })}
            >
              <View style={styles.cardHeader}>
                <Text style={styles.groupName}>{group.name}</Text>
                <View style={styles.dateBadge}>
                  <Text style={styles.dateBadgeText}>{group.dates}</Text>
                </View>
              </View>
              <Text style={styles.groupDesc}>{group.description}</Text>
              <View style={styles.cardFooter}>
                <View style={styles.avatarRow}>
                  {group.memberAvatars.slice(0, 3).map((initial, i) => (
                    <View
                      key={i}
                      style={[styles.avatarSmall, { backgroundColor: avatarColors[i % avatarColors.length], marginLeft: i > 0 ? -8 : 0 }]}
                    >
                      <Text style={styles.avatarSmallText}>{initial}</Text>
                    </View>
                  ))}
                  {group.members > 3 && (
                    <View style={[styles.avatarSmall, { backgroundColor: colors.accent, marginLeft: -8 }]}>
                      <Text style={styles.avatarSmallText}>+{group.members - 3}</Text>
                    </View>
                  )}
                  <Text style={styles.membersText}>{group.members}/{group.maxMembers} members</Text>
                </View>
                <TouchableOpacity
                  style={styles.joinBtn}
                  onPress={() => navigation.navigate('GroupDetail', { groupId: group.id })}
                >
                  <Text style={styles.joinBtnText}>Join</Text>
                </TouchableOpacity>
              </View>
            </TouchableOpacity>
          ))}
          <View style={{ height: 100 }} />
        </ScrollView>
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: colors.background },
  container: { flex: 1, paddingHorizontal: 16, paddingTop: 16 },
  header: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 },
  title: { fontSize: 24, fontWeight: '700', color: colors.textPrimary },
  createBtn: {
    width: 36, height: 36, borderRadius: 18,
    backgroundColor: colors.primary,
    alignItems: 'center', justifyContent: 'center',
  },
  createBtnText: { color: colors.white, fontSize: 22, lineHeight: 26 },
  search: {
    backgroundColor: colors.white,
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 12,
    fontSize: 15,
    color: colors.textPrimary,
    marginBottom: 12,
    elevation: 1,
  },
  tabs: { flexDirection: 'row', backgroundColor: colors.white, borderRadius: 12, padding: 4, marginBottom: 16 },
  tab: { flex: 1, paddingVertical: 8, alignItems: 'center', borderRadius: 8 },
  tabActive: { backgroundColor: colors.primary },
  tabText: { fontSize: 13, color: colors.textSecondary, fontWeight: '500' },
  tabTextActive: { color: colors.white, fontWeight: '600' },
  groupCard: {
    backgroundColor: colors.white,
    borderRadius: 16,
    padding: 16,
    marginBottom: 12,
    elevation: 2,
    shadowColor: '#000',
    shadowOpacity: 0.06,
    shadowRadius: 4,
    shadowOffset: { width: 0, height: 2 },
  },
  cardHeader: { marginBottom: 8 },
  groupName: { fontSize: 16, fontWeight: '700', color: colors.textPrimary, marginBottom: 6 },
  dateBadge: {
    alignSelf: 'flex-start',
    backgroundColor: colors.accentVeryLight,
    paddingHorizontal: 10,
    paddingVertical: 3,
    borderRadius: 20,
    marginBottom: 6,
  },
  dateBadgeText: { fontSize: 12, color: colors.primary, fontWeight: '500' },
  groupDesc: { fontSize: 13, color: colors.textSecondary, lineHeight: 19, marginBottom: 12 },
  cardFooter: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  avatarRow: { flexDirection: 'row', alignItems: 'center' },
  avatarSmall: {
    width: 28, height: 28, borderRadius: 14,
    alignItems: 'center', justifyContent: 'center',
    borderWidth: 1.5, borderColor: colors.white,
  },
  avatarSmallText: { color: colors.white, fontSize: 11, fontWeight: '600' },
  membersText: { fontSize: 12, color: colors.textSecondary, marginLeft: 8 },
  joinBtn: {
    backgroundColor: colors.primary,
    paddingHorizontal: 20,
    paddingVertical: 8,
    borderRadius: 20,
  },
  joinBtnText: { color: colors.white, fontSize: 13, fontWeight: '600' },
});

export default GroupsScreen;
