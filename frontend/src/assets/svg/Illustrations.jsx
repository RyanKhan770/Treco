import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { colors } from '../../constants/colors';

// Rounded-square card illustrations for onboarding slides.
// Each accepts a `size` prop and renders a bold colored card with an emoji.

function IllustrationCard({ size = 200, emoji, bg }) {
  return (
    <View
      style={{
        width: size,
        height: size,
        borderRadius: size * 0.22,
        backgroundColor: bg,
        alignItems: 'center',
        justifyContent: 'center',
      }}
    >
      <Text style={{ fontSize: size * 0.45 }}>{emoji}</Text>
    </View>
  );
}

export const HikerIllustration = ({ size = 200 }) => (
  <IllustrationCard size={size} emoji="🥾" bg="#D1EAE0" />
);

export const GroupIllustration = ({ size = 200 }) => (
  <IllustrationCard size={size} emoji="👥" bg="#FEF3C7" />
);

export const MapIllustration = ({ size = 200 }) => (
  <IllustrationCard size={size} emoji="🗺️" bg="#EDE9FE" />
);

export const EmptyTrailIllustration = ({ size = 180 }) => (
  <IllustrationCard size={size} emoji="🏔️" bg={colors.surface || '#F1F3F5'} />
);

export const EmptyMessagesIllustration = ({ size = 180 }) => (
  <IllustrationCard size={size} emoji="💬" bg={colors.surface || '#F1F3F5'} />
);

export const TrailPath = ({ width = 200, height = 40 }) => (
  <View style={[styles.dashRow, { width, height }]}>
    {Array.from({ length: 10 }).map((_, i) => (
      <View key={i} style={styles.dash} />
    ))}
  </View>
);

const styles = StyleSheet.create({
  dashRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  dash: { width: 8, height: 3, borderRadius: 2, backgroundColor: colors.primary, opacity: 0.5 },
});
