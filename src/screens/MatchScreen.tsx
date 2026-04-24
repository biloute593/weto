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
import { useWetoStore } from '../store/useWetoStore';

export function MatchScreen() {
  const { matches } = useWetoStore();

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
        {matches.map((match) => (
          <View key={match.id} style={styles.matchCard}>
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
            <TouchableOpacity style={styles.msgButton}>
              <Text style={styles.msgButtonText}>💬</Text>
            </TouchableOpacity>
          </View>
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
