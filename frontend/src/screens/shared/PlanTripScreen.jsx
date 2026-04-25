import { HugeiconsIcon } from '@hugeicons/react-native';
import React, { useState, useEffect, useCallback } from 'react';
import {
  View, Text, StyleSheet, ScrollView, StatusBar, Alert, TextInput,
  KeyboardAvoidingView, Platform, TouchableOpacity,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { MapPinIcon, Calendar01Icon, UserGroupIcon, PlusSignIcon, CheckmarkCircle01Icon, Cancel01Icon, Navigation03Icon } from '@hugeicons/core-free-icons';
import { colors } from '../../constants/colors';
import { fontSize, fontWeight, radius, shadows, spacing } from '../../constants/theme';
import {
  Button, Card, Chip, Input, PressableScale, SlideUp, Stagger,
} from '../../components/ui';
import ScreenHeader from '../../components/ui/ScreenHeader';
import { tripsAPI, connectionsAPI, trailsAPI } from '../../services/api';

const PlanTripScreen = ({ navigation, route }) => {
  const groupId   = route?.params?.groupId   || null;
  const groupName = route?.params?.groupName || null;
  const trailId   = route?.params?.trailId   || null;
  const trailName = route?.params?.trailName || null;

  const [name, setName]               = useState(groupName ? `Trip: ${groupName}` : trailName ? `Trek to ${trailName}` : '');
  const [description, setDescription] = useState('');
  const [startDate, setStartDate]     = useState('');
  const [endDate, setEndDate]         = useState('');
  const [meetingPoint, setMeetingPoint] = useState('');
  const [connections, setConnections] = useState([]);
  const [selectedUsers, setSelectedUsers] = useState([]);
  const [loading, setLoading]         = useState(false);
  const [loadingConnections, setLoadingConnections] = useState(true);

  useEffect(() => {
    connectionsAPI.getAll()
      .then(res => setConnections(res.data || []))
      .catch(() => {})
      .finally(() => setLoadingConnections(false));
  }, []);

  const toggleUser = (userId) => {
    setSelectedUsers(prev =>
      prev.includes(userId) ? prev.filter(id => id !== userId) : [...prev, userId]
    );
  };

  const handleCreate = async () => {
    if (!name.trim()) {
      Alert.alert('Required', 'Please give your trip a name.');
      return;
    }
    setLoading(true);
    try {
      const tripData = {
        name: name.trim(),
        description: description.trim() || null,
        trail_id: trailId || null,
        group_id: groupId || null,
        start_date: startDate || null,
        end_date: endDate || null,
        meeting_point: meetingPoint.trim() || null,
        participants: selectedUsers,
      };
      await tripsAPI.create(tripData);
      Alert.alert('Trip Created!', 'Your trip has been planned. Invited friends will be notified.', [
        { text: 'OK', onPress: () => navigation.goBack() },
      ]);
    } catch (err) {
      Alert.alert('Error', err?.response?.data?.message || 'Could not create trip.');
    } finally {
      setLoading(false);
    }
  };

  const initials = (name = '') => name.split(' ').map(w => w[0]).join('').slice(0, 2).toUpperCase();

  return (
    <SafeAreaView style={styles.safe}>
      <StatusBar barStyle="dark-content" backgroundColor={colors.background} />
      <ScreenHeader title="Plan a Trip" subtitle="Adventure" onBack={() => navigation.goBack()} />

      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        style={{ flex: 1 }}
      >
        <ScrollView
          showsVerticalScrollIndicator={false}
          contentContainerStyle={styles.content}
          keyboardShouldPersistTaps="handled"
        >
          <Stagger initialDelay={100} step={60} distance={14}>
            {/* Trip info card */}
            <SlideUp>
              <Card style={styles.infoCard}>
                <View style={styles.infoIcon}>
                  <HugeiconsIcon icon={Navigation03Icon} size={20} color={colors.primary} strokeWidth={2.25} />
                </View>
                <View style={{ flex: 1 }}>
                  <Text style={styles.infoTitle}>Plan your adventure</Text>
                  <Text style={styles.infoText}>
                    Set the details and invite friends. Everyone will be notified.
                  </Text>
                </View>
              </Card>
            </SlideUp>

            <Text style={styles.section}>Details</Text>
            <Input
              label="Trip name"
              leading={<HugeiconsIcon icon={MapPinIcon} size={18} color={colors.textSecondary} strokeWidth={2.25} />}
              placeholder="e.g. Weekend Langtang Trek"
              value={name}
              onChangeText={setName}
            />
            <Input
              label="Description (optional)"
              placeholder="Tell your friends what to expect…"
              value={description}
              onChangeText={setDescription}
              multiline
              numberOfLines={3}
            />

            <Text style={styles.section}>Schedule</Text>
            <View style={styles.dateRow}>
              <View style={{ flex: 1 }}>
                <Input
                  label="Start date"
                  leading={<HugeiconsIcon icon={Calendar01Icon} size={18} color={colors.textSecondary} strokeWidth={2.25} />}
                  placeholder="YYYY-MM-DD"
                  value={startDate}
                  onChangeText={setStartDate}
                />
              </View>
              <View style={{ flex: 1 }}>
                <Input
                  label="End date"
                  leading={<HugeiconsIcon icon={Calendar01Icon} size={18} color={colors.textSecondary} strokeWidth={2.25} />}
                  placeholder="YYYY-MM-DD"
                  value={endDate}
                  onChangeText={setEndDate}
                />
              </View>
            </View>
            <Input
              label="Meeting point (optional)"
              leading={<HugeiconsIcon icon={MapPinIcon} size={18} color={colors.textSecondary} strokeWidth={2.25} />}
              placeholder="e.g. Ratnapark Bus Station"
              value={meetingPoint}
              onChangeText={setMeetingPoint}
            />

            {/* Trail/Group context */}
            {(trailName || groupName) && (
              <>
                <Text style={styles.section}>Linked to</Text>
                <Card style={styles.linkCard}>
                  {trailName && (
                    <View style={styles.linkRow}>
                      <HugeiconsIcon icon={MapPinIcon} size={14} color={colors.primary} strokeWidth={2} />
                      <Text style={styles.linkText}>Trail: {trailName}</Text>
                    </View>
                  )}
                  {groupName && (
                    <View style={styles.linkRow}>
                      <HugeiconsIcon icon={UserGroupIcon} size={14} color={colors.primary} strokeWidth={2} />
                      <Text style={styles.linkText}>Group: {groupName}</Text>
                    </View>
                  )}
                </Card>
              </>
            )}

            {/* Invite friends */}
            <Text style={styles.section}>Invite friends</Text>
            {loadingConnections ? (
              <Text style={styles.hint}>Loading your connections…</Text>
            ) : connections.length === 0 ? (
              <Card style={styles.emptyFriends}>
                <HugeiconsIcon icon={UserGroupIcon} size={28} color={colors.border} strokeWidth={1.5} />
                <Text style={styles.emptyFriendsText}>No connections yet</Text>
                <Text style={styles.emptyFriendsSub}>Connect with trekkers in the Groups → Connect tab.</Text>
              </Card>
            ) : (
              <View style={styles.friendsList}>
                {connections.map(conn => {
                  const isSelected = selectedUsers.includes(conn.user_id);
                  return (
                    <PressableScale
                      key={conn.user_id}
                      style={[styles.friendRow, isSelected && styles.friendRowSelected]}
                      onPress={() => toggleUser(conn.user_id)}
                      scaleTo={0.98}
                    >
                      <View style={[styles.friendAvatar, isSelected && { backgroundColor: colors.primary }]}>
                        <Text style={styles.friendAvatarText}>{initials(conn.name)}</Text>
                      </View>
                      <View style={{ flex: 1 }}>
                        <Text style={styles.friendName}>{conn.name}</Text>
                        {conn.location ? <Text style={styles.friendMeta}>{conn.location}</Text> : null}
                      </View>
                      {isSelected ? (
                        <HugeiconsIcon icon={CheckmarkCircle01Icon} size={22} color={colors.primary} strokeWidth={2.5} />
                      ) : (
                        <HugeiconsIcon icon={PlusSignIcon} size={22} color={colors.textLight} strokeWidth={2} />
                      )}
                    </PressableScale>
                  );
                })}
              </View>
            )}
            {selectedUsers.length > 0 && (
              <Text style={styles.hint}>
                {selectedUsers.length} friend{selectedUsers.length !== 1 ? 's' : ''} will be invited
              </Text>
            )}

            <View style={{ marginTop: spacing.lg }}>
              <Button
                label="Create Trip"
                icon={Navigation03Icon}
                loading={loading}
                onPress={handleCreate}
                fullWidth
                size="lg"
              />
            </View>
          </Stagger>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: colors.background },
  content: { padding: spacing.md, paddingBottom: spacing.xxl },

  infoCard: {
    flexDirection: 'row', alignItems: 'center', gap: spacing.sm,
    backgroundColor: colors.primaryPale,
    borderLeftWidth: 3, borderLeftColor: colors.primary,
    marginBottom: spacing.md,
  },
  infoIcon: {
    width: 44, height: 44, borderRadius: 22,
    backgroundColor: '#fff',
    alignItems: 'center', justifyContent: 'center',
  },
  infoTitle: { fontSize: fontSize.md, fontWeight: fontWeight.bold, color: colors.primary, marginBottom: 2 },
  infoText: { fontSize: fontSize.xs, color: colors.text, lineHeight: 18 },

  section: {
    fontSize: fontSize.xs, fontWeight: fontWeight.bold,
    color: colors.primaryLight, letterSpacing: 2, textTransform: 'uppercase',
    marginTop: spacing.lg, marginBottom: spacing.sm,
  },
  dateRow: { flexDirection: 'row', gap: spacing.sm },
  linkCard: { gap: spacing.xs },
  linkRow: { flexDirection: 'row', alignItems: 'center', gap: 6 },
  linkText: { fontSize: fontSize.sm, color: colors.primary, fontWeight: fontWeight.medium },
  hint: { fontSize: fontSize.xs, color: colors.textLight, marginTop: spacing.xs },

  emptyFriends: { alignItems: 'center', paddingVertical: spacing.lg, gap: spacing.xs },
  emptyFriendsText: { fontSize: fontSize.md, fontWeight: fontWeight.bold, color: colors.textSecondary },
  emptyFriendsSub: { fontSize: fontSize.xs, color: colors.textLight, textAlign: 'center' },

  friendsList: { gap: spacing.sm },
  friendRow: {
    flexDirection: 'row', alignItems: 'center', gap: spacing.sm,
    backgroundColor: colors.card, borderRadius: radius.lg,
    padding: spacing.md, ...shadows.xs,
  },
  friendRowSelected: { borderWidth: 1.5, borderColor: colors.primary },
  friendAvatar: {
    width: 40, height: 40, borderRadius: 20,
    backgroundColor: colors.stone,
    alignItems: 'center', justifyContent: 'center',
  },
  friendAvatarText: { color: '#fff', fontWeight: fontWeight.bold, fontSize: fontSize.xs },
  friendName: { fontSize: fontSize.md, fontWeight: fontWeight.bold, color: colors.text },
  friendMeta: { fontSize: fontSize.xs, color: colors.textLight, marginTop: 1 },
});

export default PlanTripScreen;
