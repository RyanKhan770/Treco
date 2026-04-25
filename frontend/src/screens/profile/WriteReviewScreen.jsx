import { HugeiconsIcon } from '@hugeicons/react-native';
import React, { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, Alert, TextInput } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { ArrowLeft02Icon, StarIcon } from '@hugeicons/core-free-icons';
import { colors } from '../../constants/colors';
import { fontSize, fontWeight, radius, spacing } from '../../constants/theme';
import { Button, PressableScale, Card } from '../../components/ui';
import { reviewsAPI } from '../../services/api';

const WriteReviewScreen = ({ navigation, route }) => {
  const { userId, userName } = route.params;

  const [reliability, setReliability] = useState(0);
  const [cooperation, setCooperation] = useState(0);
  const [experience, setExperience] = useState(0);
  const [comment, setComment] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async () => {
    if (!reliability || !cooperation || !experience) {
      Alert.alert('Incomplete', 'Please rate all three categories.');
      return;
    }
    setLoading(true);
    try {
      await reviewsAPI.postUserReview({
        reviewed_id: userId,
        reliability,
        cooperation,
        experience_skills: experience,
        comment,
      });
      Alert.alert('Success', 'Your review has been submitted.');
      navigation.goBack();
    } catch (err) {
      const msg = err?.response?.data?.message || 'Could not submit review.';
      Alert.alert('Error', msg);
    } finally {
      setLoading(false);
    }
  };

  const renderStars = (value, setValue) => {
    return (
      <View style={styles.starRow}>
        {[1, 2, 3, 4, 5].map((star) => (
          <PressableScale key={star} onPress={() => setValue(star)} scaleTo={0.8}>
            <HugeiconsIcon icon={StarIcon}
              size={32}
              color={star <= value ? colors.warning : colors.border}
              fill={star <= value ? colors.warning : 'transparent'}
            />
          </PressableScale>
        ))}
      </View>
    );
  };

  return (
    <SafeAreaView style={styles.safe} edges={['top', 'bottom']}>
      <View style={styles.header}>
        <PressableScale onPress={() => navigation.goBack()} style={styles.backBtn}>
          <HugeiconsIcon icon={ArrowLeft02Icon} size={24} color={colors.text} />
        </PressableScale>
        <Text style={styles.headerTitle}>Review {userName}</Text>
        <View style={{ width: 40 }} />
      </View>

      <ScrollView contentContainerStyle={styles.content}>
        <Text style={styles.intro}>
          Your feedback helps build trust within the Treco community. 
          Please rate {userName} based on your past experiences trekking together.
        </Text>

        <Card style={styles.card}>
          <Text style={styles.label}>Reliability</Text>
          <Text style={styles.subLabel}>Did they show up on time? Were they dependable?</Text>
          {renderStars(reliability, setReliability)}
        </Card>

        <Card style={styles.card}>
          <Text style={styles.label}>Cooperation</Text>
          <Text style={styles.subLabel}>Were they a team player? Easy to get along with?</Text>
          {renderStars(cooperation, setCooperation)}
        </Card>

        <Card style={styles.card}>
          <Text style={styles.label}>Experience & Skills</Text>
          <Text style={styles.subLabel}>How would you rate their outdoor skills and preparedness?</Text>
          {renderStars(experience, setExperience)}
        </Card>

        <Card style={styles.card}>
          <Text style={styles.label}>Additional Comments (Optional)</Text>
          <TextInput
            style={styles.input}
            placeholder="Share any specific details..."
            placeholderTextColor={colors.textMuted}
            multiline
            value={comment}
            onChangeText={setComment}
          />
        </Card>

        <Button 
          label="Submit Review" 
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
  label: { fontSize: fontSize.md, fontWeight: fontWeight.bold, color: colors.text },
  subLabel: { fontSize: fontSize.xs, color: colors.textLight, marginTop: 4, marginBottom: spacing.md },
  starRow: { flexDirection: 'row', gap: 12 },
  input: {
    marginTop: spacing.sm, minHeight: 80, textAlignVertical: 'top',
    fontSize: fontSize.md, color: colors.text,
    backgroundColor: colors.background, padding: spacing.sm, borderRadius: radius.md,
  },
  submitBtn: { marginTop: spacing.md, marginBottom: spacing.xxl },
});

export default WriteReviewScreen;
