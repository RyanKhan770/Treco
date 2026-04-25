import React from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { colors } from '../../constants/colors';
import { fontSize, fontWeight, spacing } from '../../constants/theme';
import { FadeIn, SlideUp } from './Motion';

/**
 * Use to show an illustration + title + subtitle when a list is empty.
 */
export default function EmptyState({ illustration, title, subtitle, action }) {
  return (
    <View style={styles.wrap}>
      <FadeIn delay={0} duration={500}>{illustration}</FadeIn>
      <SlideUp delay={120}>
        <Text style={styles.title}>{title}</Text>
      </SlideUp>
      {subtitle ? (
        <SlideUp delay={200}>
          <Text style={styles.sub}>{subtitle}</Text>
        </SlideUp>
      ) : null}
      {action ? <SlideUp delay={280} style={{ marginTop: spacing.lg }}>{action}</SlideUp> : null}
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: spacing.xl,
  },
  title: {
    fontSize: fontSize.xl,
    fontWeight: fontWeight.bold,
    color: colors.text,
    marginTop: spacing.lg,
    textAlign: 'center',
  },
  sub: {
    fontSize: fontSize.md,
    color: colors.textSecondary,
    marginTop: spacing.sm,
    textAlign: 'center',
    maxWidth: 280,
    lineHeight: 22,
  },
});
