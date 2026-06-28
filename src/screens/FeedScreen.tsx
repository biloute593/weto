import React, { useCallback, useMemo, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  SafeAreaView,
  Alert,
  Platform,
  Share,
  TouchableOpacity,
  useWindowDimensions,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { AppButton } from '../components/AppButton';
import { BrandLogo } from '../components/BrandLogo';
import { ScenarioCard } from '../components/ScenarioCard';
import { MatchModal } from '../components/MatchModal';
import { SkeletonCard } from '../components/SkeletonCard';
import { SoftRegisterPrompt } from '../components/SoftRegisterPrompt';
import { Colors, Radius, Spacing, Typography, getThemeColors } from '../theme/colors';
import { useWetoStore } from '../store/useWetoStore';
import { StarfieldBackground } from '../components/StarfieldBackground';
import {
  SCENARIOS,
  SCENARIO_LEVEL_META,
  SCENARIO_LEVELS,
  getAllowedScenarioLevels,
  getScenariosForLevel,
} from '../data/scenarios';
import { getDominantTrait } from '../utils';
import { Ionicons } from '@expo/vector-icons';

const APP_LINK = 'https://weto-app.netlify.app';

export function FeedScreen() {
  const {
    currentIndex,
    pendingMatch,
    dismissMatch,
    answeredIds,
    userVector,
    answers,
    matches,
    nextScenario,
    prevScenario,
    selectedLevel,
    setSelectedLevel,
    birthYear,
    isSyncing,
    isLocalOnly,
    hasQuickRegistered,
    softRegisterNudge,
    themeMode,
  } = useWetoStore();
  const p = getThemeColors(themeMode);
  const styles = useMemo(() => createStyles(p), [themeMode]);

  const navigation = useNavigation<any>();
  const { width, height: screenH } = useWindowDimensions();
  const isSmallScreen = screenH < 720;
  const [insightDismissed, setInsightDismissed] = useState(false);
  const isImmersiveFeed = Platform.OS === 'web' || width < 768;
  const allowedLevels = useMemo(() => getAllowedScenarioLevels(birthYear), [birthYear]);
  const levelScenarios = useMemo(() => getScenariosForLevel(selectedLevel), [selectedLevel]);
  const totalScenarios = levelScenarios.length;
  const answeredInLevelCount = useMemo(
    () => levelScenarios.filter((scenario) => answeredIds.has(scenario.id)).length,
    [levelScenarios, answeredIds]
  );
  const indexedScenario = levelScenarios[currentIndex] ?? null;
  const fallbackScenario = useMemo(
    () => levelScenarios.find((scenario) => !answeredIds.has(scenario.id)) ?? levelScenarios[0] ?? null,
    [levelScenarios, answeredIds]
  );
  const isComplete = totalScenarios > 0 && answeredInLevelCount >= totalScenarios;
  const currentScenario = !isComplete
    ? indexedScenario && !answeredIds.has(indexedScenario.id)
      ? indexedScenario
      : fallbackScenario
    : null;
  const dominantTrait = useMemo(() => getDominantTrait(userVector), [userVector]);
  const profileResumeCopy = useMemo(() => {
    if (answers.length === 0) {
      return null;
    }

    if (isLocalOnly) {
      return `Profil lancé: ${answers.length} réponse${answers.length > 1 ? 's' : ''} déjà gardée${answers.length > 1 ? 's' : ''} sur cet appareil.`;
    }

    if (!hasQuickRegistered) {
      return `Profil déjà en cours: ${answers.length} réponse${answers.length > 1 ? 's' : ''}. Tu peux t'inscrire plus tard sans perdre ce départ.`;
    }

    return `Profil en cours: ${answers.length} réponse${answers.length > 1 ? 's' : ''}. Reprends exactement où tu t'es arrêté.`;
  }, [answers.length, hasQuickRegistered, isLocalOnly]);

  const handleShareSignal = useCallback(async () => {
    const dominant = getDominantTrait(userVector);
    const text = `Mon trait Weto\u00a0: ${dominant.label}\n\nD\u00e9couvre ton profil\u00a0: ${APP_LINK}`;
    if (Platform.OS === 'web') {
      if (typeof navigator !== 'undefined' && navigator.share) {
        navigator.share({ title: 'Mon signal Weto', text, url: APP_LINK }).catch(() => {});
      } else if (typeof navigator !== 'undefined' && navigator.clipboard) {
        await navigator.clipboard.writeText(text);
      }
    } else {
      await Share.share({ message: text });
    }
  }, [userVector]);

  const handleShare = useCallback(async (scenarioId: string) => {
    const scenario = SCENARIOS.find((s) => s.id === scenarioId);
    if (!scenario) return;

    const shareMessage = `${scenario.question}\n\nDécouvre Weto : ${APP_LINK}`;

    if (Platform.OS === 'web') {
      if (typeof navigator !== 'undefined' && navigator.share) {
        navigator.share({ title: 'Weto – Dilemme', text: scenario.question, url: APP_LINK }).catch(() => {});
      } else if (typeof navigator !== 'undefined' && navigator.clipboard) {
        await navigator.clipboard.writeText(shareMessage);
        Alert.alert('Copié !', 'Le dilemme et le lien de Weto ont été copiés.');
      }
    } else {
      await Share.share({ message: shareMessage });
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

  const handleOpenChat = useCallback(() => {
    navigation.navigate('Chat');
  }, [navigation]);

  const handleSkipScenario = useCallback((scenarioId: string) => {
    nextScenario(scenarioId);
  }, [nextScenario]);

  const handleLevelPress = useCallback((level: (typeof SCENARIO_LEVELS)[number]) => {
    if (!allowedLevels.includes(level)) return;
    setSelectedLevel(level);
  }, [allowedLevels, setSelectedLevel]);

  return (
    <SafeAreaView style={styles.container}>
      {themeMode === 'dark' && <StarfieldBackground />}
      <View style={[styles.header, isImmersiveFeed && styles.headerImmersive, isImmersiveFeed && isSmallScreen && styles.headerImmersiveXS]}>
        <View>
          <BrandLogo variant={isImmersiveFeed ? 'compact' : 'header'} align="left" />
          {!isImmersiveFeed && (
            <Text style={styles.tagline}>On matche d'abord les reactions, pas les photos.</Text>
          )}
        </View>
        <View style={styles.headerRight}>
          {isLocalOnly && (
            <View style={styles.offlineIndicator}>
              <Ionicons name="cloud-offline-outline" size={13} color={p.textSecondary} />
              <Text style={styles.offlineText}>Local</Text>
            </View>
          )}
          {matches.length > 0 && (
            <View style={styles.matchPill}>
              <Text style={styles.matchPillText}>{matches.length} match{matches.length > 1 ? 's' : ''}</Text>
            </View>
          )}
        </View>
      </View>

      <View style={[styles.levelSection, isImmersiveFeed && styles.levelSectionImmersive, isImmersiveFeed && isSmallScreen && styles.levelSectionXS]}>
        {!isImmersiveFeed ? <Text style={styles.levelSectionLabel}>Niveau de dilemmes</Text> : null}
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
                  isImmersiveFeed && styles.levelPillImmersive,
                  isActive && styles.levelPillActive,
                  isLocked && styles.levelPillLocked,
                ]}
                activeOpacity={0.82}
                disabled={isLocked}
                onPress={() => handleLevelPress(level)}
              >
                <Text
                  style={[
                    styles.levelPillLabel,
                    isImmersiveFeed && styles.levelPillLabelImmersive,
                    isActive && styles.levelPillLabelActive,
                  ]}
                >
                  {meta.label}
                </Text>
              </TouchableOpacity>
            );
          })}
        </View>
      </View>


      {profileResumeCopy ? (
        <View style={[styles.resumeBanner, isSmallScreen && styles.resumeBannerXS]}>
          <Ionicons name="save-outline" size={13} color={themeMode === 'dark' ? '#8BAED4' : '#3D5F84'} />
          <Text style={styles.resumeBannerText} numberOfLines={2}>{profileResumeCopy}</Text>
        </View>
      ) : null}

      {answeredInLevelCount >= 5 && !insightDismissed && (
        <View style={styles.insightChipRow}>
          <View style={styles.insightChip}>
            <Ionicons name="sparkles-outline" size={12} color="#3D5F84" />
            <Text style={styles.insightChipText} numberOfLines={1}>{dominantTrait.label}</Text>
          </View>
          <TouchableOpacity onPress={() => setInsightDismissed(true)} hitSlop={{ top: 8, bottom: 8, left: 12, right: 12 }}>
            <Text style={styles.insightChipClose}>×</Text>
          </TouchableOpacity>
        </View>
      )}

      <View style={[styles.feedBody, softRegisterNudge && styles.feedBodyWithBottomOverlay]}>
      {isComplete ? (
        <View style={[styles.completeContainer, isSmallScreen && { padding: Spacing.md }]}>
          <View style={[styles.completeEmoji, isSmallScreen && { width: 48, height: 48, borderRadius: 24, marginBottom: Spacing.sm }]}>
            <Ionicons name="checkmark-circle-outline" size={isSmallScreen ? 24 : 34} color="#4E6E92" />
          </View>
          <Text style={[styles.completeTitle, isSmallScreen && { fontSize: 20, marginBottom: 4 }]}>Banque {SCENARIO_LEVEL_META[selectedLevel].label.toLowerCase()} épuisée</Text>
          <Text style={[styles.completeSubtitle, isSmallScreen && { fontSize: 13, lineHeight: 18 }]}>
            Tu as exploré les {totalScenarios} dilemmes du niveau {SCENARIO_LEVEL_META[selectedLevel].label.toLowerCase()}. Ton profil était déjà exploitable bien avant, mais la lecture est maintenant maximale sur {dominantTrait.label.toLowerCase()}.
          </Text>
          <View style={[styles.completeActions, isSmallScreen && { marginTop: Spacing.md, gap: 6 }]}>
            <AppButton title="Voir mes matchs" onPress={handleOpenMatches} fullWidth />
            <AppButton title="Explorer mon profil" onPress={handleOpenProfile} variant="secondary" fullWidth />
          </View>
        </View>
      ) : isSyncing && !currentScenario ? (
        <View style={[styles.cardStage, isImmersiveFeed && styles.cardStageImmersive]}>
          <SkeletonCard />
        </View>
      ) : (
        <View style={[styles.cardStage, isImmersiveFeed && styles.cardStageImmersive]}>
          {currentScenario ? (
            <ScenarioCard
              key={`${selectedLevel}:${currentScenario.id}`}
              scenario={currentScenario}
              onShare={() => { void handleShare(currentScenario.id); }}
              onSkip={handleSkipScenario}
              onPrev={prevScenario}
              onOpenChat={handleOpenChat}
              immersive={isImmersiveFeed}
            />
          ) : (
            <SkeletonCard />
          )}
        </View>
      )}
      </View>

      {pendingMatch && (
        <MatchModal
          match={pendingMatch}
          onDismiss={dismissMatch}
          onMessage={handleMatchMessage}
        />
      )}
      <SoftRegisterPrompt />

      {answers.length > 0 && (
        <TouchableOpacity
          style={styles.shareSignalFab}
          onPress={() => { void handleShareSignal(); }}
          activeOpacity={0.8}
        >
          <Ionicons name="paper-plane-outline" size={17} color="#3D5F84" />
        </TouchableOpacity>
      )}
    </SafeAreaView>
  );
}

