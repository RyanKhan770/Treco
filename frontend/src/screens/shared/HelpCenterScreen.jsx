import { HugeiconsIcon } from '@hugeicons/react-native';
import React, { useState } from 'react';
import {
  View, Text, StyleSheet, ScrollView, TouchableOpacity, Linking, Alert,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { ArrowDown01Icon, ArrowUp01Icon, Mail01Icon, BubbleChatIcon, Globe02Icon, Book01Icon } from '@hugeicons/core-free-icons';
import { colors } from '../../constants/colors';
import { fontSize, fontWeight, radius, spacing } from '../../constants/theme';
import ScreenHeader from '../../components/ui/ScreenHeader';
import { PressableScale } from '../../components/ui';

const FAQ = [
  {
    category: 'Getting started',
    items: [
      {
        q: 'How do I start a trek?',
        a: 'Open any trail from the Explore screen, tap "Show more details", then tap "Start Trek". The map will track your GPS position and update your progress automatically.',
      },
      {
        q: 'Do I need an account to use Treco?',
        a: 'You need an account to save trips, join groups, and use offline maps. Browsing trails and the explore map is available without logging in.',
      },
      {
        q: 'Is Treco free to use?',
        a: 'Yes, Treco is free. Core features including trail maps, GPS tracking, and groups are all free. Offline map packs are available as a premium add-on.',
      },
    ],
  },
  {
    category: 'Maps & navigation',
    items: [
      {
        q: 'How accurate is the GPS tracking?',
        a: 'Treco uses your device\'s GPS with high-accuracy mode. In dense forest or deep valleys, accuracy may drop to 10–50m. For safety, always carry a physical map.',
      },
      {
        q: 'Can I use the map offline?',
        a: 'Yes! Go to Settings → Offline Maps to download trail maps for your chosen region. Downloaded maps work without any internet connection.',
      },
      {
        q: 'Why does the trail line not match exactly?',
        a: 'Trail coordinates are sourced from OpenStreetMap (© contributors, ODbL). OSM data is community-maintained and may vary from ground truth. Run scripts/fetch_osm_trails.py to refresh with the latest data.',
      },
    ],
  },
  {
    category: 'Groups & safety',
    items: [
      {
        q: 'How do I create a trekking group?',
        a: 'Go to the Groups tab and tap "+". Give your group a name, set the trail, dates, and difficulty. Share the invite link with your trekking partners.',
      },
      {
        q: 'What is the SOS feature?',
        a: 'In an emergency during an active trek, press and hold the SOS button for 3 seconds. This sends your GPS location to your emergency contact and alerts nearby rescue posts.',
      },
      {
        q: 'How do I add an emergency contact?',
        a: 'Go to Settings → Edit Profile and fill in the Emergency Contact field. This is the number Treco alerts if you trigger an SOS.',
      },
    ],
  },
  {
    category: 'Account & data',
    items: [
      {
        q: 'How do I change my password?',
        a: 'Go to Settings → Change Password. Enter your current password, then your new password twice. Your new password must be at least 8 characters.',
      },
      {
        q: 'Can I export my trek data?',
        a: 'Yes. Go to Settings → Privacy → Request data export. You\'ll receive a download link by email within 48 hours.',
      },
      {
        q: 'How do I delete my account?',
        a: 'Go to Settings → Privacy → Delete my account. This permanently deletes all your data. The action cannot be reversed.',
      },
    ],
  },
];

export default function HelpCenterScreen({ navigation }) {
  const [open, setOpen] = useState({});

  const toggle = (key) => setOpen((p) => ({ ...p, [key]: !p[key] }));

  return (
    <SafeAreaView style={styles.safe}>
      <ScreenHeader title="Help Center" subtitle="Support" onBack={() => navigation.goBack()} />

      <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>

        {/* Quick contact */}
        <View style={styles.contactRow}>
          <ContactCard
            Icon={Mail01Icon}
            label="Email support"
            sub="Reply within 24 h"
            color="#457B9D"
            onPress={() => Linking.openURL('mailto:support@treco.app')}
          />
          <ContactCard
            Icon={BubbleChatIcon}
            label="Community"
            sub="Forum & discussions"
            color="#40916C"
            onPress={() => Alert.alert('Coming soon', 'The community forum is launching soon!')}
          />
          <ContactCard
            Icon={Globe02Icon}
            label="Docs"
            sub="Full documentation"
            color="#8B5CF6"
            onPress={() => Alert.alert('Coming soon', 'Documentation portal is in progress.')}
          />
        </View>

        {/* FAQ */}
        <Text style={styles.faqTitle}>Frequently asked questions</Text>

        {FAQ.map((section) => (
          <View key={section.category} style={styles.faqSection}>
            <Text style={styles.faqCategory}>{section.category}</Text>
            <View style={styles.faqCard}>
              {section.items.map((item, i) => {
                const key = `${section.category}-${i}`;
                const isOpen = open[key];
                const isLast = i === section.items.length - 1;
                return (
                  <View key={key}>
                    <TouchableOpacity
                      style={[styles.faqQ, !isLast && !isOpen && styles.faqDivider]}
                      onPress={() => toggle(key)}
                      activeOpacity={0.7}
                    >
                      <Text style={styles.faqQText}>{item.q}</Text>
                      {isOpen
                        ? <HugeiconsIcon icon={ArrowUp01Icon}  size={16} color={colors.primary}   strokeWidth={2.5} />
                        : <HugeiconsIcon icon={ArrowDown01Icon} size={16} color={colors.textLight} strokeWidth={2} />
                      }
                    </TouchableOpacity>
                    {isOpen && (
                      <View style={[styles.faqA, !isLast && styles.faqDivider]}>
                        <Text style={styles.faqAText}>{item.a}</Text>
                      </View>
                    )}
                  </View>
                );
              })}
            </View>
          </View>
        ))}

        <View style={styles.footer}>
          <HugeiconsIcon icon={Book01Icon} size={14} color={colors.textLight} strokeWidth={2} />
          <Text style={styles.footerText}>Treco v1.0 · Nepal · support@treco.app</Text>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

function ContactCard({ Icon, label, sub, color, onPress }) {
  return (
    <PressableScale style={styles.contactCard} onPress={onPress} scaleTo={0.95}>
      <View style={[styles.contactIcon, { backgroundColor: `${color}18` }]}>
        <HugeiconsIcon icon={Icon} size={20} color={color} strokeWidth={2} />
      </View>
      <Text style={styles.contactLabel}>{label}</Text>
      <Text style={styles.contactSub}>{sub}</Text>
    </PressableScale>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: colors.background },
  content: { padding: spacing.md, paddingBottom: 48 },

  contactRow: { flexDirection: 'row', gap: 10, marginBottom: 28 },
  contactCard: {
    flex: 1, alignItems: 'center', paddingVertical: 16,
    backgroundColor: colors.card, borderRadius: radius.lg,
    borderWidth: 1, borderColor: colors.border, gap: 6,
  },
  contactIcon: {
    width: 44, height: 44, borderRadius: 22,
    alignItems: 'center', justifyContent: 'center',
  },
  contactLabel: { fontSize: 12, fontWeight: fontWeight.bold, color: colors.text, textAlign: 'center' },
  contactSub: { fontSize: 10, color: colors.textLight, textAlign: 'center' },

  faqTitle: {
    fontSize: fontSize.lg, fontWeight: fontWeight.bold,
    color: colors.text, marginBottom: 16, letterSpacing: -0.2,
  },
  faqSection: { marginBottom: 20 },
  faqCategory: {
    fontSize: fontSize.xs, fontWeight: fontWeight.bold,
    color: colors.primaryLight, letterSpacing: 2,
    textTransform: 'uppercase', marginBottom: spacing.sm, paddingLeft: 4,
  },
  faqCard: {
    backgroundColor: colors.card,
    borderRadius: radius.lg,
    borderWidth: 1, borderColor: colors.border,
    overflow: 'hidden',
  },
  faqQ: {
    flexDirection: 'row', alignItems: 'center',
    paddingHorizontal: spacing.md, paddingVertical: 14, gap: 12,
  },
  faqQText: {
    flex: 1, fontSize: fontSize.sm,
    fontWeight: fontWeight.semiBold, color: colors.text,
  },
  faqA: {
    paddingHorizontal: spacing.md, paddingBottom: 14,
    backgroundColor: colors.surface,
  },
  faqAText: {
    fontSize: fontSize.sm, color: colors.textSecondary,
    lineHeight: 22,
  },
  faqDivider: { borderBottomWidth: 1, borderBottomColor: colors.border },

  footer: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'center',
    gap: 6, marginTop: 8,
  },
  footerText: { fontSize: 11, color: colors.textLight },
});
