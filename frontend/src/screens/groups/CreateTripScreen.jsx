import React, { useState } from 'react';
import {
  View, Text, StyleSheet, ScrollView, TouchableOpacity,
  TextInput, StatusBar, SafeAreaView, Alert, ActivityIndicator,
} from 'react-native';
import { colors } from '../../constants/colors';

const trails = [
  'Annapurna Base Camp', 'Poon Hill Trek', 'Everest Base Camp',
  'Langtang Valley Trek', 'Mardi Himal Trek', 'Shivapuri Day Hike',
  'Nagarkot Sunrise Hike', 'Manaslu Circuit',
];

const CreateTripScreen = ({ navigation }) => {
  const [form, setForm] = useState({
    tripName: '', trail: '', startDate: '', endDate: '',
    groupSize: '', budget: '', description: '',
  });
  const [loading, setLoading] = useState(false);
  const [showTrailPicker, setShowTrailPicker] = useState(false);

  const update = (f, v) => setForm((p) => ({ ...p, [f]: v }));

  const handleCreate = async () => {
    if (!form.tripName || !form.trail || !form.startDate) {
      Alert.alert('Error', 'Please fill in trip name, trail, and start date.'); return;
    }
    setLoading(true);
    setTimeout(() => {
      setLoading(false);
      Alert.alert('Success', 'Your trip has been created!', [
        { text: 'OK', onPress: () => navigation.goBack() },
      ]);
    }, 1200);
  };

  return (
    <SafeAreaView style={styles.safe}>
      <StatusBar barStyle="dark-content" backgroundColor={colors.white} />
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <Text style={styles.cancel}>Cancel</Text>
        </TouchableOpacity>
        <Text style={styles.title}>Create Trip</Text>
        <View style={{ width: 60 }} />
      </View>

      <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
        <Field label="Trip Name" placeholder="e.g., Everest Base Camp Adventure"
          value={form.tripName} onChangeText={(v) => update('tripName', v)} />

        <Text style={styles.label}>Select Trail</Text>
        <TouchableOpacity style={styles.trailPicker} onPress={() => setShowTrailPicker(!showTrailPicker)}>
          <Text style={[styles.trailPickerText, !form.trail && { color: colors.textMuted }]}>
            {form.trail || 'Search or select a trail'}
          </Text>
          <Text style={styles.chevron}>▼</Text>
        </TouchableOpacity>
        {showTrailPicker && (
          <View style={styles.trailDropdown}>
            {trails.map((t) => (
              <TouchableOpacity
                key={t}
                style={styles.trailOption}
                onPress={() => { update('trail', t); setShowTrailPicker(false); }}
              >
                <Text style={styles.trailOptionText}>{t}</Text>
              </TouchableOpacity>
            ))}
          </View>
        )}

        <Text style={styles.label}>Date Range</Text>
        <View style={styles.dateRow}>
          <TextInput
            style={[styles.input, { flex: 1 }]}
            placeholder="Start Date"
            placeholderTextColor={colors.textMuted}
            value={form.startDate}
            onChangeText={(v) => update('startDate', v)}
          />
          <TextInput
            style={[styles.input, { flex: 1 }]}
            placeholder="End Date"
            placeholderTextColor={colors.textMuted}
            value={form.endDate}
            onChangeText={(v) => update('endDate', v)}
          />
        </View>

        <Field label="Group Size" placeholder="Max members (e.g., 8)"
          value={form.groupSize} onChangeText={(v) => update('groupSize', v)} keyboardType="numeric" />

        <Field label="Estimated Budget (NPR)" placeholder="e.g., 25000"
          value={form.budget} onChangeText={(v) => update('budget', v)} keyboardType="numeric" />

        <Text style={styles.label}>Description</Text>
        <TextInput
          style={[styles.input, styles.textarea]}
          placeholder="Tell others about your trip..."
          placeholderTextColor={colors.textMuted}
          value={form.description}
          onChangeText={(v) => update('description', v)}
          multiline
          numberOfLines={4}
          textAlignVertical="top"
        />

        <TouchableOpacity
          style={[styles.createBtn, loading && { opacity: 0.7 }]}
          onPress={handleCreate}
          disabled={loading}
        >
          {loading ? <ActivityIndicator color={colors.white} /> : <Text style={styles.createBtnText}>Create Trip</Text>}
        </TouchableOpacity>
        <View style={{ height: 40 }} />
      </ScrollView>
    </SafeAreaView>
  );
};

const Field = ({ label, ...props }) => (
  <View style={{ marginBottom: 16 }}>
    <Text style={styles.label}>{label}</Text>
    <TextInput style={styles.input} placeholderTextColor={colors.textMuted} {...props} />
  </View>
);

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: colors.white },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  cancel: { color: colors.textSecondary, fontSize: 15 },
  title: { fontSize: 17, fontWeight: '700', color: colors.textPrimary },
  container: { padding: 16 },
  label: { fontSize: 13, fontWeight: '600', color: colors.textPrimary, marginBottom: 8 },
  input: {
    backgroundColor: colors.inputBg,
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 14,
    fontSize: 15,
    color: colors.textPrimary,
    marginBottom: 16,
  },
  textarea: { height: 100, paddingTop: 14 },
  trailPicker: {
    backgroundColor: colors.inputBg,
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 14,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  trailPickerText: { fontSize: 15, color: colors.textPrimary },
  chevron: { fontSize: 12, color: colors.textMuted },
  trailDropdown: {
    backgroundColor: colors.white,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: colors.border,
    marginBottom: 16,
    elevation: 4,
  },
  trailOption: { padding: 14, borderBottomWidth: 1, borderBottomColor: colors.border },
  trailOptionText: { fontSize: 14, color: colors.textPrimary },
  dateRow: { flexDirection: 'row', gap: 12 },
  createBtn: {
    backgroundColor: colors.primary,
    paddingVertical: 16,
    borderRadius: 50,
    alignItems: 'center',
    marginTop: 8,
  },
  createBtnText: { color: colors.white, fontSize: 16, fontWeight: '600' },
});

export default CreateTripScreen;