function createStyles(p: ReturnType<typeof getThemeColors>) {
  const isDark = p.background === '#020510';
  return StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: p.background,
    position: 'relative',
  },
  feedBody: {
    flex: 1,
    minHeight: 0,
  },
  feedBodyWithBottomOverlay: {
    paddingBottom: 92,
  },
  insightChipRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'flex-end',
    paddingHorizontal: Spacing.md,
    paddingBottom: 6,
    gap: 6,
  },
  resumeBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginHorizontal: Spacing.md,
    marginBottom: 8,
    paddingHorizontal: 12,
    paddingVertical: 10,
    borderRadius: Radius.full,
    backgroundColor: isDark ? 'rgba(124,203,255,0.06)' : 'rgba(61,95,132,0.08)',
    borderWidth: 1,
    borderColor: isDark ? 'rgba(124,203,255,0.15)' : 'rgba(61,95,132,0.12)',
  },
  resumeBannerXS: {
    paddingVertical: 6,
    marginBottom: 4,
  },
  resumeBannerText: {
    ...Typography.captionBold,
    color: isDark ? '#D0EAFF' : '#3E5D80',
    flex: 1,
    lineHeight: 17,
  },
  insightChip: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: isDark ? 'rgba(255,255,255,0.08)' : 'rgba(15,23,42,0.08)',
    borderRadius: Radius.full,
    paddingHorizontal: 10,
    paddingVertical: 4,
    maxWidth: 180,
  },
  insightChipText: {
    ...Typography.captionBold,
    color: p.textSecondary,
    fontSize: 11,
  },
  insightChipClose: {
    color: p.textMuted,
    fontSize: 18,
    lineHeight: 18,
  },
  shareSignalFab: {
    position: 'absolute',
    bottom: 20,
    right: 16,
    width: 42,
    height: 42,
    borderRadius: 21,
    backgroundColor: '#EFF6FF',
    borderWidth: 1,
    borderColor: 'rgba(61,95,132,0.18)',
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 50,
    ...Platform.select({
      ios: { shadowColor: '#274E73', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.12, shadowRadius: 8 },
      android: { elevation: 4 },
      web: { boxShadow: '0 3px 10px rgba(39,78,115,0.14)' },
    }),
  },
  shareSignalFabIcon: {
    color: '#0D6EFD',
    fontSize: 17,
    fontWeight: '700',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    paddingHorizontal: Spacing.lg,
    paddingVertical: Spacing.md,
    backgroundColor: p.background,
  },
  headerImmersive: {
    paddingTop: Spacing.sm,
    paddingBottom: 10,
    alignItems: 'center',
  },
  headerImmersiveXS: {
    paddingTop: 4,
    paddingBottom: 6,
  },
  logoImmersive: {
    fontSize: 22,
  },
  logo: {
    fontSize: 26,
    fontWeight: '800',
    color: p.text,
    letterSpacing: -0.5,
  },
  tagline: {
    ...Typography.caption,
    color: p.textSecondary,
    marginTop: 4,
    maxWidth: 220,
  },
  headerRight: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.sm,
  },
  offlineIndicator: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: isDark ? 'rgba(255,255,255,0.06)' : 'rgba(0,0,0,0.04)',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: Radius.pill,
  },
  offlineText: {
    ...Typography.small,
    color: p.textSecondary,
    fontWeight: '600',
    fontSize: 11,
  },
  levelSection: {
    paddingHorizontal: Spacing.lg,
    paddingBottom: Spacing.md,
    gap: Spacing.sm,
  },
  levelSectionImmersive: {
    paddingHorizontal: Spacing.md,
    paddingBottom: 10,
    gap: 8,
  },
  levelSectionXS: {
    paddingBottom: 6,
    gap: 6,
  },
  levelSectionLabel: {
    ...Typography.captionBold,
    color: p.textSecondary,
  },
  levelStrip: {
    flexDirection: 'row',
    gap: Spacing.sm,
  },
  levelPill: {
    flex: 1,
    backgroundColor: p.card,
    borderRadius: Radius.lg,
    paddingHorizontal: 12,
    paddingVertical: 14,
    borderWidth: 1,
    borderColor: 'rgba(17,24,39,0.08)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  levelPillImmersive: {
    paddingVertical: 11,
    borderRadius: Radius.md,
  },
  levelPillActive: {
    backgroundColor: p.accentLight,
    borderColor: 'rgba(124,203,255,0.35)',
  },
  levelPillLocked: {
    opacity: 0.58,
  },
  levelPillLabel: {
    ...Typography.captionBold,
    color: p.text,
    textTransform: 'uppercase',
    letterSpacing: 0.4,
  },
  levelPillLabelImmersive: {
    fontSize: 11,
  },
  levelPillLabelActive: {
    color: p.text,
  },
  statusPill: {
    backgroundColor: p.accentLight,
    borderRadius: 50,
    paddingHorizontal: 12,
    paddingVertical: 4,
  },
  statusText: {
    ...Typography.captionBold,
    color: p.accent,
  },
  matchPill: {
    backgroundColor: p.card,
    borderRadius: Radius.pill,
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderWidth: 1,
    borderColor: p.border,
  },
  matchPillText: {
    ...Typography.captionBold,
    color: p.text,
  },
  insightPanel: {
    marginHorizontal: Spacing.md,
    marginBottom: Spacing.md,
    backgroundColor: p.card,
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
    color: p.textMuted,
    textTransform: 'uppercase',
    letterSpacing: 0.6,
  },
  insightValue: {
    ...Typography.h2,
    color: p.text,
  },
  insightHelper: {
    ...Typography.caption,
    color: p.textSecondary,
    lineHeight: 18,
  },
  insightStats: {
    flexDirection: 'row',
    gap: Spacing.sm,
  },
  statTile: {
    flex: 1,
    backgroundColor: p.background,
    borderRadius: Radius.md,
    padding: Spacing.md,
    gap: 2,
  },
  statNumber: {
    ...Typography.h2,
    color: p.accent,
  },
  statLabel: {
    ...Typography.small,
    color: p.textSecondary,
  },
  categoryStrip: {
    marginHorizontal: Spacing.md,
    marginBottom: Spacing.sm,
    gap: Spacing.sm,
  },
  categoryStripLabel: {
    ...Typography.captionBold,
    color: p.textSecondary,
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
    backgroundColor: p.card,
    borderRadius: Radius.lg,
    padding: Spacing.md,
    gap: Spacing.xs,
    borderWidth: 1,
    borderColor: p.border,
  },
  selectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    gap: Spacing.sm,
  },
  selectionEyebrow: {
    ...Typography.small,
    color: p.textMuted,
    textTransform: 'uppercase',
    letterSpacing: 0.7,
  },
  selectionTitle: {
    ...Typography.captionBold,
    color: p.accent,
  },
  selectionBody: {
    ...Typography.caption,
    color: p.textSecondary,
    lineHeight: 18,
  },
  cardStage: {
    flex: 1,
    paddingBottom: Spacing.lg,
  },
  cardStageImmersive: {
    justifyContent: 'flex-start',
    paddingHorizontal: 12,
    paddingBottom: 8,
    alignItems: 'stretch',
    minHeight: 0,
  },
  completeContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: Spacing.xl,
  },
  completeEmoji: {
    width: 72,
    height: 72,
    borderRadius: 36,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'rgba(124,203,255,0.18)',
    marginBottom: Spacing.md,
  },
  completeTitle: {
    ...Typography.title,
    color: p.text,
    textAlign: 'center',
    marginBottom: Spacing.sm,
  },
  completeSubtitle: {
    ...Typography.body,
    color: p.textSecondary,
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
}
