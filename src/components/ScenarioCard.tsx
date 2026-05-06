import React, { useEffect, useRef, useState } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Platform,
  useWindowDimensions,
} from 'react-native';
import * as Haptics from 'expo-haptics';
import Animated, {
  Easing,
  runOnJS,
  useAnimatedStyle,
  useSharedValue,
  withDelay,
  withSpring,
  withTiming,
} from 'react-native-reanimated';
import { Gesture, GestureDetector, MouseButton } from 'react-native-gesture-handler';
import { Scenario } from '../types';
import { Colors, Spacing, Radius, Typography } from '../theme/colors';
import { useWetoStore } from '../store/useWetoStore';

interface ScenarioCardProps {
  scenario: Scenario;
  onShare: () => void;
  onSkip?: (scenarioId: string) => void;
  immersive?: boolean;
}

export function ScenarioCard({ scenario, onShare, onSkip, immersive = false }: ScenarioCardProps) {
  const { submitAnswer, nextScenario, answeredIds, startAnswer } = useWetoStore();
  const [selected, setSelected] = useState<number | null>(null);
  const transitionInFlight = useRef(false);
  const { height } = useWindowDimensions();
  const opacity = useSharedValue(0);
  const translateY = useSharedValue(24);
  const dragY = useSharedValue(0);
  const scale = useSharedValue(0.985);

  const isAnswered = answeredIds.has(scenario.id);

  useEffect(() => {
    setSelected(null);
    transitionInFlight.current = false;
    opacity.value = 0;
    translateY.value = 24;
    dragY.value = 0;
    scale.value = immersive ? 0.985 : 1;

    opacity.value = withTiming(1, {
      duration: 320,
      easing: Easing.out(Easing.cubic),
    });
    translateY.value = withSpring(0, {
      damping: 14,
      stiffness: 140,
    });
    scale.value = withSpring(1, {
      damping: 14,
      stiffness: 140,
    });
    startAnswer();
  }, [scenario.id]);

  const cardAnimatedStyle = useAnimatedStyle(() => ({
    opacity: opacity.value,
    transform: [{ translateY: translateY.value + dragY.value }, { scale: scale.value }],
  }));

  const triggerAdvance = (reason: 'answer' | 'skip') => {
    if (transitionInFlight.current) return;

    transitionInFlight.current = true;
    const callback = reason === 'skip'
      ? () => {
          if (onSkip) {
            onSkip(scenario.id);
            return;
          }
          nextScenario(scenario.id);
        }
      : () => nextScenario();

    const distance = reason === 'skip' ? -Math.min(height * 0.42, 260) : -Math.min(height * 0.18, 120);
    const delay = reason === 'skip' ? 0 : 420;

    opacity.value = withDelay(
      delay,
      withTiming(0, { duration: 220, easing: Easing.inOut(Easing.cubic) }, (finished) => {
        if (finished) {
          runOnJS(callback)();
        }
      })
    );
    translateY.value = withDelay(
      delay,
      withTiming(distance, { duration: 220, easing: Easing.inOut(Easing.cubic) })
    );
    dragY.value = withTiming(0, { duration: 160 });
    scale.value = withDelay(
      delay,
      withTiming(reason === 'skip' ? 0.92 : 0.97, { duration: 220, easing: Easing.inOut(Easing.cubic) })
    );
  };

  const handleSkip = () => {
    if (selected !== null || isAnswered || transitionInFlight.current) return;

    if (Platform.OS !== 'web') {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium).catch(() => undefined);
    }

    triggerAdvance('skip');
  };

  const panGesture = Gesture.Pan()
    .enabled(immersive && selected === null && !isAnswered)
    .mouseButton(MouseButton.LEFT)
    .onUpdate((event) => {
      if (event.translationY < 0) {
        dragY.value = event.translationY;
        scale.value = 1 - Math.min(Math.abs(event.translationY) / Math.max(height, 1) * 0.06, 0.06);
      } else {
        dragY.value = event.translationY * 0.18;
        scale.value = 1;
      }
    })
    .onEnd((event) => {
      const shouldSkip = event.translationY < -Math.min(height * 0.16, 120) || event.velocityY < -950;

      if (shouldSkip) {
        runOnJS(handleSkip)();
        return;
      }

      dragY.value = withSpring(0, { damping: 14, stiffness: 140 });
      scale.value = withSpring(1, { damping: 14, stiffness: 140 });
    });

  const handleChoice = (idx: number) => {
    if (isAnswered || selected !== null || transitionInFlight.current) return;

    if (Platform.OS !== 'web') {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light).catch(() => undefined);
    }

    setSelected(idx);
    submitAnswer(scenario.id, idx);
    triggerAdvance('answer');
  };

  const catColors = Colors[scenario.category];

  return (
    <GestureDetector gesture={panGesture}>
      <Animated.View
        style={[styles.card, immersive && styles.cardImmersive, cardAnimatedStyle]}
      >
        {immersive && <View style={styles.cardGlowPrimary} />}
        {immersive && <View style={styles.cardGlowSecondary} />}

        <View style={styles.cardHeader}>
          <View style={[styles.badge, { backgroundColor: catColors.bg }]}> 
            <Text style={[styles.badgeText, { color: catColors.text }]}> 
              {scenario.category}
            </Text>
          </View>
        </View>

        <View style={immersive ? styles.questionWrapImmersive : undefined}>
          <Text style={[styles.question, immersive && styles.questionImmersive]}>{scenario.question}</Text>
        </View>

        <View style={immersive ? styles.footerImmersive : undefined}>
          {immersive && (
            <TouchableOpacity style={styles.swipeHintRow} activeOpacity={0.78} onPress={handleSkip}>
              <Text style={styles.swipeHintArrow}>↑</Text>
              <Text style={styles.swipeHintText}>Swipe up pour passer</Text>
            </TouchableOpacity>
          )}

          <View style={[styles.choicesContainer, immersive && styles.choicesContainerImmersive]}>
            {scenario.choices.map((choice, idx) => {
              const isSelected = selected === idx;
              const isOther = selected !== null && selected !== idx;
              return (
                <View key={idx}>
                  <TouchableOpacity
                    style={[
                      styles.choiceButton,
                      immersive && styles.choiceButtonImmersive,
                      isSelected && styles.choiceButtonSelected,
                      isOther && styles.choiceButtonDimmed,
                    ]}
                    onPress={() => handleChoice(idx)}
                    activeOpacity={0.78}
                    disabled={selected !== null}
                  >
                    <Text
                      style={[
                        styles.choiceText,
                        immersive && styles.choiceTextImmersive,
                        isSelected && styles.choiceTextSelected,
                        isOther && styles.choiceTextDimmed,
                      ]}
                    >
                      {choice.label}
                    </Text>
                  </TouchableOpacity>
                </View>
              );
            })}
          </View>

          <TouchableOpacity style={[styles.shareButton, immersive && styles.shareButtonImmersive]} onPress={onShare}>
            <Text style={styles.shareIcon}>✈</Text>
            <Text style={styles.shareText}>Partager ce dilemme</Text>
          </TouchableOpacity>
        </View>
      </Animated.View>
    </GestureDetector>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: Colors.card,
    borderRadius: Radius.lg,
    padding: Spacing.lg,
    marginHorizontal: Spacing.md,
    marginVertical: Spacing.sm,
    flex: 1,
    ...Platform.select({
      ios: { shadowColor: '#000', shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.08, shadowRadius: 16 },
      android: { elevation: 4 },
      web: { boxShadow: '0 4px 24px rgba(0,0,0,0.08)' },
    }),
  },
  cardImmersive: {
    marginHorizontal: 0,
    marginVertical: 0,
    minHeight: '100%',
    paddingTop: Spacing.xl,
    paddingBottom: Spacing.lg,
    borderRadius: 32,
    overflow: 'hidden',
    justifyContent: 'space-between',
    borderWidth: 1,
    borderColor: 'rgba(0,122,255,0.08)',
  },
  cardGlowPrimary: {
    position: 'absolute',
    top: -52,
    right: -30,
    width: 180,
    height: 180,
    borderRadius: 90,
    backgroundColor: '#D9EBFF',
  },
  cardGlowSecondary: {
    position: 'absolute',
    bottom: -68,
    left: -24,
    width: 170,
    height: 170,
    borderRadius: 85,
    backgroundColor: '#FFF0D6',
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'flex-start',
    alignItems: 'center',
    marginBottom: Spacing.md,
  },
  badge: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: Radius.pill,
  },
  badgeText: {
    ...Typography.captionBold,
  },
  question: {
    ...Typography.h1,
    color: Colors.text,
    marginBottom: Spacing.xl,
    lineHeight: 32,
  },
  questionWrapImmersive: {
    flex: 1,
    justifyContent: 'center',
    paddingVertical: Spacing.lg,
  },
  questionImmersive: {
    fontSize: 30,
    lineHeight: 40,
    letterSpacing: -0.8,
    marginBottom: 0,
  },
  choicesContainer: {
    gap: Spacing.md,
  },
  choicesContainerImmersive: {
    gap: 12,
  },
  choiceButton: {
    backgroundColor: Colors.buttonNeutral,
    borderRadius: Radius.pill,
    paddingVertical: 18,
    paddingHorizontal: Spacing.lg,
    alignItems: 'center',
    borderWidth: 1.5,
    borderColor: Colors.border,
  },
  choiceButtonImmersive: {
    backgroundColor: 'rgba(255,255,255,0.92)',
    paddingVertical: 20,
  },
  choiceButtonSelected: {
    backgroundColor: Colors.accent,
    borderColor: Colors.accent,
  },
  choiceButtonDimmed: {
    opacity: 0.4,
  },
  choiceText: {
    ...Typography.body,
    color: Colors.text,
    textAlign: 'center',
  },
  choiceTextImmersive: {
    fontSize: 17,
    lineHeight: 24,
  },
  choiceTextSelected: {
    color: Colors.white,
    fontWeight: '600',
  },
  choiceTextDimmed: {
    color: Colors.textMuted,
  },
  shareButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 40,
    gap: Spacing.xs,
  },
  shareIcon: {
    fontSize: 18,
    color: Colors.textMuted,
  },
  shareText: {
    ...Typography.caption,
    color: Colors.textMuted,
  },
  footerImmersive: {
    gap: Spacing.md,
  },
  shareButtonImmersive: {
    marginTop: 0,
    alignSelf: 'center',
  },
  swipeHintRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: Spacing.xs,
    marginBottom: Spacing.xs,
  },
  swipeHintArrow: {
    ...Typography.bodyBold,
    color: Colors.accent,
  },
  swipeHintText: {
    ...Typography.captionBold,
    color: Colors.textSecondary,
  },
});
