import React, { useState } from 'react';
import {
  View, Text, StyleSheet, TouchableOpacity,
  StatusBar, SafeAreaView, Dimensions,
} from 'react-native';
import MapView, { Marker, Polyline } from 'react-native-maps';
import { colors } from '../../constants/colors';

const { width, height } = Dimensions.get('window');

// Sample trail coordinates for Annapurna Base Camp
const trailCoordinates = [
  { latitude: 28.5298, longitude: 83.8779 }, // Nayapul
  { latitude: 28.4977, longitude: 83.8309 }, // Ghandruk
  { latitude: 28.4624, longitude: 83.8094 }, // Chomrong
  { latitude: 28.4236, longitude: 83.7922 }, // Dovan
  { latitude: 28.3944, longitude: 83.8204 }, // Himalaya
  { latitude: 28.3699, longitude: 83.8216 }, // Annapurna Base Camp
];

const MapViewScreen = ({ route, navigation }) => {
  const trailName = route.params?.trailName || 'Trail Map';
  const [currentWaypoint] = useState(2); // Chomrong

  return (
    <SafeAreaView style={styles.safe}>
      <StatusBar barStyle="dark-content" backgroundColor={colors.white} />
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backBtn}>
          <Text style={styles.backText}>←</Text>
        </TouchableOpacity>
        <Text style={styles.title}>Trail Map</Text>
        <View style={{ width: 40 }} />
      </View>

      <View style={styles.searchBar}>
        <Text style={styles.searchText}>Search on map...</Text>
      </View>

      <MapView
        style={styles.map}
        initialRegion={{
          latitude: 28.4624,
          longitude: 83.8094,
          latitudeDelta: 0.3,
          longitudeDelta: 0.3,
        }}
        mapType="terrain"
      >
        <Polyline
          coordinates={trailCoordinates}
          strokeColor={colors.primary}
          strokeWidth={3}
          lineDashPattern={[10, 5]}
        />
        {trailCoordinates.map((coord, i) => (
          <Marker
            key={i}
            coordinate={coord}
            pinColor={i === 0 ? '#4CAF50' : i === trailCoordinates.length - 1 ? colors.primary : i === currentWaypoint ? colors.accent : 'transparent'}
          />
        ))}
      </MapView>

      {/* Map controls */}
      <View style={styles.controls}>
        <TouchableOpacity style={styles.controlBtn}>
          <Text style={styles.controlBtnText}>+</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.controlBtn}>
          <Text style={styles.controlBtnText}>−</Text>
        </TouchableOpacity>
        <TouchableOpacity style={[styles.controlBtn, { marginTop: 8 }]}>
          <Text style={styles.controlBtnText}>◎</Text>
        </TouchableOpacity>
      </View>

      {/* Bottom info card */}
      <View style={styles.infoCard}>
        <Text style={styles.infoTrailName}>{trailName}</Text>
        <Text style={styles.infoCurrentLoc}>
          Currently at: {trailCoordinates[currentWaypoint] ? 'Chomrong Village' : 'Starting Point'}
        </Text>
        <View style={styles.progressRow}>
          <Text style={styles.progressLabel}>Progress</Text>
          <Text style={styles.progressPct}>35%</Text>
        </View>
        <View style={styles.progressBar}>
          <View style={styles.progressFill} />
        </View>
        <View style={styles.statsRow}>
          <StatItem value="38km" label="Remaining" />
          <StatItem value="2,170m" label="Elevation" />
          <StatItem value="4 days" label="To Summit" />
        </View>
      </View>
    </SafeAreaView>
  );
};

const StatItem = ({ value, label }) => (
  <View style={styles.statItem}>
    <Text style={styles.statValue}>{value}</Text>
    <Text style={styles.statLabel}>{label}</Text>
  </View>
);

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: colors.background },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 16,
    backgroundColor: colors.white,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  backBtn: { padding: 4 },
  backText: { fontSize: 22, color: colors.textPrimary },
  title: { fontSize: 17, fontWeight: '700', color: colors.textPrimary },
  searchBar: {
    backgroundColor: colors.white,
    margin: 12,
    borderRadius: 12,
    padding: 12,
    elevation: 2,
    shadowColor: '#000',
    shadowOpacity: 0.08,
    shadowRadius: 4,
    shadowOffset: { width: 0, height: 2 },
  },
  searchText: { color: colors.textMuted, fontSize: 14 },
  map: {
    flex: 1,
    marginHorizontal: 12,
    borderRadius: 16,
    overflow: 'hidden',
  },
  controls: {
    position: 'absolute',
    right: 24,
    bottom: 220,
  },
  controlBtn: {
    width: 36, height: 36,
    backgroundColor: colors.white,
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
    elevation: 3,
    marginBottom: 4,
  },
  controlBtnText: { fontSize: 18, color: colors.textPrimary },
  infoCard: {
    backgroundColor: colors.white,
    margin: 12,
    borderRadius: 16,
    padding: 16,
    elevation: 4,
    shadowColor: '#000',
    shadowOpacity: 0.1,
    shadowRadius: 6,
    shadowOffset: { width: 0, height: -2 },
  },
  infoTrailName: { fontSize: 17, fontWeight: '700', color: colors.textPrimary, marginBottom: 4 },
  infoCurrentLoc: { fontSize: 13, color: colors.textSecondary, marginBottom: 12 },
  progressRow: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 6 },
  progressLabel: { fontSize: 12, color: colors.textMuted },
  progressPct: { fontSize: 12, color: colors.textPrimary, fontWeight: '600' },
  progressBar: { height: 6, backgroundColor: colors.border, borderRadius: 3, marginBottom: 12, overflow: 'hidden' },
  progressFill: { width: '35%', height: '100%', backgroundColor: colors.primary, borderRadius: 3 },
  statsRow: { flexDirection: 'row' },
  statItem: { flex: 1, alignItems: 'center' },
  statValue: { fontSize: 15, fontWeight: '700', color: colors.textPrimary },
  statLabel: { fontSize: 11, color: colors.textMuted, marginTop: 2 },
});

export default MapViewScreen;
