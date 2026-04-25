import { HugeiconsIcon } from '@hugeicons/react-native';
import React, { useState, useEffect } from 'react';
import {
  View, Text, StyleSheet, ScrollView, TextInput, StatusBar, Alert,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { MountainIcon, Calendar01Icon, UserGroupIcon, Wallet02Icon, TextIcon, ArrowDown01Icon, Tick01Icon, PlusSignIcon, Award01Icon } from '@hugeicons/core-free-icons';
import { useDispatch } from 'react-redux';
import { colors } from '../../constants/colors';
import { fontSize, fontWeight, radius, spacing } from '../../constants/theme';
import {
  Button, Card, Input, PressableScale, SlideUp, Stagger,
} from '../../components/ui';
import ScreenHeader from '../../components/ui/ScreenHeader';
import { NEPAL_TRAILS } from '../../constants/kathmandu_trails';
import { groupsAPI } from '../../services/api';
import { useAuth } from '../../context/AuthContext';
import { loadUser } from '../../store/slices/authSlice';

const TRAIL_NAMES = NEPAL_TRAILS.map((t) => t.name);

const CreateTripScreen = ({ navigation }) => {
  const { user } = useAuth();
  const dispatch = useDispatch();

  // Refresh auth state on mount so the role gate reflects the latest DB role.
  useEffect(() => { dispatch(loadUser()); }, []);

  const isOrganizer = user?.role === 'organizer' || user?.role === 'admin';

  const [form, setForm] = useState({
    tripName: '', trail: '', startDate: '', endDate: '',
    groupSize: '', budget: '', description: '',
  });
  const [loading, setLoading] = useState(false);
  const [showTrailPicker, setShowTrailPicker] = useState(false);

  if (!isOrganizer) {
    return (
      <SafeAreaView style={styles.safe}>
        <StatusBar barStyle="dark-content" backgroundColor={colors.background} />
        <ScreenHeader title="Create Trip" onBack={() => navigation.goBack()} />
        <View style={styles.gateWrap}>
          <HugeiconsIcon icon={Award01Icon} size={56} color={colors.primaryLight} strokeWidth={1.5} />
          <Text style={styles.gateTitle}>Organizer Role Required</Text>
          <Text style={styles.gateSub}>
            Creating group trips is limited to verified Group Managers. Apply to become an organizer to unlock this feature.
          </Text>
          <Button
            label="Apply to Become an Organizer"
            icon={Award01Icon}
            onPress={() => navigation.navigate('OrganizerRequest')}
            fullWidth
            style={{ marginTop: spacing.xl }}
          />
        </View>
      </SafeAreaView>
    );
  }

  const update = (f, v) => setForm((p) => ({ ...p, [f]: v }));

  const handleCreate = async () => {
    if (!form.tripName || !form.trail || !form.startDate) {
      Alert.alert('Missing info', 'Please fill in trip name, trail, and start date.');
      return;
    }
    setLoading(true);
    try {
      const res = await groupsAPI.create({
        name:           form.tripName,
        trail_name:     form.trail,
        start_date:     form.startDate || null,
        end_date:       form.endDate   || null,
        max_members:    form.groupSize  ? parseInt(form.groupSize)   : 10,
        budget_estimate: form.budget   ? parseFloat(form.budget)    : null,
        description:    form.description || null,
      });
      const groupId = res.data?.id;
      Alert.alert('Trip created', 'Your trip has been published to the community.', [
        { text: 'OK', onPress: () => {
            if (groupId) {
              navigation.replace('Chat', { groupId, groupName: form.tripName });
            } else {
              navigation.goBack();
            }
          }
        },
      ]);
    } catch (err) {
      Alert.alert('Error', err?.response?.data?.message || 'Could not create trip. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <SafeAreaView style={styles.safe}>
      <StatusBar barStyle="dark-content" backgroundColor={colors.background} />
      <ScreenHeader
        title="Create Trip"
        subtitle="New adventure"
        onBack={() => navigation.goBack()}
      />

      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{ padding: spacing.md, paddingBottom: spacing.xxl }}>
        <Stagger initialDelay={100} step={40} distance={14}>
          <Input
            label="Trip name"
            leading={<HugeiconsIcon icon={TextIcon} size={18} color={colors.textSecondary} strokeWidth={2.25} />}
            placeholder="e.g. EBC Adventure 2026"
            value={form.tripName}
            onChangeText={(v) => update('tripName', v)}
          />

          <Text style={styles.label}>Trail</Text>
          <PressableScale
            style={styles.picker}
            onPress={() => setShowTrailPicker((s) => !s)}
            scaleTo={0.98}
          >
            <HugeiconsIcon icon={MountainIcon} size={18} color={colors.textSecondary} strokeWidth={2.25} />
            <Text style={[styles.pickerText, !form.trail && { color: colors.textMuted }]}>
              {form.trail || 'Search or select a trail'}
            </Text>
            <HugeiconsIcon icon={ArrowDown01Icon} size={18} color={colors.textLight} strokeWidth={2.25} />
          </PressableScale>

          {showTrailPicker && (
            <SlideUp>
              <Card style={{ marginTop: -spacing.sm, marginBottom: spacing.md }} padding={0}>
                {TRAIL_NAMES.map((t, i) => {
                  const active = form.trail === t;
                  return (
                    <PressableScale
                      key={t}
                      style={[styles.trailOption, i < TRAIL_NAMES.length - 1 && styles.trailDivider]}
                      onPress={() => { update('trail', t); setShowTrailPicker(false); }}
                      scaleTo={0.99}
                    >
                      <Text style={[styles.trailOptionText, active && { color: colors.primary, fontWeight: fontWeight.bold }]}>{t}</Text>
                      {active && <HugeiconsIcon icon={Tick01Icon} size={16} color={colors.primary} strokeWidth={2.5} />}
                    </PressableScale>
                  );
                })}
              </Card>
            </SlideUp>
          )}

          <Text style={styles.label}>Date range</Text>
          <View style={styles.dateRow}>
            <View style={{ flex: 1 }}>
              <Input
                leading={<HugeiconsIcon icon={Calendar01Icon} size={18} color={colors.textSecondary} strokeWidth={2.25} />}
                placeholder="YYYY-MM-DD"
                value={form.startDate}
                onChangeText={(v) => update('startDate', v)}
                keyboardType="numbers-and-punctuation"
              />
            </View>
            <View style={{ flex: 1 }}>
              <Input
                leading={<HugeiconsIcon icon={Calendar01Icon} size={18} color={colors.textSecondary} strokeWidth={2.25} />}
                placeholder="YYYY-MM-DD"
                value={form.endDate}
                onChangeText={(v) => update('endDate', v)}
                keyboardType="numbers-and-punctuation"
              />
            </View>
          </View>

          <Input
            label="Group size"
            leading={<HugeiconsIcon icon={UserGroupIcon} size={18} color={colors.textSecondary} strokeWidth={2.25} />}
            placeholder="Max members (e.g. 8)"
            value={form.groupSize}
            onChangeText={(v) => update('groupSize', v)}
            keyboardType="numeric"
          />

          <Input
            label="Estimated budget (NPR)"
            leading={<HugeiconsIcon icon={Wallet02Icon} size={18} color={colors.textSecondary} strokeWidth={2.25} />}
            placeholder="25000"
            value={form.budget}
            onChangeText={(v) => update('budget', v)}
            keyboardType="numeric"
          />

          <Text style={styles.label}>Description</Text>
          <Card style={{ marginBottom: spacing.md }}>
            <TextInput
              style={styles.textarea}
              placeholder="Tell others about your trip — pace, goals, what gear they need…"
              placeholderTextColor={colors.textMuted}
              value={form.description}
              onChangeText={(v) => update('description', v)}
              multiline
              numberOfLines={4}
              textAlignVertical="top"
            />
          </Card>

          <Button
            label="Create trip"
            icon={PlusSignIcon}
            loading={loading}
            onPress={handleCreate}
            fullWidth
            size="lg"
          />
        </Stagger>
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: colors.background },

  gateWrap: {
    flex: 1, alignItems: 'center', justifyContent: 'center',
    padding: spacing.xl, gap: spacing.md,
  },
  gateTitle: {
    fontSize: fontSize.xxl, fontWeight: fontWeight.bold,
    color: colors.text, textAlign: 'center', letterSpacing: -0.3,
  },
  gateSub: {
    fontSize: fontSize.md, color: colors.textSecondary,
    textAlign: 'center', lineHeight: 26,
  },

  title: { fontSize: fontSize.xl, fontWeight: fontWeight.bold, color: colors.text, letterSpacing: -0.3, marginTop: 2 },

  label: { fontSize: fontSize.xs, color: colors.textSecondary, fontWeight: fontWeight.semiBold, marginBottom: spacing.xs, marginTop: spacing.xs },
  picker: {
    flexDirection: 'row', alignItems: 'center', gap: spacing.sm,
    backgroundColor: colors.card,
    borderWidth: 1, borderColor: colors.border,
    borderRadius: radius.md,
    paddingHorizontal: spacing.md, paddingVertical: 14,
    marginBottom: spacing.md,
  },
  pickerText: { flex: 1, fontSize: fontSize.md, color: colors.text },
  trailOption: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
    paddingHorizontal: spacing.md, paddingVertical: 14,
  },
  trailDivider: { borderBottomWidth: 1, borderBottomColor: colors.border },
  trailOptionText: { fontSize: fontSize.md, color: colors.text },

  dateRow: { flexDirection: 'row', gap: spacing.sm },

  textarea: { minHeight: 100, fontSize: fontSize.md, color: colors.text, lineHeight: 22 },
});

export default CreateTripScreen;
