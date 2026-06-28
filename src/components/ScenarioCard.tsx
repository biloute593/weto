import React, { useEffect, useMemo, useRef, useState } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Platform,
  PanResponder,
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
  FadeInUp,
  FadeOut,
} from 'react-native-reanimated';
import { Ionicons } from '@expo/vector-icons';
import { Scenario } from '../types';
import { SCENARIO_LEVEL_META } from '../data/scenarios';
import { Colors, Spacing, Radius, Typography, getThemeColors } from '../theme/colors';
import { useWetoStore } from '../store/useWetoStore';
import { TRAIT_LABELS } from '../utils';

interface ScenarioCardProps {
  scenario: Scenario;
  onShare: () => void;
  onSkip?: (scenarioId: string) => void;
  onPrev?: () => void;
  onOpenChat?: () => void;
  immersive?: boolean;
}

export function ScenarioCard({ scenario, onShare, onSkip, onPrev, onOpenChat, immersive = false }: ScenarioCardProps) {
  const { themeMode, submitAnswer, nextScenario, answeredIds, startAnswer, optimisticMarkAnswered } = useWetoStore();
  const p = getThemeColors(themeMode);
  const styles = useMemo(() => createStyles(p), [themeMode]);
  const [selected, setSelected] = useState<number | null>(null);
  const [impactedTraits, setImpactedTraits] = useState<string[]>([]);

  // Shared values for micro-interactions on button press
  const buttonScale0 = useSharedValue(1);
  const buttonScale1 = useSharedValue(1);
  const buttonScale2 = useSharedValue(1);
  const buttonScale3 = useSharedValue(1);
  const buttonScales = [buttonScale0, buttonScale1, buttonScale2, buttonScale3];

  const animatedButtonStyle0 = useAnimatedStyle(() => ({ transform: [{ scale: buttonScale0.value }] }));
  const animatedButtonStyle1 = useAnimatedStyle(() => ({ transform: [{ scale: buttonScale1.value }] }));
  const animatedButtonStyle2 = useAnimatedStyle(() => ({ transform: [{ scale: buttonScale2.value }] }));
  const animatedButtonStyle3 = useAnimatedStyle(() => ({ transform: [{ scale: buttonScale3.value }] }));
  const animatedButtonStyles = [animatedButtonStyle0, animatedButtonStyle1, animatedButtonStyle2, animatedButtonStyle3];

  const animateButtonPress = (idx: number) => {
    if (idx >= 0 && idx < 4) {
      buttonScales[idx].value = withTiming(0.95, { duration: 60 }, () => {
        buttonScales[idx].value = withSpring(1, { damping: 12, stiffness: 150 });
      });
    }
  };

  const transitionInFlight = useRef(false);
  const gestureAxis = useRef<'horizontal' | 'vertical' | null>(null);
  const mouseGesture = useRef({
    active: false,
    dragging: false,
    startX: 0,
    startY: 0,
  });
  const suppressNextClick = useRef(false);
  const { height, width } = useWindowDimensions();
  // Responsive density: compact for small phones (≤720px), medium for mid-range (≤820px)
  const isSmallScreen = height < 720;
  const isMediumScreen = height >= 720 && height < 820;
  const contentOpacity = useSharedValue(0);
  const dragX = useSharedValue(0);
  const contentY = useSharedValue(28);
  const scale = useSharedValue(1);

  const isAnswered = answeredIds.has(scenario.id);
  const swipeThresholdX = Math.min(Math.max(width * 0.12, 44), 60);
  const swipeThresholdY = Math.min(Math.max(height * 0.03, 18), 28);
  const swipeActivationDistance = immersive ? 6 : 8;
  const swipeAxisLockRatio = 1.1;

  useEffect(() => {
    setSelected(null);
    setImpactedTraits([]);
    buttonScale0.value = 1;
    buttonScale1.value = 1;
    buttonScale2.value = 1;
    buttonScale3.value = 1;
    transitionInFlight.current = false;
    gestureAxis.current = null;
    contentOpacity.value = 0;
    dragX.value = 0;
    contentY.value = 28;
    scale.value = 1;

    contentOpacity.value = withTiming(1, {
      duration: 280,
      easing: Easing.out(Easing.cubic),
    });
    contentY.value = withSpring(0, {
      damping: 14,
      stiffness: 120,
    });
    startAnswer();
  }, [scenario.id]);

  const cardAnimatedStyle = useAnimatedStyle(() => ({
    transform: [
      { translateX: dragX.value },
      { rotate: `${dragX.value / 24}deg` },
      { scale: scale.value },
    ],
  }));

  const contentAnimatedStyle = useAnimatedStyle(() => ({
    opacity: contentOpacity.value,
    transform: [{ translateY: contentY.value }],
  }));

  const resetCardPosition = () => {
    gestureAxis.current = null;
    dragX.value = withSpring(0, { damping: 16, stiffness: 170 });
    contentY.value = withSpring(0, { damping: 16, stiffness: 170 });
    scale.value = withSpring(1, { damping: 16, stiffness: 170 });
  };

  const unlockGesture = () => {
    transitionInFlight.current = false;
    gestureAxis.current = null;
  };

  const resolveGestureAxis = (dx: number, dy: number) => {
    const absX = Math.abs(dx);
    const absY = Math.abs(dy);

    if (Math.max(absX, absY) < swipeActivationDistance) {
      return gestureAxis.current;
    }

    if (absX > absY * swipeAxisLockRatio) {
      return 'horizontal' as const;
    }

    if (absY > absX * swipeAxisLockRatio) {
      return 'vertical' as const;
    }

    return gestureAxis.current;
  };

  const applyGestureTransform = (dx: number, dy: number) => {
    const nextAxis = resolveGestureAxis(dx, dy);

    if (!gestureAxis.current && nextAxis) {
      gestureAxis.current = nextAxis;
    }

    const activeAxis = gestureAxis.current;
    const absX = Math.abs(dx);
    const absY = Math.abs(dy);

    if (activeAxis === 'horizontal') {
      dragX.value = dx;
      scale.value = 1 - Math.min(absX / Math.max(width, 1) * 0.05, 0.05);
      return;
    }

    if (activeAxis === 'vertical') {
      dragX.value = dx * 0.02;
      contentY.value = dy;
      return;
    }

    dragX.value = dx * 0.015;
    contentY.value = dy * 0.015;
  };

  const finalizeGesture = (dx: number, dy: number, velocityX = 0, velocityY = 0) => {
    const activeAxis = gestureAxis.current ?? resolveGestureAxis(dx, dy);
    const absX = Math.abs(dx);
    const absY = Math.abs(dy);
    gestureAxis.current = null;

    if (activeAxis === 'horizontal' && (absX > swipeThresholdX || Math.abs(velocityX) > 0.5)) {
      if (dx > 0) {
        handleOpenChat();
      } else {
        handleShareGesture();
      }
      return;
    }

    if (activeAxis === 'vertical' && (absY > swipeThresholdY || Math.abs(velocityY) > 0.18)) {
      if (dy < 0) {
        // Swipe UP — advance to next dilemma
        handleVerticalAdvance(-1);
      } else {
        // Swipe DOWN — go to previous dilemma
        handlePrev();
      }
      return;
    }

    resetCardPosition();
  };

  const stopMouseGesture = () => {
    mouseGesture.current.active = false;
    mouseGesture.current.dragging = false;
  };

  const getEventCoordinates = (event: any) => {
    const nativeEvent = event?.nativeEvent ?? event;
    return {
      x: nativeEvent?.pageX ?? nativeEvent?.clientX ?? 0,
      y: nativeEvent?.pageY ?? nativeEvent?.clientY ?? 0,
    };
  };

  const triggerLateralAction = (direction: -1 | 1, callback: () => void) => {
    if (transitionInFlight.current) return;

    transitionInFlight.current = true;
    gestureAxis.current = 'horizontal';
    const nudge = Math.min(width * 0.18, 84) * direction;

    dragX.value = withTiming(nudge, { duration: 120, easing: Easing.out(Easing.cubic) }, (finished) => {
      if (!finished) {
        runOnJS(unlockGesture)();
        return;
      }

      runOnJS(callback)();
      dragX.value = withSpring(0, { damping: 16, stiffness: 170 });
      contentY.value = withSpring(0, { damping: 16, stiffness: 170 });
      scale.value = withSpring(1, { damping: 16, stiffness: 170 });
      runOnJS(unlockGesture)();
    });
    contentY.value = withTiming(0, { duration: 120, easing: Easing.out(Easing.cubic) });
    scale.value = withTiming(0.982, { duration: 120, easing: Easing.out(Easing.cubic) });
  };

  const triggerAdvance = (reason: 'answer' | 'skip' | 'prev') => {
    if (transitionInFlight.current) return;

    transitionInFlight.current = true;
    const callback = reason === 'prev'
      ? () => { if (onPrev) onPrev(); }
      : reason === 'skip'
        ? () => {
            if (onSkip) {
              onSkip(scenario.id);
              return;
            }
            nextScenario(scenario.id);
          }
        : () => nextScenario();

    const exitY = reason === 'prev' ? 60 : -60;
    const delay = reason === 'answer' ? 420 : 0;

    contentOpacity.value = withDelay(
      delay,
      withTiming(0, { duration: 200, easing: Easing.inOut(Easing.cubic) }, (finished) => {
        if (finished) {
          runOnJS(callback)();
        }
      })
    );
    contentY.value = withDelay(
      delay,
      withTiming(exitY, { duration: 200, easing: Easing.inOut(Easing.cubic) })
    );
    dragX.value = withTiming(0, { duration: 160 });
    scale.value = withDelay(
      delay,
      withTiming(reason === 'answer' ? 0.97 : 0.98, { duration: 200, easing: Easing.inOut(Easing.cubic) })
    );
  };

  const handleSkip = () => {
    if (selected !== null || isAnswered || transitionInFlight.current) return;

    if (Platform.OS !== 'web') {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium).catch(() => undefined);
    }

    triggerAdvance('skip');
  };

  const handleVerticalAdvance = (_direction: -1 | 1) => {
    if (selected !== null || isAnswered || transitionInFlight.current) return;

    if (Platform.OS !== 'web') {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium).catch(() => undefined);
    }

    triggerAdvance('skip');
  };

  const handlePrev = () => {
    if (transitionInFlight.current) return;

    if (Platform.OS !== 'web') {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light).catch(() => undefined);
    }

    triggerAdvance('prev');
  };

  const handleOpenChat = () => {
    if (!onOpenChat) {
      resetCardPosition();
      return;
    }

    if (Platform.OS !== 'web') {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light).catch(() => undefined);
    }

    triggerLateralAction(1, onOpenChat);
  };

  const handleShareGesture = () => {
    if (Platform.OS !== 'web') {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light).catch(() => undefined);
    }

    triggerLateralAction(-1, onShare);
  };

  const handleChoice = (idx: number) => {
    if (isAnswered || selected !== null || transitionInFlight.current) return;

    if (Platform.OS !== 'web') {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light).catch(() => undefined);
    }

    animateButtonPress(idx);
    setSelected(idx);

    const choice = scenario.choices[idx];
    if (choice && choice.traitDeltas) {
      const traitChanges = Object.entries(choice.traitDeltas)
        .filter(([_, val]) => val !== 0)
        .map(([key, val]) => {
          const label = TRAIT_LABELS[key as keyof typeof TRAIT_LABELS] || key;
          const sign = (val ?? 0) > 0 ? '+' : '';
          return `${label} ${sign}${val}%`;
        });
      setImpactedTraits(traitChanges);
    }

    // Optimistic: advance immediately without waiting for network
    optimisticMarkAnswered(scenario.id);
    triggerAdvance('answer');
    // Background sync – fire and forget
    submitAnswer(scenario.id, idx).catch(() => undefined);
  };

  const webMouseHandlers = useMemo(() => {
    if (Platform.OS !== 'web' || !immersive) {
      return {};
    }

    return {
      onMouseDownCapture: (event: any) => {
        if (selected !== null || isAnswered || transitionInFlight.current) return;
        if ((event?.nativeEvent?.button ?? event?.button ?? 0) !== 0) return;

        const { x, y } = getEventCoordinates(event);
        mouseGesture.current.active = true;
        mouseGesture.current.dragging = false;
        mouseGesture.current.startX = x;
        mouseGesture.current.startY = y;
        gestureAxis.current = null;
      },
      onMouseMoveCapture: (event: any) => {
        if (!mouseGesture.current.active || selected !== null || isAnswered || transitionInFlight.current) return;

        const { x, y } = getEventCoordinates(event);
        const dx = x - mouseGesture.current.startX;
        const dy = y - mouseGesture.current.startY;

        if (!mouseGesture.current.dragging && Math.max(Math.abs(dx), Math.abs(dy)) < swipeActivationDistance) {
          return;
        }

        mouseGesture.current.dragging = true;
        suppressNextClick.current = true;
        event.preventDefault?.();
        applyGestureTransform(dx, dy);
      },
      onMouseUpCapture: (event: any) => {
        if (!mouseGesture.current.active) return;

        const { x, y } = getEventCoordinates(event);
        const dx = x - mouseGesture.current.startX;
        const dy = y - mouseGesture.current.startY;
        const didDrag = mouseGesture.current.dragging;

        stopMouseGesture();

        if (!didDrag) {
          gestureAxis.current = null;
          return;
        }

        event.preventDefault?.();
        finalizeGesture(dx, dy);
      },
      onMouseLeave: () => {
        if (!mouseGesture.current.active) return;
        stopMouseGesture();
        gestureAxis.current = null;
        resetCardPosition();
      },
      onClickCapture: (event: any) => {
        if (!suppressNextClick.current) {
          return;
        }

        suppressNextClick.current = false;
        event.preventDefault?.();
        event.stopPropagation?.();
      },
    };
  }, [immersive, isAnswered, selected, swipeActivationDistance]);

  const webPanResponder = useMemo(() => {
    return PanResponder.create({
      onStartShouldSetPanResponder: () => false,
      onStartShouldSetPanResponderCapture: () => false,
      onMoveShouldSetPanResponder: (_event, gestureState) => (
        immersive &&
        selected === null &&
        !isAnswered &&
        (Math.abs(gestureState.dy) > 6 || Math.abs(gestureState.dx) > 6)
      ),
      onMoveShouldSetPanResponderCapture: (_event, gestureState) => (
        immersive &&
        selected === null &&
        !isAnswered &&
        (Math.abs(gestureState.dy) > 10 || Math.abs(gestureState.dx) > 10)
      ),
      onPanResponderMove: (_event, gestureState) => {
        applyGestureTransform(gestureState.dx, gestureState.dy);
      },
      onPanResponderRelease: (_event, gestureState) => {
        finalizeGesture(gestureState.dx, gestureState.dy, gestureState.vx, gestureState.vy);
      },
      onPanResponderTerminate: () => {
        gestureAxis.current = null;
        stopMouseGesture();
        resetCardPosition();
      },
      onPanResponderTerminationRequest: () => false,
    });
  }, [immersive, selected, isAnswered, height, width, onOpenChat, swipeThresholdX, swipeThresholdY]);

  const overlayRightStyle = useAnimatedStyle(() => {
    const ratio = Math.min(Math.max(dragX.value / (swipeThresholdX * 1.15), 0), 1);
    const curvedRatio = ratio * ratio;
    return {
      opacity: curvedRatio * 0.96,
      transform: [{ scale: 0.6 + curvedRatio * 0.45 }],
    };
  });

  const overlayLeftStyle = useAnimatedStyle(() => {
    const ratio = Math.min(Math.max(-dragX.value / (swipeThresholdX * 1.15), 0), 1);
    const curvedRatio = ratio * ratio;
    return {
      opacity: curvedRatio * 0.96,
      transform: [{ scale: 0.6 + curvedRatio * 0.45 }],
    };
  });

  const overlayUpStyle = useAnimatedStyle(() => {
    const ratio = Math.min(Math.max(-contentY.value / (swipeThresholdY * 1.15), 0), 1);
    const curvedRatio = ratio * ratio;
    return {
      opacity: curvedRatio * 0.96,
      transform: [{ scale: 0.6 + curvedRatio * 0.45 }],
    };
  });

  const overlayDownStyle = useAnimatedStyle(() => {
    const ratio = Math.min(Math.max(contentY.value / (swipeThresholdY * 1.15), 0), 1);
    const curvedRatio = ratio * ratio;
    return {
      opacity: curvedRatio * 0.96,
      transform: [{ scale: 0.6 + curvedRatio * 0.45 }],
    };
  });

  const CATEGORY_THEME = useMemo(() => {
    const isDark = themeMode === 'dark';
    return {
      Relationship: {
        cardBg: isDark ? '#140816' : '#FFF5F7',
        glowA: isDark ? 'rgba(236,72,153,0.12)' : 'rgba(244,63,94,0.04)',
        border: isDark ? 'rgba(236,72,153,0.32)' : 'rgba(244,63,94,0.16)',
        tint: isDark ? '#FF6FA5' : '#E11D48',
        icon: 'heart-outline',
      },
      Social: {
        cardBg: isDark ? '#060D1E' : '#F0F9FF',
        glowA: isDark ? 'rgba(56,189,248,0.12)' : 'rgba(14,165,233,0.04)',
        border: isDark ? 'rgba(56,189,248,0.32)' : 'rgba(14,165,233,0.16)',
        tint: isDark ? '#38BDF8' : '#0284C7',
        icon: 'people-outline',
      },
      Absurd: {
        cardBg: isDark ? '#0D061F' : '#FAF5FF',
        glowA: isDark ? 'rgba(168,85,247,0.12)' : 'rgba(168,85,247,0.04)',
        border: isDark ? 'rgba(168,85,247,0.32)' : 'rgba(168,85,247,0.16)',
        tint: isDark ? '#C084FC' : '#7E22CE',
        icon: 'sparkles-outline',
      },
      Values: {
        cardBg: isDark ? '#051113' : '#F0FDF4',
        glowA: isDark ? 'rgba(16,185,129,0.12)' : 'rgba(34,197,94,0.04)',
        border: isDark ? 'rgba(16,185,129,0.32)' : 'rgba(34,197,94,0.16)',
        tint: isDark ? '#34D399' : '#15803D',
        icon: 'git-network-outline',
      },
    };
  }, [themeMode]);

  const LEVEL_THEME = useMemo(() => {
    const isDark = themeMode === 'dark';
    return {
      standard: {
        badgeBg: isDark ? 'rgba(139,174,212,0.1)' : '#F1F5F9',
        badgeBorder: isDark ? 'rgba(139,174,212,0.2)' : 'rgba(148,163,184,0.2)',
        badgeText: isDark ? '#8BAED4' : '#475569',
      },
      intense: {
        badgeBg: isDark ? 'rgba(245,158,11,0.12)' : '#FEF3C7',
        badgeBorder: isDark ? 'rgba(245,158,11,0.3)' : 'rgba(245,158,11,0.3)',
        badgeText: isDark ? '#F59E0B' : '#D97706',
      },
      fire: {
        badgeBg: isDark ? 'rgba(239,68,68,0.15)' : '#FEE2E2',
        badgeBorder: isDark ? 'rgba(239,68,68,0.45)' : 'rgba(239,68,68,0.3)',
        badgeText: isDark ? '#EF4444' : '#DC2626',
      },
    };
  }, [themeMode]);

  const theme = CATEGORY_THEME[scenario.category as keyof typeof CATEGORY_THEME] ?? CATEGORY_THEME.Social;
  const level = scenario.level ?? 'standard';
  const levelTheme = LEVEL_THEME[level] ?? LEVEL_THEME.standard;
  const immersiveQuestionDensity = scenario.question.length > 165
    ? 'dense'
    : scenario.question.length > 125
      ? 'compact'
      : 'regular';

  return (
      <Animated.View
        {...webPanResponder.panHandlers}
        {...(webMouseHandlers as any)}
        style={[
          styles.card,
          immersive && styles.cardImmersive,
          immersive && Platform.OS === 'web' && styles.cardImmersiveDesktop,
          {
            backgroundColor: theme.cardBg,
            borderColor: theme.border,
            ...(Platform.OS === 'web' ? {
              boxShadow: themeMode === 'dark'
                ? `0 16px 40px rgba(0,0,0,0.5), 0 0 24px ${theme.glowA}`
                : '0 8px 24px rgba(17,24,39,0.05)'
            } : {})
          },
          cardAnimatedStyle,
        ]}
      >
        <View style={styles.cardHeader}>
          <View style={[
            styles.badge,
            { backgroundColor: levelTheme.badgeBg, borderColor: levelTheme.badgeBorder },
          ]}>
            <Text style={[styles.badgeText, { color: levelTheme.badgeText }]}>
              {SCENARIO_LEVEL_META[level].label}
            </Text>
          </View>
        </View>

        <Animated.View style={[styles.contentWrapper, contentAnimatedStyle]}>
          {impactedTraits.length > 0 && (
            <Animated.View
              entering={FadeInUp.duration(350)}
              exiting={FadeOut.duration(200)}
              pointerEvents="none"
              style={styles.floatingTraitsContainer}
            >
              {impactedTraits.map((trait, i) => (
                <Text key={i} style={styles.floatingTraitText}>
                  🧬 {trait}
                </Text>
              ))}
            </Animated.View>
          )}

          <View style={[
            immersive ? styles.questionWrapImmersive : undefined,
            immersive && isSmallScreen && { paddingTop: 4, paddingBottom: 4 },
            immersive && isMediumScreen && { paddingBottom: 12 },
          ]}>
            <Text
              style={[
                styles.question,
                immersive && styles.questionImmersive,
                immersive && isMediumScreen && styles.questionImmersiveCompact,
                immersive && isSmallScreen && styles.questionImmersiveDense,
                immersive && immersiveQuestionDensity === 'compact' && !isSmallScreen && styles.questionImmersiveCompact,
                immersive && immersiveQuestionDensity === 'dense' && !isSmallScreen && styles.questionImmersiveDense,
                immersive && isSmallScreen && { fontSize: 17, lineHeight: 24 },
                immersive && isSmallScreen && immersiveQuestionDensity === 'dense' && { fontSize: 16, lineHeight: 22 },
              ]}
            >
              {scenario.question}
            </Text>
          </View>

          <View style={[
            immersive ? styles.footerImmersive : undefined,
            immersive && isSmallScreen && { gap: 6 },
          ]}>
            <View style={[
              styles.choicesContainer,
              immersive && styles.choicesContainerImmersive,
              immersive && isSmallScreen && { gap: 8 },
              immersive && isMediumScreen && { gap: 10 },
            ]}>
              {scenario.choices.map((choice, idx) => {
                const isSelected = selected === idx;
                const isOther = selected !== null && selected !== idx;
                return (
                  <Animated.View key={idx} style={[styles.choiceRow, animatedButtonStyles[idx] ?? null]}>
                    <TouchableOpacity
                      style={[
                        styles.choiceButton,
                        immersive && styles.choiceButtonImmersive,
                        immersive && isSmallScreen && { paddingVertical: 10, minHeight: 48 },
                        immersive && isMediumScreen && { paddingVertical: 12, minHeight: 58 },
                        isSelected && [styles.choiceButtonSelected, { backgroundColor: theme.tint, borderColor: theme.tint }],
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
                        immersive && isSmallScreen && { fontSize: 14, lineHeight: 20 },
                        isSelected && styles.choiceTextSelected,
                        isOther && styles.choiceTextDimmed,
                      ]}
                    >
                      {choice.label}
                    </Text>
                  </TouchableOpacity>
                </Animated.View>
              );
            })}
          </View>

          {!immersive ? (
            <TouchableOpacity style={styles.shareButton} onPress={onShare} activeOpacity={0.7}>
              <Ionicons name="paper-plane-outline" size={15} color={theme.tint} style={styles.shareIcon} />
              <Text style={styles.shareText}>Partager</Text>
            </TouchableOpacity>
          ) : null}

          </View>
        </Animated.View>

        {/* Dynamic visual overlay feedback when user drags the card */}
        {immersive && (
          <>
            {/* Drags Right -> onOpenChat (Discussion) */}
            <Animated.View
              pointerEvents="none"
              style={[
                styles.overlayContainer,
                { backgroundColor: themeMode === 'dark' ? 'rgba(7, 24, 40, 0.45)' : 'rgba(238, 248, 255, 0.45)' },
                overlayRightStyle,
              ]}
            >
              <View style={[
                styles.overlayBadge,
                {
                  backgroundColor: themeMode === 'dark' ? 'rgba(7,24,40,0.94)' : 'rgba(238,248,255,0.96)',
                  borderColor: '#38BDF8',
                }
              ]}>
                <Ionicons name="chatbubble-ellipses" size={18} color="#38BDF8" />
                <Text style={[styles.overlayText, { color: '#38BDF8' }]}>Discussion</Text>
              </View>
            </Animated.View>

            {/* Drags Left -> Share */}
            <Animated.View
              pointerEvents="none"
              style={[
                styles.overlayContainer,
                { backgroundColor: themeMode === 'dark' ? 'rgba(24, 20, 10, 0.45)' : 'rgba(255, 251, 235, 0.45)' },
                overlayLeftStyle,
              ]}
            >
              <View style={[
                styles.overlayBadge,
                {
                  backgroundColor: themeMode === 'dark' ? 'rgba(24,20,10,0.94)' : 'rgba(255,251,235,0.96)',
                  borderColor: '#F59E0B',
                }
              ]}>
                <Ionicons name="paper-plane" size={18} color="#F59E0B" />
                <Text style={[styles.overlayText, { color: '#F59E0B' }]}>Partager</Text>
              </View>
            </Animated.View>

            {/* Drags Up -> Skip/Next */}
            <Animated.View
              pointerEvents="none"
              style={[
                styles.overlayContainer,
                { backgroundColor: themeMode === 'dark' ? 'rgba(15, 10, 25, 0.45)' : 'rgba(245, 243, 255, 0.45)' },
                overlayUpStyle,
              ]}
            >
              <View style={[
                styles.overlayBadge,
                {
                  backgroundColor: themeMode === 'dark' ? 'rgba(15,10,25,0.94)' : 'rgba(245,243,255,0.96)',
                  borderColor: '#A855F7',
                }
              ]}>
                <Ionicons name="arrow-up-circle" size={18} color="#A855F7" />
                <Text style={[styles.overlayText, { color: '#A855F7' }]}>Ignorer</Text>
              </View>
            </Animated.View>

            {/* Drags Down -> Prev */}
            <Animated.View
              pointerEvents="none"
              style={[
                styles.overlayContainer,
                { backgroundColor: themeMode === 'dark' ? 'rgba(20, 25, 35, 0.45)' : 'rgba(241, 245, 249, 0.45)' },
                overlayDownStyle,
              ]}
            >
              <View style={[
                styles.overlayBadge,
                {
                  backgroundColor: themeMode === 'dark' ? 'rgba(20,25,35,0.94)' : 'rgba(241,245,249,0.96)',
                  borderColor: '#64748B',
                }
              ]}>
                <Ionicons name="arrow-down-circle" size={18} color="#64748B" />
                <Text style={[styles.overlayText, { color: '#64748B' }]}>Retour</Text>
              </View>
            </Animated.View>
          </>
        )}
      </Animated.View>
  );
}

