import { HugeiconsIcon } from '@hugeicons/react-native';
import React, { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, Alert, TextInput } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { ArrowLeft02Icon, StarIcon } from '@hugeicons/core-free-icons';
import { colors } from '../../constants/colors';
import { fontSize, fontWeight, radius, spacing } from '../../constants/theme';
import { Button, PressableScale, Card } from '../../components/ui';
import api from '../../services/api';

const CONDITIONS = ['Clear', 'Muddy', 'Snow/Ice', 'Overgrown', 'Closed'];

const WriteTrailReviewScreen = ({ navigation, route }) => {
  const { trailId, trailName } = route.params;

  const [rating, setRating] = useState(0);
  const [condition, setCondition] = useState('Clear');
  const [comment, setComment] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async () => {
    if (rating === 0) {
      Alert.alert('Incomplete', 'Please rate the trail out of 5 stars.');
      return;
    }
    setLoading(true);
    try {
      await api.post(`/trails/${trailId}/reviews`, {
        rating,
        comment,
        condition_status: condition,
        visited_date: new Date().toISOString().split('T')[0],
      });
      Alert.alert('Success', 'Thanks for updating the community!');
      navigation.goBack();
    } catch (err) {
      const msg = err?.response?.data?.message || 'Could not submit review.';
      Alert.alert('Error', msg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <SafeAreaView style={styles.safe} edges={['top', 'bottom']}>
      <View style={styles.header}>
        <PressableScale onPress={() => navigation.goBack()} style={styles.backBtn}>
          <HugeiconsIcon icon={ArrowLeft02Icon} size={24} color={colors.text} />
        </PressableScale>
        <Text style={styles.headerTitle}>Review {trailName}</Text>
        <View style={{ width: 40 }} />
      </View>

      <ScrollView contentContainerStyle={styles.content}>
        <Text style={styles.intro}>
          Your recent trail reports help other trekkers prepare and stay safe.
        </Text>

        <Card style={styles.card}>
          <Text style={styles.label}>Overall Rating</Text>
          <View style={styles.starRow}>
            {[1, 2, 3, 4, 5].map((star) => (
              <PressableScale key={star} onPress={() => setRating(star)} scaleTo={0.8}>
                <HugeiconsIcon icon={StarIcon}
                  size={36}
                  color={star <= rating ? colors.warning : colors.border}
                  fill={star <= rating ? colors.warning : 'transparent'}
                />
              </PressableScale>
            ))}
          </View>
        </Card>

        <Card style={styles.card}>
          <Text style={styles.label}>Current Conditions</Text>
          <Text style={styles.subLabel}>What was the trail like?</Text>
          <View style={styles.chipRow}>
            {CONDITIONS.map((c) => {
              const active = condition === c;
              return (
                <PressableScale 
                  key={c} 
                  onPress={() => setCondition(c)}
                  style={[styles.chip, active && styles.chipActive]}
                  scaleTo={0.95}
                >
                  <Text style={[styles.chipText, active && styles.chipTextActive]}>{c}</Text>
                </PressableScale>
              );
            })}
          </View>
        </Card>

        <Card style={styles.card}>
          <Text style={styles.label}>Details (Optional)</Text>
          <TextInput
            style={styles.input}
            placeholder="Share any hazards, views, or general tips..."
            placeholderTextColor={colors.textMuted}
            multiline
            value={comment}
            onChangeText={setComment}
          />
        </Card>

        <Button 
          label="Submit Report" 
          onPress={handleSubmit} 
          loading={loading}
          style={styles.submitBtn}
        />
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: colors.background },
  header: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
    paddingHorizontal: spacing.md, paddingVertical: spacing.sm,
    borderBottomWidth: 1, borderBottomColor: colors.border,
  },
  backBtn: { padding: 8, marginLeft: -8 },
  headerTitle: { fontSize: fontSize.lg, fontWeight: fontWeight.bold, color: colors.text },
  content: { padding: spacing.lg },
  intro: { fontSize: fontSize.md, color: colors.textSecondary, marginBottom: spacing.xl, lineHeight: 22 },
  card: { marginBottom: spacing.lg },
  label: { fontSize: fontSize.md, fontWeight: fontWeight.bold, color: colors.text, marginBottom: spacing.sm },
  subLabel: { fontSize: fontSize.xs, color: colors.textLight, marginBottom: spacing.md },
  starRow: { flexDirection: 'row', gap: 12 },
  chipRow: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
  chip: { 
    paddingHorizontal: 16, paddingVertical: 8, 
    borderRadius: radius.round, backgroundColor: colors.background,
    borderWidth: 1, borderColor: colors.border
  },
  chipActive: { backgroundColor: colors.primary, borderColor: colors.primary },
  chipText: { fontSize: fontSize.sm, fontWeight: fontWeight.bold, color: colors.textLight },
  chipTextActive: { color: '#fff' },
  input: {
    minHeight: 100, textAlignVertical: 'top',
    fontSize: fontSize.md, color: colors.text,
    backgroundColor: colors.background, padding: spacing.sm, borderRadius: radius.md,
  },
  submitBtn: { marginTop: spacing.md, marginBottom: spacing.xxl },
});

export default WriteTrailReviewScreen;
