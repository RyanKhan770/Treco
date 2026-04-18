import React, { useState, useRef, useEffect, useCallback } from 'react';
import {
  View, Text, StyleSheet, FlatList, TextInput, StatusBar,
  KeyboardAvoidingView, Platform, ActivityIndicator,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import {
  ChevronLeft, MoreVertical, Send, MapPin, CheckSquare, Paperclip,
} from 'lucide-react-native';
import { colors } from '../../constants/colors';
import { fontSize, fontWeight, radius, shadows, spacing } from '../../constants/theme';
import { useAuth } from '../../context/AuthContext';
import { PressableScale, FadeIn } from '../../components/ui';
import { messagesAPI, dmAPI } from '../../services/api';

const AVATAR_COLORS = ['#40916C', '#457B9D', '#E76F51', '#6B4423', '#52B788', '#8B5CF6'];

function avatarColor(str = '') {
  let h = 0;
  for (let i = 0; i < str.length; i++) h = (h * 31 + str.charCodeAt(i)) >>> 0;
  return AVATAR_COLORS[h % AVATAR_COLORS.length];
}

function initials(name = '') {
  return name.split(' ').map((w) => w[0]).join('').slice(0, 2).toUpperCase();
}

function formatTime(dateStr) {
  if (!dateStr) return '';
  return new Date(dateStr).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
}

function formatDateLabel(dateStr) {
  if (!dateStr) return 'Today';
  const d = new Date(dateStr);
  const today = new Date();
  if (d.toDateString() === today.toDateString()) return 'Today';
  const yesterday = new Date(today);
  yesterday.setDate(today.getDate() - 1);
  if (d.toDateString() === yesterday.toDateString()) return 'Yesterday';
  return d.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
}

// Insert date separator items between messages from different days
function insertDateSeparators(msgs) {
  const items = [];
  let lastDate = null;
  for (const msg of msgs) {
    const d = msg.created_at ? new Date(msg.created_at).toDateString() : null;
    if (d && d !== lastDate) {
      items.push({ _separator: true, _key: `sep-${d}`, label: formatDateLabel(msg.created_at) });
      lastDate = d;
    }
    items.push(msg);
  }
  return items;
}

const ChatScreen = ({ route, navigation }) => {
  const { groupId, groupName, isDM, receiverId, receiverName } = route.params;
  const { user } = useAuth();

  const [messages, setMessages] = useState([]);
  const [loading, setLoading] = useState(true);
  const [sending, setSending] = useState(false);
  const [text, setText] = useState('');
  const flatRef = useRef(null);
  const pollRef = useRef(null);

  const displayName = isDM ? (receiverName || groupName) : groupName;

  const fetchMessages = useCallback(async (silent = false) => {
    try {
      if (!silent) setLoading(true);
      const res = isDM
        ? await dmAPI.getMessages(receiverId)
        : await messagesAPI.getGroupMessages(groupId);
      setMessages(res.data || []);
    } catch (err) {
      // Silently fail on background polls
    } finally {
      setLoading(false);
    }
  }, [isDM, receiverId, groupId]);

  useEffect(() => {
    fetchMessages();
    // Poll every 4 seconds for new messages
    pollRef.current = setInterval(() => fetchMessages(true), 4000);
    return () => clearInterval(pollRef.current);
  }, [fetchMessages]);

  // Scroll to bottom when messages change
  useEffect(() => {
    if (messages.length > 0) {
      setTimeout(() => flatRef.current?.scrollToEnd({ animated: true }), 100);
    }
  }, [messages.length]);

  const sendMessage = async () => {
    const content = text.trim();
    if (!content || sending) return;
    try {
      setSending(true);
      setText('');
      if (isDM) {
        await dmAPI.send(receiverId, content);
      } else {
        await messagesAPI.send(groupId, content);
      }
      await fetchMessages(true);
    } catch (err) {
      setText(content); // Restore on error
    } finally {
      setSending(false);
    }
  };

  const isMyMessage = (msg) => {
    if (!user) return false;
    const senderId = msg.sender_id ?? msg.senderId;
    return senderId === user.id || senderId === user._id;
  };

  const listData = insertDateSeparators(messages);

  const renderItem = ({ item }) => {
    if (item._separator) {
      return (
        <View style={styles.dateChip}>
          <Text style={styles.dateLabel}>{item.label}</Text>
        </View>
      );
    }

    const mine = isMyMessage(item);
    const senderName = item.sender_name || item.senderName || 'Unknown';
    const color = avatarColor(senderName);
    const abbr = initials(senderName);
    const msgText = item.content || item.text || '';
    const time = formatTime(item.created_at || item.createdAt);

    return (
      <View style={[styles.msgRow, mine && styles.msgRowMine]}>
        {!mine && (
          <View style={[styles.msgAvatar, { backgroundColor: color }]}>
            <Text style={styles.msgAvatarText}>{abbr}</Text>
          </View>
        )}
        <View style={{ maxWidth: '74%' }}>
          {!mine && <Text style={styles.senderName}>{senderName}</Text>}
          <View style={[styles.bubble, mine ? styles.bubbleMine : styles.bubbleTheirs]}>
            <Text style={[styles.bubbleText, mine && styles.bubbleTextMine]}>{msgText}</Text>
          </View>
          <Text style={[styles.time, mine && { textAlign: 'right' }]}>{time}</Text>
        </View>
      </View>
    );
  };

  const avatarColor2 = avatarColor(displayName);

  return (
    <SafeAreaView style={styles.safe}>
      <StatusBar barStyle="dark-content" backgroundColor={colors.background} />
      <KeyboardAvoidingView style={{ flex: 1 }} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>

        {/* ── Header ───────────────────────────────────────────────────────── */}
        <FadeIn style={styles.header}>
          <PressableScale onPress={() => navigation.goBack()} style={styles.backBtn} scaleTo={0.9}>
            <ChevronLeft size={22} color={colors.text} strokeWidth={2.25} />
          </PressableScale>
          <View style={styles.headerCenter}>
            <View style={[styles.headerAvatar, { backgroundColor: avatarColor2 }]}>
              <Text style={styles.headerAvatarText}>{initials(displayName)}</Text>
            </View>
            <View style={{ flex: 1 }}>
              <Text style={styles.headerName} numberOfLines={1}>{displayName}</Text>
              <Text style={styles.headerSub}>
                {isDM ? 'Direct message' : `${messages.length} messages`}
              </Text>
            </View>
          </View>
          <PressableScale style={styles.iconBtn} scaleTo={0.9}>
            <MoreVertical size={20} color={colors.text} strokeWidth={2.25} />
          </PressableScale>
        </FadeIn>

        {/* ── Messages ─────────────────────────────────────────────────────── */}
        {loading ? (
          <View style={styles.loadingContainer}>
            <ActivityIndicator color={colors.primary} size="large" />
            <Text style={styles.loadingText}>Loading messages…</Text>
          </View>
        ) : (
          <FlatList
            ref={flatRef}
            data={listData}
            keyExtractor={(item, idx) => item._key || String(item.id || idx)}
            renderItem={renderItem}
            style={styles.messageList}
            contentContainerStyle={{ paddingVertical: spacing.md }}
            showsVerticalScrollIndicator={false}
            ListEmptyComponent={
              <View style={styles.emptyContainer}>
                <Text style={styles.emptyText}>No messages yet. Say hi!</Text>
              </View>
            }
            onContentSizeChange={() => flatRef.current?.scrollToEnd({ animated: false })}
          />
        )}

        {/* ── Quick actions (group only) ────────────────────────────────────── */}
        {!isDM && (
          <View style={styles.quickActions}>
            <PressableScale style={styles.quickBtn} scaleTo={0.95}>
              <MapPin size={14} color={colors.primary} strokeWidth={2.25} />
              <Text style={styles.quickBtnText}>Location</Text>
            </PressableScale>
            <PressableScale
              style={styles.quickBtn}
              onPress={() => navigation.navigate('Checklist', { groupId })}
              scaleTo={0.95}
            >
              <CheckSquare size={14} color={colors.primary} strokeWidth={2.25} />
              <Text style={styles.quickBtnText}>Checklist</Text>
            </PressableScale>
          </View>
        )}

        {/* ── Input ─────────────────────────────────────────────────────────── */}
        <View style={styles.inputRow}>
          <PressableScale style={styles.attachBtn} scaleTo={0.9}>
            <Paperclip size={18} color={colors.textSecondary} strokeWidth={2.25} />
          </PressableScale>
          <TextInput
            style={styles.input}
            placeholder="Message…"
            placeholderTextColor={colors.textMuted}
            value={text}
            onChangeText={setText}
            multiline
            onSubmitEditing={sendMessage}
            blurOnSubmit={false}
          />
          <PressableScale
            style={[styles.sendBtn, (!text.trim() || sending) && styles.sendBtnDisabled]}
            onPress={sendMessage}
            scaleTo={0.88}
            disabled={!text.trim() || sending}
          >
            {sending
              ? <ActivityIndicator color="#fff" size="small" />
              : <Send size={18} color="#fff" strokeWidth={2.5} />
            }
          </PressableScale>
        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: colors.background },

  header: {
    flexDirection: 'row', alignItems: 'center', gap: spacing.sm,
    paddingHorizontal: spacing.md, paddingVertical: spacing.sm,
    backgroundColor: colors.card,
    borderBottomWidth: 1, borderBottomColor: colors.border,
  },
  backBtn: {
    width: 36, height: 36, borderRadius: 18,
    backgroundColor: colors.surface,
    alignItems: 'center', justifyContent: 'center',
  },
  headerCenter: { flex: 1, flexDirection: 'row', alignItems: 'center', gap: spacing.sm },
  headerAvatar: {
    width: 40, height: 40, borderRadius: 20,
    alignItems: 'center', justifyContent: 'center',
  },
  headerAvatarText: { color: '#fff', fontSize: fontSize.xs, fontWeight: fontWeight.bold, letterSpacing: 0.5 },
  headerName: { fontSize: fontSize.md, fontWeight: fontWeight.bold, color: colors.text, letterSpacing: -0.2 },
  headerSub: { fontSize: fontSize.xs, color: colors.textLight, fontWeight: fontWeight.medium, marginTop: 1 },
  iconBtn: {
    width: 36, height: 36, borderRadius: 18,
    backgroundColor: colors.surface,
    alignItems: 'center', justifyContent: 'center',
  },

  loadingContainer: { flex: 1, alignItems: 'center', justifyContent: 'center', gap: spacing.sm },
  loadingText: { fontSize: fontSize.sm, color: colors.textSecondary },

  messageList: { flex: 1, paddingHorizontal: spacing.md },
  emptyContainer: { flex: 1, alignItems: 'center', paddingTop: spacing.xxl },
  emptyText: { fontSize: fontSize.sm, color: colors.textMuted, fontStyle: 'italic' },

  dateChip: {
    alignSelf: 'center',
    backgroundColor: colors.surface,
    paddingHorizontal: 12, paddingVertical: 4,
    borderRadius: radius.round,
    marginVertical: spacing.sm,
  },
  dateLabel: { color: colors.textLight, fontSize: fontSize.xs, fontWeight: fontWeight.semiBold },

  msgRow: { flexDirection: 'row', marginBottom: spacing.sm, alignItems: 'flex-end', gap: 8 },
  msgRowMine: { justifyContent: 'flex-end' },
  msgAvatar: {
    width: 32, height: 32, borderRadius: 16,
    alignItems: 'center', justifyContent: 'center',
  },
  msgAvatarText: { color: '#fff', fontSize: 11, fontWeight: fontWeight.bold },
  senderName: {
    fontSize: fontSize.xs, color: colors.textLight,
    fontWeight: fontWeight.semiBold, marginLeft: 4, marginBottom: 3,
  },
  bubble: {
    borderRadius: radius.lg,
    paddingVertical: 10, paddingHorizontal: 14,
    ...shadows.xs,
  },
  bubbleTheirs: {
    backgroundColor: colors.card,
    borderBottomLeftRadius: 4,
  },
  bubbleMine: {
    backgroundColor: colors.primary,
    borderBottomRightRadius: 4,
  },
  bubbleText: { fontSize: fontSize.sm, color: colors.text, lineHeight: 20 },
  bubbleTextMine: { color: '#fff' },
  time: { fontSize: 10, color: colors.textLight, marginTop: 3, marginHorizontal: 4 },

  quickActions: {
    flexDirection: 'row', paddingHorizontal: spacing.md, paddingVertical: spacing.xs,
    gap: spacing.sm, backgroundColor: colors.card,
  },
  quickBtn: {
    flexDirection: 'row', alignItems: 'center', gap: 6,
    backgroundColor: colors.primaryPale,
    paddingHorizontal: 12, paddingVertical: 6,
    borderRadius: radius.round,
  },
  quickBtnText: { fontSize: fontSize.xs, color: colors.primary, fontWeight: fontWeight.semiBold },

  inputRow: {
    flexDirection: 'row', alignItems: 'flex-end', gap: spacing.sm,
    paddingHorizontal: spacing.md, paddingVertical: spacing.sm,
    backgroundColor: colors.card,
    borderTopWidth: 1, borderTopColor: colors.border,
  },
  attachBtn: {
    width: 40, height: 40, borderRadius: 20,
    backgroundColor: colors.surface,
    alignItems: 'center', justifyContent: 'center',
  },
  input: {
    flex: 1,
    backgroundColor: colors.surface,
    borderRadius: radius.lg,
    paddingHorizontal: 14, paddingVertical: 10,
    fontSize: fontSize.md, color: colors.text,
    maxHeight: 100,
  },
  sendBtn: {
    width: 40, height: 40, borderRadius: 20,
    backgroundColor: colors.primary,
    alignItems: 'center', justifyContent: 'center',
    ...shadows.sm,
  },
  sendBtnDisabled: { backgroundColor: colors.textMuted },
});

export default ChatScreen;
