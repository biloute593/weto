import React, { useCallback, useMemo } from 'react';
import {
  View,
  Text,
  StyleSheet,
  SafeAreaView,
  Alert,
  Platform,
  useWindowDimensions,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { AppButton } from '../components/AppButton';
import { ScenarioCard } from '../components/ScenarioCard';
import { MatchModal } from '../components/MatchModal';
import { Colors, Radius, Spacing, Typography } from '../theme/colors';
import { useWetoStore } from '../store/useWetoStore';
import { PROFILE_COMPLETION_TARGET, SCENARIOS } from '../data/scenarios';
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
  } = useWetoStore();

  const navigation = useNavigation<any>();
  const { width } = useWindowDimensions();
  const totalScenarios = SCENARIOS.length;
  const isImmersiveFeed = width < 768;
  const isComplete = currentIndex >= totalScenarios || answeredIds.size >= totalScenarios;
  const currentScenario = !isComplete ? SCENARIOS[currentIndex] : null;
  const signalRemainingCount = Math.max(0, PROFILE_COMPLETION_TARGET - answers.length);
  const hasReliableSignal = answers.length >= PROFILE_COMPLETION_TARGET;
  const dominantTrait = useMemo(() => getDominantTrait(userVector), [userVector]);
  const recommendedScenarios = useMemo(
    () => getRecommendedScenarios(userVector, answeredIds, SCENARIOS),
    [userVector, answeredIds]
  );
  const nextCategories = useMemo(() => {
    const categories = recommendedScenarios.map((scenario) => scenario.category);

    return Array.from(new Set(categories)).slice(0, 3);
  }, [recommendedScenarios]);
  const selectionHint = useMemo(() => {
    if (!currentScenario) return null;
    return getScenarioSelectionHint(currentScenario, userVector, answeredIds, SCENARIOS);
  }, [currentScenario, userVector, answeredIds]);

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
          <View style={styles.statusPill}>
            <Text style={styles.statusText}>{hasReliableSignal ? 'Matchs actifs' : 'Lecture en cours'}</Text>
          </View>
        </View>
      </View>

      {!isImmersiveFeed && (
        <>
          <View style={styles.insightPanel}>
            <View style={styles.insightPrimary}>
              <Text style={styles.insightLabel}>Lecture en cours</Text>
              <Text style={styles.insightValue}>{dominantTrait.label}</Text>
              <Text style={styles.insightHelper}>
                {hasReliableSignal
                  ? 'Le signal est assez net pour matcher. Tu peux continuer a scroller pour affiner les nuances.'
                  : `Encore ${signalRemainingCount} dilemme${signalRemainingCount > 1 ? 's' : ''} environ pour rendre la lecture du profil vraiment fiable.`}
              </Text>
            </View>
            <View style={styles.insightStats}>
              <View style={styles.statTile}>
                <Text style={styles.statNumber}>{matches.length}</Text>
                <Text style={styles.statLabel}>Matchs</Text>
              </View>
              <View style={styles.statTile}>
                <Text style={styles.statNumber}>{Math.round(userVector[dominantTrait.key])}%</Text>
                <Text style={styles.statLabel}>Trait fort</Text>
              </View>
            </View>
          </View>

          {nextCategories.length > 0 && !isComplete && (
            <View style={styles.categoryStrip}>
              <Text style={styles.categoryStripLabel}>A venir</Text>
              <View style={styles.categoryPills}>
                {nextCategories.map((category) => (
                  <View key={category} style={[styles.categoryPill, { backgroundColor: Colors[category].bg }]}> 
                    <Text style={[styles.categoryPillText, { color: Colors[category].text }]}>{category}</Text>
                  </View>
                ))}
              </View>
            </View>
          )}

          {selectionHint && !isComplete && (
            <View style={styles.selectionCard}>
              <View style={styles.selectionHeader}>
                <Text style={styles.selectionEyebrow}>Pourquoi ce dilemme</Text>
                <Text style={styles.selectionTitle}>{selectionHint.title}</Text>
              </View>
              <Text style={styles.selectionBody}>{selectionHint.detail}</Text>
            </View>
          )}
        </>
      )}

      {isImmersiveFeed && !isComplete && selectionHint && (
        <View style={styles.immersiveMetaWrap}>
          <View style={styles.immersiveFocusPill}>
            <Text style={styles.immersiveFocusLabel}>{hasReliableSignal ? 'Signal fiable' : 'On affine'}</Text>
            <Text style={styles.immersiveFocusValue}>{selectionHint.title}</Text>
          </View>
        </View>
      )}

      {isComplete ? (
        <View style={styles.completeContainer}>
          <Text style={styles.completeEmoji}>🎉</Text>
          <Text style={styles.completeTitle}>Banque epuisee</Text>
          <Text style={styles.completeSubtitle}>
            Tu as explore toute la banque actuelle. Ton profil etait deja exploitable bien avant, mais la lecture est maintenant maximale sur {dominantTrait.label.toLowerCase()}.
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

      {isImmersiveFeed && !isComplete && nextCategories.length > 0 && (
        <View style={styles.immersiveBottomRow}>
          {nextCategories.slice(0, 2).map((category) => (
            <View key={category} style={[styles.immersiveCategoryPill, { backgroundColor: Colors[category].bg }]}>
              <Text style={[styles.immersiveCategoryText, { color: Colors[category].text }]}>{category}</Text>
            </View>
          ))}
          <View style={styles.immersiveTraitPill}>
            <Text style={styles.immersiveTraitText}>{Math.round(userVector[dominantTrait.key])}% {dominantTrait.label}</Text>
          </View>
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
