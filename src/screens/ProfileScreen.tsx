import React, { useEffect, useMemo, useState } from 'react';
import {
  View,
  Text,
  ScrollView,
  StyleSheet,
  TouchableOpacity,
  SafeAreaView,
  Platform,
  Alert,
  Switch,
  TextInput,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Colors, Spacing, Radius, Typography, getThemeColors } from '../theme/colors';
import { ProgressRing } from '../components/ProgressRing';
import { useWetoStore } from '../store/useWetoStore';
import { StarfieldBackground } from '../components/StarfieldBackground';
import { fetchAnalyticsSummary } from '../services/wetoApi';
import { TRAIT_LABELS, getAvatarMonogram, getDominantTrait, getRecommendedScenarios, getScenarioSelectionHint } from '../utils';
import { AnalyticsSummary, ModerationAction, ProfileVisibility, TraitKey } from '../types';
import { PROFILE_COMPLETION_TARGET, SCENARIOS } from '../data/scenarios';

const TRAIT_ICONS: Record<TraitKey, keyof typeof Ionicons.glyphMap> = {
  sociability: 'people-outline',
  humor: 'happy-outline',
  risk: 'compass-outline',
  emotion: 'heart-outline',
  conflict: 'swap-horizontal-outline',
  stability: 'shield-checkmark-outline',
};

const TRAIT_BAR_COLORS: Record<TraitKey, string> = {
  sociability: Colors.accent,
  humor: '#9DDCFF',
  risk: '#B7E6FF',
  emotion: '#8FD6FF',
  conflict: '#A9E1FF',
  stability: '#C6ECFF',
};

const REGISTER_AVATARS = ['A', 'B', 'C', 'D', 'E', 'F'];
const REGISTER_GENDERS = ['Homme', 'Femme', 'Autre'];

