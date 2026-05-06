import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  Platform,
  Dimensions,
} from 'react-native';
import Animated, { FadeIn, FadeInDown, FadeInUp, ZoomIn } from 'react-native-reanimated';
import { AppButton } from './AppButton';
import { Colors, Spacing, Radius, Typography } from '../theme/colors';
import { MatchProfile } from '../types';
import { useWetoStore } from '../store/useWetoStore';

const { width } = Dimensions.get('window');

interface MatchModalProps {
  match: MatchProfile;
  onDismiss: () => void;
  onMessage: () => void;
}

export function MatchModal({ match, onDismiss, onMessage }: MatchModalProps) {
  const { userAvatar, userName } = useWetoStore();

  const confettiEmojis = ['🎉', '✨', '💙', '🎊', '⭐', '💫'];

  return (
    <Animated.View entering={FadeIn.duration(220)} style={styles.backdrop}>
      <Animated.View entering={ZoomIn.springify().damping(16)} style={styles.modal}>
        {/* Confetti */}
        <View style={styles.confettiContainer}>
          {confettiEmojis.map((emoji, idx) => (
            <View
              key={idx}
              style={[
                styles.confettiSlot,
                {
                  left: 40 + idx * 30,
                  transform: [{ rotate: `${idx % 2 === 0 ? '-' : ''}${8 + idx * 4}deg` }],
                },
              ]}
            >
              <Animated.Text entering={FadeInUp.delay(idx * 70).duration(500)} style={styles.confetti}>
                {emoji}
              </Animated.Text>
            </View>
          ))}
        </View>

        {/* Match header */}
        <Animated.Text entering={FadeInDown.delay(80).duration(280)} style={styles.matchEmoji}>💙</Animated.Text>
        <Animated.Text entering={FadeInDown.delay(120).duration(280)} style={styles.matchTitle}>It's a match !</Animated.Text>
        <Animated.Text entering={FadeInDown.delay(160).duration(280)} style={styles.matchSubtitle}>
          Vous avez des réactions très compatibles.
        </Animated.Text>

        {/* Avatars */}
        <Animated.View entering={FadeInDown.delay(220).duration(320)} style={styles.avatarsRow}>
          <View style={styles.avatarCircle}>
            <Text style={styles.avatarEmoji}>{userAvatar}</Text>
          </View>
          <View style={styles.heartBadge}>
            <Text style={styles.heartText}>💙</Text>
          </View>
          <View style={styles.avatarCircle}>
            <Text style={styles.avatarEmoji}>{match.avatar}</Text>
          </View>
        </Animated.View>

        {/* Score */}
        <Animated.View entering={FadeInDown.delay(280).duration(320)} style={styles.scoreRow}>
          <Text style={styles.scoreName}>{userName} × {match.name}</Text>
          <Text style={styles.scoreValue}>{match.compatibilityScore}%</Text>
        </Animated.View>

        {/* Compatibility reasons */}
        <View style={styles.reasonsContainer}>
          {match.compatibilityReasons.map((reason, idx) => (
            <Animated.View key={idx} entering={FadeInDown.delay(340 + idx * 60).duration(280)} style={styles.reasonRow}>
              <Text style={styles.reasonIcon}>✓</Text>
              <Text style={styles.reasonText}>{reason}</Text>
            </Animated.View>
          ))}
        </View>

        {/* CTA buttons */}
        <Animated.View entering={FadeInDown.delay(520).duration(320)} style={styles.buttonWrap}>
          <AppButton title="Envoyer un message 💬" onPress={onMessage} fullWidth />
        </Animated.View>
        <Animated.View entering={FadeInDown.delay(580).duration(320)} style={styles.buttonWrap}>
          <AppButton title="Continuer à jouer" onPress={onDismiss} variant="secondary" fullWidth />
        </Animated.View>
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
  confettiSlot: {
    position: 'absolute',
    top: 20,
  },
  confetti: {
    fontSize: 20,
  },
  matchEmoji: {
    fontSize: 48,
    marginBottom: Spacing.sm,
  },
  matchTitle: {
    ...Typography.title,
    color: Colors.text,
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
  scoreRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    width: '100%',
    backgroundColor: Colors.accentLight,
    borderRadius: Radius.md,
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.sm,
    marginBottom: Spacing.md,
  },
  scoreName: {
    ...Typography.bodyBold,
    color: Colors.accent,
  },
  scoreValue: {
    ...Typography.h1,
    color: Colors.accent,
  },
  reasonsContainer: {
    width: '100%',
    gap: Spacing.sm,
    marginBottom: Spacing.lg,
  },
  reasonRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.sm,
  },
  reasonIcon: {
    fontSize: 14,
    color: Colors.success,
    fontWeight: '700',
  },
  reasonText: {
    ...Typography.body,
    color: Colors.text,
  },
  buttonWrap: {
    width: '100%',
  },
});
