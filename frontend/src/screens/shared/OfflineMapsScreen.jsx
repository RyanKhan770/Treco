import React, { useState } from 'react';
import {
  View, Text, StyleSheet, TouchableOpacity,
  ScrollView, Alert,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { colors } from '../../constants/colors';

const DOWNLOADED = [
  { id: 1, name: 'Annapurna Base Camp', size: '48.2 MB', updated: 'Mar 10, 2024' },
  { id: 2, name: 'Poon Hill Trek', size: '22.7 MB', updated: 'Feb 28, 2024' },
];

const AVAILABLE = [
  { id: 3, name: 'Everest Base Camp', size: '63.5 MB' },
  { id: 4, name: 'Langtang Valley', size: '35.1 MB' },
  { id: 5, name: 'Gokyo Lakes', size: '41.8 MB' },
  { id: 6, name: 'Mardi Himal', size: '28.4 MB' },
];

const USED_MB = 70.9;
const TOTAL_MB = 1024;

export default function OfflineMapsScreen({ navigation }) {
  const [downloaded, setDownloaded] = useState(DOWNLOADED);
  const [downloading, setDownloading] = useState(null);

  const handleDelete = (id, name) => {
    Alert.alert(
      'Delete Map',
      `Remove offline map for "${name}"?`,
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete', style: 'destructive',
          onPress: () => setDownloaded(prev => prev.filter(d => d.id !== id)),
        },
      ]
    );
  };

  const handleDownload = (item) => {
    setDownloading(item.id);
    setTimeout(() => {
      setDownloading(null);
      setDownloaded(prev => [
        ...prev,
        { id: item.id, name: item.name, size: item.size, updated: 'Just now' },
      ]);
      Alert.alert('Downloaded', `${item.name} map saved for offline use.`);
    }, 2000);
  };

  const usedPct = (USED_MB / TOTAL_MB) * 100;

  return (
    <SafeAreaView style={styles.safe}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <Text style={styles.backArrow}>←</Text>
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Offline Maps</Text>
        <View style={{ width: 40 }} />
      </View>

      <ScrollView showsVerticalScrollIndicator={false} style={styles.scroll}>
        {/* Storage card */}
        <View style={styles.storageCard}>
          <Text style={styles.storageLabel}>Storage Used</Text>
          <Text style={styles.storageAmount}>{USED_MB} MB</Text>
          <View style={styles.progressBar}>
            <View style={[styles.progressFill, { width: `${usedPct}%` }]} />
          </View>
          <Text style={styles.storageDetail}>{USED_MB} MB of 1 GB used</Text>
        </View>

        {/* Downloaded maps */}
        <Text style={styles.sectionTitle}>Downloaded Maps</Text>
        <View style={styles.card}>
          {downloaded.length === 0 ? (
            <Text style={styles.emptyText}>No offline maps downloaded yet.</Text>
          ) : (
            downloaded.map((map, idx) => (
              <View
                key={map.id}
                style={[styles.mapRow, idx < downloaded.length - 1 && styles.rowDivider]}
              >
                <View style={styles.mapThumb} />
                <View style={styles.mapInfo}>
                  <Text style={styles.mapName}>{map.name}</Text>
                  <Text style={styles.mapMeta}>{map.size}  •  Updated {map.updated}</Text>
                </View>
                <TouchableOpacity
                  style={styles.deleteBtn}
                  onPress={() => handleDelete(map.id, map.name)}
                >
                  <Text style={styles.deleteIcon}>×</Text>
                </TouchableOpacity>
              </View>
            ))
          )}
        </View>

        {/* Available to download */}
        <Text style={styles.sectionTitle}>Available to Download</Text>
        <View style={styles.card}>
          {AVAILABLE.filter(a => !downloaded.find(d => d.id === a.id)).map((map, idx, arr) => (
            <View
              key={map.id}
              style={[styles.mapRow, idx < arr.length - 1 && styles.rowDivider]}
            >
              <View style={[styles.mapThumb, styles.mapThumbGray]} />
              <View style={styles.mapInfo}>
                <Text style={styles.mapName}>{map.name}</Text>
                <Text style={styles.mapMeta}>{map.size}</Text>
              </View>
              <TouchableOpacity
                style={[
                  styles.downloadBtn,
                  downloading === map.id && styles.downloadBtnDisabled,
                ]}
                onPress={() => handleDownload(map)}
                disabled={downloading === map.id}
                activeOpacity={0.8}
              >
                <Text style={styles.downloadBtnText}>
                  {downloading === map.id ? '...' : 'Download'}
                </Text>
              </TouchableOpacity>
            </View>
          ))}
        </View>

        <View style={{ height: 40 }} />
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: colors.background },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 14,
    backgroundColor: colors.white,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  backArrow: { fontSize: 22, color: colors.text, padding: 4 },
  headerTitle: { fontSize: 17, fontWeight: '700', color: colors.text },
  scroll: { flex: 1 },
  storageCard: {
    backgroundColor: colors.white,
    margin: 16,
    borderRadius: 16,
    padding: 20,
    shadowColor: '#000',
    shadowOpacity: 0.06,
    shadowRadius: 8,
    elevation: 3,
  },
  storageLabel: { fontSize: 13, color: colors.textSecondary, marginBottom: 4 },
  storageAmount: { fontSize: 28, fontWeight: '800', color: colors.primary, marginBottom: 12 },
  progressBar: {
    height: 8,
    backgroundColor: colors.border,
    borderRadius: 4,
    overflow: 'hidden',
    marginBottom: 8,
  },
  progressFill: {
    height: '100%',
    backgroundColor: colors.primary,
    borderRadius: 4,
  },
  storageDetail: { fontSize: 12, color: colors.textLight },
  sectionTitle: {
    fontSize: 15,
    fontWeight: '700',
    color: colors.text,
    paddingHorizontal: 16,
    marginBottom: 8,
    marginTop: 4,
  },
  card: {
    backgroundColor: colors.white,
    marginHorizontal: 16,
    borderRadius: 16,
    overflow: 'hidden',
    marginBottom: 20,
  },
  emptyText: {
    padding: 20,
    textAlign: 'center',
    color: colors.textLight,
    fontSize: 14,
  },
  mapRow: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 14,
  },
  rowDivider: { borderBottomWidth: 1, borderBottomColor: colors.border },
  mapThumb: {
    width: 44,
    height: 44,
    borderRadius: 10,
    backgroundColor: colors.primaryPale,
    marginRight: 12,
  },
  mapThumbGray: { backgroundColor: colors.inputBg },
  mapInfo: { flex: 1 },
  mapName: { fontSize: 14, fontWeight: '600', color: colors.text },
  mapMeta: { fontSize: 12, color: colors.textSecondary, marginTop: 2 },
  deleteBtn: {
    width: 30,
    height: 30,
    borderRadius: 15,
    backgroundColor: '#FEE2E2',
    alignItems: 'center',
    justifyContent: 'center',
  },
  deleteIcon: { fontSize: 18, color: colors.error, lineHeight: 22 },
  downloadBtn: {
    backgroundColor: colors.primary,
    paddingHorizontal: 14,
    paddingVertical: 7,
    borderRadius: 20,
  },
  downloadBtnDisabled: { opacity: 0.6 },
  downloadBtnText: { fontSize: 13, fontWeight: '600', color: colors.white },
});
