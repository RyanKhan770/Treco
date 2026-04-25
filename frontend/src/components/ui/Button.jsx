import React from 'react';
import { HugeiconsIcon } from '@hugeicons/react-native';
import { ActivityIndicator, StyleSheet, Text, View } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { colors } from '../../constants/colors';
import { radius, spacing, shadows, fontSize, fontWeight } from '../../constants/theme';
import { PressableScale } from './Motion';

/**
 * Variants: primary (gradient), solid, outline, ghost, danger
 * Sizes: sm, md, lg
 */
export default function Button({
  label,
  onPress,
  variant = 'primary',
  size = 'md',
  icon: Icon,
  iconRight: IconRight,
  loading = false,
  disabled = false,
  style,
  textStyle,
  fullWidth = true,
}) {
  const sizeStyle = sizes[size];
  const isDisabled = disabled || loading;

  const Body = (
    <View style={[styles.row, { height: sizeStyle.height, paddingHorizontal: sizeStyle.padX }]}>
      {loading ? (
        <ActivityIndicator color={variant === 'outline' || variant === 'ghost' ? colors.primary : '#fff'} />
      ) : (
        <>
          {Icon ? <HugeiconsIcon icon={Icon} size={sizeStyle.icon} color={variantTextColor(variant)} strokeWidth={2.25} /> : null}
          <Text
            style={[
              styles.label,
              { color: variantTextColor(variant), fontSize: sizeStyle.font },
              textStyle,
            ]}
          >
            {label}
          </Text>
          {IconRight ? <HugeiconsIcon icon={IconRight} size={sizeStyle.icon} color={variantTextColor(variant)} strokeWidth={2.25} /> : null}
        </>
      )}
    </View>
  );

  const wrapperStyle = [
    styles.base,
    { borderRadius: radius.round, opacity: isDisabled ? 0.55 : 1 },
    fullWidth && { alignSelf: 'stretch' },
    variant === 'solid' && { backgroundColor: colors.primary, ...shadows.md },
    variant === 'outline' && { borderWidth: 1.5, borderColor: colors.primary, backgroundColor: colors.transparent },
    variant === 'ghost' && { backgroundColor: colors.transparent },
    variant === 'danger' && { backgroundColor: colors.error, ...shadows.md },
    style,
  ];

  if (variant === 'primary') {
    return (
      <PressableScale onPress={isDisabled ? undefined : onPress} style={[wrapperStyle, shadows.md]} scaleTo={0.97}>
        <LinearGradient
          colors={colors.gradForest}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={[StyleSheet.absoluteFill, { borderRadius: radius.round }]}
        />
        {Body}
      </PressableScale>
    );
  }

  return (
    <PressableScale onPress={isDisabled ? undefined : onPress} style={wrapperStyle} scaleTo={0.97}>
      {Body}
    </PressableScale>
  );
}

function variantTextColor(v) {
  if (v === 'outline' || v === 'ghost') return colors.primary;
  return '#FFFFFF';
}

const sizes = {
  sm: { height: 36, padX: 14, font: fontSize.sm, icon: 16 },
  md: { height: 48, padX: 20, font: fontSize.md, icon: 18 },
  lg: { height: 56, padX: 24, font: fontSize.lg, icon: 20 },
};

const styles = StyleSheet.create({
  base: { overflow: 'hidden' },
  row: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: spacing.sm },
  label: { fontWeight: fontWeight.semiBold, letterSpacing: 0.2 },
});
