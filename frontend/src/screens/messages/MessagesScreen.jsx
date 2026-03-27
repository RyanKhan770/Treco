import React from 'react';
import {
  View, Text, StyleSheet, ScrollView, TouchableOpacity,
  StatusBar, SafeAreaView,
} from 'react-native';
import { colors } from '../../constants/colors';

const conversations = [
  { id: '1', groupName: 'Langtang Valley Trek', lastMessage: 'See you all at 6am!', time: '2m ago', unread: 3, members: 5, initial: 'LV' },
  { id: '2', groupName: 'Shivapuri Day Hike', lastMessage: 'Bring warm clothes', time: '1h ago', unread: 0, members: 2, initial: 'SD' },
  { id: '3', groupName: 'EBC Jan 2026', lastMessage: 'Permits confirmed ✓', time: '3h ago', unread: 1, members: 4, initial: 'EB' },
  { id: '4', groupName: 'Poon Hill Feb', lastMessage: 'Who has trekking poles?', time: 'Yesterday', unread: 0, members: 3, initial: 'PH' },
];

const MessagesScreen = ({ navigation }) => (
  <SafeAreaView style={styles.safe}>
    <StatusBar barStyle="dark-content" backgroundColor={colors.background} />
    <View style={styles.container}>
      <Text style={styles.title}>Messages</Text>
      <ScrollView showsVerticalScrollIndicator={false}>
        {conversations.map((conv) => (
          <TouchableOpacity
            key={conv.id}
            style={styles.convRow}
            onPress={() => navigation.navigate('Chat', { groupId: conv.id, groupName: conv.groupName })}
          >
            <View style={styles.avatar}>
              <Text style={styles.avatarText}>{conv.initial}</Text>
            </View>
            <View style={styles.convInfo}>
              <View style={styles.convHeader}>
                <Text style={styles.convName}>{conv.groupName}</Text>
                <Text style={styles.convTime}>{conv.time}</Text>
              </View>
              <View style={styles.convBottom}>
                <Text style={styles.lastMessage} numberOfLines={1}>{conv.lastMessage}</Text>
                {conv.unread > 0 && (
                  <View style={styles.unreadBadge}>
                    <Text style={styles.unreadText}>{conv.unread}</Text>
                  </View>
                )}
              </View>
            </View>
          </TouchableOpacity>
        ))}
        <View style={{ height: 100 }} />
      </ScrollView>
    </View>
  </SafeAreaView>
);

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: colors.background },
  container: { flex: 1, paddingTop: 16 },
  title: { fontSize: 24, fontWeight: '700', color: colors.textPrimary, paddingHorizontal: 16, marginBottom: 12 },
  convRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 14,
    backgroundColor: colors.white,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  avatar: {
    width: 50, height: 50, borderRadius: 25,
    backgroundColor: colors.primary,
    alignItems: 'center', justifyContent: 'center',
    marginRight: 12,
  },
  avatarText: { color: colors.white, fontSize: 14, fontWeight: '700' },
  convInfo: { flex: 1 },
  convHeader: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 4 },
  convName: { fontSize: 15, fontWeight: '600', color: colors.textPrimary },
  convTime: { fontSize: 12, color: colors.textMuted },
  convBottom: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  lastMessage: { fontSize: 13, color: colors.textSecondary, flex: 1 },
  unreadBadge: {
    backgroundColor: colors.primary,
    width: 20, height: 20, borderRadius: 10,
    alignItems: 'center', justifyContent: 'center',
    marginLeft: 8,
  },
  unreadText: { color: colors.white, fontSize: 11, fontWeight: '700' },
});

export default MessagesScreen;
