import React, { useEffect } from 'react';
import { Pressable } from 'react-native';
import Animated, {
  useSharedValue, useAnimatedStyle, withTiming, withSpring, withDelay, withRepeat,
  Easing, interpolate,
} from 'react-native-reanimated';

// Snappy, modern easing — feels instant but still polished
const EASE = Easing.bezier(0.25, 0.46, 0.45, 0.94);
const EASE_IN = Easing.bezier(0.4, 0, 0.2, 1);

/* ---------- FadeIn ---------- */
export function FadeIn({ children, delay = 0, duration = 180, style, from = 0, to = 1 }) {
  const opacity = useSharedValue(from);
  useEffect(() => {
    opacity.value = withDelay(delay, withTiming(to, { duration, easing: EASE }));
  }, []);
  const aStyle = useAnimatedStyle(() => ({ opacity: opacity.value }));
  return <Animated.View style={[style, aStyle]}>{children}</Animated.View>;
}

/* ---------- SlideUp (fade + translateY) ---------- */
export function SlideUp({ children, delay = 0, distance = 14, duration = 200, style }) {
  const t = useSharedValue(0);
  useEffect(() => {
    t.value = withDelay(delay, withTiming(1, { duration, easing: EASE }));
  }, []);
  const aStyle = useAnimatedStyle(() => ({
    opacity: t.value,
    transform: [{ translateY: interpolate(t.value, [0, 1], [distance, 0]) }],
  }));
  return <Animated.View style={[style, aStyle]}>{children}</Animated.View>;
}

/* ---------- SlideInX ---------- */
export function SlideInX({ children, delay = 0, distance = 24, duration = 200, style }) {
  const t = useSharedValue(0);
  useEffect(() => {
    t.value = withDelay(delay, withTiming(1, { duration, easing: EASE }));
  }, []);
  const aStyle = useAnimatedStyle(() => ({
    opacity: t.value,
    transform: [{ translateX: interpolate(t.value, [0, 1], [distance, 0]) }],
  }));
  return <Animated.View style={[style, aStyle]}>{children}</Animated.View>;
}

/* ---------- ScaleIn (spring) ---------- */
export function ScaleIn({ children, delay = 0, style }) {
  const s = useSharedValue(0.92);
  const o = useSharedValue(0);
  useEffect(() => {
    s.value = withDelay(delay, withSpring(1, { damping: 18, stiffness: 260, mass: 0.8 }));
    o.value = withDelay(delay, withTiming(1, { duration: 180 }));
  }, []);
  const aStyle = useAnimatedStyle(() => ({
    opacity: o.value,
    transform: [{ scale: s.value }],
  }));
  return <Animated.View style={[style, aStyle]}>{children}</Animated.View>;
}

/* ---------- Pressable with scale feedback ---------- */
export function PressableScale({ children, onPress, style, scaleTo = 0.96, disabled, hitSlop }) {
  const s = useSharedValue(1);
  const aStyle = useAnimatedStyle(() => ({ transform: [{ scale: s.value }] }));
  return (
    <Pressable
      onPress={onPress}
      disabled={disabled}
      hitSlop={hitSlop}
      onPressIn={() => (s.value = withSpring(scaleTo, { damping: 20, stiffness: 400, mass: 0.6 }))}
      onPressOut={() => (s.value = withSpring(1, { damping: 20, stiffness: 400, mass: 0.6 }))}
    >
      <Animated.View style={[style, aStyle]}>{children}</Animated.View>
    </Pressable>
  );
}

/* ---------- Stagger: wraps children in SlideUp with incremental delay ---------- */
export function Stagger({ children, initialDelay = 0, step = 40, distance = 14 }) {
  const arr = React.Children.toArray(children);
  return (
    <>
      {arr.map((child, i) => (
        <SlideUp key={i} delay={initialDelay + i * step} distance={distance}>
          {child}
        </SlideUp>
      ))}
    </>
  );
}

/* ---------- Pulse (infinite breathing) ---------- */
export function Pulse({ children, style, min = 0.85, max = 1, duration = 1400 }) {
  const s = useSharedValue(min);
  useEffect(() => {
    s.value = withRepeat(withTiming(max, { duration, easing: EASE_IN }), -1, true);
  }, []);
  const aStyle = useAnimatedStyle(() => ({ opacity: s.value }));
  return <Animated.View style={[style, aStyle]}>{children}</Animated.View>;
}

/* ---------- Floating (gentle y-bob) ---------- */
export function Floating({ children, style, amplitude = 6, duration = 2600 }) {
  const t = useSharedValue(0);
  useEffect(() => {
    t.value = withRepeat(withTiming(1, { duration, easing: Easing.inOut(Easing.quad) }), -1, true);
  }, []);
  const aStyle = useAnimatedStyle(() => ({
    transform: [{ translateY: interpolate(t.value, [0, 1], [-amplitude, amplitude]) }],
  }));
  return <Animated.View style={[style, aStyle]}>{children}</Animated.View>;
}

export const Easings = { EASE, EASE_IN };
export default { FadeIn, SlideUp, SlideInX, ScaleIn, PressableScale, Stagger, Pulse, Floating };
