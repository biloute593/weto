import React from 'react';
import {
  View,
  Text,
  ScrollView,
  StyleSheet,
  TouchableOpacity,
  SafeAreaView,
  Platform,
} from 'react-native';
import { Colors, Spacing, Radius, Typography } from '../theme/colors';
import { useWetoStore, UserTraits } from '../store/useWetoStore';

const TRAIT_LABELS: Record<keyof UserTraits, string> = {
  sociability: 'Sociabilité',
  emotionalReactivity: 'Réactivité émotionnelle',
  riskTolerance: 'Tolérance au risque',
  humorStyle: "Style d'humour",
  conflictStyle: 'Gestion des conflits',
  stability: 'Stabilité',
};

const TRAIT_COLORS: Record<keyof UserTraits, string> = {
  sociability: '#007AFF',
  emotionalReactivity: '#FF6B9D',
  riskTolerance: '#FF9500',
  humorStyle: '#34C759',
  conflictStyle: '#AF52DE',
  stability: '#5AC8FA',
};

export function ProfileScreen() {
  const { userTraits, profileCompletion, answers, matches } = useWetoStore();

  const traitKeys = Object.keys(userTraits) as (keyof UserTraits)[];

  const dominantTrait = traitKeys.reduce((a, b) =>
    userTraits[a] > userTraits[b] ? a : b
  );

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Mon profil</Text>
        <TouchableOpacity style={styles.settingsButton}>
          <Text style={styles.settingsIcon}>⚙️</Text>
        </TouchableOpacity>
      </View>

      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.content}
      >
        {/* Profile completion card */}
        <View style={styles.completionCard}>
          <View style={styles.completionCircle}>
            <Text style={styles.completionPercent}>{profileCompletion}%</Text>
          </View>
          <View style={styles.completionInfo}>
            <Text style={styles.completionTitle}>
              {profileCompletion < 100 ? 'Profil en construction' : 'Profil complet !'}
            </Text>
            <Text style={styles.completionSubtitle}>
              {profileCompletion < 100
                ? 'Plus tu joues, plus les matchs seront pertinents.'
                : `Tu as répondu à ${answers.length} dilemmes. 🎉`}
            </Text>
            {/* Progress bar */}
            <View style={styles.progressBg}>
              <View
                style={[styles.progressFg, { width: `${profileCompletion}%` as any }]}
              />
            </View>
          </View>
        </View>

        {/* Stats */}
        <View style={styles.statsRow}>
          <View style={styles.statCard}>
            <Text style={styles.statNumber}>{answers.length}</Text>
            <Text style={styles.statLabel}>Réponses</Text>
          </View>
          <View style={styles.statCard}>
            <Text style={styles.statNumber}>{matches.length}</Text>
            <Text style={styles.statLabel}>Matchs</Text>
          </View>
          <View style={styles.statCard}>
            <Text style={[styles.statNumber, { fontSize: 20 }]}>
              {TRAIT_LABELS[dominantTrait]?.split(' ')[0] ?? '—'}
            </Text>
            <Text style={styles.statLabel}>Trait dominant</Text>
          </View>
        </View>

        {/* Traits */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Mes traits</Text>
          <View style={styles.traitsContainer}>
            {traitKeys.map((key) => (
              <View key={key} style={styles.traitRow}>
                <View style={styles.traitLabelRow}>
                  <View
                    style={[
                      styles.traitDot,
                      { backgroundColor: TRAIT_COLORS[key] },
                    ]}
                  />
                  <Text style={styles.traitLabel}>{TRAIT_LABELS[key]}</Text>
                  <Text style={styles.traitValue}>{Math.round(userTraits[key])}%</Text>
                </View>
                <View style={styles.traitBarBg}>
                  <View
                    style={[
                      styles.traitBarFg,
                      {
                        width: `${userTraits[key]}%` as any,
                        backgroundColor: TRAIT_COLORS[key],
                      },
                    ]}
                  />
                </View>
              </View>
            ))}
          </View>
        </View>

        {/* Dominant trait card */}
        <View style={styles.dominantCard}>
          <Text style={styles.dominantEmoji}>🧬</Text>
          <View style={{ flex: 1 }}>
            <Text style={styles.dominantTitle}>Trait dominant</Text>
            <Text style={styles.dominantName}>{TRAIT_LABELS[dominantTrait]}</Text>
            <Text style={styles.dominantValue}>{Math.round(userTraits[dominantTrait])} / 100</Text>
          </View>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: Spacing.lg,
    paddingVertical: Spacing.md,
  },
  title: {
    ...Typography.title,
    color: Colors.text,
  },
  settingsButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: Colors.card,
    alignItems: 'center',
    justifyContent: 'center',
    ...Platform.select({
      web: { boxShadow: '0 2px 8px rgba(0,0,0,0.07)' },
    }),
  },
  settingsIcon: {
    fontSize: 18,
  },
  content: {
    padding: Spacing.md,
    gap: Spacing.md,
    paddingBottom: Spacing.xxl,
  },
  completionCard: {
    backgroundColor: Colors.card,
    borderRadius: Radius.lg,
    padding: Spacing.lg,
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.md,
    ...Platform.select({
      web: { boxShadow: '0 4px 20px rgba(0,0,0,0.07)' },
      ios: { shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.07, shadowRadius: 12 },
      android: { elevation: 3 },
    }),
  },
  completionCircle: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: Colors.accentLight,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 3,
    borderColor: Colors.accent,
  },
  completionPercent: {
    ...Typography.h1,
    color: Colors.accent,
  },
  completionInfo: {
    flex: 1,
    gap: Spacing.xs,
  },
  completionTitle: {
    ...Typography.bodyBold,
    color: Colors.text,
  },
  completionSubtitle: {
    ...Typography.caption,
    color: Colors.textSecondary,
    lineHeight: 18,
  },
  progressBg: {
    height: 4,
    backgroundColor: Colors.border,
    borderRadius: 2,
    marginTop: Spacing.xs,
  },
  progressFg: {
    height: 4,
    backgroundColor: Colors.accent,
    borderRadius: 2,
  },
  statsRow: {
    flexDirection: 'row',
    gap: Spacing.sm,
  },
  statCard: {
    flex: 1,
    backgroundColor: Colors.card,
    borderRadius: Radius.md,
    padding: Spacing.md,
    alignItems: 'center',
    gap: 4,
    ...Platform.select({
      web: { boxShadow: '0 2px 12px rgba(0,0,0,0.06)' },
    }),
  },
  statNumber: {
    ...Typography.h1,
    color: Colors.accent,
  },
  statLabel: {
    ...Typography.small,
    color: Colors.textSecondary,
    textAlign: 'center',
  },
  section: {
    gap: Spacing.md,
  },
  sectionTitle: {
    ...Typography.h2,
    color: Colors.text,
  },
  traitsContainer: {
    backgroundColor: Colors.card,
    borderRadius: Radius.lg,
    padding: Spacing.lg,
    gap: Spacing.md,
    ...Platform.select({
      web: { boxShadow: '0 4px 20px rgba(0,0,0,0.07)' },
    }),
  },
  traitRow: {
    gap: Spacing.xs,
  },
  traitLabelRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.sm,
  },
  traitDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
  },
  traitLabel: {
    ...Typography.body,
    color: Colors.text,
    flex: 1,
  },
  traitValue: {
    ...Typography.captionBold,
    color: Colors.textSecondary,
  },
  traitBarBg: {
    height: 6,
    backgroundColor: Colors.border,
    borderRadius: 3,
  },
  traitBarFg: {
    height: 6,
    borderRadius: 3,
  },
  dominantCard: {
    backgroundColor: Colors.accentLight,
    borderRadius: Radius.lg,
    padding: Spacing.lg,
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.md,
    borderWidth: 1,
    borderColor: Colors.accent + '30',
  },
  dominantEmoji: {
    fontSize: 36,
  },
  dominantTitle: {
    ...Typography.caption,
    color: Colors.accent,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  dominantName: {
    ...Typography.h2,
    color: Colors.text,
  },
  dominantValue: {
    ...Typography.caption,
    color: Colors.textSecondary,
  },
});
