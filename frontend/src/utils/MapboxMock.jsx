/**
 * Mapbox mock for Expo Go development.
 * Renders a placeholder so all non-map screens work normally.
 * The real @rnmapbox/maps is used in production dev builds.
 */
import { View, Text, StyleSheet } from 'react-native';

const Placeholder = ({ style, children }) => (
  <View style={[styles.placeholder, style]}>
    <Text style={styles.icon}>🗺️</Text>
    <Text style={styles.text}>Map unavailable in Expo Go</Text>
    <Text style={styles.sub}>Use the dev build to see the map</Text>
    {children}
  </View>
);

const MapboxMock = {
  MapView: Placeholder,
  Camera: () => null,
  ShapeSource: () => null,
  LineLayer: () => null,
  MarkerView: ({ children }) => children || null,
  offlineManager: {
    getPacks: async () => [],
    createPack: async () => {},
    deletePack: async () => {},
  },
};

const styles = StyleSheet.create({
  placeholder: {
    backgroundColor: '#e8f0e8',
    alignItems: 'center',
    justifyContent: 'center',
  },
  icon: { fontSize: 48, marginBottom: 12 },
  text: { fontSize: 16, fontWeight: '600', color: '#2d5a27' },
  sub: { fontSize: 12, color: '#666', marginTop: 4 },
});

export default MapboxMock;
