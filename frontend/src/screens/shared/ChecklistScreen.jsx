import React, { useState, useEffect, useCallback } from 'react';
import {
  View, Text, StyleSheet, ScrollView, TextInput, StatusBar, ActivityIndicator,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { HugeiconsIcon } from '@hugeicons/react-native';
import { Tick01Icon, PlusSignIcon, Package01Icon, Shirt01Icon, TentIcon } from '@hugeicons/core-free-icons';
import { colors } from '../../constants/colors';
import { fontSize, fontWeight, radius, shadows, spacing } from '../../constants/theme';
import { Button, Card, PressableScale, SlideUp, Stagger } from '../../components/ui';
import ScreenHeader from '../../components/ui/ScreenHeader';
import { checklistAPI } from '../../services/api';

const categoryIcons = { Essentials: Package01Icon, Clothing: Shirt01Icon, Camping: TentIcon, General: Package01Icon };

const ChecklistScreen = ({ navigation, route }) => {
  const groupId   = route?.params?.groupId;
  const groupName = route?.params?.groupName || 'Trek Checklist';
  const groupMeta = route?.params?.groupMeta || '';

  const [items,    setItems]    = useState([]);
  const [loading,  setLoading]  = useState(true);
  const [showAdd,  setShowAdd]  = useState(false);
  const [newItem,  setNewItem]  = useState('');
  const [category, setCategory] = useState('General');
  const [saving,   setSaving]   = useState(false);

  const loadChecklist = useCallback(async () => {
    if (!groupId) { setLoading(false); return; }
    try {
      const res = await checklistAPI.get(groupId);
      setItems(res.data.items || []);
    } catch {
      // keep empty
    } finally {
      setLoading(false);
    }
  }, [groupId]);

  useEffect(() => { loadChecklist(); }, [loadChecklist]);

  const checkedCount = items.filter(i => i.is_checked).length;
  const categories   = [...new Set(items.map(i => i.category || 'General'))];
  const progress     = items.length ? checkedCount / items.length : 0;

  const toggle = async (item) => {
    setItems(prev => prev.map(i => i.id === item.id ? { ...i, is_checked: !i.is_checked } : i));
    try {
      await checklistAPI.toggleItem(item.id, { is_checked: !item.is_checked });
    } catch {
      setItems(prev => prev.map(i => i.id === item.id ? { ...i, is_checked: item.is_checked } : i));
    }
  };

  const addItem = async () => {
    if (!newItem.trim()) return;
    setSaving(true);
    try {
      const res = await checklistAPI.addItem(groupId, { item_name: newItem.trim(), category });
      setItems(prev => [...prev, res.data]);
      setNewItem('');
      setShowAdd(false);
    } catch {
      // ignore
    } finally {
      setSaving(false);
    }
  };

  return (
    <SafeAreaView style={styles.safe}>
      <StatusBar barStyle="dark-content" backgroundColor={colors.background} />
      <ScreenHeader title="Trek Checklist" subtitle="Gear" onBack={() => navigation.goBack()} />

      {loading ? (
        <View style={styles.centered}><ActivityIndicator color={colors.primary} size="large" /></View>
      ) : (
        <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{ padding: spacing.md, paddingBottom: 80 }}>
          <SlideUp delay={100}>
            <Card style={styles.contextCard} elevation="sm">
              <Text style={styles.contextTrail}>{groupName}</Text>
              {!!groupMeta && <Text style={styles.contextMeta}>{groupMeta}</Text>}
              <View style={styles.progressRow}>
                <View style={styles.progressBar}>
                  <View style={[styles.progressFill, { width: `${progress * 100}%` }]} />
                </View>
                <Text style={styles.progressLabel}>{checkedCount}/{items.length}</Text>
              </View>
            </Card>
          </SlideUp>

          {showAdd && (
            <SlideUp>
              <Card style={{ marginBottom: spacing.md }}>
                <Text style={styles.addTitle}>New item</Text>
                <TextInput
                  style={styles.addInput}
                  placeholder="e.g. Water purification tablets"
                  placeholderTextColor={colors.textMuted}
                  value={newItem}
                  onChangeText={setNewItem}
                  autoFocus
                />
                <View style={{ flexDirection: 'row', gap: spacing.sm, marginTop: spacing.sm }}>
                  <Button label="Cancel" variant="outline" onPress={() => setShowAdd(false)} fullWidth />
                  <Button label="Add" loading={saving} onPress={addItem} fullWidth />
                </View>
              </Card>
            </SlideUp>
          )}

          {!showAdd && (
            <SlideUp delay={120}>
              <PressableScale
                style={styles.addBtn}
                onPress={() => setShowAdd(true)}
                scaleTo={0.97}
              >
                <HugeiconsIcon icon={PlusSignIcon} size={16} color={colors.primary} strokeWidth={2.5} />
                <Text style={styles.addBtnText}>Add item</Text>
              </PressableScale>
            </SlideUp>
          )}

          {categories.map((cat, catIdx) => {
            const Icon = categoryIcons[cat] || Package01Icon;
            return (
              <View key={cat} style={{ marginTop: catIdx === 0 ? 0 : spacing.md }}>
                <View style={styles.categoryHeader}>
                  <View style={styles.categoryIcon}>
                    <HugeiconsIcon icon={Icon} size={14} color={colors.primary} strokeWidth={2.25} />
                  </View>
                  <Text style={styles.categoryTitle}>{cat}</Text>
                </View>
                <Stagger initialDelay={160 + catIdx * 60} step={50} distance={10}>
                  {items.filter(i => (i.category || 'General') === cat).map((item) => (
                    <PressableScale
                      key={item.id}
                      style={styles.itemRow}
                      onPress={() => toggle(item)}
                      scaleTo={0.99}
                    >
                      <View style={[styles.checkbox, item.is_checked && styles.checkboxChecked]}>
                        {item.is_checked && <HugeiconsIcon icon={Tick01Icon} size={14} color="#fff" strokeWidth={3} />}
                      </View>
                      <Text style={[styles.itemText, item.is_checked && styles.itemTextChecked]} numberOfLines={1}>
                        {item.item_name}
                      </Text>
                      {item.assigned_name ? (
                        <View style={styles.assigneeChip}>
                          <Text style={styles.assigneeText}>{item.assigned_name}</Text>
                        </View>
                      ) : null}
                    </PressableScale>
                  ))}
                </Stagger>
              </View>
            );
          })}

          {items.length === 0 && !showAdd && (
            <View style={styles.empty}>
              <HugeiconsIcon icon={Package01Icon} size={40} color={colors.border} strokeWidth={1.5} />
              <Text style={styles.emptyText}>No items yet</Text>
              <Text style={styles.emptySub}>Tap "Add item" to start building your gear checklist.</Text>
            </View>
          )}
        </ScrollView>
      )}
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safe:     { flex: 1, backgroundColor: colors.background },
  centered: { flex: 1, alignItems: 'center', justifyContent: 'center' },
  contextCard:   { marginBottom: spacing.md },
  contextTrail:  { fontSize: fontSize.md, fontWeight: fontWeight.bold, color: colors.text },
  contextMeta:   { fontSize: fontSize.xs, color: colors.textSecondary, marginTop: 2 },
  progressRow:   { flexDirection: 'row', alignItems: 'center', gap: spacing.sm, marginTop: spacing.sm },
  progressBar:   { flex: 1, height: 6, backgroundColor: colors.surface, borderRadius: 3, overflow: 'hidden' },
  progressFill:  { height: '100%', backgroundColor: colors.primary, borderRadius: 3 },
  progressLabel: { fontSize: fontSize.xs, color: colors.primary, fontWeight: fontWeight.bold },
  addBtn: { flexDirection: 'row', alignItems: 'center', gap: 8, backgroundColor: colors.primaryPale, borderRadius: radius.lg, padding: spacing.md, marginBottom: spacing.md, justifyContent: 'center' },
  addBtnText: { color: colors.primary, fontWeight: fontWeight.bold, fontSize: fontSize.md },
  categoryHeader: { flexDirection: 'row', alignItems: 'center', gap: 8, marginBottom: spacing.sm },
  categoryIcon:   { width: 24, height: 24, borderRadius: 12, backgroundColor: colors.primaryPale, alignItems: 'center', justifyContent: 'center' },
  categoryTitle:  { fontSize: fontSize.xs, fontWeight: fontWeight.bold, color: colors.primaryLight, letterSpacing: 2, textTransform: 'uppercase' },
  itemRow: { flexDirection: 'row', alignItems: 'center', backgroundColor: colors.card, borderRadius: radius.lg, padding: spacing.md, marginBottom: spacing.sm, gap: spacing.sm, ...shadows.xs },
  checkbox:        { width: 22, height: 22, borderRadius: 6, borderWidth: 2, borderColor: colors.border, alignItems: 'center', justifyContent: 'center' },
  checkboxChecked: { backgroundColor: colors.primary, borderColor: colors.primary },
  itemText:        { flex: 1, fontSize: fontSize.md, color: colors.text },
  itemTextChecked: { textDecorationLine: 'line-through', color: colors.textMuted },
  assigneeChip:    { backgroundColor: colors.primaryPale, paddingHorizontal: 8, paddingVertical: 3, borderRadius: radius.round },
  assigneeText:    { fontSize: 11, color: colors.primary, fontWeight: fontWeight.semiBold },
  addTitle:  { fontSize: fontSize.md, fontWeight: fontWeight.bold, color: colors.text, marginBottom: spacing.sm },
  addInput:  { backgroundColor: colors.surface, borderRadius: radius.md, paddingHorizontal: spacing.md, paddingVertical: spacing.sm, fontSize: fontSize.md, color: colors.text },
  empty:     { alignItems: 'center', paddingTop: 60, gap: 12 },
  emptyText: { fontSize: fontSize.lg, fontWeight: fontWeight.bold, color: colors.textSecondary },
  emptySub:  { fontSize: fontSize.sm, color: colors.textLight, textAlign: 'center', maxWidth: 260, lineHeight: 20 },
});

export default ChecklistScreen;
