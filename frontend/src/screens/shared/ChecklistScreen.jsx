import React, { useState } from 'react';
import {
  View, Text, StyleSheet, ScrollView, TouchableOpacity,
  TextInput, StatusBar, SafeAreaView, Alert,
} from 'react-native';
import { colors } from '../../constants/colors';

const initialItems = [
  { id: '1', category: 'Essentials', text: 'Backpack (50-60L)', checked: true, assignee: 'Hari' },
  { id: '2', category: 'Essentials', text: 'Sleeping Bag (-10°C)', checked: true, assignee: 'Priya' },
  { id: '3', category: 'Essentials', text: 'Trekking Poles', checked: false, assignee: null },
  { id: '4', category: 'Clothing', text: 'Down Jacket', checked: true, assignee: 'Ramesh' },
  { id: '5', category: 'Clothing', text: 'Rain Gear / Poncho', checked: false, assignee: null },
  { id: '6', category: 'Clothing', text: 'Hiking Boots', checked: false, assignee: null },
];

const ChecklistScreen = ({ route, navigation }) => {
  const [items, setItems] = useState(initialItems);
  const [showAdd, setShowAdd] = useState(false);
  const [newItem, setNewItem] = useState('');
  const [newCategory, setNewCategory] = useState('Essentials');

  const checkedCount = items.filter((i) => i.checked).length;
  const categories = [...new Set(items.map((i) => i.category))];

  const toggle = (id) => {
    setItems((prev) => prev.map((item) =>
      item.id === id ? { ...item, checked: !item.checked } : item
    ));
  };

  const addItem = () => {
    if (!newItem.trim()) return;
    setItems((prev) => [...prev, {
      id: String(Date.now()), category: newCategory,
      text: newItem.trim(), checked: false, assignee: null,
    }]);
    setNewItem('');
    setShowAdd(false);
  };

  return (
    <SafeAreaView style={styles.safe}>
      <StatusBar barStyle="dark-content" backgroundColor={colors.white} />
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <Text style={styles.back}>←</Text>
        </TouchableOpacity>
        <Text style={styles.title}>Gear Checklist</Text>
        <TouchableOpacity onPress={() => setShowAdd(true)}>
          <Text style={styles.addBtn}>+</Text>
        </TouchableOpacity>
      </View>

      <ScrollView showsVerticalScrollIndicator={false}>
        {/* Group context */}
        <View style={styles.contextBanner}>
          <Text style={styles.contextTrail}>Langtang Valley Trek</Text>
          <Text style={styles.contextMeta}>Dec 28 – Jan 3 • 5 members</Text>
        </View>

        {/* Progress */}
        <View style={styles.progressContainer}>
          <Text style={styles.progressText}>Progress: {checkedCount}/{items.length} items</Text>
          <View style={styles.progressBar}>
            <View style={[styles.progressFill, { width: `${(checkedCount / items.length) * 100}%` }]} />
          </View>
        </View>

        {/* Items by category */}
        {categories.map((cat) => (
          <View key={cat} style={styles.categorySection}>
            <Text style={styles.categoryTitle}>{cat}</Text>
            {items.filter((i) => i.category === cat).map((item) => (
              <TouchableOpacity key={item.id} style={styles.itemRow} onPress={() => toggle(item.id)}>
                <View style={[styles.checkbox, item.checked && styles.checkboxChecked]}>
                  {item.checked && <Text style={styles.checkmark}>✓</Text>}
                </View>
                <Text style={[styles.itemText, item.checked && styles.itemTextChecked]}>{item.text}</Text>
                <Text style={styles.assigneeText}>{item.assignee || 'Assign'}</Text>
              </TouchableOpacity>
            ))}
          </View>
        ))}

        {/* Add Item modal */}
        {showAdd && (
          <View style={styles.addPanel}>
            <Text style={styles.addPanelTitle}>Add Item</Text>
            <TextInput
              style={styles.addInput}
              placeholder="Item name..."
              placeholderTextColor={colors.textMuted}
              value={newItem}
              onChangeText={setNewItem}
              autoFocus
            />
            <View style={styles.addActions}>
              <TouchableOpacity style={styles.cancelBtn} onPress={() => setShowAdd(false)}>
                <Text style={styles.cancelBtnText}>Cancel</Text>
              </TouchableOpacity>
              <TouchableOpacity style={styles.addConfirmBtn} onPress={addItem}>
                <Text style={styles.addConfirmText}>Add</Text>
              </TouchableOpacity>
            </View>
          </View>
        )}

        <TouchableOpacity style={styles.addItemBtn} onPress={() => setShowAdd(true)}>
          <Text style={styles.addItemBtnText}>+ Add Item</Text>
        </TouchableOpacity>
        <View style={{ height: 40 }} />
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
  back: { fontSize: 22, color: colors.textPrimary },
  title: { fontSize: 17, fontWeight: '700', color: colors.textPrimary },
  addBtn: { fontSize: 26, color: colors.primary, fontWeight: '300' },
  contextBanner: {
    backgroundColor: colors.accentVeryLight,
    margin: 16,
    borderRadius: 12,
    padding: 14,
    borderLeftWidth: 4,
    borderLeftColor: colors.primary,
  },
  contextTrail: { fontSize: 14, fontWeight: '700', color: colors.primary },
  contextMeta: { fontSize: 12, color: colors.textSecondary, marginTop: 2 },
  progressContainer: { paddingHorizontal: 16, marginBottom: 8 },
  progressText: { fontSize: 13, fontWeight: '600', color: colors.textPrimary, marginBottom: 8 },
  progressBar: { height: 6, backgroundColor: colors.border, borderRadius: 3, overflow: 'hidden' },
  progressFill: { height: '100%', backgroundColor: colors.primary, borderRadius: 3 },
  categorySection: { marginTop: 16, paddingHorizontal: 16 },
  categoryTitle: { fontSize: 14, fontWeight: '700', color: colors.textPrimary, marginBottom: 8 },
  itemRow: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.white,
    borderRadius: 12,
    padding: 14,
    marginBottom: 8,
    elevation: 1,
  },
  checkbox: {
    width: 22, height: 22, borderRadius: 6,
    borderWidth: 2, borderColor: colors.border,
    alignItems: 'center', justifyContent: 'center',
    marginRight: 12,
  },
  checkboxChecked: { backgroundColor: colors.primary, borderColor: colors.primary },
  checkmark: { color: colors.white, fontSize: 13, fontWeight: '700' },
  itemText: { flex: 1, fontSize: 14, color: colors.textPrimary },
  itemTextChecked: { textDecorationLine: 'line-through', color: colors.textMuted },
  assigneeText: { fontSize: 12, color: colors.textMuted },
  addPanel: {
    margin: 16,
    backgroundColor: colors.white,
    borderRadius: 16,
    padding: 16,
    elevation: 3,
  },
  addPanelTitle: { fontSize: 15, fontWeight: '700', color: colors.textPrimary, marginBottom: 12 },
  addInput: {
    backgroundColor: colors.inputBg,
    borderRadius: 10,
    padding: 12,
    fontSize: 14,
    color: colors.textPrimary,
    marginBottom: 12,
  },
  addActions: { flexDirection: 'row', gap: 10 },
  cancelBtn: {
    flex: 1,
    padding: 12,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: colors.border,
    alignItems: 'center',
  },
  cancelBtnText: { color: colors.textSecondary, fontSize: 14 },
  addConfirmBtn: { flex: 1, backgroundColor: colors.primary, padding: 12, borderRadius: 10, alignItems: 'center' },
  addConfirmText: { color: colors.white, fontSize: 14, fontWeight: '600' },
  addItemBtn: {
    margin: 16,
    backgroundColor: colors.primary,
    paddingVertical: 14,
    borderRadius: 50,
    alignItems: 'center',
  },
  addItemBtnText: { color: colors.white, fontSize: 15, fontWeight: '600' },
});

export default ChecklistScreen;
