import React, { useEffect } from 'react';
import { View, StyleSheet } from 'react-native';
import Animated, {
  useSharedValue, useAnimatedStyle, withRepeat, withTiming, Easing, interpolate,
} from 'react-native-reanimated';
import { colors } from '../../constants/colors';
import { radius } from '../../constants/theme';

/** Shimmering placeholder block. */
export default function Skeleton({ width = '100%', height = 16, rounded = radius.sm, style }) {
  const t = useSharedValue(0);
  useEffect(() => {
    t.value = withRepeat(withTiming(1, { duration: 1200, easing: Easing.inOut(Easing.ease) }), -1, false);
  }, []);
  const aStyle = useAnimatedStyle(() => ({
    opacity: interpolate(t.value, [0, 0.5, 1], [0.5, 1, 0.5]),
  }));
  return (
    <Animated.View
      style={[
        { width, height, borderRadius: rounded, backgroundColor: colors.border },
        aStyle,
        style,
      ]}
    />
  );
}

export function SkeletonCard() {
  return (
    <View style={styles.card}>
      <Skeleton height={140} rounded={radius.md} />
      <View style={{ height: 12 }} />
      <Skeleton width="70%" height={16} />
      <View style={{ height: 8 }} />
      <Skeleton width="40%" height={12} />
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: colors.card,
    borderRadius: radius.lg,
    padding: 14,
    marginBottom: 14,
  },
});
