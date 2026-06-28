import React, { useMemo } from 'react';
import {
  View,
  Text,
  ScrollView,
  StyleSheet,
  TouchableOpacity,
  SafeAreaView,
  Platform,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { Ionicons } from '@expo/vector-icons';
import { AppButton } from '../components/AppButton';
import { Colors, Spacing, Radius, Typography, getThemeColors } from '../theme/colors';
import { useWetoStore } from '../store/useWetoStore';
import { StarfieldBackground } from '../components/StarfieldBackground';
import { getAvatarMonogram } from '../utils';

export function MatchScreen() {
  const { matches, userAvatar, userName, themeMode } = useWetoStore();
  const navigation = useNavigation<any>();
  const p = getThemeColors(themeMode);
  const styles = useMemo(() => createStyles(p), [themeMode]);

  // Sort all matches by compatibilityScore descending so users can choose any degree
  const sortedMatches = [...matches].sort((a, b) => b.compatibilityScore - a.compatibilityScore);
  const topMatch = sortedMatches[0] ?? null;
  const otherMatches = sortedMatches.slice(1);

  if (!matches.length) {
    return (
      <SafeAreaView style={styles.container}>
        {themeMode === 'dark' && <StarfieldBackground />}
        <View style={styles.header}>
          <Text style={styles.title}>Match</Text>
        </View>
        <View style={styles.emptyContainer}>
          <View style={styles.emptyEmoji}>
            <Ionicons name="heart-outline" size={34} color="#4E6E92" />
          </View>
          <Text style={styles.emptyTitle}>Pas encore de match</Text>
          <Text style={styles.emptySubtitle}>
            Continue à répondre aux dilemmes pour que Weto trouve tes compatibilités.
          </Text>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      {themeMode === 'dark' && <StarfieldBackground />}
      <View style={styles.header}>
        <Text style={styles.title}>Match</Text>
        <View style={styles.badge}>
          <Text style={styles.badgeText}>{matches.length}</Text>
        </View>
      </View>
      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.listContent}
      >
        {topMatch && (
          <View style={styles.heroCard}>
            <View style={styles.heroTopRow}>
              <Text style={styles.heroEyebrow}>Meilleure compatibilité</Text>
              <View style={styles.heroScoreBadge}>
                <Text style={styles.heroScoreText}>{topMatch.compatibilityScore}%</Text>
              </View>
            </View>
            <Text style={styles.heroTitle}>Compatibilité avec {topMatch.name}</Text>
            <Text style={styles.heroSubtitle}>
              Weto a trouvé un terrain commun solide entre vos réactions, votre humour et votre style relationnel.
            </Text>

            <View style={styles.heroAvatars}>
              <View style={styles.heroAvatarCircle}>
                <Text style={styles.heroAvatarEmoji}>{getAvatarMonogram(userName, userAvatar)}</Text>
              </View>
              <View style={styles.heroHeartBadge}>
                  <Ionicons name="heart-outline" size={16} color="#4E6E92" />
              </View>
              <View style={styles.heroAvatarCircle}>
                <Text style={styles.heroAvatarEmoji}>{getAvatarMonogram(topMatch.name, topMatch.avatar)}</Text>
              </View>
            </View>

            <View style={styles.heroReasons}>
              {topMatch.compatibilityReasons.map((reason, idx) => (
                <View key={idx} style={styles.heroReasonPill}>
                  <Text style={styles.heroReasonText}>{reason}</Text>
                </View>
              ))}
            </View>

            <AppButton
              title="Envoyer un message"
              onPress={() => navigation.navigate('ChatDetail', { contactId: topMatch.id })}
              fullWidth
            />
          </View>
        )}

        {otherMatches.length > 0 && (
          <Text style={styles.sectionLabel}>Tous tes matchs — du plus au moins compatible</Text>
        )}

        {otherMatches.map((match) => (
          <TouchableOpacity
            key={match.id}
            style={styles.matchCard}
            activeOpacity={0.7}
            onPress={() => navigation.navigate('ChatDetail', { contactId: match.id })}
          >
            {/* Avatar */}
            <View style={styles.avatarContainer}>
              <View style={styles.avatarCircle}>
                <Text style={styles.avatarEmoji}>{getAvatarMonogram(match.name, match.avatar)}</Text>
              </View>
              <View style={styles.onlineDot} />
            </View>

            {/* Info */}
            <View style={styles.matchInfo}>
              <View style={styles.nameRow}>
                <Text style={styles.matchName}>{match.name}</Text>
                <View style={styles.compatScore}>
                  <Text style={styles.compatText}>{match.compatibilityScore}%</Text>
                </View>
              </View>
              <View style={styles.reasonsRow}>
                {match.compatibilityReasons.slice(0, 2).map((reason, idx) => (
                  <View key={idx} style={styles.reasonPill}>
                    <Text style={styles.reasonPillText}>{reason}</Text>
                  </View>
                ))}
              </View>
            </View>

            {/* CTA */}
            <View style={styles.msgButton}>
              <Ionicons name="chatbubble-ellipses-outline" size={17} color="#4E6E92" />
            </View>
          </TouchableOpacity>
        ))}
      </ScrollView>
    </SafeAreaView>
  );
}

function createStyles(p: ReturnType<typeof getThemeColors>) {
  return StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: p.background,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: Spacing.lg,
    paddingVertical: Spacing.md,
    gap: Spacing.sm,
  },
  title: {
    ...Typography.title,
    color: p.text,
  },
  badge: {
    backgroundColor: p.accent,
    borderRadius: Radius.full,
    minWidth: 24,
    height: 24,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 6,
  },
  badgeText: {
    ...Typography.captionBold,
    color: p.white,
  },
  emptyContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: Spacing.xl,
  },
  emptyEmoji: {
    width: 72,
    height: 72,
    borderRadius: 36,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'rgba(124,203,255,0.18)',
    marginBottom: Spacing.md,
  },
  emptyTitle: {
    ...Typography.h1,
    color: p.text,
    textAlign: 'center',
    marginBottom: Spacing.sm,
  },
  emptySubtitle: {
    ...Typography.body,
    color: p.textSecondary,
    textAlign: 'center',
    lineHeight: 24,
  },
  listContent: {
    padding: Spacing.md,
    gap: Spacing.md,
  },
  heroCard: {
    backgroundColor: p.card,
    borderRadius: Radius.lg,
    padding: Spacing.lg,
    gap: Spacing.md,
    ...Platform.select({
      web: { boxShadow: '0 6px 24px rgba(0,0,0,0.08)' },
      ios: { shadowColor: '#000', shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.08, shadowRadius: 18 },
      android: { elevation: 4 },
    }),
  },
  heroTopRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  heroEyebrow: {
    ...Typography.small,
    color: p.textMuted,
    textTransform: 'uppercase',
    letterSpacing: 0.8,
  },
  heroScoreBadge: {
    backgroundColor: p.accentLight,
    borderRadius: Radius.full,
    paddingHorizontal: 12,
    paddingVertical: 4,
  },
  heroScoreText: {
    ...Typography.bodyBold,
    color: p.accent,
    fontSize: 16,
  },
  heroTitle: {
    ...Typography.h1,
    color: p.text,
  },
  heroSubtitle: {
    ...Typography.body,
    color: p.textSecondary,
  },
  heroAvatars: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: Spacing.sm,
  },
  heroAvatarCircle: {
    width: 72,
    height: 72,
    borderRadius: 36,
    backgroundColor: p.accentLight,
    alignItems: 'center',
    justifyContent: 'center',
  },
  heroAvatarEmoji: {
    fontSize: 34,
  },
  heroHeartBadge: {
    width: 34,
    height: 34,
    borderRadius: 17,
    marginHorizontal: -10,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: p.card,
    zIndex: 1,
    ...Platform.select({
      web: { boxShadow: '0 2px 8px rgba(0,0,0,0.08)' },
    }),
  },
  heroHeartText: {
    fontSize: 18,
  },
  heroReasons: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: Spacing.sm,
  },
  heroReasonPill: {
    backgroundColor: p.background,
    borderRadius: Radius.pill,
    paddingHorizontal: Spacing.md,
    paddingVertical: 8,
  },
  heroReasonText: {
    ...Typography.captionBold,
    color: p.textSecondary,
  },
  sectionLabel: {
    ...Typography.captionBold,
    color: p.textSecondary,
    paddingHorizontal: Spacing.xs,
    marginTop: Spacing.xs,
  },
  matchCard: {
    backgroundColor: p.card,
    borderRadius: Radius.lg,
    padding: Spacing.md,
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.md,
    ...Platform.select({
      web: { boxShadow: '0 2px 16px rgba(0,0,0,0.07)' },
      ios: { shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.07, shadowRadius: 12 },
      android: { elevation: 3 },
    }),
  },
  avatarContainer: {
    position: 'relative',
  },
  avatarCircle: {
    width: 58,
    height: 58,
    borderRadius: 29,
    backgroundColor: p.accentLight,
    alignItems: 'center',
    justifyContent: 'center',
  },
  avatarEmoji: {
    fontSize: 28,
  },
  onlineDot: {
    position: 'absolute',
    bottom: 2,
    right: 2,
    width: 12,
    height: 12,
    borderRadius: 6,
    backgroundColor: p.success,
    borderWidth: 2,
    borderColor: p.card,
  },
  matchInfo: {
    flex: 1,
    gap: Spacing.xs,
  },
  nameRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  matchName: {
    ...Typography.h2,
    color: p.text,
  },
  compatScore: {
    backgroundColor: p.accentLight,
    borderRadius: Radius.pill,
    paddingHorizontal: Spacing.sm,
    paddingVertical: 2,
  },
  compatText: {
    ...Typography.captionBold,
    color: p.accent,
  },
  reasonsRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 4,
  },
  reasonPill: {
    backgroundColor: p.background,
    borderRadius: Radius.pill,
    paddingHorizontal: Spacing.sm,
    paddingVertical: 2,
  },
  reasonPillText: {
    ...Typography.small,
    color: p.textSecondary,
  },
  msgButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: p.accentLight,
    alignItems: 'center',
    justifyContent: 'center',
  },
  msgButtonText: {
    fontSize: 18,
  },
  });
}
