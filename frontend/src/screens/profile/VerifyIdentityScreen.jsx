import { HugeiconsIcon } from '@hugeicons/react-native';
import { useState } from 'react';
import {
  View, Text, StyleSheet, ScrollView, StatusBar, Alert, Image,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import * as ImagePicker from 'expo-image-picker';
import { Shield01Icon, CallIcon, File02Icon, Camera01Icon, CheckmarkBadge01Icon, CheckmarkCircle01Icon } from '@hugeicons/core-free-icons';
import { colors } from '../../constants/colors';
import { userAPI } from '../../services/api';
import { fontSize, fontWeight, radius, shadows, spacing } from '../../constants/theme';
import {
  Button, Card, Chip, Input, PressableScale, SlideUp, Stagger,
} from '../../components/ui';
import ScreenHeader from '../../components/ui/ScreenHeader';

const docTypes = ['Citizenship', 'Passport', 'Driver License'];

const VerifyIdentityScreen = ({ navigation }) => {
  const [phone, setPhone] = useState('');
  const [docType, setDocType] = useState('Citizenship');
  const [docNumber, setDocNumber] = useState('');
  const [idPhotoUri, setIdPhotoUri] = useState(null);
  const [uploading, setUploading] = useState(false);
  const [loading, setLoading] = useState(false);

  const pickIdPhoto = async () => {
    const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (status !== 'granted') {
      Alert.alert('Permission needed', 'Please allow access to your photo library.');
      return;
    }
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ['images'],
      allowsEditing: true,
      quality: 0.85,
    });
    if (result.canceled) return;
    setIdPhotoUri(result.assets[0].uri);
  };

  const handleSubmit = async () => {
    if (!docNumber) {
      Alert.alert('Missing info', 'Please enter your document number.');
      return;
    }
    setLoading(true);
    try {
      // Upload photo first if selected
      if (idPhotoUri) {
        setUploading(true);
        await userAPI.uploadGovId(idPhotoUri);
        setUploading(false);
      }
      // Submit text details
      await userAPI.verifyRequest({ phone, document_type: docType, document_number: docNumber });
      Alert.alert('Submitted', "We'll review your verification within 24 hours.", [
        { text: 'OK', onPress: () => navigation.goBack() },
      ]);
    } catch (err) {
      Alert.alert('Error', err?.response?.data?.message || 'Could not submit. Please try again.');
    } finally {
      setLoading(false);
      setUploading(false);
    }
  };

  return (
    <SafeAreaView style={styles.safe}>
      <StatusBar barStyle="dark-content" backgroundColor={colors.background} />
      <ScreenHeader
        title="Verify Identity"
        subtitle="Trust"
        onBack={() => navigation.goBack()}
      />

      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{ padding: spacing.md, paddingBottom: spacing.xxl }}>
        <SlideUp delay={100}>
          <Card style={styles.infoCard}>
            <View style={styles.infoIcon}>
              <HugeiconsIcon icon={Shield01Icon} size={22} color={colors.primary} strokeWidth={2.25} />
            </View>
            <View style={{ flex: 1 }}>
              <Text style={styles.infoTitle}>Why verify?</Text>
              <Text style={styles.infoText}>
                Verified users build trust with trek partners. Get a blue badge and join more group trips.
              </Text>
            </View>
          </Card>
        </SlideUp>

        <Stagger initialDelay={200} step={100} distance={14}>
          <Text style={styles.section}>Contact</Text>
          <Input
            label="Phone number"
            leading={<HugeiconsIcon icon={CallIcon} size={18} color={colors.textSecondary} strokeWidth={2.25} />}
            placeholder="+977 98XXXXXXXX"
            value={phone}
            onChangeText={setPhone}
            keyboardType="phone-pad"
          />

          <Text style={styles.section}>Government ID</Text>
          <Text style={styles.label}>Document type</Text>
          <View style={styles.chipRow}>
            {docTypes.map((t) => (
              <Chip key={t} label={t} selected={docType === t} onPress={() => setDocType(t)} />
            ))}
          </View>

          <Input
            label="Document number"
            leading={<HugeiconsIcon icon={File02Icon} size={18} color={colors.textSecondary} strokeWidth={2.25} />}
            placeholder="Enter document number"
            value={docNumber}
            onChangeText={setDocNumber}
          />

          <Text style={styles.label}>Upload ID photo</Text>
          <PressableScale style={styles.uploadBox} scaleTo={0.98} onPress={pickIdPhoto}>
            {idPhotoUri ? (
              <View style={styles.uploadPreviewWrap}>
                <Image source={{ uri: idPhotoUri }} style={styles.uploadPreview} />
                <View style={styles.uploadDoneOverlay}>
                  <HugeiconsIcon icon={CheckmarkCircle01Icon} size={28} color="#fff" strokeWidth={2.5} />
                </View>
                <Text style={styles.uploadDoneText}>Tap to change</Text>
              </View>
            ) : (
              <>
                <View style={styles.uploadIconWrap}>
                  <HugeiconsIcon icon={Camera01Icon} size={22} color={colors.primary} strokeWidth={2.25} />
                </View>
                <Text style={styles.uploadText}>Tap to upload</Text>
                <Text style={styles.uploadSub}>JPG or PNG · up to 5 MB</Text>
              </>
            )}
          </PressableScale>

          <View style={{ marginTop: spacing.lg }}>
            <Button
              label={uploading ? 'Uploading photo…' : 'Submit for verification'}
              icon={CheckmarkBadge01Icon}
              loading={loading}
              onPress={handleSubmit}
              fullWidth
              size="lg"
            />
          </View>
        </Stagger>
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: colors.background },

  infoCard: {
    flexDirection: 'row', alignItems: 'center', gap: spacing.sm,
    backgroundColor: colors.primaryPale,
    borderLeftWidth: 3, borderLeftColor: colors.primary,
    marginBottom: spacing.md,
  },
  infoIcon: {
    width: 44, height: 44, borderRadius: 22,
    backgroundColor: '#fff',
    alignItems: 'center', justifyContent: 'center',
  },
  infoTitle: { fontSize: fontSize.md, fontWeight: fontWeight.bold, color: colors.primary, marginBottom: 2 },
  infoText: { fontSize: fontSize.xs, color: colors.text, lineHeight: 18 },

  section: {
    fontSize: fontSize.xs, fontWeight: fontWeight.bold,
    color: colors.primaryLight, letterSpacing: 2, textTransform: 'uppercase',
    marginTop: spacing.md, marginBottom: spacing.sm,
  },
  label: { fontSize: fontSize.xs, color: colors.textSecondary, fontWeight: fontWeight.semiBold, marginBottom: spacing.xs, marginTop: spacing.sm },
  chipRow: { flexDirection: 'row', flexWrap: 'wrap', marginBottom: spacing.sm },

  uploadBox: {
    borderWidth: 1.5, borderStyle: 'dashed',
    borderColor: colors.primaryLight + '60',
    borderRadius: radius.lg,
    padding: spacing.xl,
    alignItems: 'center',
    backgroundColor: colors.primaryPale + '50',
    minHeight: 140, justifyContent: 'center',
  },
  uploadIconWrap: {
    width: 48, height: 48, borderRadius: 24,
    backgroundColor: '#fff',
    alignItems: 'center', justifyContent: 'center',
    marginBottom: spacing.sm,
    ...shadows.xs,
  },
  uploadText: { fontSize: fontSize.md, color: colors.text, fontWeight: fontWeight.semiBold },
  uploadSub: { fontSize: fontSize.xs, color: colors.textLight, marginTop: 2 },

  uploadPreviewWrap: { alignItems: 'center', gap: spacing.sm },
  uploadPreview: { width: 120, height: 80, borderRadius: radius.md },
  uploadDoneOverlay: {
    position: 'absolute', top: 26, left: '50%', marginLeft: -14,
    backgroundColor: 'rgba(0,0,0,0.45)',
    borderRadius: 99, padding: 4,
  },
  uploadDoneText: { fontSize: fontSize.xs, color: colors.textSecondary, marginTop: 4 },
});

export default VerifyIdentityScreen;
