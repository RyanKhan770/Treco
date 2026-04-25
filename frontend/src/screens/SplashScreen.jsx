import React, { useEffect } from 'react';
import { View, Text, StyleSheet, StatusBar, Dimensions } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { LinearGradient } from 'expo-linear-gradient';
import Animated, {
  useSharedValue, useAnimatedStyle, withTiming, withDelay, withSpring, withRepeat, Easing, interpolate,
} from 'react-native-reanimated';
import { colors } from '../constants/colors';
import Logo from '../assets/svg/Logo';

const { width: W, height: H } = Dimensions.get('window');

export default function SplashScreen({ navigation }) {
  // sun
  const sunY = useSharedValue(40);
  const sunO = useSharedValue(0);
  // mountains
  const peakBack = useSharedValue(80);
  const peakMid = useSharedValue(100);
  const peakFront = useSharedValue(120);
  // brand
  const logoScale = useSharedValue(0.6);
  const logoO = useSharedValue(0);
  const textO = useSharedValue(0);
  // glow
  const glow = useSharedValue(0);

  useEffect(() => {
    sunO.value = withDelay(200, withTiming(1, { duration: 700 }));
    sunY.value = withDelay(200, withTiming(0, { duration: 900, easing: Easing.bezier(0.22, 1, 0.36, 1) }));
    peakBack.value = withDelay(300, withTiming(0, { duration: 900, easing: Easing.bezier(0.22, 1, 0.36, 1) }));
    peakMid.value  = withDelay(400, withTiming(0, { duration: 900, easing: Easing.bezier(0.22, 1, 0.36, 1) }));
    peakFront.value = withDelay(500, withTiming(0, { duration: 950, easing: Easing.bezier(0.22, 1, 0.36, 1) }));
    logoO.value = withDelay(800, withTiming(1, { duration: 500 }));
    logoScale.value = withDelay(800, withSpring(1, { damping: 12, stiffness: 180 }));
    textO.value = withDelay(1100, withTiming(1, { duration: 500 }));
    glow.value = withRepeat(withTiming(1, { duration: 2200, easing: Easing.inOut(Easing.ease) }), -1, true);

    const check = async () => {
      const seen = await AsyncStorage.getItem('onboarding_seen');
      setTimeout(() => navigation.replace(seen ? 'Login' : 'Onboarding'), 2600);
    };
    check();
  }, []);

  const sunStyle = useAnimatedStyle(() => ({
    opacity: sunO.value,
    transform: [{ translateY: sunY.value }],
  }));
  const glowStyle = useAnimatedStyle(() => ({
    opacity: interpolate(glow.value, [0, 1], [0.35, 0.7]),
    transform: [{ scale: interpolate(glow.value, [0, 1], [1, 1.08]) }],
  }));
  const peakBackStyle = useAnimatedStyle(() => ({ transform: [{ translateY: peakBack.value }] }));
  const peakMidStyle  = useAnimatedStyle(() => ({ transform: [{ translateY: peakMid.value }] }));
  const peakFrontStyle= useAnimatedStyle(() => ({ transform: [{ translateY: peakFront.value }] }));
  const logoStyle = useAnimatedStyle(() => ({
    opacity: logoO.value,
    transform: [{ scale: logoScale.value }],
  }));
  const textStyle = useAnimatedStyle(() => ({ opacity: textO.value }));

  return (
    <View style={styles.container}>
      <StatusBar barStyle="light-content" />
      <LinearGradient
        colors={['#0F2C20', '#1B4332', '#2D6A4F']}
        style={StyleSheet.absoluteFill}
      />

      {/* Sun glow (pulsing) */}
      <Animated.View style={[styles.sunWrap, glowStyle]} pointerEvents="none">
        <View style={styles.sunGlow} />
      </Animated.View>

      {/* Sun — geometric circle */}
      <Animated.View style={[styles.sun, sunStyle]} pointerEvents="none">
        <View style={styles.sunCircle} />
      </Animated.View>

      {/* Mountain layers — geometric silhouettes */}
      <View style={styles.mountainStack} pointerEvents="none">
        <Animated.View style={[styles.layer, styles.layerBack, peakBackStyle]}>
          <MountainSilhouette width={W} color="rgba(255,255,255,0.18)" peaks={[
            { left: W * 0.0,  half: W * 0.27, h: 160 },
            { left: W * 0.25, half: W * 0.22, h: 200 },
            { left: W * 0.5,  half: W * 0.28, h: 170 },
            { left: W * 0.72, half: W * 0.24, h: 145 },
          ]} />
        </Animated.View>
        <Animated.View style={[styles.layer, styles.layerMid, peakMidStyle]}>
          <MountainSilhouette width={W} color="rgba(82,183,136,0.35)" peaks={[
            { left: -W * 0.05, half: W * 0.3,  h: 140 },
            { left: W * 0.28,  half: W * 0.26, h: 175 },
            { left: W * 0.6,   half: W * 0.32, h: 150 },
          ]} />
        </Animated.View>
        <Animated.View style={[styles.layer, styles.layerFront, peakFrontStyle]}>
          <MountainSilhouette width={W} color="rgba(15,44,32,0.72)" peaks={[
            { left: -W * 0.08, half: W * 0.32, h: 115 },
            { left: W * 0.22,  half: W * 0.28, h: 135 },
            { left: W * 0.55,  half: W * 0.35, h: 120 },
          ]} />
        </Animated.View>
      </View>

      {/* Brand */}
      <Animated.View style={[styles.brand, logoStyle]}>
        <Logo size={96} color="#FFFFFF" accent="#52B788" />
        <Text style={styles.logoText}>Treco</Text>
      </Animated.View>
      <Animated.View style={[styles.taglineWrap, textStyle]}>
        <Text style={styles.subtitle}>TREK  •  CONNECT</Text>
        <Text style={styles.tagline}>Find Your Trail Partners</Text>
      </Animated.View>

      {/* dots loader */}
      <Animated.View style={[styles.dots, textStyle]}>
        <Dot delay={0} />
        <Dot delay={150} />
        <Dot delay={240} />
      </Animated.View>
    </View>
  );
}

