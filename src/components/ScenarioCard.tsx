import React, { useEffect, useRef, useState } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Animated,
  Platform,
} from 'react-native';
import { Scenario } from '../data/scenarios';
import { Colors, Spacing, Radius, Typography } from '../theme/colors';
import { useWetoStore } from '../store/useWetoStore';

interface ScenarioCardProps {
  scenario: Scenario;
  index: number;
  onShare: () => void;
}

export function ScenarioCard({ scenario, index, onShare }: ScenarioCardProps) {
  const { submitAnswer, nextScenario, answeredIds, startAnswer } = useWetoStore();
  const [selected, setSelected] = useState<number | null>(null);
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const slideAnim = useRef(new Animated.Value(30)).current;
  const buttonAnims = scenario.choices.map(() => useRef(new Animated.Value(1)).current);

  const isAnswered = answeredIds.has(scenario.id);

  useEffect(() => {
    Animated.parallel([
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 400,
        useNativeDriver: true,
      }),
      Animated.spring(slideAnim, {
        toValue: 0,
        tension: 60,
        friction: 10,
        useNativeDriver: true,
      }),
    ]).start();
    startAnswer();
  }, [scenario.id]);

  const handleChoice = (idx: number) => {
    if (isAnswered || selected !== null) return;

    // Press animation
    Animated.sequence([
      Animated.timing(buttonAnims[idx], {
        toValue: 0.95,
        duration: 80,
        useNativeDriver: true,
      }),
      Animated.timing(buttonAnims[idx], {
        toValue: 1,
        duration: 120,
        useNativeDriver: true,
      }),
    ]).start();

    setSelected(idx);
    submitAnswer(scenario.id, idx);

    // Fade out then go next
    setTimeout(() => {
      Animated.parallel([
        Animated.timing(fadeAnim, {
          toValue: 0,
          duration: 300,
          useNativeDriver: true,
        }),
        Animated.timing(slideAnim, {
          toValue: -30,
          duration: 300,
          useNativeDriver: true,
        }),
      ]).start(() => {
        setSelected(null);
        nextScenario();
      });
    }, 600);
  };

  const catColors = Colors[scenario.category];

  return (
    <Animated.View
      style={[
        styles.card,
        { opacity: fadeAnim, transform: [{ translateY: slideAnim }] },
      ]}
    >
      {/* Category badge + counter */}
      <View style={styles.cardHeader}>
        <View style={[styles.badge, { backgroundColor: catColors.bg }]}>
          <Text style={[styles.badgeText, { color: catColors.text }]}>
            {scenario.category}
          </Text>
        </View>
        <Text style={styles.counter}>{index + 1}/20</Text>
      </View>

      {/* Question */}
      <Text style={styles.question}>{scenario.question}</Text>
      <Text style={styles.subLabel}>Comment réagis-tu ?</Text>

      {/* Choices */}
      <View style={styles.choicesContainer}>
        {scenario.choices.map((choice, idx) => {
          const isSelected = selected === idx;
          return (
            <Animated.View
              key={idx}
              style={{ transform: [{ scale: buttonAnims[idx] }] }}
            >
              <TouchableOpacity
                style={[
                  styles.choiceButton,
                  isSelected && styles.choiceButtonSelected,
                ]}
                onPress={() => handleChoice(idx)}
                activeOpacity={0.7}
              >
                <Text
                  style={[
                    styles.choiceText,
                    isSelected && styles.choiceTextSelected,
                  ]}
                >
                  {choice.label}
                </Text>
              </TouchableOpacity>
            </Animated.View>
          );
        })}
      </View>

      {/* Share button */}
      <TouchableOpacity style={styles.shareButton} onPress={onShare}>
        <Text style={styles.shareIcon}>✈</Text>
        <Text style={styles.shareText}>Partager ce dilemme</Text>
      </TouchableOpacity>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: Colors.card,
    borderRadius: Radius.lg,
    padding: Spacing.lg,
    marginHorizontal: Spacing.md,
    marginVertical: Spacing.sm,
    ...Platform.select({
      ios: {
        shadowColor: Colors.shadow,
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 1,
        shadowRadius: 16,
      },
      android: { elevation: 4 },
      web: { boxShadow: '0 4px 24px rgba(0,0,0,0.08)' },
    }),
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: Spacing.md,
  },
  badge: {
    paddingHorizontal: Spacing.sm,
    paddingVertical: 4,
    borderRadius: Radius.pill,
  },
  badgeText: {
    ...Typography.captionBold,
  },
  counter: {
    ...Typography.caption,
    color: Colors.textMuted,
  },
  question: {
    ...Typography.h1,
    color: Colors.text,
    marginBottom: Spacing.xs,
    lineHeight: 30,
  },
  subLabel: {
    ...Typography.body,
    color: Colors.textSecondary,
    marginBottom: Spacing.lg,
  },
  choicesContainer: {
    gap: Spacing.sm,
  },
  choiceButton: {
    backgroundColor: Colors.buttonNeutral,
    borderRadius: Radius.pill,
    paddingVertical: Spacing.md,
    paddingHorizontal: Spacing.lg,
    alignItems: 'center',
  },
  choiceButtonSelected: {
    backgroundColor: Colors.accent,
  },
  choiceText: {
    ...Typography.bodyBold,
    color: Colors.buttonNeutralText,
    textAlign: 'center',
  },
  choiceTextSelected: {
    color: Colors.white,
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
    color: Colors.textMuted,
  },
  shareText: {
    ...Typography.caption,
    color: Colors.textMuted,
  },
});
