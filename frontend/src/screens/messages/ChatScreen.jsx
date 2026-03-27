import React, { useState, useRef } from 'react';
import {
  View, Text, StyleSheet, ScrollView, TouchableOpacity,
  TextInput, StatusBar, SafeAreaView, KeyboardAvoidingView, Platform,
} from 'react-native';
import { colors } from '../../constants/colors';
import { useAuth } from '../../context/AuthContext';

const initialMessages = [
  { id: '1', sender: 'Hari Sharma', initial: 'H', text: 'Good morning everyone! Ready for the trek?', time: '8:00 AM', mine: false },
  { id: '2', sender: 'Priya Thapa', initial: 'P', text: 'Yes! So excited 🏔️', time: '8:05 AM', mine: false },
  { id: '3', sender: 'Me', initial: 'R', text: 'Packed and ready!', time: '8:07 AM', mine: true },
  { id: '4', sender: 'Ramesh KC', initial: 'R', text: 'See you all at the meeting point at 6am tomorrow', time: '8:10 AM', mine: false },
  { id: '5', sender: 'Hari Sharma', initial: 'H', text: 'Don\'t forget your permits!', time: '8:12 AM', mine: false },
];

const ChatScreen = ({ route, navigation }) => {
  const { groupName, groupId } = route.params;
  const { user } = useAuth();
  const [messages, setMessages] = useState(initialMessages);
  const [text, setText] = useState('');
  const scrollRef = useRef(null);

  const sendMessage = () => {
    if (!text.trim()) return;
    setMessages((prev) => [
      ...prev,
      {
        id: String(Date.now()),
        sender: 'Me',
        initial: user?.fullName?.[0] || 'R',
        text: text.trim(),
        time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        mine: true,
      },
    ]);
    setText('');
    setTimeout(() => scrollRef.current?.scrollToEnd({ animated: true }), 100);
  };

  return (
    <SafeAreaView style={styles.safe}>
      <StatusBar barStyle="dark-content" backgroundColor={colors.white} />
      <KeyboardAvoidingView style={{ flex: 1 }} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
        {/* Header */}
        <View style={styles.header}>
          <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backBtn}>
            <Text style={styles.backText}>←</Text>
          </TouchableOpacity>
          <View style={styles.headerCenter}>
            <View style={styles.headerAvatar}>
              <Text style={styles.headerAvatarText}>{groupName.slice(0, 2).toUpperCase()}</Text>
            </View>
            <View>
              <Text style={styles.headerName}>{groupName}</Text>
              <Text style={styles.headerSub}>{messages.length} members</Text>
            </View>
          </View>
          <TouchableOpacity>
            <Text style={styles.moreIcon}>⋮</Text>
          </TouchableOpacity>
        </View>

        {/* Messages */}
        <ScrollView
          ref={scrollRef}
          style={styles.messageList}
          showsVerticalScrollIndicator={false}
          onContentSizeChange={() => scrollRef.current?.scrollToEnd({ animated: false })}
        >
          <Text style={styles.dateLabel}>Today</Text>
          {messages.map((msg) => (
            <View key={msg.id} style={[styles.msgRow, msg.mine && styles.msgRowMine]}>
              {!msg.mine && (
                <View style={styles.msgAvatar}>
                  <Text style={styles.msgAvatarText}>{msg.initial}</Text>
                </View>
              )}
              <View style={[styles.bubble, msg.mine && styles.bubbleMine]}>
                <Text style={[styles.bubbleText, msg.mine && styles.bubbleTextMine]}>{msg.text}</Text>
                <Text style={[styles.bubbleTime, msg.mine && { color: 'rgba(255,255,255,0.7)' }]}>{msg.time}</Text>
              </View>
            </View>
          ))}
          <View style={{ height: 16 }} />
        </ScrollView>

        {/* Quick actions */}
        <View style={styles.quickActions}>
          <TouchableOpacity style={styles.quickBtn}>
            <Text style={styles.quickBtnText}>📍 Share Location</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={styles.quickBtn}
            onPress={() => navigation.navigate('Checklist', { groupId })}
          >
            <Text style={styles.quickBtnText}>✅ Checklist</Text>
          </TouchableOpacity>
        </View>

        {/* Input */}
        <View style={styles.inputRow}>
          <TextInput
            style={styles.input}
            placeholder="Type a message..."
            placeholderTextColor={colors.textMuted}
            value={text}
            onChangeText={setText}
            multiline
          />
          <TouchableOpacity style={styles.sendBtn} onPress={sendMessage}>
            <Text style={styles.sendBtnText}>→</Text>
          </TouchableOpacity>
        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: colors.background },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 12,
    backgroundColor: colors.white,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  backBtn: { padding: 4, marginRight: 4 },
  backText: { fontSize: 22, color: colors.textPrimary },
  headerCenter: { flex: 1, flexDirection: 'row', alignItems: 'center', gap: 10 },
  headerAvatar: {
    width: 38, height: 38, borderRadius: 19,
    backgroundColor: colors.primary,
    alignItems: 'center', justifyContent: 'center',
  },
  headerAvatarText: { color: colors.white, fontSize: 12, fontWeight: '700' },
  headerName: { fontSize: 15, fontWeight: '700', color: colors.textPrimary },
  headerSub: { fontSize: 12, color: colors.textMuted },
  moreIcon: { fontSize: 22, color: colors.textPrimary, padding: 4 },
  messageList: { flex: 1, paddingHorizontal: 12 },
  dateLabel: { textAlign: 'center', color: colors.textMuted, fontSize: 12, marginVertical: 12 },
  msgRow: { flexDirection: 'row', marginBottom: 12, alignItems: 'flex-end' },
  msgRowMine: { justifyContent: 'flex-end' },
  msgAvatar: {
    width: 30, height: 30, borderRadius: 15,
    backgroundColor: colors.primary,
    alignItems: 'center', justifyContent: 'center',
    marginRight: 8,
  },
  msgAvatarText: { color: colors.white, fontSize: 12, fontWeight: '600' },
  bubble: {
    maxWidth: '72%',
    backgroundColor: colors.white,
    borderRadius: 16,
    borderBottomLeftRadius: 4,
    padding: 10,
    elevation: 1,
  },
  bubbleMine: {
    backgroundColor: colors.primary,
    borderBottomLeftRadius: 16,
    borderBottomRightRadius: 4,
  },
  bubbleText: { fontSize: 14, color: colors.textPrimary, lineHeight: 20 },
  bubbleTextMine: { color: colors.white },
  bubbleTime: { fontSize: 10, color: colors.textMuted, marginTop: 4, alignSelf: 'flex-end' },
  quickActions: {
    flexDirection: 'row',
    paddingHorizontal: 12,
    paddingVertical: 8,
    gap: 8,
    backgroundColor: colors.white,
    borderTopWidth: 1,
    borderTopColor: colors.border,
  },
  quickBtn: {
    backgroundColor: colors.accentVeryLight,
    paddingHorizontal: 14,
    paddingVertical: 6,
    borderRadius: 20,
  },
  quickBtnText: { fontSize: 12, color: colors.primary, fontWeight: '500' },
  inputRow: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    padding: 12,
    backgroundColor: colors.white,
    gap: 10,
  },
  input: {
    flex: 1,
    backgroundColor: colors.inputBg,
    borderRadius: 24,
    paddingHorizontal: 16,
    paddingVertical: 10,
    fontSize: 15,
    color: colors.textPrimary,
    maxHeight: 100,
  },
  sendBtn: {
    width: 44, height: 44, borderRadius: 22,
    backgroundColor: colors.primary,
    alignItems: 'center', justifyContent: 'center',
  },
  sendBtnText: { color: colors.white, fontSize: 18, fontWeight: '700' },
});

export default ChatScreen;
