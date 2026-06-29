import React, { useEffect, useMemo, useState } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Platform,
} from 'react-native';
import * as Haptics from 'expo-haptics';
import Animated, {
  useAnimatedStyle,
  useSharedValue,
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
  onSkip: () => void;
  onOpenChat?: () => void;
  immersive?: boolean;
  onAnswered?: (choiceIndex: number) => void;
  cardHeight?: number;
}

export function ScenarioCard({
  scenario,
  onShare,
  onSkip,
  onOpenChat,
  immersive = false,
  onAnswered,
  cardHeight,
}: ScenarioCardProps) {
  const { themeMode, submitAnswer, answeredIds, answers } = useWetoStore();
  const p = getThemeColors(themeMode);
  const styles = useMemo(() => createStyles(p), [themeMode]);

  // Read already answered state from store to support scrolling back
  const initialAnswer = useMemo(() => {
    return answers.find((a) => a.scenarioId === scenario.id);
  }, [answers, scenario.id]);

  const isAnswered = answeredIds.has(scenario.id);
  const [selected, setSelected] = useState<number | null>(
    initialAnswer ? initialAnswer.choiceIndex : null
  );
  const [impactedTraits, setImpactedTraits] = useState<string[]>([]);

  // Reset/sync state when the scenario ID changes
  useEffect(() => {
    setSelected(initialAnswer ? initialAnswer.choiceIndex : null);
    setImpactedTraits([]);
  }, [scenario.id, initialAnswer]);

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
  const animatedButtonStyles = [
    animatedButtonStyle0,
    animatedButtonStyle1,
    animatedButtonStyle2,
    animatedButtonStyle3,
  ];

  const animateButtonPress = (idx: number) => {
    if (idx >= 0 && idx < 4) {
      buttonScales[idx].value = withTiming(0.95, { duration: 60 }, () => {
        buttonScales[idx].value = withSpring(1, { damping: 12, stiffness: 150 });
      });
    }
  };

  const handleChoice = (idx: number) => {
    if (isAnswered || selected !== null) return;

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

    submitAnswer(scenario.id, idx).catch(() => undefined);

    if (onAnswered) {
      onAnswered(idx);
    }
  };

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
        cardBg: isDark ? '#0B0F0B' : '#F0FDF4',
        glowA: isDark ? 'rgba(74,222,128,0.12)' : 'rgba(34,197,94,0.04)',
        border: isDark ? 'rgba(74,222,128,0.32)' : 'rgba(34,197,94,0.16)',
        tint: isDark ? '#4ADE80' : '#16A34A',
        icon: 'ribbon-outline',
      },
    };
  }, [themeMode]);

  const theme = CATEGORY_THEME[scenario.category] || CATEGORY_THEME.Social;

  return (
    <View style={[
      styles.card,
      immersive && styles.cardImmersive,
      { backgroundColor: theme.cardBg, borderColor: theme.border },
      cardHeight ? { height: cardHeight } : undefined
    ]}>
      {/* Category Indicator */}
      <View style={styles.cardHeader}>
        <View style={[styles.categoryBadge, { backgroundColor: theme.glowA, borderColor: theme.border }]}>
          <Ionicons name={theme.icon as any} size={13} color={theme.tint} />
          <Text style={[styles.categoryText, { color: theme.tint }]}>
            {scenario.category}
          </Text>
        </View>
        {scenario.level && (
          <View style={styles.levelBadge}>
            <Text style={styles.levelText}>
              {SCENARIO_LEVEL_META[scenario.level]?.label}
            </Text>
          </View>
        )}
      </View>

      {/* Main content wrapper */}
      <View style={styles.contentWrapper}>
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

        <View style={styles.questionWrap}>
          <Text style={styles.question}>
            {scenario.question}
          </Text>
        </View>

        <View style={styles.choicesContainer}>
          {scenario.choices.map((choice, idx) => {
            const isSelected = selected === idx;
            const isOther = selected !== null && selected !== idx;
            return (
              <Animated.View key={idx} style={[styles.choiceRow, animatedButtonStyles[idx] ?? null]}>
                <TouchableOpacity
                  style={[
                    styles.choiceButton,
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

        {/* Action toolbar at the bottom of the card */}
        <View style={styles.cardActionsRow}>
          <TouchableOpacity style={styles.cardActionButton} onPress={onShare} activeOpacity={0.7}>
            <Ionicons name="paper-plane-outline" size={16} color={p.textSecondary} />
            <Text style={styles.cardActionText}>Partager ce dilemme</Text>
          </TouchableOpacity>
        </View>
      </View>
    </View>
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
      borderWidth: 1,
      borderColor: p.border,
      overflow: 'hidden',
      justifyContent: 'space-between',
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
      borderRadius: 0,
      borderWidth: 0,
    },
    cardHeader: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
      marginBottom: Spacing.sm,
    },
    categoryBadge: {
      flexDirection: 'row',
      alignItems: 'center',
      paddingHorizontal: Spacing.sm,
      paddingVertical: 5,
      borderRadius: Radius.full,
      borderWidth: 1,
      gap: 5,
    },
    categoryText: {
      ...Typography.captionBold,
      fontSize: 11,
      textTransform: 'uppercase',
      letterSpacing: 0.5,
    },
    levelBadge: {
      paddingHorizontal: 8,
      paddingVertical: 3,
      borderRadius: Radius.sm,
      backgroundColor: p.buttonNeutral,
    },
    levelText: {
      ...Typography.caption,
      fontSize: 10,
      color: p.textSecondary,
    },
    contentWrapper: {
      flex: 1,
      justifyContent: 'space-between',
    },
    questionWrap: {
      justifyContent: 'center',
      paddingVertical: Spacing.md,
      minHeight: 120,
    },
    question: {
      ...Typography.h2,
      color: p.text,
      textAlign: 'center',
      fontSize: 20,
      lineHeight: 28,
    },
    choicesContainer: {
      gap: 10,
      width: '100%',
      justifyContent: 'center',
      flexGrow: 1,
      marginVertical: Spacing.md,
    },
    choiceRow: {
      width: '100%',
    },
    choiceButton: {
      backgroundColor: p.buttonNeutral,
      borderRadius: Radius.pill,
      paddingVertical: 14,
      paddingHorizontal: Spacing.md,
      alignItems: 'center',
      borderWidth: 1,
      borderColor: p.border,
      minHeight: 52,
      justifyContent: 'center',
    },
    choiceButtonSelected: {
      borderColor: p.accent,
    },
    choiceButtonDimmed: {
      opacity: 0.4,
    },
    choiceText: {
      ...Typography.body,
      color: p.text,
      textAlign: 'center',
      fontSize: 15,
      lineHeight: 20,
    },
    choiceTextSelected: {
      color: '#FFFFFF',
      fontWeight: '600',
    },
    choiceTextDimmed: {
      color: p.textMuted,
    },
    floatingTraitsContainer: {
      position: 'absolute',
      top: '25%',
      left: '5%',
      right: '5%',
      alignItems: 'center',
      justifyContent: 'center',
      backgroundColor: isDark ? 'rgba(6, 13, 30, 0.96)' : 'rgba(255, 255, 255, 0.96)',
      borderRadius: Radius.md,
      borderWidth: 1,
      borderColor: p.accent,
      paddingVertical: 12,
      paddingHorizontal: 16,
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
    cardActionsRow: {
      flexDirection: 'row',
      justifyContent: 'center',
      alignItems: 'center',
      borderTopWidth: 1,
      borderTopColor: p.border,
      paddingTop: Spacing.sm,
      marginTop: Spacing.sm,
    },
    cardActionButton: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 6,
      paddingHorizontal: Spacing.md,
      paddingVertical: 8,
    },
    cardActionText: {
      ...Typography.captionBold,
      color: p.textSecondary,
      fontSize: 12,
    },
  });
}
