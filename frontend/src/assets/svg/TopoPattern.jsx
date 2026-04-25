import React from 'react';
import { View } from 'react-native';

// No-op decorative overlay — kept for API compatibility with screens that still import it
export default function TopoPattern({ width, height }) {
  return <View style={{ width, height }} pointerEvents="none" />;
}
