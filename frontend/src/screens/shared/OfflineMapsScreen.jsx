import { HugeiconsIcon } from '@hugeicons/react-native';
import { useState, useEffect, useCallback } from 'react';
import {
  View, Text, StyleSheet, ScrollView, Alert, ActivityIndicator, StatusBar,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import Constants from 'expo-constants';
import MapboxMock from '../../utils/MapboxMock';

const isExpoGo = Constants.executionEnvironment === 'storeClient';
const MapboxGL = isExpoGo ? MapboxMock : require('@rnmapbox/maps').default;
import { ArrowLeft02Icon, MapsIcon, MapPinIcon, Delete02Icon, Download01Icon, HardDriveIcon } from '@hugeicons/core-free-icons';
import { colors } from '../../constants/colors';
import { fontSize, fontWeight, radius, shadows, spacing } from '../../constants/theme';
import { Card, PressableScale, FadeIn, SlideUp } from '../../components/ui';
import ScreenHeader from '../../components/ui/ScreenHeader';
import { KATHMANDU_TRAILS } from '../../constants/kathmandu_trails';

// ── Trail region definitions for offline packs ──
// Each trail gets a bounding box computed from its coordinates + padding
function computeBounds(coordinates, padding = 0.02) {
  let minLng = Infinity, maxLng = -Infinity;
  let minLat = Infinity, maxLat = -Infinity;
  for (const [lng, lat] of coordinates) {
    if (lng < minLng) minLng = lng;
    if (lng > maxLng) maxLng = lng;
    if (lat < minLat) minLat = lat;
    if (lat > maxLat) maxLat = lat;
  }
  return [
    [minLng - padding, minLat - padding], // SW corner
    [maxLng + padding, maxLat + padding], // NE corner
  ];
}

// Build available map packs from trail data
const TRAIL_PACKS = KATHMANDU_TRAILS.map((trail) => ({
  id: trail.id,
  name: trail.name,
  region: trail.region,
  bounds: computeBounds(trail.coordinates),
  styleURL: 'mapbox://styles/mapbox/outdoors-v12',
  minZoom: 10,
  maxZoom: 16,
}));

export default function OfflineMapsScreen({ navigation }) {
  const [downloaded, setDownloaded] = useState([]);
  const [downloading, setDownloading] = useState(null); // pack id being downloaded
  const [progress, setProgress] = useState(0);           // 0-100 download progress
  const [loading, setLoading] = useState(true);
  const [storageUsed, setStorageUsed] = useState(0);     // MB

  // ── Load existing packs on mount ──
  useEffect(() => {
    loadExistingPacks();
  }, []);

  const loadExistingPacks = async () => {
    try {
      setLoading(true);
      const packs = await MapboxGL.offlineManager.getPacks();
      const existing = [];
      let totalBytes = 0;

      if (packs && packs.length > 0) {
        for (const pack of packs) {
          const packName = pack.name || pack._metadata?.name || 'Unknown';
          const completedSize = pack.pack?.completedResourceSize || 0;
          totalBytes += completedSize;
          existing.push({
            id: packName,
            name: packName.replace(/-/g, ' ').replace(/\b\w/g, (c) => c.toUpperCase()),
            size: `${(completedSize / (1024 * 1024)).toFixed(1)} MB`,
            sizeBytes: completedSize,
            updated: new Date().toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }),
          });
        }
      }

      setDownloaded(existing);
      setStorageUsed(parseFloat((totalBytes / (1024 * 1024)).toFixed(1)));
    } catch (err) {
      console.warn('Failed to load offline packs:', err);
    } finally {
      setLoading(false);
    }
  };

  // ── Download a trail pack ──
  const handleDownload = useCallback(async (pack) => {
    if (downloading) return;

    setDownloading(pack.id);
    setProgress(0);

    try {
      await MapboxGL.offlineManager.createPack(
        {
          name: pack.id,
          styleURL: pack.styleURL,
          minZoom: pack.minZoom,
          maxZoom: pack.maxZoom,
          bounds: pack.bounds,
        },
        (_region, status) => {
          // Progress callback
          const pct = status.percentage != null
            ? Math.round(status.percentage)
            : 0;
          setProgress(pct);
        },
        (_region, err) => {
          // Error callback
          console.warn('Offline pack error:', err);
          Alert.alert('Download Error', `Failed to download ${pack.name} map.`);
          setDownloading(null);
          setProgress(0);
        },
      );

      // Download started successfully — when complete, refresh the list
      // The progress callback fires until 100%, then we refresh
      // Use a short interval to detect completion
      const checkComplete = setInterval(() => {
        if (progress >= 100 || !downloading) {
          clearInterval(checkComplete);
        }
      }, 500);

      // Wait a moment and reload packs
      setTimeout(async () => {
        await loadExistingPacks();
        setDownloading(null);
        setProgress(0);
        Alert.alert('Downloaded', `${pack.name} map saved for offline use.`);
      }, 3000);
    } catch (err) {
      console.warn('createPack failed:', err);
      Alert.alert('Error', `Could not start download for ${pack.name}.`);
      setDownloading(null);
      setProgress(0);
    }
  }, [downloading, progress]);

  // ── Delete a downloaded pack ──
  const handleDelete = useCallback((packId, displayName) => {
    Alert.alert(
      'Delete Map',
      `Remove offline map for "${displayName}"?`,
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: async () => {
            try {
              await MapboxGL.offlineManager.deletePack(packId);
              await loadExistingPacks();
            } catch (err) {
              console.warn('Delete pack failed:', err);
              Alert.alert('Error', 'Could not delete the offline map.');
            }
          },
        },
      ],
    );
  }, []);

  // ── Determine which packs are available (not yet downloaded) ──
  const downloadedIds = downloaded.map((d) => d.id);
  const available = TRAIL_PACKS.filter((p) => !downloadedIds.includes(p.id));

  const usedPct = Math.min((storageUsed / 1024) * 100, 100);

  return (
    <SafeAreaView style={styles.safe}>
      <StatusBar barStyle="dark-content" backgroundColor={colors.background} />
      <ScreenHeader
        title="Offline Maps"
        subtitle="Maps"
        onBack={() => navigation.goBack()}
      />

      {loading ? (
        <View style={styles.loadingWrap}>
          <ActivityIndicator size="large" color={colors.primary} />
          <Text style={styles.loadingText}>Loading offline maps...</Text>
        </View>
      ) : (
        <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{ padding: spacing.md, paddingBottom: spacing.xxl }}>
          <SlideUp delay={100}>
            <Card style={styles.storageCard} elevation="md">
              <View style={styles.storageHead}>
                <View style={styles.storageIcon}>
                  <HugeiconsIcon icon={HardDriveIcon} size={18} color={colors.primary} strokeWidth={2.25} />
                </View>
                <View style={{ flex: 1 }}>
                  <Text style={styles.storageLabel}>Storage used</Text>
                  <Text style={styles.storageAmount}>{storageUsed} MB <Text style={styles.storageOf}>of 1 GB</Text></Text>
                </View>
              </View>
              <View style={styles.progressBarBg}>
                <View style={[styles.progressBarFill, { width: `${usedPct}%` }]} />
              </View>
            </Card>
          </SlideUp>

          <Text style={styles.sectionTitle}>Downloaded</Text>
          {downloaded.length === 0 ? (
            <Card>
              <Text style={styles.emptyText}>No offline maps yet. Download a trail pack below to get started.</Text>
            </Card>
          ) : (
            <Card padding={0} style={{ overflow: 'hidden' }}>
              {downloaded.map((map, idx) => (
                <View
                  key={map.id}
                  style={[styles.mapRow, idx < downloaded.length - 1 && styles.rowDivider]}
                >
                  <View style={styles.mapThumb}>
                    <HugeiconsIcon icon={MapsIcon} size={18} color={colors.primary} strokeWidth={2.25} />
                  </View>
                  <View style={styles.mapInfo}>
                    <Text style={styles.mapName}>{map.name}</Text>
                    <Text style={styles.mapMeta}>{map.size} · Updated {map.updated}</Text>
                  </View>
                  <PressableScale
                    style={styles.deleteBtn}
                    onPress={() => handleDelete(map.id, map.name)}
                    scaleTo={0.85}
                  >
                    <HugeiconsIcon icon={Delete02Icon} size={16} color={colors.danger} strokeWidth={2.25} />
                  </PressableScale>
                </View>
              ))}
            </Card>
          )}

          {available.length > 0 && (
            <>
              <Text style={styles.sectionTitle}>Available to download</Text>
              <Card padding={0} style={{ overflow: 'hidden' }}>
                {available.map((pack, idx) => (
                  <View
                    key={pack.id}
                    style={[styles.mapRow, idx < available.length - 1 && styles.rowDivider]}
                  >
                    <View style={[styles.mapThumb, styles.mapThumbGray]}>
                      <HugeiconsIcon icon={MapPinIcon} size={18} color={colors.textSecondary} strokeWidth={2.25} />
                    </View>
                    <View style={styles.mapInfo}>
                      <Text style={styles.mapName}>{pack.name}</Text>
                      <Text style={styles.mapMeta}>{pack.region}</Text>
                    </View>
                    {downloading === pack.id ? (
                      <View style={styles.progressWrap}>
                        <ActivityIndicator size="small" color={colors.primary} />
                        <Text style={styles.progressText}>{progress}%</Text>
                      </View>
                    ) : (
                      <PressableScale
                        style={styles.downloadBtn}
                        onPress={() => handleDownload(pack)}
                        disabled={!!downloading}
                        scaleTo={0.92}
                      >
                        <HugeiconsIcon icon={Download01Icon} size={14} color="#fff" strokeWidth={2.5} />
                        <Text style={styles.downloadBtnText}>Get</Text>
                      </PressableScale>
                    )}
                  </View>
                ))}
              </Card>
            </>
          )}
        </ScrollView>
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: colors.background },





  loadingWrap: { flex: 1, alignItems: 'center', justifyContent: 'center' },
  loadingText: { marginTop: 12, fontSize: fontSize.sm, color: colors.textSecondary },

  storageCard: { marginBottom: spacing.md },
  storageHead: { flexDirection: 'row', alignItems: 'center', gap: spacing.sm, marginBottom: spacing.sm },
  storageIcon: {
    width: 40, height: 40, borderRadius: 20,
    backgroundColor: colors.primaryPale,
    alignItems: 'center', justifyContent: 'center',
  },
  storageLabel: { fontSize: fontSize.xs, color: colors.textLight, fontWeight: fontWeight.semiBold, textTransform: 'uppercase', letterSpacing: 1 },
  storageAmount: { fontSize: fontSize.xxl, fontWeight: fontWeight.bold, color: colors.primary, letterSpacing: -0.5 },
  storageOf: { fontSize: fontSize.sm, color: colors.textLight, fontWeight: fontWeight.medium },
  progressBarBg: { height: 8, backgroundColor: colors.surface, borderRadius: 4, overflow: 'hidden' },
  progressBarFill: { height: '100%', backgroundColor: colors.primary, borderRadius: 4 },

  sectionTitle: {
    fontSize: fontSize.xs, fontWeight: fontWeight.bold,
    color: colors.primaryLight, letterSpacing: 2, textTransform: 'uppercase',
    marginBottom: spacing.sm, marginTop: spacing.md,
  },
  emptyText: { textAlign: 'center', color: colors.textLight, fontSize: fontSize.sm, paddingVertical: spacing.md },

  mapRow: { flexDirection: 'row', alignItems: 'center', gap: spacing.sm, padding: spacing.md },
  rowDivider: { borderBottomWidth: 1, borderBottomColor: colors.border },
  mapThumb: {
    width: 44, height: 44, borderRadius: radius.md,
    backgroundColor: colors.primaryPale,
    alignItems: 'center', justifyContent: 'center',
  },
  mapThumbGray: { backgroundColor: colors.surface },
  mapInfo: { flex: 1 },
  mapName: { fontSize: fontSize.md, fontWeight: fontWeight.semiBold, color: colors.text },
  mapMeta: { fontSize: fontSize.xs, color: colors.textSecondary, marginTop: 2 },

  deleteBtn: {
    width: 32, height: 32, borderRadius: 16,
    backgroundColor: colors.danger + '15',
    alignItems: 'center', justifyContent: 'center',
  },

  downloadBtn: {
    flexDirection: 'row', alignItems: 'center', gap: 6,
    backgroundColor: colors.primary,
    paddingHorizontal: 14, paddingVertical: 8,
    borderRadius: radius.round,
    ...shadows.xs,
  },
  downloadBtnText: { fontSize: fontSize.xs, fontWeight: fontWeight.bold, color: '#fff', letterSpacing: 0.5 },

  progressWrap: { flexDirection: 'row', alignItems: 'center', gap: 6 },
  progressText: { fontSize: fontSize.xs, fontWeight: fontWeight.semiBold, color: colors.primary },
});
