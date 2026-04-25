import React from 'react';
import { View, Text } from 'react-native';

// Emoji-based logo — same API as the old SVG logo
export default function Logo({ size = 80, color = '#FFFFFF', accent = '#52B788' }) {
  return (
    <View
      style={{
        width: size,
        height: size,
        borderRadius: size / 2,
        backgroundColor: accent,
        alignItems: 'center',
        justifyContent: 'center',
      }}
    >
      <Text style={{ fontSize: size * 0.55 }}>🏔️</Text>
    </View>
  );
}
