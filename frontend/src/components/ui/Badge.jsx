import React from 'react';
import { HugeiconsIcon } from '@hugeicons/react-native';
import { StyleSheet, Text, View } from 'react-native';
import { colors } from '../../constants/colors';
import { fontSize, fontWeight, radius, spacing } from '../../constants/theme';

/**
 * Compact label pill. tone: neutral | primary | success | warning | danger | info
 */
export default function Badge({ label, tone = 'neutral', icon: Icon, style, size = 'sm' }) {
  const t = tones[tone] || tones.neutral;
  const s = sizes[size];
  return (
    <View style={[styles.badge, { backgroundColor: t.bg, paddingVertical: s.padY, paddingHorizontal: s.padX }, style]}>
      {Icon ? <HugeiconsIcon icon={Icon} size={s.icon} color={t.fg} strokeWidth={2.5} /> : null}
      <Text style={[styles.label, { color: t.fg, fontSize: s.font }]}>{label}</Text>
    </View>
  );
}

const tones = {
  neutral: { bg: colors.surface, fg: colors.textSecondary },
  primary: { bg: colors.primaryPale, fg: colors.primary },
  success: { bg: '#D1FAE5', fg: '#065F46' },
  warning: { bg: '#FEF3C7', fg: '#92400E' },
  danger:  { bg: '#FEE2E2', fg: '#991B1B' },
  info:    { bg: '#DBEAFE', fg: '#1E40AF' },
  dark:    { bg: colors.primary, fg: '#FFFFFF' },
};

const sizes = {
  xs: { padY: 2, padX: 8,  font: 10, icon: 10 },
  sm: { padY: 4, padX: 10, font: 11, icon: 12 },
  md: { padY: 6, padX: 12, font: 13, icon: 14 },
};

const styles = StyleSheet.create({
  badge: {
    flexDirection: 'row', alignItems: 'center',
    borderRadius: radius.round,
    alignSelf: 'flex-start',
    gap: 4,
  },
  label: { fontWeight: fontWeight.semiBold, letterSpacing: 0.2 },
});
