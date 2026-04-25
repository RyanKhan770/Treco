import { HugeiconsIcon } from '@hugeicons/react-native';
import React, { useState, useRef } from 'react';
import {
  View, Text, StyleSheet, FlatList, Dimensions, StatusBar,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { ArrowRight01Icon } from '@hugeicons/core-free-icons';
import Animated, { FadeIn as RFadeIn, FadeOut } from 'react-native-reanimated';
import { LinearGradient } from 'expo-linear-gradient';
import { colors } from '../../constants/colors';
import { fontSize, fontWeight, spacing, radius } from '../../constants/theme';
import { HikerIllustration, GroupIllustration, MapIllustration } from '../../assets/svg/Illustrations';
import TopoPattern from '../../assets/svg/TopoPattern';
import { Button, Floating, PressableScale } from '../../components/ui';

const { width } = Dimensions.get('window');

const slides = [
  {
    id: '1',
    title: 'Discover Trails',
    description: 'Explore detailed maps across Nepal with difficulty, elevation, and waypoints.',
    Illustration: HikerIllustration,
  },
  {
    id: '2',
    title: 'Find Trek Partners',
    description: 'Connect with verified hikers who share your pace, pack, and Saturday plans.',
    Illustration: GroupIllustration,
  },
  {
    id: '3',
    title: 'Plan Together',
    description: 'Shared itineraries, budgets, gear checklists — one tap away, even offline.',
    Illustration: MapIllustration,
  },
];

const OnboardingScreen = ({ navigation }) => {
  const [idx, setIdx] = useState(0);
  const listRef = useRef(null);

  const finish = async () => {
    await AsyncStorage.setItem('onboarding_seen', '1');
    navigation.replace('Login');
  };

  const next = () => {
    if (idx < slides.length - 1) {
      listRef.current?.scrollToIndex({ index: idx + 1 });
      setIdx(idx + 1);
    } else {
      finish();
    }
  };

  const renderSlide = ({ item }) => {
    const { Illustration } = item;
    return (
      <View style={styles.slide}>
        <Animated.View entering={RFadeIn.duration(500)} style={styles.illoWrap}>
          <View style={styles.illoBg}>
            <TopoPattern width={360} height={360} color={colors.primary} opacity={0.08} />
          </View>
          <Floating amplitude={8} duration={3000}>
            <Illustration size={240} />
          </Floating>
        </Animated.View>
        <Animated.Text entering={RFadeIn.delay(200).duration(500)} style={styles.title}>
          {item.title}
        </Animated.Text>
        <Animated.Text entering={RFadeIn.delay(320).duration(500)} style={styles.desc}>
          {item.description}
        </Animated.Text>
      </View>
    );
  };

  return (
    <SafeAreaView style={styles.safe}>
      <StatusBar barStyle="dark-content" backgroundColor={colors.background} />
      <LinearGradient
        colors={[colors.background, colors.offWhite]}
        style={StyleSheet.absoluteFill}
      />

      {/* Skip */}
      <View style={styles.topBar}>
        <PressableScale onPress={finish} style={styles.skipBtn} hitSlop={8}>
          <Text style={styles.skipText}>Skip</Text>
        </PressableScale>
      </View>

      <FlatList
        ref={listRef}
        data={slides}
        renderItem={renderSlide}
        keyExtractor={(i) => i.id}
        horizontal
        pagingEnabled
        showsHorizontalScrollIndicator={false}
        onMomentumScrollEnd={(e) => setIdx(Math.round(e.nativeEvent.contentOffset.x / width))}
      />

      <View style={styles.footer}>
        <View style={styles.dots}>
          {slides.map((_, i) => (
            <Animated.View
              key={i}
              style={[
                styles.dot,
                i === idx && styles.dotActive,
              ]}
            />
          ))}
        </View>
        <Button
          label={idx === slides.length - 1 ? 'Get Started' : 'Next'}
          onPress={next}
          iconRight={ArrowRight01Icon}
          size="lg"
        />
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: colors.background },
  topBar: { flexDirection: 'row', justifyContent: 'flex-end', padding: spacing.md },
  skipBtn: { padding: 10 },
  skipText: { color: colors.textSecondary, fontWeight: fontWeight.semiBold, fontSize: fontSize.sm },
  slide: {
    width,
    alignItems: 'center',
    paddingHorizontal: spacing.xl,
    paddingTop: spacing.lg,
  },
  illoWrap: {
    width: 300,
    height: 300,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: spacing.xl,
  },
  illoBg: {
    position: 'absolute',
    width: 300,
    height: 300,
    alignItems: 'center',
    justifyContent: 'center',
    overflow: 'hidden',
    borderRadius: 150,
  },
  title: {
    fontSize: fontSize.xxxl,
    fontWeight: fontWeight.bold,
    color: colors.text,
    letterSpacing: -0.6,
    textAlign: 'center',
    marginBottom: spacing.md,
  },
  desc: {
    fontSize: fontSize.md,
    color: colors.textSecondary,
    textAlign: 'center',
    lineHeight: 24,
    paddingHorizontal: spacing.sm,
  },
  footer: {
    paddingHorizontal: spacing.xl,
    paddingBottom: spacing.xxl,
    gap: spacing.lg,
  },
  dots: { flexDirection: 'row', gap: 8, alignSelf: 'center' },
  dot: {
    width: 8, height: 8, borderRadius: 4, backgroundColor: colors.border,
  },
  dotActive: { width: 28, backgroundColor: colors.primary },
});

export default OnboardingScreen;
