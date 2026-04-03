import React, { useState } from 'react';
import {
  View, Text, StyleSheet, TouchableOpacity,
  ScrollView, Alert,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { colors } from '../../constants/colors';

const EXPENSES = [
  { id: 1, category: 'Transport', description: 'Bus Kathmandu → Pokhara', amount: 1800, color: '#3B82F6' },
  { id: 2, category: 'Permit', description: 'ACAP Permit + TIMS', amount: 3500, color: '#8B5CF6' },
  { id: 3, category: 'Accommodation', description: 'Tea houses (10 nights)', amount: 8000, color: '#F59E0B' },
  { id: 4, category: 'Food', description: 'Meals per day × 11 days', amount: 7700, color: '#10B981' },
  { id: 5, category: 'Guide', description: 'Local guide fee', amount: 4000, color: '#EF4444' },
];

const TOTAL = 25000;
const SPENT = EXPENSES.reduce((s, e) => s + e.amount, 0);

export default function TripBudgetScreen({ navigation, route }) {
  const groupName = route?.params?.groupName || 'ABC Trek 2024';
  const members = route?.params?.members || 6;
  const dates = route?.params?.dates || 'Mar 15 – Mar 26';

  const remaining = TOTAL - SPENT;
  const progress = SPENT / TOTAL;

  return (
    <SafeAreaView style={styles.safe}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <Text style={styles.backArrow}>←</Text>
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Trip Budget</Text>
        <TouchableOpacity>
          <Text style={styles.addBtn}>+</Text>
        </TouchableOpacity>
      </View>

      <ScrollView showsVerticalScrollIndicator={false}>
        {/* Group banner */}
        <View style={styles.groupBanner}>
          <Text style={styles.groupName}>{groupName}</Text>
          <Text style={styles.groupMeta}>{members} members  •  {dates}</Text>
        </View>

        {/* Budget summary card */}
        <View style={styles.summaryCard}>
          <Text style={styles.summaryLabel}>Total Budget (per person)</Text>
          <Text style={styles.summaryAmount}>NPR {TOTAL.toLocaleString()}</Text>
          <Text style={styles.summaryDetail}>
            NPR {SPENT.toLocaleString()} spent  •  NPR {remaining.toLocaleString()} remaining
          </Text>
          <View style={styles.progressBar}>
            <View style={[styles.progressFill, { width: `${Math.min(progress * 100, 100)}%` }]} />
          </View>
          <Text style={styles.progressPct}>{Math.round(progress * 100)}% used</Text>
        </View>

        {/* Expense breakdown */}
        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>Expense Breakdown</Text>
        </View>
        <View style={styles.expensesCard}>
          {EXPENSES.map((exp, idx) => (
            <View
              key={exp.id}
              style={[styles.expenseRow, idx < EXPENSES.length - 1 && styles.expenseDivider]}
            >
              <View style={[styles.expenseIcon, { backgroundColor: exp.color + '22' }]}>
                <View style={[styles.expenseDot, { backgroundColor: exp.color }]} />
              </View>
              <View style={styles.expenseInfo}>
                <Text style={styles.expenseCategory}>{exp.category}</Text>
                <Text style={styles.expenseDesc}>{exp.description}</Text>
              </View>
              <Text style={styles.expenseAmount}>NPR {exp.amount.toLocaleString()}</Text>
            </View>
          ))}
        </View>

        {/* Share button */}
        <TouchableOpacity
          style={styles.shareBtn}
          onPress={() => Alert.alert('Shared', 'Budget shared with group members.')}
          activeOpacity={0.85}
        >
          <Text style={styles.shareBtnText}>Share with Group</Text>
        </TouchableOpacity>

        <View style={{ height: 40 }} />
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: colors.background },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 14,
    backgroundColor: colors.white,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  backArrow: { fontSize: 22, color: colors.text, padding: 4 },
  headerTitle: { fontSize: 17, fontWeight: '700', color: colors.text },
  addBtn: { fontSize: 26, color: colors.primary, fontWeight: '300', padding: 4 },
  groupBanner: {
    backgroundColor: colors.primary,
    paddingHorizontal: 20,
    paddingVertical: 16,
  },
  groupName: { fontSize: 17, fontWeight: '700', color: colors.white },
  groupMeta: { fontSize: 13, color: 'rgba(255,255,255,0.75)', marginTop: 4 },
  summaryCard: {
    backgroundColor: colors.white,
    margin: 16,
    borderRadius: 16,
    padding: 20,
    shadowColor: '#000',
    shadowOpacity: 0.06,
    shadowRadius: 8,
    elevation: 3,
  },
  summaryLabel: { fontSize: 13, color: colors.textSecondary, marginBottom: 4 },
  summaryAmount: {
    fontSize: 32,
    fontWeight: '800',
    color: colors.primary,
    marginBottom: 6,
  },
  summaryDetail: { fontSize: 13, color: colors.textSecondary, marginBottom: 12 },
  progressBar: {
    height: 8,
    backgroundColor: colors.border,
    borderRadius: 4,
    overflow: 'hidden',
    marginBottom: 6,
  },
  progressFill: {
    height: '100%',
    backgroundColor: colors.primary,
    borderRadius: 4,
  },
  progressPct: { fontSize: 12, color: colors.textLight, textAlign: 'right' },
  sectionHeader: { paddingHorizontal: 16, marginBottom: 8 },
  sectionTitle: { fontSize: 16, fontWeight: '700', color: colors.text },
  expensesCard: {
    backgroundColor: colors.white,
    marginHorizontal: 16,
    borderRadius: 16,
    overflow: 'hidden',
    marginBottom: 24,
  },
  expenseRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 14,
  },
  expenseDivider: { borderBottomWidth: 1, borderBottomColor: colors.border },
  expenseIcon: {
    width: 40,
    height: 40,
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  expenseDot: { width: 16, height: 16, borderRadius: 4 },
  expenseInfo: { flex: 1 },
  expenseCategory: { fontSize: 14, fontWeight: '600', color: colors.text },
  expenseDesc: { fontSize: 12, color: colors.textSecondary, marginTop: 2 },
  expenseAmount: { fontSize: 14, fontWeight: '700', color: colors.text },
  shareBtn: {
    backgroundColor: colors.primary,
    marginHorizontal: 16,
    borderRadius: 50,
    paddingVertical: 16,
    alignItems: 'center',
  },
  shareBtnText: { fontSize: 16, fontWeight: '700', color: colors.white },
});
