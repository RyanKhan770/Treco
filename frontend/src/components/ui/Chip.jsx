import React from 'react';
import { StyleSheet, Text } from 'react-native';
import { colors } from '../../constants/colors';
import { fontSize, fontWeight, radius, spacing } from '../../constants/theme';
import { PressableScale } from './Motion';

/**
 * Horizontal filter chip. Pass `selected` for active state.
 */
export default function Chip({ label, selected, onPress, icon: Icon, style }) {
  return (
    <PressableScale
      onPress={onPress}
      style={[
        styles.chip,
        selected ? styles.selected : styles.unselected,
        style,
      ]}
      scaleTo={0.94}
    >
      {Icon ? (
        <Icon
          size={14}
          color={selected ? '#fff' : colors.textSecondary}
          strokeWidth={2.25}
          style={{ marginRight: 6 }}
        />
      ) : null}
      <Text style={[styles.label, selected ? styles.labelSelected : styles.labelUnselected]}>{label}</Text>
    </PressableScale>
  );
}

const styles = StyleSheet.create({
  chip: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 8,
    paddingHorizontal: 14,
    borderRadius: radius.round,
    marginRight: spacing.sm,
  },
  selected: { backgroundColor: colors.primary },
  unselected: { backgroundColor: colors.surface, borderWidth: 1, borderColor: colors.border },
  label: { fontSize: fontSize.sm, fontWeight: fontWeight.semiBold, letterSpacing: 0.2 },
  labelSelected: { color: '#fff' },
  labelUnselected: { color: colors.textSecondary },
});
