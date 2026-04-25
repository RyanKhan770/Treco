import React, { useState, useEffect, useRef } from 'react';
import { View, Text, StyleSheet, Alert, StatusBar, Dimensions } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import * as Location from 'expo-location';
import MapboxGL from '@rnmapbox/maps';
import { HugeiconsIcon } from '@hugeicons/react-native';
import { PlayIcon, StopIcon, PauseIcon, ArrowLeft02Icon, MapPinIcon } from '@hugeicons/core-free-icons';
import { colors } from '../../constants/colors';
import { fontSize, fontWeight, radius, spacing, shadows } from '../../constants/theme';
import { Button, Card, PressableScale, ScreenHeader } from '../../components/ui';
import api from '../../services/api';

MapboxGL.setAccessToken(process.env.EXPO_PUBLIC_MAPBOX_TOKEN || '');

const { width: W } = Dimensions.get('window');

function formatTime(seconds) {
  const h = Math.floor(seconds / 3600);
  const m = Math.floor((seconds % 3600) / 60);
  const s = seconds % 60;
  if (h > 0) return `${h}h ${m}m ${s}s`;
  return `${m}m ${s < 10 ? '0' : ''}${s}s`;
}

// Haversine formula
function calculateDistance(lat1, lon1, lat2, lon2) {
  const R = 6371; // km
  const dLat = (lat2 - lat1) * Math.PI / 180;
  const dLon = (lon2 - lon1) * Math.PI / 180;
  const a = Math.sin(dLat/2) * Math.sin(dLat/2) +
            Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) *
            Math.sin(dLon/2) * Math.sin(dLon/2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
  return R * c;
}

