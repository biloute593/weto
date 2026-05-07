import React, { useCallback, useMemo } from 'react';
import {
  View,
  Text,
  StyleSheet,
  SafeAreaView,
  Alert,
  Platform,
  TouchableOpacity,
  useWindowDimensions,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { AppButton } from '../components/AppButton';
import { ScenarioCard } from '../components/ScenarioCard';
import { MatchModal } from '../components/MatchModal';
import { Colors, Radius, Spacing, Typography } from '../theme/colors';
import { useWetoStore } from '../store/useWetoStore';
import {
  PROFILE_COMPLETION_TARGET,
  SCENARIOS,
  SCENARIO_LEVEL_META,
  SCENARIO_LEVELS,
  getAllowedScenarioLevels,
  getScenariosForLevel,
  isAdultBirthYear,
} from '../data/scenarios';
import { getDominantTrait, getRecommendedScenarios, getScenarioSelectionHint } from '../utils';

export function FeedScreen() {
  const {
    currentIndex,
    pendingMatch,
    dismissMatch,
    answers,
    answeredIds,
    userVector,
    matches,
    nextScenario,
    selectedLevel,
    setSelectedLevel,
    birthYear,
  } = useWetoStore();

  const navigation = useNavigation<any>();
  const { width } = useWindowDimensions();
  const isImmersiveFeed = width < 768;
  const isAdult = useMemo(() => isAdultBirthYear(birthYear), [birthYear]);
  const allowedLevels = useMemo(() => getAllowedScenarioLevels(birthYear), [birthYear]);
  const levelScenarios = useMemo(() => getScenariosForLevel(selectedLevel), [selectedLevel]);
  const totalScenarios = levelScenarios.length;
  const answeredInLevelCount = useMemo(
    () => levelScenarios.filter((scenario) => answeredIds.has(scenario.id)).length,
    [levelScenarios, answeredIds]
  );
  const isComplete = currentIndex >= totalScenarios || answeredInLevelCount >= totalScenarios;
  const currentScenario = !isComplete ? levelScenarios[currentIndex] ?? null : null;
  const signalRemainingCount = Math.max(0, PROFILE_COMPLETION_TARGET - answers.length);
  const hasReliableSignal = answers.length >= PROFILE_COMPLETION_TARGET;
  const dominantTrait = useMemo(() => getDominantTrait(userVector), [userVector]);
  const recommendedScenarios = useMemo(
    () => getRecommendedScenarios(userVector, answeredIds, levelScenarios),
    [userVector, answeredIds, levelScenarios]
  );
  const nextCategories = useMemo(() => {
    const categories = recommendedScenarios.map((scenario) => scenario.category);

    return Array.from(new Set(categories)).slice(0, 3);
  }, [recommendedScenarios]);
  const selectionHint = useMemo(() => {
    if (!currentScenario) return null;
    return getScenarioSelectionHint(currentScenario, userVector, answeredIds, levelScenarios);
  }, [currentScenario, userVector, answeredIds, levelScenarios]);

  const handleShare = useCallback((scenarioId: string) => {
    const scenario = SCENARIOS.find((s) => s.id === scenarioId);
    if (!scenario) return;
    if (Platform.OS === 'web') {
      if (typeof navigator !== 'undefined' && navigator.share) {
        navigator.share({ title: 'Weto – Dilemme', text: scenario.question }).catch(() => {});
      } else if (typeof navigator !== 'undefined' && navigator.clipboard) {
        navigator.clipboard.writeText(scenario.question);
        Alert.alert('Copié !', 'Le dilemme a été copié dans le presse-papier.');
      }
    } else {
      Alert.alert('Partager', `"${scenario.question}"`, [
        { text: 'Annuler', style: 'cancel' },
        { text: 'OK' },
      ]);
    }
  }, []);

  const handleMatchMessage = () => {
    if (!pendingMatch) return;

    const contactId = pendingMatch.id;
    dismissMatch();
    navigation.navigate('ChatDetail', { contactId });
  };

  const handleOpenProfile = () => {
    navigation.navigate('Profil');
  };

  const handleOpenMatches = () => {
    navigation.navigate('Match');
  };

  const handleSkipScenario = useCallback((scenarioId: string) => {
    nextScenario(scenarioId);
  }, [nextScenario]);

  const handleLevelPress = useCallback((level: (typeof SCENARIO_LEVELS)[number]) => {
    if (!allowedLevels.includes(level)) return;
    setSelectedLevel(level);
  }, [allowedLevels, setSelectedLevel]);

  return (
    <SafeAreaView style={styles.container}>
      <View style={[styles.header, isImmersiveFeed && styles.headerImmersive]}>
        <View>
          <Text style={styles.logo}>Weto</Text>
          {!isImmersiveFeed && (
            <Text style={styles.tagline}>On matche d'abord les reactions, pas les photos.</Text>
          )}
        </View>
        <View style={styles.headerRight}>
          {matches.length > 0 && (
            <View style={styles.matchPill}>
              <Text style={styles.matchPillText}>{matches.length} match{matches.length > 1 ? 's' : ''}</Text>
            </View>
          )}
        </View>
      </View>

      <View style={styles.levelSection}>
        <Text style={styles.levelSectionLabel}>Niveau de dilemmes</Text>
        <View style={styles.levelStrip}>
          {SCENARIO_LEVELS.map((level) => {
            const meta = SCENARIO_LEVEL_META[level];
            const isActive = selectedLevel === level;
            const isLocked = !allowedLevels.includes(level);

            return (
              <TouchableOpacity
                key={level}
                style={[
                  styles.levelPill,
                  { borderColor: meta.accent },
                  isActive && [styles.levelPillActive, { backgroundColor: meta.accent }],
                  isLocked && styles.levelPillLocked,
                ]}
                activeOpacity={0.82}
                disabled={isLocked}
                onPress={() => handleLevelPress(level)}
              >
                <View style={styles.levelPillTop}>
                  <Text style={[styles.levelPillLabel, isActive && styles.levelPillLabelActive]}>{meta.label}</Text>
                  {meta.minAge ? <Text style={[styles.levelPillLock, isActive && styles.levelPillLabelActive]}>18+</Text> : null}
                </View>
                <Text style={[styles.levelPillCount, isActive && styles.levelPillLabelActive]}>
                  {getScenariosForLevel(level).length} dilemmes
                </Text>
              </TouchableOpacity>
            );
          })}
        </View>
        {!isAdult && (
          <Text style={styles.levelGuardText}>Les niveaux Intense et Fire restent reserves aux profils 18+.</Text>
        )}
      </View>





      {isComplete ? (
        <View style={styles.completeContainer}>
          <Text style={styles.completeEmoji}>🎉</Text>
          <Text style={styles.completeTitle}>Banque {SCENARIO_LEVEL_META[selectedLevel].label.toLowerCase()} epuisee</Text>
          <Text style={styles.completeSubtitle}>
            Tu as explore les {totalScenarios} dilemmes du niveau {SCENARIO_LEVEL_META[selectedLevel].label.toLowerCase()}. Ton profil etait deja exploitable bien avant, mais la lecture est maintenant maximale sur {dominantTrait.label.toLowerCase()}.
          </Text>
          <View style={styles.completeActions}>
            <AppButton title="Voir mes matchs" onPress={handleOpenMatches} fullWidth />
            <AppButton title="Explorer mon profil" onPress={handleOpenProfile} variant="secondary" fullWidth />
          </View>
        </View>
      ) : (
        <View style={[styles.cardStage, isImmersiveFeed && styles.cardStageImmersive]}>
          {currentScenario && (
            <ScenarioCard
              scenario={currentScenario}
              onShare={() => handleShare(currentScenario.id)}
              onSkip={handleSkipScenario}
              immersive={isImmersiveFeed}
            />
          )}
        </View>
      )}



      {pendingMatch && (
        <MatchModal
          match={pendingMatch}
          onDismiss={dismissMatch}
          onMessage={handleMatchMessage}
        />
      )}
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
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    paddingHorizontal: Spacing.lg,
    paddingVertical: Spacing.md,
    backgroundColor: Colors.background,
  },
  headerImmersive: {
    paddingBottom: Spacing.sm,
  },
  logo: {
    fontSize: 26,
    fontWeight: '800',
    color: Colors.text,
    letterSpacing: -0.5,
  },
  tagline: {
    ...Typography.caption,
    color: Colors.textSecondary,
    marginTop: 4,
    maxWidth: 220,
  },
  headerRight: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.sm,
  },
  levelSection: {
    paddingHorizontal: Spacing.lg,
    paddingBottom: Spacing.md,
    gap: Spacing.sm,
  },
  levelSectionLabel: {
    ...Typography.captionBold,
    color: Colors.textSecondary,
  },
  levelStrip: {
    flexDirection: 'row',
    gap: Spacing.sm,
  },
  levelPill: {
    flex: 1,
    backgroundColor: Colors.card,
    borderRadius: Radius.lg,
    paddingHorizontal: 12,
    paddingVertical: 12,
    borderWidth: 1,
    gap: 4,
  },
  levelPillActive: {
    transform: [{ translateY: -1 }],
  },
  levelPillLocked: {
    opacity: 0.42,
  },
  levelPillTop: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    gap: Spacing.sm,
  },
  levelPillLabel: {
    ...Typography.captionBold,
    color: Colors.text,
  },
  levelPillLabelActive: {
    color: Colors.white,
  },
  levelPillLock: {
    ...Typography.small,
    color: Colors.textSecondary,
  },
  levelPillCount: {
    ...Typography.small,
    color: Colors.textMuted,
  },
  levelGuardText: {
    ...Typography.caption,
    color: Colors.textSecondary,
    lineHeight: 18,
  },
  statusPill: {
    backgroundColor: Colors.accentLight,
    borderRadius: 50,
    paddingHorizontal: 12,
    paddingVertical: 4,
  },
  statusText: {
    ...Typography.captionBold,
    color: Colors.accent,
  },
  matchPill: {
    backgroundColor: Colors.card,
    borderRadius: Radius.pill,
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  matchPillText: {
    ...Typography.captionBold,
    color: Colors.text,
  },
  insightPanel: {
    marginHorizontal: Spacing.md,
    marginBottom: Spacing.md,
    backgroundColor: Colors.card,
    borderRadius: Radius.lg,
    padding: Spacing.md,
    gap: Spacing.md,
    ...Platform.select({
      ios: { shadowColor: '#000', shadowOffset: { width: 0, height: 3 }, shadowOpacity: 0.06, shadowRadius: 12 },
      android: { elevation: 2 },
      web: { boxShadow: '0 4px 20px rgba(0,0,0,0.06)' },
    }),
  },
  insightPrimary: {
    gap: 4,
  },
  insightLabel: {
    ...Typography.small,
    color: Colors.textMuted,
    textTransform: 'uppercase',
    letterSpacing: 0.6,
  },
  insightValue: {
    ...Typography.h2,
    color: Colors.text,
  },
  insightHelper: {
    ...Typography.caption,
    color: Colors.textSecondary,
    lineHeight: 18,
  },
  insightStats: {
    flexDirection: 'row',
    gap: Spacing.sm,
  },
  statTile: {
    flex: 1,
    backgroundColor: Colors.background,
    borderRadius: Radius.md,
    padding: Spacing.md,
    gap: 2,
  },
  statNumber: {
    ...Typography.h2,
    color: Colors.accent,
  },
  statLabel: {
    ...Typography.small,
    color: Colors.textSecondary,
  },
  categoryStrip: {
    marginHorizontal: Spacing.md,
    marginBottom: Spacing.sm,
    gap: Spacing.sm,
  },
  categoryStripLabel: {
    ...Typography.captionBold,
    color: Colors.textSecondary,
  },
  categoryPills: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: Spacing.sm,
  },
  categoryPill: {
    borderRadius: Radius.pill,
    paddingHorizontal: 12,
    paddingVertical: 8,
  },
  categoryPillText: {
    ...Typography.captionBold,
  },
  selectionCard: {
    marginHorizontal: Spacing.md,
    marginBottom: Spacing.sm,
    backgroundColor: Colors.card,
    borderRadius: Radius.lg,
    padding: Spacing.md,
    gap: Spacing.xs,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  selectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    gap: Spacing.sm,
  },
  selectionEyebrow: {
    ...Typography.small,
    color: Colors.textMuted,
    textTransform: 'uppercase',
    letterSpacing: 0.7,
  },
  selectionTitle: {
    ...Typography.captionBold,
    color: Colors.accent,
  },
  selectionBody: {
    ...Typography.caption,
    color: Colors.textSecondary,
    lineHeight: 18,
  },
  cardStage: {
    flex: 1,
    justifyContent: 'center',
    paddingBottom: Spacing.lg,
  },
  cardStageImmersive: {
    paddingHorizontal: Spacing.md,
    paddingBottom: Spacing.md,
    alignItems: 'stretch',
  },
  immersiveMetaWrap: {
    flexDirection: 'row',
    gap: Spacing.sm,
    paddingHorizontal: Spacing.md,
    paddingBottom: Spacing.sm,
  },
  immersiveFocusPill: {
    flex: 1,
    backgroundColor: Colors.card,
    borderRadius: Radius.md,
    paddingHorizontal: Spacing.md,
    paddingVertical: 10,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  immersiveFocusLabel: {
    ...Typography.small,
    color: Colors.textMuted,
    textTransform: 'uppercase',
    letterSpacing: 0.7,
  },
  immersiveFocusValue: {
    ...Typography.captionBold,
    color: Colors.text,
    marginTop: 2,
  },
  immersiveBottomRow: {
    flexDirection: 'row',
    alignItems: 'center',
    flexWrap: 'wrap',
    gap: Spacing.sm,
    paddingHorizontal: Spacing.md,
    paddingBottom: Spacing.sm,
  },
  immersiveCategoryPill: {
    borderRadius: Radius.pill,
    paddingHorizontal: 12,
    paddingVertical: 8,
  },
  immersiveCategoryText: {
    ...Typography.captionBold,
  },
  immersiveTraitPill: {
    backgroundColor: Colors.card,
    borderRadius: Radius.pill,
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  immersiveTraitText: {
    ...Typography.captionBold,
    color: Colors.textSecondary,
  },
  completeContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: Spacing.xl,
  },
  completeEmoji: {
    fontSize: 64,
    marginBottom: Spacing.md,
  },
  completeTitle: {
    ...Typography.title,
    color: Colors.text,
    textAlign: 'center',
    marginBottom: Spacing.sm,
  },
  completeSubtitle: {
    ...Typography.body,
    color: Colors.textSecondary,
    textAlign: 'center',
    lineHeight: 26,
    maxWidth: 320,
  },
  completeActions: {
    width: '100%',
    marginTop: Spacing.lg,
    gap: Spacing.sm,
    maxWidth: 320,
  },
});