// Geometric mountain silhouette — renders multiple triangle peaks at the bottom edge.
function MountainSilhouette({ width, color, peaks = [] }) {
  return (
    <View style={{ width, height: 260, position: 'relative' }}>
      {peaks.map((p, i) => (
        <View
          key={i}
          style={{
            position: 'absolute',
            bottom: 0,
            left: p.left - p.half,
            width: 0,
            height: 0,
            borderStyle: 'solid',
            borderLeftWidth: p.half,
            borderRightWidth: p.half,
            borderBottomWidth: p.h,
            borderLeftColor: 'transparent',
            borderRightColor: 'transparent',
            borderBottomColor: color,
          }}
        />
      ))}
    </View>
  );
}

function Dot({ delay }) {
  const y = useSharedValue(0);
  useEffect(() => {
    y.value = withDelay(
      delay,
      withRepeat(withTiming(-6, { duration: 500, easing: Easing.inOut(Easing.quad) }), -1, true),
    );
  }, []);
  const s = useAnimatedStyle(() => ({ transform: [{ translateY: y.value }] }));
  return <Animated.View style={[styles.dot, s]} />;
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.primaryDark, overflow: 'hidden' },
  sunWrap: { position: 'absolute', top: H * 0.2, alignSelf: 'center' },
  sunGlow: {
    width: 260, height: 260, borderRadius: 130, backgroundColor: '#FFE29A', opacity: 0.35,
  },
  sun: { position: 'absolute', top: H * 0.22, alignSelf: 'center' },
  sunCircle: {
    width: 88, height: 88, borderRadius: 44,
    backgroundColor: '#FFE29A',
  },
  mountainStack: { position: 'absolute', left: 0, right: 0, bottom: 0, height: 280 },
  layer: { position: 'absolute', left: 0, right: 0, bottom: 0 },
  layerBack:  { bottom: 80 },
  layerMid:   { bottom: 40 },
  layerFront: { bottom: 0 },
  brand: {
    position: 'absolute',
    top: H * 0.38,
    alignSelf: 'center',
    alignItems: 'center',
  },
  logoText: {
    fontSize: 56, color: '#fff', fontWeight: '900', letterSpacing: -1, marginTop: 12,
  },
  taglineWrap: {
    position: 'absolute',
    top: H * 0.58,
    alignSelf: 'center',
    alignItems: 'center',
  },
  subtitle: { color: '#95D5B2', fontWeight: '700', letterSpacing: 4, fontSize: 12 },
  tagline: {
    marginTop: 8,
    color: 'rgba(255,255,255,0.8)',
    fontSize: 15,
    fontStyle: 'italic',
  },
  dots: {
    position: 'absolute',
    bottom: 60,
    alignSelf: 'center',
    flexDirection: 'row',
    gap: 8,
  },
  dot: { width: 8, height: 8, borderRadius: 4, backgroundColor: '#52B788' },
});