export function ProfileScreen() {
  const {
    userVector,
    answers,
    matches,
    userName,
    userAvatar,
    authEmail,
    isAdmin,
    sessionToken,
    isLocalOnly,
    setIsLocalOnly,
    hasQuickRegistered,
    quickRegister,
    themeMode,
    setThemeMode,
    profileVisibility,
    setProfileVisibility,
    isSuspended,
    suspensionReason,
    adminReports,
    loadModerationReports,
    applyModerationAction,
    logout,
    resetProgress,
    answeredIds,
  } = useWetoStore();
  const p = getThemeColors(themeMode);
  const styles = useMemo(() => createStyles(p), [themeMode]);

  const [showCalc, setShowCalc] = useState(false);
  const [showLecture, setShowLecture] = useState(false);
  const [showData, setShowData] = useState(false);
  const [showAdmin, setShowAdmin] = useState(false);
  const [showRegisterForm, setShowRegisterForm] = useState(false);
  const [regPseudo, setRegPseudo] = useState('');
  const [regBirthYear, setRegBirthYear] = useState('');
  const [regGender, setRegGender] = useState('');
  const [regAvatar, setRegAvatar] = useState(REGISTER_AVATARS[0]);
  const [regLoading, setRegLoading] = useState(false);
  const [registerError, setRegisterError] = useState('');
  const [analyticsSummary, setAnalyticsSummary] = useState<AnalyticsSummary | null>(null);
  const [analyticsError, setAnalyticsError] = useState('');
  const [isAnalyticsLoading, setIsAnalyticsLoading] = useState(false);
  const visibilityLabel: Record<ProfileVisibility, string> = {
    public: 'Public',
    matches: 'Mes matchs',
    private: 'Privé',
  };

  const signalRemainingCount = Math.max(0, PROFILE_COMPLETION_TARGET - answers.length);
  const hasReliableSignal = answers.length >= PROFILE_COMPLETION_TARGET;
  const recommendedScenarios = useMemo(
    () => getRecommendedScenarios(userVector, answeredIds, SCENARIOS),
    [userVector, answeredIds]
  );
  const nextCategories = useMemo(() => {
    const cats = recommendedScenarios.map((scenario) => scenario.category);
    return Array.from(new Set(cats)).slice(0, 3);
  }, [recommendedScenarios]);
  const currentScenario = SCENARIOS.find((scenario) => !answeredIds.has(scenario.id)) ?? null;
  const selectionHint = useMemo(() => {
    if (!currentScenario) return null;
    return getScenarioSelectionHint(currentScenario, userVector, answeredIds, SCENARIOS);
  }, [currentScenario, userVector, answeredIds]);

  const traitKeys = Object.keys(userVector) as TraitKey[];
  const dominant = getDominantTrait(userVector);

  useEffect(() => {
    if (isAdmin && showAdmin) {
      void loadModerationReports().catch(() => undefined);

      if (sessionToken) {
        setIsAnalyticsLoading(true);
        setAnalyticsError('');
        void fetchAnalyticsSummary(sessionToken)
          .then(({ summary }) => {
            setAnalyticsSummary(summary);
          })
          .catch((error) => {
            setAnalyticsError(error instanceof Error ? error.message : 'Résumé analytics indisponible.');
          })
          .finally(() => {
            setIsAnalyticsLoading(false);
          });
      }
    }
  }, [isAdmin, loadModerationReports, sessionToken, showAdmin]);

  const getEventCount = (eventName: string) => {
    return analyticsSummary?.byEvent.find((item) => item.eventName === eventName)?.total ?? 0;
  };

  const formatRate = (numerator: number, denominator: number) => {
    if (denominator <= 0) {
      return '0%';
    }

    return `${Math.round((numerator / denominator) * 100)}%`;
  };

  const landingViews = getEventCount('landing_viewed');
  const dilemmaAnswers = getEventCount('landing_dilemma_answered');
  const landingCtaClicks = getEventCount('landing_signup_cta_clicked');
  const welcomeViews = getEventCount('welcome_viewed');
  const registerSubmits = getEventCount('welcome_register_submit');
  const loginSubmits = getEventCount('welcome_login_submit');

  const isValidRegYear = (y: string) => {
    const n = parseInt(y, 10);
    const now = new Date().getFullYear();
    if (isNaN(n)) {
      return null;
    }

    if (y.trim().length === 4) {
      return n >= now - 99 && n <= now - 13 ? String(n) : null;
    }

    return n >= 13 && n <= 99 ? String(now - n) : null;
  };

  const normalizedRegBirthYear = isValidRegYear(regBirthYear);
  const canRegister =
    regPseudo.trim().length >= 2 &&
    Boolean(normalizedRegBirthYear) &&
    regGender.length > 0 &&
    !regLoading;

  const handleRegister = async () => {
    if (!canRegister || !normalizedRegBirthYear) {
      setRegisterError('Renseigne un pseudo, un sexe, puis un age valide (13-99) ou une annee valide.');
      return;
    }

    setRegisterError('');
    setRegLoading(true);
    try {
      await quickRegister(regPseudo.trim(), normalizedRegBirthYear, regAvatar, regGender);
      setShowRegisterForm(false);
      setRegPseudo('');
      setRegBirthYear('');
      setRegGender('');
      setRegAvatar(REGISTER_AVATARS[0]);
      Alert.alert('Profil cree', 'Ton profil est enregistre.');
    } catch (error) {
      setRegisterError(error instanceof Error ? error.message : 'Inscription impossible pour le moment.');
    } finally {
      setRegLoading(false);
    }
  };

  const handleDelete = () => {
    if (Platform.OS === 'web' && typeof window !== 'undefined') {
      const ok = window.confirm('Supprimer ton compte ? Cette action est irreversible.');
      if (ok) {
        void resetProgress();
      }
      return;
    }

    Alert.alert(
      'Supprimer le compte',
      'Cette action est irreversible.',
      [
        { text: 'Annuler', style: 'cancel' },
        { text: 'Supprimer', style: 'destructive', onPress: () => { void resetProgress(); } },
      ]
    );
  };

  const handleLogout = () => {
    if (Platform.OS === 'web' && typeof window !== 'undefined') {
      const ok = window.confirm('Te déconnecter de Weto ?');
      if (ok) {
        void logout();
      }
      return;
    }

    Alert.alert('Déconnexion', 'Te déconnecter de Weto ?', [
      { text: 'Annuler', style: 'cancel' },
      { text: 'Déconnexion', style: 'destructive', onPress: () => { void logout(); } },
    ]);
  };

  const handleModerationAction = (reportId: string, action: ModerationAction) => {
    void applyModerationAction(reportId, action).catch((error) => {
      Alert.alert('Modération', error instanceof Error ? error.message : 'Action impossible.');
    });
  };

  return (
    <SafeAreaView style={styles.container}>
      {themeMode === 'dark' && <StarfieldBackground />}
      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.content}>
        <View style={styles.heroRow}>
          <ProgressRing
            progress={Math.min(100, Math.round((answers.length / PROFILE_COMPLETION_TARGET) * 100))}
            size={84}
            strokeWidth={5}
          >
            <View style={styles.avatar}>
              <Text style={styles.avatarText}>{getAvatarMonogram(userName, userAvatar)}</Text>
            </View>
          </ProgressRing>
          <View style={styles.heroInfo}>
            <Text style={styles.heroName}>{userName}</Text>
            <Text style={styles.heroSub}>{dominant.label} · {answers.length} réponse{answers.length > 1 ? 's' : ''}</Text>
            {authEmail ? <Text style={styles.accountMeta}>{authEmail}</Text> : null}
            {isAdmin ? <Text style={styles.accountBadge}>Admin</Text> : null}
          </View>
        </View>

        {isSuspended ? (
          <View style={styles.warningCard}>
            <Text style={styles.warningTitle}>Compte suspendu</Text>
            <Text style={styles.warningBody}>{suspensionReason || 'Certaines actions sont temporairement bloquées.'}</Text>
          </View>
        ) : null}

        <View style={styles.statsRow}>
          <View style={styles.statBox}>
            <Text style={styles.statNum}>{answers.length}</Text>
            <Text style={styles.statLbl}>Réponses</Text>
          </View>
          <View style={styles.statBox}>
            <Text style={styles.statNum}>{matches.length}</Text>
            <Text style={styles.statLbl}>Matchs</Text>
          </View>
          <View style={styles.statBox}>
            <Text style={styles.statNum}>{Math.min(100, Math.round((answers.length / PROFILE_COMPLETION_TARGET) * 100))}%</Text>
            <Text style={styles.statLbl}>Profil</Text>
          </View>
        </View>

        <View style={styles.dominantCard}>
          <View style={styles.dominantEmoji}>
            <Ionicons name={TRAIT_ICONS[dominant.key]} size={24} color="#4E6E92" />
          </View>
          <View style={styles.dominantInfo}>
            <Text style={styles.dominantLabel}>Trait dominant</Text>
            <Text style={styles.dominantName}>{dominant.label}</Text>
          </View>
        </View>

        <View style={styles.settingsCard}>
          <View style={styles.settingsRow}>
            <View style={styles.settingsTextWrap}>
              <Text style={styles.settingsTitle}>Mode sombre</Text>
              <Text style={styles.settingsHint}>Active un rendu plus reposant pour les écrans de nuit.</Text>
            </View>
            <Switch
              value={themeMode === 'dark'}
              onValueChange={(enabled) => setThemeMode(enabled ? 'dark' : 'light')}
              trackColor={{ false: p.border, true: p.accent }}
              thumbColor={p.card}
            />
          </View>

          <View style={styles.settingsDivider} />

          <Text style={styles.settingsTitle}>Visibilité du profil</Text>
          <Text style={styles.settingsHint}>Contrôle qui peut voir ton résumé et tes repères de profil.</Text>
          <View style={styles.visibilityRow}>
            {(['public', 'matches', 'private'] as ProfileVisibility[]).map((option) => (
              <TouchableOpacity
                key={option}
                style={[styles.visibilityPill, profileVisibility === option && styles.visibilityPillActive]}
                onPress={() => setProfileVisibility(option)}
                activeOpacity={0.85}
              >
                <Text style={[styles.visibilityText, profileVisibility === option && styles.visibilityTextActive]}>
                  {visibilityLabel[option]}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>

        {isLocalOnly && (
          <View style={styles.localNoticeCard}>
            <Ionicons name="information-circle-outline" size={20} color={p.textSecondary} style={{ marginRight: 8, marginTop: 1 }} />
            <View style={{ flex: 1 }}>
              <Text style={styles.localNoticeTitle}>Mode local actif</Text>
              <Text style={styles.localNoticeBody}>
                L'application fonctionne hors-ligne. Vos réponses et vos statistiques de compatibilité sont conservées localement sur cet appareil.
              </Text>
            </View>
          </View>
        )}

        {!hasQuickRegistered && !authEmail && (
          <View style={styles.registerCard}>
            <Text style={styles.registerCardTitle}>Crée ton profil</Text>
            <Text style={styles.registerCardBody}>
              Sauvegarde ta progression, accède aux matchs et synchronise sur tous tes appareils.
            </Text>
            {!showRegisterForm ? (
              <TouchableOpacity
                style={styles.registerCardBtn}
                onPress={() => {
                  setRegisterError('');
                  setShowRegisterForm(true);
                }}
                activeOpacity={0.85}
              >
                <Text style={styles.registerCardBtnText}>Créer mon profil →</Text>
              </TouchableOpacity>
            ) : (
              <View style={styles.registerForm}>
                <TextInput
                  style={styles.registerInput}
                  placeholder="Ton pseudo"
                  placeholderTextColor={p.textMuted}
                  value={regPseudo}
                  onChangeText={setRegPseudo}
                  autoCorrect={false}
                  autoCapitalize="none"
                  maxLength={24}
                />
                <TextInput
                  style={styles.registerInput}
                  placeholder="Ton âge (ex: 24) ou année (ex: 2002)"
                  placeholderTextColor={p.textMuted}
                  value={regBirthYear}
                  onChangeText={setRegBirthYear}
                  keyboardType="numeric"
                  maxLength={4}
                />
                <View style={styles.registerGenderRow}>
                  {REGISTER_GENDERS.map((gender) => (
                    <TouchableOpacity
                      key={gender}
                      style={[styles.registerGenderPill, regGender === gender && styles.registerGenderPillActive]}
                      onPress={() => setRegGender(gender)}
                      activeOpacity={0.85}
                    >
                      <Text style={[styles.registerGenderText, regGender === gender && styles.registerGenderTextActive]}>{gender}</Text>
                    </TouchableOpacity>
                  ))}
                </View>
                <View style={styles.avatarPickerRow}>
                  {REGISTER_AVATARS.map((avatar) => (
                    <TouchableOpacity
                      key={avatar}
                      style={[styles.avatarPill, regAvatar === avatar && styles.avatarPillActive]}
                      onPress={() => setRegAvatar(avatar)}
                      activeOpacity={0.85}
                    >
                      <Text style={styles.avatarPillText}>{avatar}</Text>
                    </TouchableOpacity>
                  ))}
                </View>
                <Text style={styles.registerHintText}>Pseudo (2+) + sexe + age 13-99 ou annee valide.</Text>
                {registerError ? (
                  <Text style={styles.registerErrorText}>{registerError}</Text>
                ) : null}
                <Text style={styles.registerPrivacyNote}>Pas d'email · Pas de mot de passe</Text>
                <TouchableOpacity
                  style={[styles.registerCardBtn, !canRegister && styles.registerCardBtnDisabled]}
                  onPress={() => { void handleRegister(); }}
                  activeOpacity={0.85}
                  disabled={!canRegister}
                >
                  <Text style={styles.registerCardBtnText}>
                    {regLoading ? 'Sauvegarde...' : 'Sauvegarder →'}
                  </Text>
                </TouchableOpacity>
              </View>
            )}
          </View>
        )}

        <View style={styles.separator} />

        <View style={styles.bottomRow}>
          <Text style={styles.bottomLabel}>Calculs</Text>
          <Switch
            value={showCalc}
            onValueChange={setShowCalc}
            trackColor={{ false: p.border, true: p.accent }}
            thumbColor={p.card}
          />
        </View>

        {showCalc && (
          <View style={styles.calcBlock}>
            {traitKeys.map((key) => (
              <View key={key} style={styles.traitRow}>
                <View style={styles.traitEmoji}>
                  <Ionicons name={TRAIT_ICONS[key]} size={14} color="#4E6E92" />
                </View>
                <Text style={styles.traitLabel}>{TRAIT_LABELS[key]}</Text>
                <View style={styles.traitBarBg}>
                  <View
                    style={[
                      styles.traitBarFg,
                      { width: `${userVector[key]}%` as const, backgroundColor: TRAIT_BAR_COLORS[key] },
                    ]}
                  />
                </View>
                <Text style={styles.traitPct}>{Math.round(userVector[key])}%</Text>
              </View>
            ))}
          </View>
        )}

        <View style={styles.bottomRow}>
          <Text style={styles.bottomLabel}>Lecture en cours</Text>
          <Switch
            value={showLecture}
            onValueChange={setShowLecture}
            trackColor={{ false: p.border, true: p.accent }}
            thumbColor={p.card}
          />
        </View>

        {showLecture && (
          <View style={styles.lectureBlock}>
            <View style={styles.lecturePrimary}>
              <Text style={styles.lectureTag}>Lecture en cours</Text>
              <Text style={styles.lectureValue}>{dominant.label}</Text>
              <Text style={styles.lectureHelper}>
                {hasReliableSignal
                  ? 'Le signal est assez net pour matcher. Continue pour affiner les nuances.'
                  : `Encore ${signalRemainingCount} dilemme${signalRemainingCount > 1 ? 's' : ''} pour rendre la lecture du profil vraiment fiable.`}
              </Text>
            </View>
            <View style={styles.lectureStats}>
              <View style={styles.lectureStat}>
                <Text style={styles.lectureStatNum}>{matches.length}</Text>
                <Text style={styles.lectureStatLbl}>Matchs</Text>
              </View>
              <View style={styles.lectureStat}>
                <Text style={styles.lectureStatNum}>{Math.round(userVector[dominant.key])}%</Text>
                <Text style={styles.lectureStatLbl}>Trait fort</Text>
              </View>
            </View>
            {nextCategories.length > 0 && (
              <View style={styles.lectureCategories}>
                <Text style={styles.lectureCatLabel}>A venir</Text>
                <View style={styles.lectureCatPills}>
                  {nextCategories.map((cat) => (
                    <View
                      key={cat}
                      style={[
                        styles.lectureCatPill,
                        { backgroundColor: (Colors[cat as keyof typeof Colors] as any).bg },
                      ]}
                    >
                      <Text style={[styles.lectureCatText, { color: (Colors[cat as keyof typeof Colors] as any).text }]}>{cat}</Text>
                    </View>
                  ))}
                </View>
              </View>
            )}
            {selectionHint && (
              <View style={styles.lectureHint}>
                <Text style={styles.lectureHintEyebrow}>Pourquoi ce dilemme</Text>
                <Text style={styles.lectureHintTitle}>{selectionHint.title}</Text>
                <Text style={styles.lectureHintBody}>{selectionHint.detail}</Text>
              </View>
            )}
          </View>
        )}

        <View style={styles.bottomRow}>
          <Text style={styles.bottomLabel}>Mes données</Text>
          <Switch
            value={showData}
            onValueChange={setShowData}
            trackColor={{ false: p.border, true: p.accent }}
            thumbColor={p.card}
          />
        </View>

        {showData && (
          <View style={styles.dataStorageCard}>
            <View style={styles.dataStorageRow}>
              <View style={styles.dataStorageTextWrap}>
                <Text style={styles.dataStorageLabel}>
                  {isLocalOnly ? 'Données sur cet appareil uniquement' : 'Données synchronisées'}
                </Text>
                <Text style={styles.dataStorageHint}>
                  {isLocalOnly
                    ? 'Si tu changes de téléphone ou réinstalles l\'appli, tes données seront perdues définitivement.'
                    : 'Tes réponses et matchs sont sauvegardés sur nos serveurs sécurisés.'}
                </Text>
              </View>
              <Switch
                value={!isLocalOnly}
                onValueChange={(sync) => setIsLocalOnly(!sync)}
                trackColor={{ false: p.border, true: p.accent }}
                thumbColor={p.white}
              />
            </View>
            {!hasQuickRegistered && !authEmail && (
              <Text style={styles.dataStorageUpgrade}>
                Pour synchroniser tes données, crée ton profil (pseudo + âge + sexe) — ça prend 10 secondes.
              </Text>
            )}
          </View>
        )}

        {isAdmin ? (
          <>
            <View style={styles.bottomRow}>
              <Text style={styles.bottomLabel}>Modération</Text>
              <Switch
                value={showAdmin}
                onValueChange={setShowAdmin}
                trackColor={{ false: p.border, true: p.accent }}
                thumbColor={p.card}
              />
            </View>

            {showAdmin && (
              <View style={styles.adminBlock}>
                <View style={styles.analyticsCard}>
                  <Text style={styles.analyticsTitle}>Funnel produit</Text>
                  <Text style={styles.analyticsSubtitle}>7 derniers jours, alimenté par l’ingestion analytics Netlify.</Text>

                  {isAnalyticsLoading ? (
                    <Text style={styles.adminEmpty}>Chargement du funnel...</Text>
                  ) : analyticsError ? (
                    <Text style={styles.analyticsError}>{analyticsError}</Text>
                  ) : analyticsSummary ? (
                    <>
                      <View style={styles.analyticsStatsGrid}>
                        <View style={styles.analyticsStatCard}>
                          <Text style={styles.analyticsStatValue}>{landingViews}</Text>
                          <Text style={styles.analyticsStatLabel}>Landing vues</Text>
                        </View>
                        <View style={styles.analyticsStatCard}>
                          <Text style={styles.analyticsStatValue}>{dilemmaAnswers}</Text>
                          <Text style={styles.analyticsStatLabel}>Dilemmes répondus</Text>
                        </View>
                        <View style={styles.analyticsStatCard}>
                          <Text style={styles.analyticsStatValue}>{landingCtaClicks}</Text>
                          <Text style={styles.analyticsStatLabel}>CTA signup</Text>
                        </View>
                        <View style={styles.analyticsStatCard}>
                          <Text style={styles.analyticsStatValue}>{registerSubmits + loginSubmits}</Text>
                          <Text style={styles.analyticsStatLabel}>Submits auth</Text>
                        </View>
                      </View>

                      <View style={styles.analyticsConversionRow}>
                        <View style={styles.analyticsConversionPill}>
                          <Text style={styles.analyticsConversionLabel}>Réponse / vue</Text>
                          <Text style={styles.analyticsConversionValue}>{formatRate(dilemmaAnswers, landingViews)}</Text>
                        </View>
                        <View style={styles.analyticsConversionPill}>
                          <Text style={styles.analyticsConversionLabel}>CTA / réponse</Text>
                          <Text style={styles.analyticsConversionValue}>{formatRate(landingCtaClicks, dilemmaAnswers)}</Text>
                        </View>
                        <View style={styles.analyticsConversionPill}>
                          <Text style={styles.analyticsConversionLabel}>Auth / Welcome</Text>
                          <Text style={styles.analyticsConversionValue}>{formatRate(registerSubmits + loginSubmits, welcomeViews)}</Text>
                        </View>
                      </View>

                      {analyticsSummary.recentEvents.length > 0 ? (
                        <View style={styles.analyticsRecentWrap}>
                          <Text style={styles.analyticsRecentTitle}>Événements récents</Text>
                          {analyticsSummary.recentEvents.slice(0, 5).map((event) => (
                            <View key={event.id} style={styles.analyticsRecentRow}>
                              <Text style={styles.analyticsRecentEvent}>{event.eventName}</Text>
                              <Text style={styles.analyticsRecentMeta}>{event.surface} · {event.pathname || '/'}</Text>
                            </View>
                          ))}
                        </View>
                      ) : null}
                    </>
                  ) : (
                    <Text style={styles.adminEmpty}>Aucune donnée analytics disponible pour le moment.</Text>
                  )}
                </View>

                <View style={styles.adminSectionDivider} />

                <Text style={styles.analyticsTitle}>Modération</Text>
                {adminReports.length === 0 ? (
                  <Text style={styles.adminEmpty}>Aucun signalement en attente.</Text>
                ) : (
                  adminReports.map((report) => (
                    <View key={report.id} style={styles.reportCard}>
                      <View style={styles.reportHeader}>
                        <Text style={styles.reportTitle}>{report.reportedName}</Text>
                        <Text style={styles.reportStatus}>{report.status}</Text>
                      </View>
                      <Text style={styles.reportMeta}>Signalé par {report.reporterName}</Text>
                      <Text style={styles.reportReason}>{report.reason}</Text>
                      <Text style={styles.reportPreview} numberOfLines={3}>{report.messagePreview}</Text>
                      <View style={styles.reportActions}>
                        <TouchableOpacity style={styles.reportActionBtn} onPress={() => handleModerationAction(report.id, 'hide-message')}>
                          <Text style={styles.reportActionText}>Masquer</Text>
                        </TouchableOpacity>
                        <TouchableOpacity style={styles.reportActionBtn} onPress={() => handleModerationAction(report.id, 'suspend-user')}>
                          <Text style={styles.reportActionText}>Suspendre</Text>
                        </TouchableOpacity>
                        <TouchableOpacity style={styles.reportActionBtn} onPress={() => handleModerationAction(report.id, 'dismiss')}>
                          <Text style={styles.reportActionText}>Classer</Text>
                        </TouchableOpacity>
                      </View>
                    </View>
                  ))
                )}
              </View>
            )}
          </>
        ) : null}

        {!hasQuickRegistered && !authEmail ? (
          <TouchableOpacity
            style={styles.connectBtn}
            onPress={() => {
              setRegisterError('');
              setShowRegisterForm(true);
            }}
            activeOpacity={0.8}
          >
            <Text style={styles.connectBtnText}>S'inscrire</Text>
          </TouchableOpacity>
        ) : (
          <TouchableOpacity style={styles.secondaryBtn} onPress={handleLogout} activeOpacity={0.8}>
            <Text style={styles.secondaryBtnText}>Se déconnecter</Text>
          </TouchableOpacity>
        )}

        <TouchableOpacity style={styles.deleteBtn} onPress={handleDelete} activeOpacity={0.8}>
          <Text style={styles.deleteBtnText}>Supprimer mon compte</Text>
        </TouchableOpacity>
      </ScrollView>
    </SafeAreaView>
  );
}

function createStyles(p: ReturnType<typeof getThemeColors>) {
  return StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: p.background,
  },
  content: {
    padding: Spacing.lg,
    gap: Spacing.md,
    paddingBottom: 40,
  },
  heroRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.md,
    paddingTop: Spacing.sm,
  },
  avatar: {
    width: 68,
    height: 68,
    borderRadius: 34,
    backgroundColor: p.card,
    alignItems: 'center',
    justifyContent: 'center',
  },
  avatarText: {
    fontSize: 34,
  },
  heroInfo: {
    flex: 1,
    gap: 4,
  },
  heroName: {
    ...Typography.title,
    color: p.text,
  },
  heroSub: {
    ...Typography.caption,
    color: p.textSecondary,
  },
  accountMeta: {
    ...Typography.caption,
    color: p.textMuted,
  },
  accountBadge: {
    ...Typography.captionBold,
    color: p.accent,
  },
  warningCard: {
    backgroundColor: '#FFF3E8',
    borderRadius: Radius.md,
    padding: Spacing.md,
    gap: 4,
  },
  warningTitle: {
    ...Typography.bodyBold,
    color: '#B45309',
  },
  warningBody: {
    ...Typography.caption,
    color: '#92400E',
    lineHeight: 18,
  },
  statsRow: {
    flexDirection: 'row',
    gap: Spacing.sm,
  },
  statBox: {
    flex: 1,
    backgroundColor: p.card,
    borderRadius: Radius.md,
    padding: Spacing.md,
    alignItems: 'center',
    gap: 4,
  },
  statNum: {
    ...Typography.h1,
    color: p.text,
    fontSize: 22,
  },
  statLbl: {
    ...Typography.caption,
    color: p.textSecondary,
  },
  dominantCard: {
    backgroundColor: p.card,
    borderRadius: Radius.md,
    padding: Spacing.md,
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.md,
  },
  dominantEmoji: {
    width: 46,
    height: 46,
    borderRadius: 23,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'rgba(124,203,255,0.18)',
  },
  dominantInfo: {
    gap: 2,
  },
  dominantLabel: {
    ...Typography.caption,
    color: p.textSecondary,
  },
  dominantName: {
    ...Typography.bodyBold,
    color: p.text,
    fontSize: 18,
  },
  settingsCard: {
    backgroundColor: p.card,
    borderRadius: Radius.md,
    padding: Spacing.md,
    gap: Spacing.sm,
  },
  settingsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: 12,
  },
  settingsTextWrap: {
    flex: 1,
  },
  settingsTitle: {
    ...Typography.bodyBold,
    color: p.text,
  },
  settingsHint: {
    ...Typography.caption,
    color: p.textSecondary,
    lineHeight: 18,
    marginTop: 2,
  },
  settingsDivider: {
    height: 1,
    backgroundColor: p.border,
  },
  visibilityRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    marginTop: 2,
  },
  visibilityPill: {
    flexGrow: 1,
    minWidth: 94,
    borderRadius: Radius.pill,
    borderWidth: 1,
    borderColor: p.border,
    backgroundColor: p.background,
    paddingVertical: 9,
    alignItems: 'center',
  },
  visibilityPillActive: {
    backgroundColor: p.accentLight,
    borderColor: p.accent,
  },
  visibilityText: {
    ...Typography.captionBold,
    color: p.textSecondary,
  },
  visibilityTextActive: {
    color: p.text,
  },
  separator: {
    height: 1,
    backgroundColor: p.border,
    marginVertical: Spacing.sm,
  },
  bottomRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 2,
  },
  bottomLabel: {
    ...Typography.body,
    color: p.text,
    fontWeight: '600',
  },
  dataStorageCard: {
    backgroundColor: p.card,
    borderRadius: Radius.md,
    padding: Spacing.md,
    gap: Spacing.sm,
  },
  dataStorageHeader: {
    marginBottom: 4,
  },
  dataStorageTitle: {
    ...Typography.body,
    color: p.text,
    fontWeight: '700',
    fontSize: 15,
  },
  dataStorageRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: 12,
  },
  dataStorageTextWrap: {
    flex: 1,
  },
  dataStorageLabel: {
    ...Typography.body,
    color: p.text,
    fontWeight: '600',
    marginBottom: 4,
  },
  dataStorageHint: {
    ...Typography.small,
    color: p.textMuted,
    lineHeight: 18,
  },
  dataStorageUpgrade: {
    ...Typography.small,
    color: p.accent,
    marginTop: 4,
    lineHeight: 18,
  },
  calcBlock: {
    backgroundColor: p.card,
    borderRadius: Radius.md,
    padding: Spacing.md,
    gap: Spacing.sm,
  },
  traitRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.sm,
  },
  traitEmoji: {
    width: 24,
    height: 24,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'rgba(124,203,255,0.15)',
  },
  traitLabel: {
    ...Typography.caption,
    color: p.textSecondary,
    width: 80,
  },
  traitBarBg: {
    flex: 1,
    height: 6,
    backgroundColor: p.border,
    borderRadius: 3,
  },
  traitBarFg: {
    height: 6,
    borderRadius: 3,
  },
  traitPct: {
    ...Typography.caption,
    color: p.textSecondary,
    width: 32,
    textAlign: 'right',
    fontWeight: '600',
  },
  lectureBlock: {
    backgroundColor: p.card,
    borderRadius: Radius.md,
    padding: Spacing.md,
    gap: Spacing.md,
  },
  lecturePrimary: {
    gap: 4,
  },
  lectureTag: {
    ...Typography.captionBold,
    color: p.textSecondary,
    textTransform: 'uppercase' as const,
    letterSpacing: 0.5,
  },
  lectureValue: {
    ...Typography.h2,
    color: p.text,
  },
  lectureHelper: {
    ...Typography.caption,
    color: p.textSecondary,
    lineHeight: 18,
  },
  lectureStats: {
    flexDirection: 'row',
    gap: Spacing.sm,
  },
  lectureStat: {
    flex: 1,
    backgroundColor: p.background,
    borderRadius: Radius.sm,
    padding: Spacing.sm,
    alignItems: 'center',
    gap: 2,
  },
  lectureStatNum: {
    ...Typography.h2,
    color: p.text,
  },
  lectureStatLbl: {
    ...Typography.caption,
    color: p.textSecondary,
  },
  lectureCategories: {
    gap: Spacing.xs,
  },
  lectureCatLabel: {
    ...Typography.captionBold,
    color: p.textSecondary,
  },
  lectureCatPills: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: Spacing.xs,
  },
  lectureCatPill: {
    paddingHorizontal: Spacing.sm,
    paddingVertical: 4,
    borderRadius: Radius.pill,
  },
  lectureCatText: {
    ...Typography.captionBold,
  },
  lectureHint: {
    gap: 4,
    borderTopWidth: 1,
    borderTopColor: p.border,
    paddingTop: Spacing.sm,
  },
  lectureHintEyebrow: {
    ...Typography.captionBold,
    color: p.textSecondary,
  },
  lectureHintTitle: {
    ...Typography.bodyBold,
    color: p.text,
  },
  lectureHintBody: {
    ...Typography.caption,
    color: p.textSecondary,
    lineHeight: 18,
  },
  adminBlock: {
    backgroundColor: p.card,
    borderRadius: Radius.md,
    padding: Spacing.md,
    gap: Spacing.md,
  },
  analyticsCard: {
    gap: Spacing.sm,
  },
  analyticsTitle: {
    ...Typography.bodyBold,
    color: p.text,
  },
  analyticsSubtitle: {
    ...Typography.caption,
    color: p.textSecondary,
    lineHeight: 18,
  },
  analyticsError: {
    ...Typography.caption,
    color: '#C0392B',
  },
  analyticsStatsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: Spacing.sm,
  },
  analyticsStatCard: {
    minWidth: 132,
    flexGrow: 1,
    backgroundColor: p.background,
    borderRadius: Radius.md,
    padding: Spacing.md,
    gap: 4,
  },
  analyticsStatValue: {
    ...Typography.h2,
    color: p.text,
  },
  analyticsStatLabel: {
    ...Typography.caption,
    color: p.textSecondary,
  },
  analyticsConversionRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: Spacing.sm,
  },
  analyticsConversionPill: {
    flexGrow: 1,
    minWidth: 150,
    backgroundColor: p.card,
    borderRadius: Radius.pill,
    borderWidth: 1,
    borderColor: p.border,
    paddingHorizontal: Spacing.md,
    paddingVertical: 10,
    gap: 2,
  },
  analyticsConversionLabel: {
    ...Typography.caption,
    color: p.textMuted,
  },
  analyticsConversionValue: {
    ...Typography.captionBold,
    color: p.text,
  },
  analyticsRecentWrap: {
    gap: 8,
    paddingTop: 4,
  },
  analyticsRecentTitle: {
    ...Typography.captionBold,
    color: p.textSecondary,
  },
  analyticsRecentRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: Spacing.sm,
    paddingVertical: 2,
  },
  analyticsRecentEvent: {
    ...Typography.captionBold,
    color: p.text,
    flex: 1,
  },
  analyticsRecentMeta: {
    ...Typography.caption,
    color: p.textMuted,
    textAlign: 'right',
  },
  adminSectionDivider: {
    height: 1,
    backgroundColor: p.border,
  },
  adminEmpty: {
    ...Typography.caption,
    color: p.textSecondary,
  },
  reportCard: {
    backgroundColor: p.background,
    borderRadius: Radius.md,
    padding: Spacing.md,
    gap: 6,
  },
  reportHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    gap: Spacing.sm,
  },
  reportTitle: {
    ...Typography.bodyBold,
    color: p.text,
  },
  reportStatus: {
    ...Typography.captionBold,
    color: p.accent,
    textTransform: 'uppercase' as const,
  },
  reportMeta: {
    ...Typography.caption,
    color: p.textMuted,
  },
  reportReason: {
    ...Typography.captionBold,
    color: p.text,
  },
  reportPreview: {
    ...Typography.caption,
    color: p.textSecondary,
    lineHeight: 18,
  },
  reportActions: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: Spacing.xs,
    marginTop: 4,
  },
  reportActionBtn: {
    paddingHorizontal: Spacing.sm,
    paddingVertical: 8,
    borderRadius: Radius.pill,
    backgroundColor: p.card,
    borderWidth: 1,
    borderColor: p.border,
  },
  reportActionText: {
    ...Typography.captionBold,
    color: p.text,
  },
  registerCard: {
    backgroundColor: p.accentLight,
    borderRadius: Radius.md,
    padding: Spacing.md,
    gap: Spacing.sm,
    borderWidth: 1,
    borderColor: 'rgba(124,203,255,0.3)',
  },
  registerCardTitle: {
    ...Typography.bodyBold,
    color: p.text,
  },
  registerCardBody: {
    ...Typography.caption,
    color: p.textSecondary,
    lineHeight: 18,
  },
  registerCardBtn: {
    backgroundColor: p.accent,
    borderRadius: Radius.md,
    paddingVertical: 11,
    alignItems: 'center',
  },
  registerCardBtnDisabled: {
    opacity: 0.45,
  },
  registerCardBtnText: {
    ...Typography.bodyBold,
    color: '#0F172A',
    fontSize: 14,
  },
  registerForm: {
    gap: 10,
  },
  registerInput: {
    backgroundColor: p.card,
    borderRadius: Radius.md,
    borderWidth: 1,
    borderColor: p.border,
    paddingHorizontal: Spacing.md,
    paddingVertical: 11,
    ...Typography.body,
    color: p.text,
    fontSize: 15,
  },
  avatarPickerRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    justifyContent: 'center',
  },
  registerGenderRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  registerGenderPill: {
    flex: 1,
    minWidth: 92,
    borderRadius: Radius.pill,
    borderWidth: 1,
    borderColor: p.border,
    backgroundColor: p.card,
    paddingVertical: 9,
    alignItems: 'center',
  },
  registerGenderPillActive: {
    borderColor: p.accent,
    backgroundColor: '#D9F2FF',
  },
  registerGenderText: {
    ...Typography.captionBold,
    color: p.textSecondary,
  },
  registerGenderTextActive: {
    color: p.text,
  },
  avatarPill: {
    width: 42,
    height: 42,
    borderRadius: 21,
    borderWidth: 1,
    borderColor: p.border,
    backgroundColor: p.card,
    alignItems: 'center',
    justifyContent: 'center',
  },
  avatarPillActive: {
    borderColor: p.accent,
    backgroundColor: '#D9F2FF',
  },
  avatarPillText: {
    fontSize: 15,
    fontWeight: '700',
    color: p.text,
  },
  registerHintText: {
    ...Typography.caption,
    color: p.textMuted,
    textAlign: 'center',
  },
  registerErrorText: {
    ...Typography.caption,
    color: '#C62828',
    textAlign: 'center',
  },
  registerPrivacyNote: {
    ...Typography.caption,
    color: p.textMuted,
    textAlign: 'center',
  },
  connectBtn: {
    marginTop: Spacing.sm,
    padding: Spacing.md,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: p.accent,
    borderRadius: Radius.md,
    backgroundColor: p.accentLight,
  },
  connectBtnText: {
    color: p.text,
    fontWeight: '600',
    fontSize: 14,
  },
  secondaryBtn: {
    marginTop: Spacing.sm,
    padding: Spacing.md,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: p.border,
    borderRadius: Radius.md,
    backgroundColor: p.card,
  },
  secondaryBtnText: {
    color: p.text,
    fontWeight: '600',
    fontSize: 14,
  },
  deleteBtn: {
    marginTop: Spacing.sm,
    padding: Spacing.md,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: p.accent,
    borderRadius: Radius.md,
  },
  deleteBtnText: {
    color: p.accent,
    fontWeight: '600',
    fontSize: 14,
  },
  localNoticeCard: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    backgroundColor: p.card,
    borderRadius: Radius.lg,
    borderWidth: 1,
    borderColor: p.border,
    padding: Spacing.md,
    marginBottom: Spacing.md,
  },
  localNoticeTitle: {
    ...Typography.bodyBold,
    color: p.text,
    fontSize: 14,
    marginBottom: 4,
  },
  localNoticeBody: {
    ...Typography.caption,
    color: p.textSecondary,
    lineHeight: 18,
  },
  });
}