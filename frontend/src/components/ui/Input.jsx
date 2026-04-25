import React, { forwardRef, useState } from 'react';
import { HugeiconsIcon } from '@hugeicons/react-native';
import { StyleSheet, Text, TextInput, View } from 'react-native';
import Animated, { useSharedValue, useAnimatedStyle, withTiming, interpolateColor } from 'react-native-reanimated';
import { colors } from '../../constants/colors';
import { radius, spacing, fontSize, fontWeight } from '../../constants/theme';
import { PressableScale } from './Motion';

/**
 * Modern input with leading icon, focus-animated border, optional trailing action.
 */
const Input = forwardRef(function Input(
  { label, icon: Icon, trailing, error, style, containerStyle, ...rest },
  ref,
) {
  const [focused, setFocused] = useState(false);
  const t = useSharedValue(0);

  React.useEffect(() => {
    t.value = withTiming(focused ? 1 : 0, { duration: 180 });
  }, [focused]);

  const borderStyle = useAnimatedStyle(() => ({
    borderColor: interpolateColor(
      t.value,
      [0, 1],
      [error ? colors.error : colors.inputBorder, error ? colors.error : colors.inputFocus],
    ),
  }));

  return (
    <View style={[{ marginBottom: spacing.md }, containerStyle]}>
      {label ? <Text style={styles.label}>{label}</Text> : null}
      <Animated.View style={[styles.row, borderStyle, style]}>
        {Icon ? (
          <HugeiconsIcon icon={Icon} size={18} color={focused ? colors.primary : colors.textLight} strokeWidth={2} />
        ) : null}
        <TextInput
          ref={ref}
          style={styles.input}
          placeholderTextColor={colors.textMuted}
          onFocus={() => setFocused(true)}
          onBlur={() => setFocused(false)}
          {...rest}
        />
        {trailing ? <View style={{ marginLeft: spacing.sm }}>{trailing}</View> : null}
      </Animated.View>
      {error ? <Text style={styles.error}>{error}</Text> : null}
    </View>
  );
});

const styles = StyleSheet.create({
  label: {
    fontSize: fontSize.sm,
    fontWeight: fontWeight.semiBold,
    color: colors.textSecondary,
    marginBottom: 6,
    letterSpacing: 0.2,
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1.5,
    borderRadius: radius.md,
    backgroundColor: colors.inputBg,
    paddingHorizontal: spacing.md,
    height: 52,
    gap: spacing.sm,
  },
  input: {
    flex: 1,
    fontSize: fontSize.md,
    color: colors.text,
    paddingVertical: 0,
  },
  error: {
    fontSize: fontSize.xs,
    color: colors.error,
    marginTop: 4,
    marginLeft: 4,
  },
});

export default Input;
