import { HugeiconsIcon } from '@hugeicons/react-native';
import React, { useState, useEffect, useCallback } from 'react';
import {
  View, Text, StyleSheet, ScrollView, StatusBar, Alert,
  Dimensions, Modal, TextInput, TouchableOpacity, ActivityIndicator,
  KeyboardAvoidingView, Platform,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { ArrowLeft02Icon, PlusSignIcon, Bus01Icon, File02Icon, Home01Icon, Restaurant01Icon, UserGroupIcon, Share01Icon, Delete02Icon, Cancel01Icon, DollarIcon } from '@hugeicons/core-free-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { colors } from '../../constants/colors';
import { fontSize, fontWeight, radius, shadows, spacing } from '../../constants/theme';
import {
  Card, PressableScale, FadeIn, SlideUp, Stagger,
} from '../../components/ui';
import TopoPattern from '../../assets/svg/TopoPattern';
import { budgetAPI } from '../../services/api';

const { width: W } = Dimensions.get('window');

const CATEGORY_META = {
  Transport:     { color: '#457B9D', Icon: Bus01Icon },
  Permit:        { color: '#8B5CF6', Icon: File02Icon },
  Accommodation: { color: '#E76F51', Icon: Home01Icon },
  Food:          { color: '#52B788', Icon: Restaurant01Icon },
  Guide:         { color: '#6B4423', Icon: UserGroupIcon },
  Other:         { color: '#94A3B8', Icon: DollarIcon },
};

const CATEGORIES = Object.keys(CATEGORY_META);

function getMeta(category) {
  return CATEGORY_META[category] || CATEGORY_META.Other;
}

export default function TripBudgetScreen({ navigation, route }) {
  const groupId   = route?.params?.groupId;
  const groupName = route?.params?.groupName || 'Trip Budget';
  const members   = route?.params?.members   || 1;
  const dates     = route?.params?.dates     || '';

  const [items, setItems]       = useState([]);
  const [loading, setLoading]   = useState(true);
  const [modalVisible, setModalVisible] = useState(false);
  const [saving, setSaving]     = useState(false);

  const [form, setForm] = useState({
    category: 'Transport',
    description: '',
    amount: '',
  });

  const fetchItems = useCallback(async () => {
    if (!groupId) { setLoading(false); return; }
    try {
      const res = await budgetAPI.get(groupId);
      setItems(res.data);
    } catch {
      Alert.alert('Error', 'Could not load budget items.');
    } finally {
      setLoading(false);
    }
  }, [groupId]);

  useEffect(() => { fetchItems(); }, [fetchItems]);

  const total   = items.reduce((s, i) => s + parseFloat(i.amount || 0), 0);
  const perHead = members > 1 ? Math.round(total / members) : total;

  const openModal = () => {
    setForm({ category: 'Transport', description: '', amount: '' });
    setModalVisible(true);
  };

  const handleAdd = async () => {
    const amt = parseFloat(form.amount);
    if (!form.category || isNaN(amt) || amt <= 0)
      return Alert.alert('Validation', 'Enter a valid category and amount.');
    setSaving(true);
    try {
      const meta = getMeta(form.category);
      await budgetAPI.add(groupId, {
        category:    form.category,
        description: form.description.trim() || null,
        amount:      amt,
        color:       meta.color,
      });
      setModalVisible(false);
      fetchItems();
    } catch {
      Alert.alert('Error', 'Could not add item.');
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = (itemId, category) => {
    Alert.alert('Remove item', `Remove "${category}" expense?`, [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Remove', style: 'destructive',
        onPress: async () => {
          try {
            await budgetAPI.remove(groupId, itemId);
            setItems((prev) => prev.filter((i) => i.id !== itemId));
          } catch {
            Alert.alert('Error', 'Could not remove item.');
          }
        },
      },
    ]);
  };

  return (
    <SafeAreaView style={styles.safe} edges={['top']}>
      <StatusBar barStyle="light-content" />

      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingBottom: spacing.xxl }}>
        {/* Hero */}
        <View style={styles.hero}>
          <LinearGradient colors={colors.gradForest} style={StyleSheet.absoluteFill} />
          <TopoPattern width={W} height={240} color="#fff" opacity={0.06} />
          <View style={styles.heroHeader}>
            <PressableScale onPress={() => navigation.goBack()} style={styles.iconBtn} scaleTo={0.9}>
              <HugeiconsIcon icon={ArrowLeft02Icon} size={22} color="#fff" strokeWidth={2.25} />
            </PressableScale>
            <Text style={styles.heroTitle}>Trip Budget</Text>
            <PressableScale onPress={openModal} style={styles.iconBtn} scaleTo={0.9}>
              <HugeiconsIcon icon={PlusSignIcon} size={20} color="#fff" strokeWidth={2.5} />
            </PressableScale>
          </View>

          <FadeIn delay={120} style={{ alignItems: 'center', paddingHorizontal: spacing.lg, marginTop: spacing.md }}>
            <Text style={styles.overline}>{groupName}</Text>
            <Text style={styles.bigAmount}>NPR {total.toLocaleString()}</Text>
            <Text style={styles.subAmount}>
              {members > 1 ? `NPR ${perHead.toLocaleString()} per person · ` : ''}{members} member{members !== 1 ? 's' : ''}{dates ? ` · ${dates}` : ''}
            </Text>
          </FadeIn>
        </View>

        {/* Summary card */}
        {items.length > 0 && (
          <SlideUp delay={160} style={styles.summaryWrap}>
            <Card style={styles.summaryCard} elevation="lg">
              <View style={styles.categoryBreakdown}>
                {CATEGORIES.filter((c) => items.some((i) => i.category === c)).map((c) => {
                  const catTotal = items.filter((i) => i.category === c).reduce((s, i) => s + parseFloat(i.amount), 0);
                  const pct      = total > 0 ? catTotal / total : 0;
                  const { color } = getMeta(c);
                  return (
                    <View key={c} style={styles.catRow}>
                      <View style={[styles.catDot, { backgroundColor: color }]} />
                      <Text style={styles.catLabel}>{c}</Text>
                      <Text style={styles.catAmt}>NPR {catTotal.toLocaleString()}</Text>
                      <Text style={styles.catPct}>{Math.round(pct * 100)}%</Text>
                    </View>
                  );
                })}
              </View>
              <View style={styles.stackBar}>
                {CATEGORIES.filter((c) => items.some((i) => i.category === c)).map((c) => {
                  const catTotal = items.filter((i) => i.category === c).reduce((s, i) => s + parseFloat(i.amount), 0);
                  const pct      = total > 0 ? catTotal / total : 0;
                  const { color } = getMeta(c);
                  return (
                    <View key={c} style={[styles.stackSegment, { flex: pct, backgroundColor: color }]} />
                  );
                })}
              </View>
            </Card>
          </SlideUp>
        )}

        {/* Items list */}
        <View style={{ paddingHorizontal: spacing.md }}>
          {loading ? (
            <ActivityIndicator color={colors.primary} style={{ marginTop: spacing.xl }} />
          ) : items.length === 0 ? (
            <SlideUp delay={160}>
              <Card style={styles.emptyCard}>
                <HugeiconsIcon icon={DollarIcon} size={36} color={colors.border} strokeWidth={1.5} />
                <Text style={styles.emptyTitle}>No expenses yet</Text>
                <Text style={styles.emptySubtitle}>Tap + to add your first budget item</Text>
              </Card>
            </SlideUp>
          ) : (
            <>
              <Text style={styles.section}>Breakdown</Text>
              <Stagger initialDelay={200} step={40} distance={14}>
                {items.map((item) => {
                  const { color, Icon } = getMeta(item.category);
                  const amt = parseFloat(item.amount);
                  return (
                    <Card key={item.id} style={{ marginBottom: spacing.sm }}>
                      <View style={styles.expenseRow}>
                        <View style={[styles.expenseIcon, { backgroundColor: `${color}22` }]}>
                          <HugeiconsIcon icon={Icon} size={18} color={color} strokeWidth={2.25} />
                        </View>
                        <View style={{ flex: 1 }}>
                          <Text style={styles.expenseCategory}>{item.category}</Text>
                          {!!item.description && (
                            <Text style={styles.expenseDesc}>{item.description}</Text>
                          )}
                        </View>
                        <Text style={styles.expenseAmount}>NPR {amt.toLocaleString()}</Text>
                        {groupId && (
                          <PressableScale onPress={() => handleDelete(item.id, item.category)} scaleTo={0.85} style={styles.deleteBtn}>
                            <HugeiconsIcon icon={Delete02Icon} size={16} color={colors.error} strokeWidth={2} />
                          </PressableScale>
                        )}
                      </View>
                      <View style={styles.miniBarWrap}>
                        <View style={[styles.miniBar, { width: total > 0 ? `${(amt / total) * 100}%` : '0%', backgroundColor: color }]} />
                      </View>
                    </Card>
                  );
                })}
              </Stagger>
            </>
          )}

          {!loading && items.length > 0 && (
            <SlideUp delay={240}>
              <PressableScale
                style={styles.shareBtn}
                onPress={() => Alert.alert('Shared', 'Budget shared with group members.')}
                scaleTo={0.97}
              >
                <HugeiconsIcon icon={Share01Icon} size={18} color="#fff" strokeWidth={2.25} />
                <Text style={styles.shareBtnText}>Share with group</Text>
              </PressableScale>
            </SlideUp>
          )}
        </View>
      </ScrollView>

      {/* Add Expense Modal */}
      <Modal visible={modalVisible} animationType="slide" transparent onRequestClose={() => setModalVisible(false)}>
        <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : undefined} style={styles.modalOverlay}>
          <View style={styles.modalSheet}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Add Expense</Text>
              <TouchableOpacity onPress={() => setModalVisible(false)}>
                <HugeiconsIcon icon={Cancel01Icon} size={22} color={colors.textSecondary} />
              </TouchableOpacity>
            </View>

            <Text style={styles.fieldLabel}>Category</Text>
            <ScrollView horizontal showsHorizontalScrollIndicator={false} style={{ marginBottom: spacing.md }}>
              <View style={{ flexDirection: 'row', gap: spacing.sm, paddingVertical: 4 }}>
                {CATEGORIES.map((c) => {
                  const { color } = getMeta(c);
                  const active = form.category === c;
                  return (
                    <TouchableOpacity
                      key={c}
                      onPress={() => setForm((f) => ({ ...f, category: c }))}
                      style={[styles.catChip, active && { backgroundColor: color, borderColor: color }]}
                    >
                      <Text style={[styles.catChipText, active && { color: '#fff' }]}>{c}</Text>
                    </TouchableOpacity>
                  );
                })}
              </View>
            </ScrollView>

            <Text style={styles.fieldLabel}>Description (optional)</Text>
            <TextInput
              style={styles.input}
              placeholder="e.g. Bus Kathmandu → Pokhara"
              placeholderTextColor={colors.textLight}
              value={form.description}
              onChangeText={(v) => setForm((f) => ({ ...f, description: v }))}
            />

            <Text style={styles.fieldLabel}>Amount (NPR)</Text>
            <TextInput
              style={styles.input}
              placeholder="0"
              placeholderTextColor={colors.textLight}
              keyboardType="numeric"
              value={form.amount}
              onChangeText={(v) => setForm((f) => ({ ...f, amount: v }))}
            />

            <TouchableOpacity
              style={[styles.addBtn, saving && { opacity: 0.6 }]}
              onPress={handleAdd}
              disabled={saving}
            >
              {saving
                ? <ActivityIndicator color="#fff" size="small" />
                : <Text style={styles.addBtnText}>Add Expense</Text>}
            </TouchableOpacity>
          </View>
        </KeyboardAvoidingView>
      </Modal>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: colors.background },

  hero: {
    paddingBottom: 50,
    borderBottomLeftRadius: radius.xxl, borderBottomRightRadius: radius.xxl,
    overflow: 'hidden',
  },
  heroHeader: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
    paddingHorizontal: spacing.md, paddingTop: spacing.md,
  },
  iconBtn: {
    width: 40, height: 40, borderRadius: 20,
    backgroundColor: 'rgba(255,255,255,0.15)',
    alignItems: 'center', justifyContent: 'center',
  },
  heroTitle: { fontSize: fontSize.md, fontWeight: fontWeight.bold, color: '#fff', letterSpacing: -0.2 },
  overline: {
    fontSize: fontSize.xs, letterSpacing: 2, color: 'rgba(255,255,255,0.75)',
    fontWeight: fontWeight.bold, textTransform: 'uppercase', marginBottom: spacing.xs,
  },
  bigAmount: { fontSize: 44, fontWeight: fontWeight.bold, color: '#fff', letterSpacing: -1.5 },
  subAmount: { fontSize: fontSize.sm, color: 'rgba(255,255,255,0.8)', marginTop: 2, fontWeight: fontWeight.medium },

  summaryWrap: { paddingHorizontal: spacing.md, marginTop: -30, marginBottom: spacing.md },
  summaryCard: {},
  categoryBreakdown: { gap: spacing.xs },
  catRow: { flexDirection: 'row', alignItems: 'center', gap: spacing.sm },
  catDot: { width: 10, height: 10, borderRadius: 5 },
  catLabel: { flex: 1, fontSize: fontSize.sm, color: colors.text, fontWeight: fontWeight.medium },
  catAmt: { fontSize: fontSize.sm, color: colors.text, fontWeight: fontWeight.bold },
  catPct: { fontSize: fontSize.xs, color: colors.textLight, width: 36, textAlign: 'right' },
  stackBar: {
    flexDirection: 'row', height: 8, borderRadius: 4,
    overflow: 'hidden', marginTop: spacing.md,
  },
  stackSegment: { height: '100%' },

  section: {
    fontSize: fontSize.xs, fontWeight: fontWeight.bold,
    color: colors.primaryLight, letterSpacing: 2,
    textTransform: 'uppercase', marginBottom: spacing.sm, marginTop: spacing.sm,
  },
  expenseRow: { flexDirection: 'row', alignItems: 'center', gap: spacing.sm },
  expenseIcon: {
    width: 40, height: 40, borderRadius: 20,
    alignItems: 'center', justifyContent: 'center',
  },
  expenseCategory: { fontSize: fontSize.md, fontWeight: fontWeight.bold, color: colors.text },
  expenseDesc: { fontSize: fontSize.xs, color: colors.textSecondary, marginTop: 2 },
  expenseAmount: { fontSize: fontSize.md, fontWeight: fontWeight.bold, color: colors.text },
  deleteBtn: { padding: 6 },
  miniBarWrap: { height: 4, backgroundColor: colors.surface, borderRadius: 2, overflow: 'hidden', marginTop: spacing.sm },
  miniBar: { height: '100%', borderRadius: 2 },

  emptyCard: { alignItems: 'center', paddingVertical: spacing.xl, gap: spacing.sm, marginTop: spacing.xl },
  emptyTitle: { fontSize: fontSize.md, fontWeight: fontWeight.bold, color: colors.textSecondary },
  emptySubtitle: { fontSize: fontSize.sm, color: colors.textLight },

  shareBtn: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: spacing.sm,
    backgroundColor: colors.primary,
    paddingVertical: 16, borderRadius: radius.round,
    marginTop: spacing.md, ...shadows.md,
  },
  shareBtnText: { color: '#fff', fontSize: fontSize.md, fontWeight: fontWeight.bold, letterSpacing: 0.3 },

  // Modal
  modalOverlay: {
    flex: 1, justifyContent: 'flex-end',
    backgroundColor: 'rgba(0,0,0,0.45)',
  },
  modalSheet: {
    backgroundColor: colors.card,
    borderTopLeftRadius: radius.xxl, borderTopRightRadius: radius.xxl,
    padding: spacing.lg, paddingBottom: spacing.xxl,
  },
  modalHeader: {
    flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center',
    marginBottom: spacing.lg,
  },
  modalTitle: { fontSize: fontSize.lg, fontWeight: fontWeight.bold, color: colors.text },
  fieldLabel: { fontSize: fontSize.xs, fontWeight: fontWeight.bold, color: colors.textLight, textTransform: 'uppercase', letterSpacing: 1, marginBottom: spacing.xs },
  input: {
    borderWidth: 1.5, borderColor: colors.border, borderRadius: radius.md,
    paddingHorizontal: spacing.md, paddingVertical: 12,
    fontSize: fontSize.md, color: colors.text,
    backgroundColor: colors.surface,
    marginBottom: spacing.md,
  },
  catChip: {
    paddingHorizontal: spacing.md, paddingVertical: 8,
    borderRadius: radius.round, borderWidth: 1.5,
    borderColor: colors.border, backgroundColor: colors.surface,
  },
  catChipText: { fontSize: fontSize.sm, fontWeight: fontWeight.medium, color: colors.text },
  addBtn: {
    backgroundColor: colors.primary,
    paddingVertical: 16, borderRadius: radius.round,
    alignItems: 'center', marginTop: spacing.sm, ...shadows.md,
  },
  addBtnText: { color: '#fff', fontSize: fontSize.md, fontWeight: fontWeight.bold, letterSpacing: 0.3 },
});
