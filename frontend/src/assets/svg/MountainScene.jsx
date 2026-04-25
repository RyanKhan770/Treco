import React from 'react';
import { View, Image, StyleSheet } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';

// Real mountain photos (Unsplash — royalty-free), with a matching gradient fallback
// underneath while the remote image loads.
const VARIANTS = {
  sunrise: {
    uri: 'https://images.unsplash.com/photo-1464822759023-fed622ff2c3b?auto=format&fit=crop&w=1200&q=70',
    colors: ['#FFB88C', '#DE6262'],
  },
  alpine: {
    uri: 'https://images.unsplash.com/photo-1454496522488-7a8e488e8606?auto=format&fit=crop&w=1200&q=70',
    colors: ['#2193b0', '#6dd5ed'],
  },
  dusk: {
    uri: 'https://images.unsplash.com/photo-1519681393784-d120267933ba?auto=format&fit=crop&w=1200&q=70',
    colors: ['#4B6CB7', '#182848'],
  },
  mist: {
    uri: 'https://images.unsplash.com/photo-1486870591958-9b9d0d1dda99?auto=format&fit=crop&w=1200&q=70',
    colors: ['#BDC3C7', '#2C3E50'],
  },
};

export default function MountainScene({ width = 400, height = 200, variant = 'alpine', uri, overlay = true }) {
  const v = VARIANTS[variant] || VARIANTS.alpine;
  const imageUri = uri || v.uri;
  return (
    <View style={{ width, height, overflow: 'hidden', backgroundColor: v.colors[1] }}>
      <LinearGradient colors={v.colors} style={StyleSheet.absoluteFill} />
      <Image
        source={{ uri: imageUri }}
        style={StyleSheet.absoluteFill}
        resizeMode="cover"
      />
      {overlay && (
        <LinearGradient
          colors={['rgba(0,0,0,0)', 'rgba(0,0,0,0.35)']}
          style={StyleSheet.absoluteFill}
        />
      )}
    </View>
  );
}