function createStyles(p: ReturnType<typeof getThemeColors>) {
  const isDark = p.background === '#020510';
  return StyleSheet.create({
  card: {
    backgroundColor: p.card,
    borderRadius: Radius.lg,
    padding: Spacing.md,
    marginHorizontal: Spacing.md,
    marginVertical: Spacing.sm,
    flex: 1,
    borderWidth: 1,
    borderColor: p.border,
    overflow: 'hidden',
    ...Platform.select({
      ios: { shadowColor: '#000', shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.04, shadowRadius: 16 },
      android: { elevation: 2 },
      web: { boxShadow: '0 8px 24px rgba(17,24,39,0.05)' },
    }),
  },
  cardImmersive: {
    marginHorizontal: 0,
    marginVertical: 0,
    paddingTop: Spacing.md,
    paddingBottom: 14,
    paddingHorizontal: 14,
    borderRadius: 28,
    justifyContent: 'flex-start',
    borderWidth: 1,
    borderColor: p.border,
    minHeight: 0,
  },
  cardImmersiveDesktop: {
    cursor: 'pointer',
    userSelect: 'none',
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'flex-start',
    alignItems: 'center',
    marginBottom: Spacing.sm,
  },
  contentWrapper: {
    flex: 1,
    overflow: 'hidden',
    ...Platform.select({
      web: { overflowY: 'auto' as any },
    }),
  },
  badge: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: Radius.pill,
    borderWidth: 1,
  },
  badgeText: {
    ...Typography.captionBold,
  },
  question: {
    ...Typography.h1,
    color: p.text,
    marginBottom: Spacing.lg,
    lineHeight: 32,
  },
  questionWrapImmersive: {
    flexShrink: 0,
    paddingTop: 6,
    paddingBottom: 24,
    justifyContent: 'flex-start',
    minHeight: 0,
  },
  questionImmersive: {
    fontSize: 22,
    lineHeight: 31,
    letterSpacing: -0.5,
    marginBottom: 0,
    textAlign: 'left',
    flexShrink: 1,
  },
  questionImmersiveCompact: {
    fontSize: 21,
    lineHeight: 30,
  },
  questionImmersiveDense: {
    fontSize: 19,
    lineHeight: 27,
    letterSpacing: -0.35,
  },
  choicesContainer: {
    gap: Spacing.md,
  },
  choicesContainerImmersive: {
    gap: 12,
    flexShrink: 1,
  },
  choiceRow: {
    width: '100%',
  },
  choiceButton: {
    backgroundColor: p.buttonNeutral,
    borderRadius: Radius.pill,
    paddingVertical: 16,
    paddingHorizontal: Spacing.lg,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: p.border,
  },
  choiceButtonImmersive: {
    paddingVertical: 15,
    paddingHorizontal: Spacing.md,
    minHeight: 72,
    borderRadius: 22,
  },
  choiceButtonSelected: {
    backgroundColor: p.accentLight,
  },
  choiceButtonDimmed: {
    opacity: 0.4,
  },
  choiceText: {
    ...Typography.body,
    color: p.text,
    textAlign: 'center',
    flexShrink: 1,
  },
  choiceTextImmersive: {
    fontSize: 15,
    lineHeight: 22,
  },
  choiceTextSelected: {
    color: p.text,
    fontWeight: '600',
  },
  choiceTextDimmed: {
    color: p.textMuted,
  },
  shareButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: Spacing.lg,
    gap: Spacing.xs,
  },
  shareIcon: {
    fontSize: 16,
  },
  shareText: {
    ...Typography.captionBold,
    color: p.textSecondary,
  },
  footerImmersive: {
    gap: 10,
    marginTop: 0,
    minHeight: 0,
  },
  overlayContainer: {
    ...StyleSheet.absoluteFillObject,
    justifyContent: 'center',
    alignItems: 'center',
    borderRadius: 28,
    overflow: 'hidden',
    zIndex: 10,
  },
  overlayBadge: {
    paddingHorizontal: 22,
    paddingVertical: 12,
    borderRadius: Radius.md,
    borderWidth: 1.5,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.12,
    shadowRadius: 10,
    elevation: 4,
  },
  overlayText: {
    ...Typography.captionBold,
    fontSize: 14,
    textTransform: 'uppercase',
    letterSpacing: 0.8,
  },
  floatingTraitsContainer: {
    position: 'absolute',
    top: '32%',
    left: '10%',
    right: '10%',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: isDark ? 'rgba(6, 13, 30, 0.95)' : 'rgba(255, 255, 255, 0.95)',
    borderRadius: Radius.md,
    borderWidth: 1,
    borderColor: p.accent,
    paddingVertical: 14,
    paddingHorizontal: 20,
    zIndex: 999,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.12,
    shadowRadius: 16,
    elevation: 8,
  },
  floatingTraitText: {
    ...Typography.bodyBold,
    color: p.accent,
    fontSize: 14,
    marginVertical: 3,
    textAlign: 'center',
  },
  });
}
