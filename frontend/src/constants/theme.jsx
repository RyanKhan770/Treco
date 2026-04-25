import { colors } from './colors';
import { Platform } from 'react-native';

export const spacing = {
  xs: 4, sm: 8, md: 16, lg: 24, xl: 32, xxl: 48, xxxl: 64,
};

export const radius = {
  xs: 6, sm: 10, md: 16, lg: 20, xl: 24, xxl: 32, round: 9999,
};

export const fontSize = {
  xs: 11, sm: 13, md: 15, lg: 17, xl: 20, xxl: 24, xxxl: 30, display: 40, hero: 56,
};

export const fontWeight = {
  regular: '400', medium: '500', semiBold: '600', bold: '700', heavy: '800', black: '900',
};

export const shadows = {
  none: { shadowColor: 'transparent', shadowOpacity: 0, elevation: 0 },
  xs: Platform.select({
    ios: { shadowColor: '#000000', shadowOffset: { width: 0, height: 1 }, shadowOpacity: 0.03, shadowRadius: 2 },
    android: { elevation: 1 },
  }),
  sm: Platform.select({
    ios: { shadowColor: '#000000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.05, shadowRadius: 4 },
    android: { elevation: 2 },
  }),
  md: Platform.select({
    ios: { shadowColor: '#000000', shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.07, shadowRadius: 10 },
    android: { elevation: 4 },
  }),
  lg: Platform.select({
    ios: { shadowColor: '#000000', shadowOffset: { width: 0, height: 8 }, shadowOpacity: 0.1, shadowRadius: 18 },
    android: { elevation: 8 },
  }),
  xl: Platform.select({
    ios: { shadowColor: '#000000', shadowOffset: { width: 0, height: 14 }, shadowOpacity: 0.14, shadowRadius: 28 },
    android: { elevation: 14 },
  }),
};

export const motion = {
  duration: { instant: 120, fast: 200, base: 300, slow: 450, lazy: 650 },
  spring: {
    soft:   { damping: 18, mass: 1, stiffness: 180 },
    bouncy: { damping: 12, mass: 1, stiffness: 220 },
    snappy: { damping: 22, mass: 0.9, stiffness: 260 },
  },
};

export const typography = {
  hero:       { fontSize: fontSize.hero,    fontWeight: fontWeight.black,    color: colors.text, letterSpacing: -1.5 },
  display:    { fontSize: fontSize.display, fontWeight: fontWeight.heavy,    color: colors.text, letterSpacing: -0.8 },
  h1:         { fontSize: fontSize.xxxl,    fontWeight: fontWeight.bold,     color: colors.text, letterSpacing: -0.5 },
  h2:         { fontSize: fontSize.xxl,     fontWeight: fontWeight.bold,     color: colors.text, letterSpacing: -0.3 },
  h3:         { fontSize: fontSize.xl,      fontWeight: fontWeight.semiBold, color: colors.text },
  title:      { fontSize: fontSize.lg,      fontWeight: fontWeight.semiBold, color: colors.text },
  body:       { fontSize: fontSize.md,      fontWeight: fontWeight.regular,  color: colors.text, lineHeight: 22 },
  bodyStrong: { fontSize: fontSize.md,      fontWeight: fontWeight.semiBold, color: colors.text, lineHeight: 22 },
  caption:    { fontSize: fontSize.sm,      fontWeight: fontWeight.medium,   color: colors.textSecondary },
  tiny:       { fontSize: fontSize.xs,      fontWeight: fontWeight.medium,   color: colors.textLight, letterSpacing: 0.5 },
  overline:   { fontSize: fontSize.xs,      fontWeight: fontWeight.bold,     color: colors.primaryLight, letterSpacing: 2, textTransform: 'uppercase' },
};

export const theme = {
  colors, spacing, radius,
  borderRadius: radius, // backward compat
  fontSize, fontWeight, shadows, motion, typography,
};

export default theme;