const RecordTrekScreen = ({ navigation }) => {
  const [hasPermission, setHasPermission] = useState(null);
  const [isTracking, setIsTracking] = useState(false);
  const [coordinates, setCoordinates] = useState([]);
  const [distanceKm, setDistanceKm] = useState(0);
  const [durationSecs, setDurationSecs] = useState(0);
  const [saving, setSaving] = useState(false);
  const [currentLoc, setCurrentLoc] = useState(null);

  const locationSubscription = useRef(null);
  const timerRef = useRef(null);
  const cameraRef = useRef(null);

  useEffect(() => {
    (async () => {
      const { status } = await Location.requestForegroundPermissionsAsync();
      setHasPermission(status === 'granted');
      if (status === 'granted') {
        const loc = await Location.getCurrentPositionAsync({});
        setCurrentLoc([loc.coords.longitude, loc.coords.latitude]);
      }
    })();
    return stopTracking;
  }, []);

  const startTracking = async () => {
    if (!hasPermission) return Alert.alert('Permission denied');
    setIsTracking(true);
    
    // Start timer
    timerRef.current = setInterval(() => {
      setDurationSecs(s => s + 1);
    }, 1000);

    // Watch position
    locationSubscription.current = await Location.watchPositionAsync(
      {
        accuracy: Location.Accuracy.High,
        timeInterval: 5000,
        distanceInterval: 10, // meters
      },
      (loc) => {
        const newCoord = [loc.coords.longitude, loc.coords.latitude];
        setCurrentLoc(newCoord);
        
        setCoordinates(prev => {
          if (prev.length > 0) {
            const last = prev[prev.length - 1];
            const dist = calculateDistance(last[1], last[0], newCoord[1], newCoord[0]);
            setDistanceKm(d => d + dist);
          }
          return [...prev, newCoord];
        });
        
        cameraRef.current?.setCamera({
          centerCoordinate: newCoord,
          zoomLevel: 15,
          animationDuration: 1000,
        });
      }
    );
  };

  const stopTracking = () => {
    if (timerRef.current) clearInterval(timerRef.current);
    if (locationSubscription.current) locationSubscription.current.remove();
    setIsTracking(false);
  };

  const finishTrek = async () => {
    stopTracking();
    if (coordinates.length < 2) {
      Alert.alert('Too short', 'You need to move around more to save a trek!');
      return;
    }
    Alert.prompt('Save Trek', 'Give your trek a name:', async (name) => {
      try {
        setSaving(true);
        await api.post('/tracks', {
          name: name || 'Afternoon Trek',
          coordinates,
          distance_km: distanceKm,
          duration_minutes: Math.round(durationSecs / 60)
        });
        Alert.alert('Success', 'Trek saved to your profile!', [
          { text: 'OK', onPress: () => navigation.goBack() }
        ]);
      } catch (err) {
        Alert.alert('Error', 'Could not save trek.');
      } finally {
        setSaving(false);
      }
    });
  };

  const geojson = {
    type: 'FeatureCollection',
    features: [
      {
        type: 'Feature',
        geometry: {
          type: 'LineString',
          coordinates: coordinates,
        },
      },
    ],
  };

  if (hasPermission === false) {
    return (
      <SafeAreaView style={styles.safe}>
        <ScreenHeader title="Record Trek" onBack={() => navigation.goBack()} />
        <View style={styles.center}>
          <Text style={styles.errorText}>Location permission is required to record a trek.</Text>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.safe} edges={['top', 'bottom']}>
      <StatusBar barStyle="dark-content" />
      <View style={styles.header}>
        <PressableScale onPress={() => { stopTracking(); navigation.goBack(); }} style={styles.backBtn} scaleTo={0.9}>
          <HugeiconsIcon icon={ArrowLeft02Icon} size={24} color={colors.text} strokeWidth={2.25} />
        </PressableScale>
        <Text style={styles.headerTitle}>Live Tracking</Text>
        <View style={{ width: 40 }} />
      </View>

      <View style={styles.mapContainer}>
        <MapboxGL.MapView style={styles.map} styleURL={MapboxGL.StyleURL.Outdoors}>
          <MapboxGL.Camera
            ref={cameraRef}
            zoomLevel={14}
            centerCoordinate={currentLoc || [85.3240, 27.7172]} // Default Kathmandu
            animationMode="flyTo"
            animationDuration={2000}
          />
          <MapboxGL.UserLocation visible={true} showsUserHeadingIndicator={true} />
          
          {coordinates.length > 1 && (
            <MapboxGL.ShapeSource id="routeSource" shape={geojson}>
              <MapboxGL.LineLayer
                id="routeLayer"
                style={{
                  lineColor: colors.primary,
                  lineWidth: 6,
                  lineCap: 'round',
                  lineJoin: 'round',
                }}
              />
            </MapboxGL.ShapeSource>
          )}
        </MapboxGL.MapView>
      </View>

      <View style={styles.bottomPanel}>
        <View style={styles.statsRow}>
          <View style={styles.statBox}>
            <Text style={styles.statValue}>{distanceKm.toFixed(2)}</Text>
            <Text style={styles.statLabel}>KM</Text>
          </View>
          <View style={styles.divider} />
          <View style={styles.statBox}>
            <Text style={styles.statValue}>{formatTime(durationSecs)}</Text>
            <Text style={styles.statLabel}>DURATION</Text>
          </View>
        </View>

        <View style={styles.controls}>
          {isTracking ? (
            <>
              <PressableScale style={[styles.controlBtn, { backgroundColor: colors.warning }]} onPress={stopTracking}>
                <HugeiconsIcon icon={PauseIcon} size={28} color="#fff" fill="#fff" />
              </PressableScale>
              <PressableScale style={[styles.controlBtn, { backgroundColor: colors.primary }]} onPress={finishTrek}>
                <HugeiconsIcon icon={StopIcon} size={24} color="#fff" fill="#fff" />
              </PressableScale>
            </>
          ) : (
            <PressableScale style={[styles.controlBtn, styles.startBtn]} onPress={startTracking}>
              <HugeiconsIcon icon={PlayIcon} size={32} color="#fff" fill="#fff" style={{ marginLeft: 4 }} />
            </PressableScale>
          )}
        </View>
        
        {saving && <Text style={styles.savingText}>Saving trek...</Text>}
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: colors.background },
  header: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
    paddingHorizontal: spacing.md, paddingVertical: spacing.sm,
    backgroundColor: colors.background,
    zIndex: 10,
    ...shadows.sm,
  },
  backBtn: { padding: spacing.xs },
  headerTitle: { fontSize: fontSize.lg, fontWeight: fontWeight.bold, color: colors.text },
  center: { flex: 1, alignItems: 'center', justifyContent: 'center', padding: spacing.xl },
  errorText: { fontSize: fontSize.md, color: colors.textSecondary, textAlign: 'center' },
  
  mapContainer: { flex: 1 },
  map: { flex: 1 },

  bottomPanel: {
    backgroundColor: colors.card,
    borderTopLeftRadius: radius.xxl,
    borderTopRightRadius: radius.xxl,
    padding: spacing.xl,
    paddingBottom: spacing.xxl,
    ...shadows.lg,
    marginTop: -20,
  },
  statsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-evenly',
    marginBottom: spacing.xl,
  },
  statBox: { alignItems: 'center' },
  statValue: { fontSize: 32, fontWeight: fontWeight.black, color: colors.text, letterSpacing: -1 },
  statLabel: { fontSize: fontSize.xs, fontWeight: fontWeight.bold, color: colors.textLight, letterSpacing: 2, marginTop: 4 },
  divider: { width: 1, height: 40, backgroundColor: colors.border },

  controls: {
    flexDirection: 'row',
    justifyContent: 'center',
    gap: spacing.xl,
  },
  controlBtn: {
    width: 64, height: 64, borderRadius: 32,
    alignItems: 'center', justifyContent: 'center',
    ...shadows.md,
  },
  startBtn: {
    width: 80, height: 80, borderRadius: 40,
    backgroundColor: '#22C55E', // Green
  },
  savingText: {
    textAlign: 'center', color: colors.primary, marginTop: spacing.md, fontWeight: fontWeight.semiBold
  }
});

export default RecordTrekScreen;
