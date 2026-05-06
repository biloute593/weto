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
import { useNavigation } from '@react-navigation/native';
import { AppButton } from '../components/AppButton';
import { Colors, Spacing, Radius, Typography } from '../theme/colors';
import { useWetoStore } from '../store/useWetoStore';

export function MatchScreen() {
  const { matches, userAvatar } = useWetoStore();
  const navigation = useNavigation<any>();

  const latestMatch = matches[matches.length - 1];
  const previousMatches = matches.slice(0, -1).reverse();

  if (matches.length === 0) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.header}>
          <Text style={styles.title}>Match</Text>
        </View>
        <View style={styles.emptyContainer}>
          <Text style={styles.emptyEmoji}>💙</Text>
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
        {latestMatch && (
          <View style={styles.heroCard}>
            <Text style={styles.heroEyebrow}>Dernier reveal</Text>
            <Text style={styles.heroTitle}>Compatibilite detectee avec {latestMatch.name}</Text>
            <Text style={styles.heroSubtitle}>
              Weto a trouve un terrain commun solide entre vos reactions, votre humour et votre style relationnel.
            </Text>

            <View style={styles.heroAvatars}>
              <View style={styles.heroAvatarCircle}>
                <Text style={styles.heroAvatarEmoji}>{userAvatar}</Text>
              </View>
              <View style={styles.heroHeartBadge}>
                <Text style={styles.heroHeartText}>💙</Text>
              </View>
              <View style={styles.heroAvatarCircle}>
                <Text style={styles.heroAvatarEmoji}>{latestMatch.avatar}</Text>
              </View>
            </View>

            <View style={styles.heroReasons}>
              {latestMatch.compatibilityReasons.map((reason, idx) => (
                <View key={idx} style={styles.heroReasonPill}>
                  <Text style={styles.heroReasonText}>{reason}</Text>
                </View>
              ))}
            </View>

            <AppButton
              title="Envoyer un message"
              onPress={() => navigation.navigate('ChatDetail', { contactId: latestMatch.id })}
              fullWidth
            />
          </View>
        )}

        {previousMatches.length > 0 && (
          <Text style={styles.sectionLabel}>Autres matchs</Text>
        )}

        {previousMatches.map((match) => (
          <TouchableOpacity
            key={match.id}
            style={styles.matchCard}
            activeOpacity={0.7}
            onPress={() => navigation.navigate('ChatDetail', { contactId: match.id })}
          >
            {/* Avatar */}
            <View style={styles.avatarContainer}>
              <View style={styles.avatarCircle}>
                <Text style={styles.avatarEmoji}>{match.avatar}</Text>
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
              <Text style={styles.msgButtonText}>💬</Text>
            </View>
          </TouchableOpacity>
        ))}
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
    alignItems: 'center',
    paddingHorizontal: Spacing.lg,
    paddingVertical: Spacing.md,
    gap: Spacing.sm,
  },
  title: {
    ...Typography.title,
    color: Colors.text,
  },
  badge: {
    backgroundColor: Colors.accent,
    borderRadius: Radius.full,
    minWidth: 24,
    height: 24,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 6,
  },
  badgeText: {
    ...Typography.captionBold,
    color: Colors.white,
  },
  emptyContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: Spacing.xl,
  },
  emptyEmoji: {
    fontSize: 60,
    marginBottom: Spacing.md,
  },
  emptyTitle: {
    ...Typography.h1,
    color: Colors.text,
    textAlign: 'center',
    marginBottom: Spacing.sm,
  },
  emptySubtitle: {
    ...Typography.body,
    color: Colors.textSecondary,
    textAlign: 'center',
    lineHeight: 24,
  },
  listContent: {
    padding: Spacing.md,
    gap: Spacing.md,
  },
  heroCard: {
    backgroundColor: Colors.card,
    borderRadius: Radius.lg,
    padding: Spacing.lg,
    gap: Spacing.md,
    ...Platform.select({
      web: { boxShadow: '0 6px 24px rgba(0,0,0,0.08)' },
      ios: { shadowColor: '#000', shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.08, shadowRadius: 18 },
      android: { elevation: 4 },
    }),
  },
  heroEyebrow: {
    ...Typography.small,
    color: Colors.textMuted,
    textTransform: 'uppercase',
    letterSpacing: 0.8,
  },
  heroTitle: {
    ...Typography.h1,
    color: Colors.text,
  },
  heroSubtitle: {
    ...Typography.body,
    color: Colors.textSecondary,
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
    backgroundColor: Colors.accentLight,
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
    backgroundColor: Colors.card,
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
    backgroundColor: Colors.background,
    borderRadius: Radius.pill,
    paddingHorizontal: Spacing.md,
    paddingVertical: 8,
  },
  heroReasonText: {
    ...Typography.captionBold,
    color: Colors.textSecondary,
  },
  sectionLabel: {
    ...Typography.captionBold,
    color: Colors.textSecondary,
    paddingHorizontal: Spacing.xs,
    marginTop: Spacing.xs,
  },
  matchCard: {
    backgroundColor: Colors.card,
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
    backgroundColor: Colors.accentLight,
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
    backgroundColor: Colors.success,
    borderWidth: 2,
    borderColor: Colors.card,
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
    color: Colors.text,
  },
  compatScore: {
    backgroundColor: Colors.accentLight,
    borderRadius: Radius.pill,
    paddingHorizontal: Spacing.sm,
    paddingVertical: 2,
  },
  compatText: {
    ...Typography.captionBold,
    color: Colors.accent,
  },
  reasonsRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 4,
  },
  reasonPill: {
    backgroundColor: Colors.background,
    borderRadius: Radius.pill,
    paddingHorizontal: Spacing.sm,
    paddingVertical: 2,
  },
  reasonPillText: {
    ...Typography.small,
    color: Colors.textSecondary,
  },
  msgButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: Colors.accentLight,
    alignItems: 'center',
    justifyContent: 'center',
  },
  msgButtonText: {
    fontSize: 18,
  },
});
