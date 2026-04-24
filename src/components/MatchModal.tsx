import React, { useEffect, useRef } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Animated,
  Platform,
  Dimensions,
} from 'react-native';
import { Colors, Spacing, Radius, Typography } from '../theme/colors';
import { MatchProfile } from '../store/useWetoStore';

const { width } = Dimensions.get('window');

interface MatchModalProps {
  match: MatchProfile;
  onDismiss: () => void;
  onMessage: () => void;
}

const REASON_ICONS: Record<string, string> = {
  'Humour similaire': '😄',
  'Valeurs alignées': '✅',
  'Style relationnel compatible': '💜',
  'Vision du risque proche': '🎯',
  'Style de conflit complémentaire': '🤝',
  'Réactivité émotionnelle similaire': '💙',
  'Humor Style +++': '😂',
  'Même approche sociale': '🌍',
};

export function MatchModal({ match, onDismiss, onMessage }: MatchModalProps) {
  const backdropAnim = useRef(new Animated.Value(0)).current;
  const scaleAnim = useRef(new Animated.Value(0.7)).current;
  const confettiAnims = Array.from({ length: 6 }, () => ({
    y: useRef(new Animated.Value(0)).current,
    x: useRef(new Animated.Value(0)).current,
    opacity: useRef(new Animated.Value(1)).current,
  }));

  useEffect(() => {
    Animated.parallel([
      Animated.timing(backdropAnim, { toValue: 1, duration: 300, useNativeDriver: true }),
      Animated.spring(scaleAnim, { toValue: 1, tension: 70, friction: 8, useNativeDriver: true }),
    ]).start();

    // Confetti animation
    confettiAnims.forEach((anim, idx) => {
      const delay = idx * 80;
      Animated.sequence([
        Animated.delay(delay),
        Animated.parallel([
          Animated.timing(anim.y, { toValue: -60 - idx * 10, duration: 600, useNativeDriver: true }),
          Animated.timing(anim.x, { toValue: (idx % 2 === 0 ? 1 : -1) * (20 + idx * 8), duration: 600, useNativeDriver: true }),
          Animated.timing(anim.opacity, { toValue: 0, duration: 600, useNativeDriver: true }),
        ]),
      ]).start();
    });
  }, []);

  const confettiEmojis = ['🎉', '✨', '💙', '🎊', '⭐', '💫'];

  return (
    <Animated.View style={[styles.backdrop, { opacity: backdropAnim }]}>
      <Animated.View style={[styles.modal, { transform: [{ scale: scaleAnim }] }]}>
        {/* Confetti */}
        <View style={styles.confettiContainer}>
          {confettiAnims.map((anim, idx) => (
            <Animated.Text
              key={idx}
              style={[
                styles.confetti,
                {
                  opacity: anim.opacity,
                  transform: [{ translateY: anim.y }, { translateX: anim.x }],
                  left: 40 + idx * 30,
                },
              ]}
            >
              {confettiEmojis[idx]}
            </Animated.Text>
          ))}
        </View>

        {/* Match header */}
        <Text style={styles.matchTitle}>C'est un match !</Text>
        <Text style={styles.matchSubtitle}>
          Vous avez des réactions très compatibles.
        </Text>

        {/* Avatars */}
        <View style={styles.avatarsRow}>
          <View style={styles.avatarCircle}>
            <Text style={styles.avatarEmoji}>😊</Text>
          </View>
          <View style={styles.heartBadge}>
            <Text style={styles.heartText}>💙</Text>
          </View>
          <View style={styles.avatarCircle}>
            <Text style={styles.avatarEmoji}>{match.avatar}</Text>
          </View>
        </View>

        {/* Compatibility reasons */}
        <View style={styles.reasonsContainer}>
          {match.compatibilityReasons.map((reason, idx) => (
            <View key={idx} style={styles.reasonRow}>
              <Text style={styles.reasonIcon}>
                {REASON_ICONS[reason] ?? '✓'}
              </Text>
              <Text style={styles.reasonText}>{reason}</Text>
            </View>
          ))}
        </View>

        {/* Compatibility score */}
        <View style={styles.scoreRow}>
          <Text style={styles.scoreLabel}>Compatibilité</Text>
          <Text style={styles.scoreValue}>{match.compatibilityScore}%</Text>
        </View>

        {/* CTA buttons */}
        <TouchableOpacity style={styles.primaryButton} onPress={onMessage}>
          <Text style={styles.primaryButtonText}>Envoyer un message</Text>
        </TouchableOpacity>

        <TouchableOpacity style={styles.secondaryButton} onPress={onDismiss}>
          <Text style={styles.secondaryButtonText}>Voir le profil</Text>
        </TouchableOpacity>
      </Animated.View>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  backdrop: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: Colors.overlay,
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 999,
  },
  modal: {
    backgroundColor: Colors.card,
    borderRadius: Radius.lg,
    padding: Spacing.xl,
    width: Math.min(width - 48, 360),
    alignItems: 'center',
    ...Platform.select({
      ios: { shadowColor: '#000', shadowOffset: { width: 0, height: 8 }, shadowOpacity: 0.2, shadowRadius: 24 },
      android: { elevation: 12 },
      web: { boxShadow: '0 8px 40px rgba(0,0,0,0.2)' },
    }),
  },
  confettiContainer: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    height: 60,
    overflow: 'hidden',
  },
  confetti: {
    position: 'absolute',
    top: 20,
    fontSize: 20,
  },
  matchTitle: {
    ...Typography.title,
    color: Colors.text,
    marginTop: Spacing.md,
    textAlign: 'center',
  },
  matchSubtitle: {
    ...Typography.body,
    color: Colors.textSecondary,
    textAlign: 'center',
    marginTop: Spacing.xs,
    marginBottom: Spacing.lg,
  },
  avatarsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: Spacing.lg,
  },
  avatarCircle: {
    width: 72,
    height: 72,
    borderRadius: 36,
    backgroundColor: Colors.accentLight,
    alignItems: 'center',
    justifyContent: 'center',
  },
  avatarEmoji: {
    fontSize: 36,
  },
  heartBadge: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: Colors.card,
    alignItems: 'center',
    justifyContent: 'center',
    marginHorizontal: -8,
    zIndex: 1,
    ...Platform.select({
      web: { boxShadow: '0 2px 8px rgba(0,0,0,0.1)' },
    }),
  },
  heartText: {
    fontSize: 18,
  },
  reasonsContainer: {
    width: '100%',
    gap: Spacing.sm,
    marginBottom: Spacing.md,
  },
  reasonRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.sm,
  },
  reasonIcon: {
    fontSize: 18,
  },
  reasonText: {
    ...Typography.body,
    color: Colors.text,
  },
  scoreRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    width: '100%',
    backgroundColor: Colors.accentLight,
    borderRadius: Radius.md,
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.sm,
    marginBottom: Spacing.lg,
  },
  scoreLabel: {
    ...Typography.bodyBold,
    color: Colors.accent,
  },
  scoreValue: {
    ...Typography.h1,
    color: Colors.accent,
  },
  primaryButton: {
    backgroundColor: Colors.accent,
    borderRadius: Radius.pill,
    width: '100%',
    paddingVertical: Spacing.md,
    alignItems: 'center',
    marginBottom: Spacing.sm,
  },
  primaryButtonText: {
    ...Typography.bodyBold,
    color: Colors.white,
  },
  secondaryButton: {
    paddingVertical: Spacing.sm,
    alignItems: 'center',
  },
  secondaryButtonText: {
    ...Typography.body,
    color: Colors.textSecondary,
  },
});
