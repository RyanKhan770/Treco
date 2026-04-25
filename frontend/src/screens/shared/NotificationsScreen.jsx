import { HugeiconsIcon } from '@hugeicons/react-native';
import React, { useState, useEffect, useCallback } from 'react';
import {
  View, Text, StyleSheet, ScrollView, StatusBar,
  ActivityIndicator, RefreshControl, TouchableOpacity,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { UserGroupIcon, Message01Icon, Tick02Icon, MountainIcon, Notification01Icon, Delete02Icon, UserAdd01Icon, CheckmarkCircle01Icon, Cancel01Icon } from '@hugeicons/core-free-icons';
import { colors } from '../../constants/colors';
import { fontSize, fontWeight, radius, shadows, spacing } from '../../constants/theme';
import { PressableScale, Stagger, EmptyState } from '../../components/ui';
import ScreenHeader from '../../components/ui/ScreenHeader';
import { EmptyMessagesIllustration } from '../../assets/svg/Illustrations';
import { notificationsAPI, connectionsAPI } from '../../services/api';

const iconMap = {
  group:      { Icon: UserGroupIcon,    color: '#40916C', bg: '#D8F3DC' },
  message:    { Icon: Message01Icon,    color: '#457B9D', bg: '#D0E4F0' },
  checklist:  { Icon: Tick02Icon,       color: '#52B788', bg: '#E6F7EE' },
  trail:      { Icon: MountainIcon,     color: '#E76F51', bg: '#FBE3DC' },
  connection: { Icon: UserAdd01Icon,    color: '#6B4423', bg: '#F3E8D8' },
  default:    { Icon: Notification01Icon, color: colors.primary, bg: colors.primaryPale },
};

function timeAgo(dateStr) {
  if (!dateStr) return '';
  const diff = Date.now() - new Date(dateStr).getTime();
  const m = Math.floor(diff / 60000);
  if (m < 1)  return 'just now';
  if (m < 60) return `${m}m ago`;
  const h = Math.floor(m / 60);
  if (h < 24) return `${h}h ago`;
  const d = Math.floor(h / 24);
  return d === 1 ? 'Yesterday' : `${d}d ago`;
}

const NotificationsScreen = ({ navigation }) => {
  const [notifications, setNotifications] = useState([]);
  const [loading,       setLoading]       = useState(true);
  const [refreshing,    setRefreshing]    = useState(false);
  const [respondingTo,  setRespondingTo]  = useState(null); // track which connection is being responded to

  const fetchNotifications = useCallback(async (isRefresh = false) => {
    try {
      if (isRefresh) setRefreshing(true);
      else setLoading(true);
      const res = await notificationsAPI.getAll();
      setNotifications(res.data || []);
    } catch {
      // keep empty
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  useEffect(() => { fetchNotifications(); }, [fetchNotifications]);

  const markRead = async (id) => {
    try {
      await notificationsAPI.markRead(id);
      setNotifications((prev) =>
        prev.map((n) => n.id === id ? { ...n, is_read: true } : n),
      );
    } catch {}
  };

  const clearAll = async () => {
    try {
      await notificationsAPI.clearAll();
      setNotifications([]);
    } catch {}
  };

  const handleConnectionResponse = async (notification, status) => {
    const data = typeof notification.data === 'string' ? JSON.parse(notification.data) : notification.data;
    const connectionId = data?.connection_id;
    if (!connectionId) {
      // Fallback: try to look up connection via the sender's user ID
      try {
        const statusRes = await connectionsAPI.getStatus(data?.from_user_id);
        if (statusRes.data?.connectionId) {
          await connectionsAPI.respond(statusRes.data.connectionId, status);
        }
      } catch {}
    } else {
      try {
        setRespondingTo(notification.id);
        await connectionsAPI.respond(connectionId, status);
      } catch {}
    }
    // Mark the notification as read and update its body
    await markRead(notification.id);
    setNotifications((prev) =>
      prev.map((n) => n.id === notification.id
        ? { ...n, is_read: true, _responded: status }
        : n
      ),
    );
    setRespondingTo(null);
  };

  return (
    <SafeAreaView style={styles.safe}>
      <StatusBar barStyle="dark-content" backgroundColor={colors.background} />
      <ScreenHeader
        title="Notifications"
        subtitle="Activity"
        onBack={() => navigation.goBack()}
        right={
          notifications.length > 0 ? (
            <TouchableOpacity onPress={clearAll} style={styles.clearBtn}>
              <HugeiconsIcon icon={Delete02Icon} size={16} color={colors.textLight} strokeWidth={2.25} />
            </TouchableOpacity>
          ) : null
        }
      />

      {loading ? (
        <View style={styles.center}>
          <ActivityIndicator color={colors.primary} size="large" />
        </View>
      ) : (
        <ScrollView
          showsVerticalScrollIndicator={false}
          contentContainerStyle={{ padding: spacing.md, paddingBottom: spacing.xxl }}
          refreshControl={
            <RefreshControl
              refreshing={refreshing}
              onRefresh={() => fetchNotifications(true)}
              tintColor={colors.primary}
              colors={[colors.primary]}
            />
          }
        >
          {notifications.length > 0 ? (
            <Stagger initialDelay={80} step={35} distance={12}>
              {notifications.map((n) => {
                const typeKey = n.type in iconMap ? n.type : 'default';
                const { Icon, color, bg } = iconMap[typeKey];
                const isRead = n.is_read || n.read;
                const isConnection = n.type === 'connection';
                const responded = n._responded;

                return (
                  <PressableScale
                    key={n.id}
                    style={[styles.row, !isRead && styles.rowUnread]}
                    onPress={() => markRead(n.id)}
                    scaleTo={0.99}
                  >
                    <View style={[styles.iconWrap, { backgroundColor: bg }]}>
                      <HugeiconsIcon icon={Icon} size={18} color={color} strokeWidth={2.25} />
                    </View>
                    <View style={styles.body}>
                      <Text style={styles.rowTitle}>{n.title}</Text>
                      <Text style={styles.rowBody} numberOfLines={2}>{n.body}</Text>
                      
                      {/* Connection Accept/Reject Buttons */}
                      {isConnection && !responded && !isRead && (
                        <View style={styles.actionRow}>
                          <TouchableOpacity
                            style={styles.acceptBtn}
                            onPress={() => handleConnectionResponse(n, 'accepted')}
                            disabled={respondingTo === n.id}
                          >
                            <HugeiconsIcon icon={CheckmarkCircle01Icon} size={14} color="#fff" strokeWidth={2.5} />
                            <Text style={styles.acceptText}>Accept</Text>
                          </TouchableOpacity>
                          <TouchableOpacity
                            style={styles.declineBtn}
                            onPress={() => handleConnectionResponse(n, 'rejected')}
                            disabled={respondingTo === n.id}
                          >
                            <HugeiconsIcon icon={Cancel01Icon} size={14} color={colors.textSecondary} strokeWidth={2.5} />
                            <Text style={styles.declineText}>Decline</Text>
                          </TouchableOpacity>
                        </View>
                      )}
                      {isConnection && responded === 'accepted' && (
                        <View style={styles.respondedRow}>
                          <HugeiconsIcon icon={CheckmarkCircle01Icon} size={14} color={colors.primary} strokeWidth={2} />
                          <Text style={styles.respondedText}>Connected!</Text>
                        </View>
                      )}
                      {isConnection && responded === 'rejected' && (
                        <View style={styles.respondedRow}>
                          <Text style={[styles.respondedText, { color: colors.textLight }]}>Declined</Text>
                        </View>
                      )}
                      
                      <Text style={styles.time}>{timeAgo(n.created_at)}</Text>
                    </View>
                    {!isRead && <View style={styles.dot} />}
                  </PressableScale>
                );
              })}
            </Stagger>
          ) : (
            <EmptyState
              illustration={<EmptyMessagesIllustration size={180} />}
              title="You're all caught up"
              subtitle="New alerts from your groups and trails will show here."
            />
          )}
        </ScrollView>
      )}
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safe:   { flex: 1, backgroundColor: colors.background },
  center: { flex: 1, alignItems: 'center', justifyContent: 'center' },

  clearBtn: {
    width: 36, height: 36, borderRadius: 18,
    backgroundColor: colors.surface,
    alignItems: 'center', justifyContent: 'center',
  },

  row: {
    flexDirection: 'row', alignItems: 'flex-start', gap: spacing.sm,
    backgroundColor: colors.card, borderRadius: radius.lg,
    padding: spacing.md, marginBottom: spacing.sm,
    ...shadows.xs,
  },
  rowUnread: { borderLeftWidth: 3, borderLeftColor: colors.primary, paddingLeft: spacing.md - 3 },
  iconWrap: {
    width: 42, height: 42, borderRadius: 21,
    alignItems: 'center', justifyContent: 'center',
  },
  body:     { flex: 1 },
  rowTitle: { fontSize: fontSize.md, fontWeight: fontWeight.bold, color: colors.text, marginBottom: 2 },
  rowBody:  { fontSize: fontSize.sm, color: colors.textSecondary, lineHeight: 19 },
  time:     { fontSize: fontSize.xs, color: colors.textLight, marginTop: 6, fontWeight: fontWeight.medium },
  dot:      { width: 8, height: 8, borderRadius: 4, backgroundColor: colors.primary, marginTop: 6 },

  /* Connection action buttons */
  actionRow: {
    flexDirection: 'row',
    gap: 8,
    marginTop: 10,
  },
  acceptBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: colors.primary,
    paddingHorizontal: 14,
    paddingVertical: 7,
    borderRadius: radius.round,
  },
  acceptText: {
    color: '#fff',
    fontSize: fontSize.xs,
    fontWeight: fontWeight.bold,
  },
  declineBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: colors.surface,
    paddingHorizontal: 14,
    paddingVertical: 7,
    borderRadius: radius.round,
    borderWidth: 1,
    borderColor: colors.border,
  },
  declineText: {
    color: colors.textSecondary,
    fontSize: fontSize.xs,
    fontWeight: fontWeight.bold,
  },
  respondedRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    marginTop: 8,
  },
  respondedText: {
    color: colors.primary,
    fontSize: fontSize.xs,
    fontWeight: fontWeight.bold,
  },
});

export default NotificationsScreen;
