import React, { useEffect } from 'react';
import { View, Text, StyleSheet, ActivityIndicator } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { colors } from '../constants/colors';

export default function SplashScreen({ navigation }) {
  useEffect(() => {
    const checkOnboarding = async () => {
      const seen = await AsyncStorage.getItem('onboarding_seen');
      setTimeout(() => {
        if (seen) {
          navigation.replace('Login');
        } else {
          navigation.replace('Onboarding');
        }
      }, 2500);
    };
    checkOnboarding();
  }, []);

  return (
    <View style={styles.container}>
      {/* Mountain silhouettes */}
      <View style={styles.mountainsContainer}>
        <View style={[styles.mountain, styles.mountainBack]} />
        <View style={[styles.mountain, styles.mountainLeft]} />
        <View style={[styles.mountain, styles.mountainRight]} />
        <View style={[styles.mountain, styles.mountainCenter]} />
      </View>

      {/* Brand */}
      <View style={styles.brandContainer}>
        <Text style={styles.logo}>Treco</Text>
        <Text style={styles.subtitle}>TREK  •  CONNECT</Text>
        <Text style={styles.tagline}>Find Your Trail Partners</Text>
      </View>

      {/* Loader */}
      <View style={styles.loaderContainer}>
        <ActivityIndicator size="large" color={colors.accent} />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
  },
  mountainsContainer: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    height: 220,
  },
  mountain: {
    position: 'absolute',
    bottom: 0,
    width: 0,
    height: 0,
    borderStyle: 'solid',
    borderLeftColor: 'transparent',
    borderRightColor: 'transparent',
  },
  mountainBack: {
    borderLeftWidth: 160,
    borderRightWidth: 160,
    borderBottomWidth: 200,
    borderBottomColor: 'rgba(255,255,255,0.04)',
    left: 80,
  },
  mountainLeft: {
    borderLeftWidth: 120,
    borderRightWidth: 120,
    borderBottomWidth: 160,
    borderBottomColor: 'rgba(255,255,255,0.06)',
    left: -20,
  },
  mountainRight: {
    borderLeftWidth: 130,
    borderRightWidth: 130,
    borderBottomWidth: 180,
    borderBottomColor: 'rgba(255,255,255,0.05)',
    right: -10,
  },
  mountainCenter: {
    borderLeftWidth: 100,
    borderRightWidth: 100,
    borderBottomWidth: 140,
    borderBottomColor: 'rgba(255,255,255,0.08)',
    left: '50%',
    marginLeft: -100,
  },
  brandContainer: {
    alignItems: 'center',
    marginBottom: 60,
  },
  logo: {
    fontSize: 64,
    fontWeight: '900',
    color: colors.white,
    letterSpacing: 2,
  },
  subtitle: {
    fontSize: 13,
    fontWeight: '600',
    color: colors.accent,
    letterSpacing: 6,
    marginTop: 4,
  },
  tagline: {
    fontSize: 15,
    color: 'rgba(255,255,255,0.7)',
    marginTop: 12,
    fontStyle: 'italic',
  },
  loaderContainer: {
    position: 'absolute',
    bottom: 60,
  },
});
