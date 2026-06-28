import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  Platform,
  Dimensions,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import Animated, {
  FadeIn,
  FadeInDown,
  FadeInUp,
  ZoomIn,
  SlideInLeft,
  SlideInRight,
  useSharedValue,
  useAnimatedStyle,
  withRepeat,
  withTiming,
  Easing,
} from 'react-native-reanimated';
import { AppButton } from './AppButton';
import { Colors, Spacing, Radius, Typography } from '../theme/colors';
import { MatchProfile } from '../types';
import { useWetoStore } from '../store/useWetoStore';
import { getAvatarMonogram } from '../utils';

const { width } = Dimensions.get('window');

interface MatchModalProps {
  match: MatchProfile;
  onDismiss: () => void;
  onMessage: () => void;
}

export function MatchModal({ match, onDismiss, onMessage }: MatchModalProps) {
  const { userAvatar, userName } = useWetoStore();

  const pulseScale = useSharedValue(1);
  React.useEffect(() => {
    pulseScale.value = withRepeat(
      withTiming(1.15, { duration: 1300, easing: Easing.inOut(Easing.ease) }),
      -1,
      true
    );
  }, []);

  const pulseStyle = useAnimatedStyle(() => ({
    transform: [{ scale: pulseScale.value }],
    opacity: 0.28,
  }));

  const confettiIcons: Array<keyof typeof Ionicons.glyphMap> = [
    'sparkles-outline',
    'ellipse-outline',
    'star-outline',
    'diamond-outline',
    'planet-outline',
    'flash-outline',
  ];

  const confettiColors = ['#0D6EFD', '#7CCBFF', '#FFD700', '#2C9B66', '#FF9500'];

  return (
    <Animated.View entering={FadeIn.duration(220)} style={styles.backdrop}>
      <Animated.View entering={ZoomIn.springify().damping(16)} style={styles.modal}>
        {/* Confetti */}
        <View style={styles.confettiContainer}>
          {confettiIcons.map((icon, idx) => (
            <View
              key={idx}
              style={[
                styles.confettiSlot,
                {
                  left: 30 + idx * 45,
                  transform: [{ rotate: `${idx % 2 === 0 ? '-' : ''}${8 + idx * 4}deg` }],
                },
              ]}
            >
              <Animated.View entering={FadeInUp.delay(idx * 80).duration(800)} style={styles.confetti}>
                <Ionicons name={icon} size={16} color={confettiColors[idx % confettiColors.length]} />
              </Animated.View>
            </View>
          ))}
        </View>

        {/* Match header */}
        <Animated.View entering={FadeInDown.delay(80).duration(280)} style={styles.matchEmoji}>
          <Ionicons name="heart" size={30} color="#0D6EFD" />
        </Animated.View>
        <Animated.Text entering={FadeInDown.delay(120).duration(280)} style={styles.matchTitle}>It's a match !</Animated.Text>
        <Animated.Text entering={FadeInDown.delay(160).duration(280)} style={styles.matchSubtitle}>
          Vous avez des réactions très compatibles.
        </Animated.Text>

        {/* Avatars */}
        <View style={styles.avatarsRow}>
          {/* Glowing Pulsing Halo */}
          <Animated.View style={[styles.glowingHalo, pulseStyle]} />

          {/* Left Avatar (Me) - Slide from left */}
          <Animated.View entering={SlideInLeft.delay(100).duration(500).springify().damping(12)} style={styles.avatarCircle}>
            <Text style={styles.avatarEmoji}>{getAvatarMonogram(userName, userAvatar)}</Text>
          </Animated.View>

          {/* Heart Badge in the middle - Pop in */}
          <Animated.View entering={ZoomIn.delay(500).duration(300)} style={styles.heartBadge}>
            <Ionicons name="heart" size={16} color="#0D6EFD" />
          </Animated.View>

          {/* Right Avatar (Match) - Slide from right */}
          <Animated.View entering={SlideInRight.delay(100).duration(500).springify().damping(12)} style={styles.avatarCircle}>
            <Text style={styles.avatarEmoji}>{getAvatarMonogram(match.name, match.avatar)}</Text>
          </Animated.View>
        </View>

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
          <AppButton title="Envoyer un message" onPress={onMessage} fullWidth />
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
    width: 18,
    height: 18,
    alignItems: 'center',
    justifyContent: 'center',
  },
  matchEmoji: {
    width: 56,
    height: 56,
    borderRadius: 28,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'rgba(124,203,255,0.18)',
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
    justifyContent: 'center',
    marginBottom: Spacing.lg,
    position: 'relative',
  },
  glowingHalo: {
    position: 'absolute',
    width: 144,
    height: 84,
    borderRadius: 42,
    backgroundColor: 'rgba(13, 110, 253, 0.12)',
    borderWidth: 2,
    borderColor: '#0D6EFD',
    zIndex: 0,
  },
  avatarCircle: {
    width: 72,
    height: 72,
    borderRadius: 36,
    backgroundColor: Colors.accentLight,
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 2,
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
    zIndex: 3,
    ...Platform.select({
      web: { boxShadow: '0 2px 8px rgba(0,0,0,0.1)' },
    }),
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
