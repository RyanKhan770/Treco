import React from 'react';
import { StyleSheet, View } from 'react-native';
import { colors } from '../../constants/colors';
import { radius, shadows, spacing } from '../../constants/theme';
import { PressableScale } from './Motion';

/**
 * Generic surface card. Pass onPress to make it interactive with scale feedback.
 */
export default function Card({
  children,
  onPress,
  padding = spacing.md,
  style,
  elevation = 'sm',
  bordered = false,
}) {
  const base = [
    styles.card,
    shadows[elevation] || shadows.sm,
    { padding, borderWidth: bordered ? 1 : 0, borderColor: colors.border },
    style,
  ];
  if (onPress) {
    return (
      <PressableScale onPress={onPress} style={base}>
        {children}
      </PressableScale>
    );
  }
  return <View style={base}>{children}</View>;
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: colors.card,
    borderRadius: radius.xl,
  },
});
