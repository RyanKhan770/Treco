import { HugeiconsIcon } from '@hugeicons/react-native';
import React, { useState, useEffect, useCallback } from 'react';
import { View, Text, StyleSheet, FlatList, TextInput, Alert, StatusBar } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { ArrowLeft02Icon, PlusSignIcon, Delete02Icon, CallIcon, UserIcon, UserGroupIcon } from '@hugeicons/core-free-icons';
import { colors } from '../../constants/colors';
import { fontSize, fontWeight, radius, spacing, shadows } from '../../constants/theme';
import { Button, Card, Input, PressableScale, ScreenHeader } from '../../components/ui';
import api from '../../services/api'; // Standard axios instance

const EmergencyContactsScreen = ({ navigation }) => {
  const [contacts, setContacts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [adding, setAdding] = useState(false);
  const [form, setForm] = useState({ name: '', phone_number: '', relation: '' });

  const fetchContacts = useCallback(async () => {
    try {
      setLoading(true);
      const res = await api.get('/sos/contacts');
      setContacts(res.data);
    } catch (error) {
      Alert.alert('Error', 'Failed to fetch emergency contacts.');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchContacts();
  }, [fetchContacts]);

  const handleAdd = async () => {
    if (!form.name || !form.phone_number) {
      return Alert.alert('Missing Info', 'Please provide at least a name and phone number.');
    }
    try {
      setAdding(true);
      await api.post('/sos/contacts', form);
      setForm({ name: '', phone_number: '', relation: '' });
      fetchContacts();
    } catch (error) {
      Alert.alert('Error', 'Could not add contact. Please try again.');
    } finally {
      setAdding(false);
    }
  };

  const handleDelete = async (id) => {
    Alert.alert('Remove Contact', 'Are you sure you want to remove this emergency contact?', [
      { text: 'Cancel', style: 'cancel' },
      { text: 'Remove', style: 'destructive', onPress: async () => {
          try {
            await api.delete(`/sos/contacts/${id}`);
            setContacts(prev => prev.filter(c => c.id !== id));
          } catch (error) {
            Alert.alert('Error', 'Failed to delete contact.');
          }
        }
      }
    ]);
  };

  const renderItem = ({ item }) => (
    <Card style={styles.card}>
      <View style={styles.cardContent}>
        <View style={styles.avatar}>
          <HugeiconsIcon icon={UserIcon} size={20} color={colors.primary} />
        </View>
        <View style={styles.info}>
          <Text style={styles.name}>{item.name}</Text>
          <Text style={styles.phone}>{item.phone_number}</Text>
          {item.relation ? <Text style={styles.relation}>{item.relation}</Text> : null}
        </View>
        <PressableScale onPress={() => handleDelete(item.id)} style={styles.deleteBtn} scaleTo={0.8}>
          <HugeiconsIcon icon={Delete02Icon} size={20} color={colors.danger} />
        </PressableScale>
      </View>
    </Card>
  );

  return (
    <SafeAreaView style={styles.safe}>
      <StatusBar barStyle="dark-content" backgroundColor={colors.background} />
      <ScreenHeader title="Emergency Contacts" onBack={() => navigation.goBack()} />
      
      <View style={styles.formContainer}>
        <Text style={styles.sectionTitle}>Add New Contact</Text>
        <Input
          placeholder="Name (e.g. Jane Doe)"
          value={form.name}
          onChangeText={v => setForm({ ...form, name: v })}
          leading={<HugeiconsIcon icon={UserIcon} size={18} color={colors.textMuted} />}
        />
        <Input
          placeholder="Phone Number"
          value={form.phone_number}
          onChangeText={v => setForm({ ...form, phone_number: v })}
          keyboardType="phone-pad"
          leading={<HugeiconsIcon icon={CallIcon} size={18} color={colors.textMuted} />}
        />
        <Input
          placeholder="Relation (e.g. Sister, Friend)"
          value={form.relation}
          onChangeText={v => setForm({ ...form, relation: v })}
          leading={<HugeiconsIcon icon={UserGroupIcon} size={18} color={colors.textMuted} />}
        />
        <Button 
          label="Save Contact" 
          icon={PlusSignIcon} 
          onPress={handleAdd} 
          loading={adding} 
          disabled={!form.name || !form.phone_number}
          style={{ marginTop: spacing.sm }}
        />
      </View>

      <View style={styles.listContainer}>
        <Text style={styles.sectionTitle}>Your Trusted Contacts</Text>
        <Text style={styles.subtitle}>These people will be notified if you trigger an SOS.</Text>
        
        <FlatList
          data={contacts}
          keyExtractor={item => item.id}
          renderItem={renderItem}
          contentContainerStyle={{ paddingBottom: spacing.xxl }}
          showsVerticalScrollIndicator={false}
          ListEmptyComponent={
            <View style={styles.empty}>
              <Text style={styles.emptyText}>You haven't added any emergency contacts yet.</Text>
            </View>
          }
          refreshing={loading}
          onRefresh={fetchContacts}
        />
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: colors.background },
  formContainer: {
    padding: spacing.md,
    backgroundColor: colors.surface,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  sectionTitle: {
    fontSize: fontSize.lg,
    fontWeight: fontWeight.bold,
    color: colors.text,
    marginBottom: spacing.sm,
  },
  subtitle: {
    fontSize: fontSize.sm,
    color: colors.textSecondary,
    marginBottom: spacing.md,
  },
  listContainer: {
    flex: 1,
    padding: spacing.md,
  },
  card: {
    marginBottom: spacing.sm,
    padding: spacing.sm,
  },
  cardContent: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
  },
  avatar: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: colors.primaryPale,
    alignItems: 'center',
    justifyContent: 'center',
  },
  info: {
    flex: 1,
  },
  name: {
    fontSize: fontSize.md,
    fontWeight: fontWeight.bold,
    color: colors.text,
  },
  phone: {
    fontSize: fontSize.sm,
    color: colors.textSecondary,
    marginTop: 2,
  },
  relation: {
    fontSize: fontSize.xs,
    color: colors.primary,
    marginTop: 2,
    fontWeight: fontWeight.semiBold,
  },
  deleteBtn: {
    padding: spacing.sm,
  },
  empty: {
    alignItems: 'center',
    padding: spacing.xl,
  },
  emptyText: {
    color: colors.textMuted,
    fontSize: fontSize.sm,
  }
});

export default EmergencyContactsScreen;
