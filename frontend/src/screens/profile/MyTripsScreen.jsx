import React, { useState } from 'react';
import {
  View, Text, StyleSheet, ScrollView, TouchableOpacity,
  StatusBar, SafeAreaView,
} from 'react-native';
import { colors } from '../../constants/colors';

const MyTripsScreen = ({ navigation }) => {
  const [trips] = useState([]); // Empty state by default

  return (
    <SafeAreaView style={styles.safe}>
      <StatusBar barStyle="dark-content" backgroundColor={colors.white} />
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <Text style={styles.back}>←</Text>
        </TouchableOpacity>
        <Text style={styles.title}>My Trips</Text>
        <View style={{ width: 40 }} />
      </View>

      {trips.length === 0 ? (
        <View style={styles.emptyState}>
          <View style={styles.emptyCircle} />
          <Text style={styles.emptyTitle}>No trips yet</Text>
          <Text style={styles.emptyDesc}>Start your adventure by joining a group{'\n'}or creating your own trip</Text>
          <TouchableOpacity
            style={styles.exploreBtn}
            onPress={() => navigation.navigate('Explore')}
          >
            <Text style={styles.exploreBtnText}>Explore Trails</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={styles.findGroupBtn}
            onPress={() => navigation.navigate('Groups')}
          >
            <Text style={styles.findGroupBtnText}>Find Groups</Text>
          </TouchableOpacity>
        </View>
      ) : (
        <ScrollView>
          {trips.map((trip, i) => (
            <View key={i} style={styles.tripCard}>
              <Text style={styles.tripName}>{trip.name}</Text>
            </View>
          ))}
        </ScrollView>
      )}
    </SafeAreaView>
  );
};

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
  back: { fontSize: 22, color: colors.textPrimary },
  title: { fontSize: 17, fontWeight: '700', color: colors.textPrimary },
  emptyState: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 32,
  },
  emptyCircle: {
    width: 120, height: 120, borderRadius: 60,
    backgroundColor: colors.accentVeryLight,
    marginBottom: 24,
  },
  emptyTitle: { fontSize: 20, fontWeight: '700', color: colors.textPrimary, marginBottom: 10 },
  emptyDesc: { fontSize: 14, color: colors.textSecondary, textAlign: 'center', lineHeight: 22, marginBottom: 32 },
  exploreBtn: {
    backgroundColor: colors.primary,
    paddingVertical: 14,
    paddingHorizontal: 32,
    borderRadius: 50,
    width: '100%',
    alignItems: 'center',
    marginBottom: 12,
  },
  exploreBtnText: { color: colors.white, fontSize: 15, fontWeight: '600' },
  findGroupBtn: {
    borderWidth: 1.5,
    borderColor: colors.primary,
    paddingVertical: 14,
    paddingHorizontal: 32,
    borderRadius: 50,
    width: '100%',
    alignItems: 'center',
  },
  findGroupBtnText: { color: colors.primary, fontSize: 15, fontWeight: '600' },
  tripCard: { backgroundColor: colors.white, margin: 16, borderRadius: 16, padding: 16, elevation: 1 },
  tripName: { fontSize: 16, fontWeight: '600', color: colors.textPrimary },
});

export default MyTripsScreen;
