import React from 'react';
import { StyleSheet, Text, View, Platform } from 'react-native';
import { HugeiconsIcon } from '@hugeicons/react-native';
import { ArrowLeft02Icon } from '@hugeicons/core-free-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { colors } from '../../constants/colors';
import { fontSize, fontWeight, spacing } from '../../constants/theme';
import { PressableScale } from './Motion';

/**
 * Unified sub-screen header — always shows a back button top-left.
 *
 * Props:
 *   title       – main title string
 *   subtitle    – smaller text below title
 *   onBack      – called when back chevron is pressed
 *   right       – optional JSX in right slot
 *   transparent – no background (for hero-overlay headers)
 *   light       – white icons/text (for dark hero backgrounds)
 */
export default function ScreenHeader({
  title,
  subtitle,
  onBack,
  right,
  transparent = false,
  light = false,
}) {
  const insets = useSafeAreaInsets();
  const topPad = Math.max(insets.top, Platform.OS === 'android' ? 28 : 0);
  const textColor = light ? '#fff' : colors.text;
  const subColor  = light ? 'rgba(255,255,255,0.75)' : colors.textSecondary;

  return (
    <View
      style={[
        styles.wrap,
        { paddingTop: topPad + 8 },
        !transparent && styles.surface,
      ]}
    >
      {/* Back button — always visible */}
      <PressableScale
        onPress={onBack}
        scaleTo={0.88}
        hitSlop={10}
        style={[styles.iconBtn, light ? styles.iconBtnLight : styles.iconBtnDark]}
      >
        <HugeiconsIcon icon={ArrowLeft02Icon} size={22} color={light ? '#fff' : colors.text} />
      </PressableScale>

      {/* Title block */}
      <View style={styles.titleBlock}>
        <Text style={[styles.title, { color: textColor }]} numberOfLines={1}>{title}</Text>
        {subtitle ? (
          <Text style={[styles.subtitle, { color: subColor }]} numberOfLines={1}>{subtitle}</Text>
        ) : null}
      </View>

      {/* Right slot — same width as back btn to keep title visually centred */}
      <View style={styles.rightSlot}>{right || null}</View>
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: spacing.md,
    paddingBottom: spacing.sm,
    gap: spacing.sm,
    zIndex: 10,
  },
  surface: {
    backgroundColor: colors.background,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: colors.border,
    ...Platform.select({
      ios:     { shadowColor: '#000', shadowOpacity: 0.04, shadowRadius: 4, shadowOffset: { width: 0, height: 2 } },
      android: { elevation: 2 },
    }),
  },
  iconBtn: {
    width: 40, height: 40, borderRadius: 20,
    alignItems: 'center', justifyContent: 'center', flexShrink: 0,
  },
  iconBtnDark: {
    backgroundColor: colors.card,
    ...Platform.select({
      ios:     { shadowColor: '#000', shadowOpacity: 0.06, shadowRadius: 3, shadowOffset: { width: 0, height: 1 } },
      android: { elevation: 1 },
    }),
  },
  iconBtnLight: { backgroundColor: 'rgba(0,0,0,0.28)' },
  titleBlock: { flex: 1 },
  title:    { fontSize: fontSize.lg, fontWeight: fontWeight.bold, letterSpacing: -0.3 },
  subtitle: { fontSize: fontSize.xs, fontWeight: fontWeight.medium, marginTop: 1 },
  rightSlot: { width: 40, alignItems: 'flex-end' },
});
