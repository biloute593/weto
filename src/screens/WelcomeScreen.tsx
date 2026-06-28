import React, { useEffect, useMemo, useState } from 'react';
import {
  SafeAreaView,
  ScrollView,
  KeyboardAvoidingView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
  Platform,
} from 'react-native';
import Animated, { FadeIn, FadeInDown } from 'react-native-reanimated';
import { Ionicons } from '@expo/vector-icons';
import { BrandLogo } from '../components/BrandLogo';
import { Colors, Radius, Spacing, Typography, getThemeColors } from '../theme/colors';
import { useWetoStore } from '../store/useWetoStore';
import { trackEvent } from '../utils/analytics';

const AVATAR_OPTIONS = ['A', 'B', 'C', 'D', 'E', 'F', 'G', 'H'];
const CURRENT_YEAR = new Date().getFullYear();
const GENDER_OPTIONS = ['Homme', 'Femme', 'Autre'];
const SEEKING_OPTIONS = [
  { label: 'Relation sérieuse', icon: 'heart-outline' as const },
  { label: 'Amitié', icon: 'people-outline' as const },
  { label: 'Autres', icon: 'sparkles-outline' as const },
];

type Step = 'pseudo' | 'details';

function WelcomeLayout({ children, styles }: { children: React.ReactNode; styles: ReturnType<typeof createStyles> }) {
  return (
    <SafeAreaView style={styles.container}>
      <KeyboardAvoidingView
        style={styles.flex}
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      >
        <ScrollView
          contentContainerStyle={styles.scrollContent}
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}
          bounces={false}
        >
          {children}
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

export function WelcomeScreen() {
  const { completeOnboarding, login, themeMode } = useWetoStore();
  const p = getThemeColors(themeMode);
  const styles = useMemo(() => createStyles(p), [themeMode]);
  const [step, setStep] = useState<Step>('pseudo');
  const [authMode, setAuthMode] = useState<'register' | 'login'>('register');
  const [name, setName] = useState('');
  const [avatar, setAvatar] = useState(AVATAR_OPTIONS[0]);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [birthYear, setBirthYear] = useState('');
  const [gender, setGender] = useState('');
  const [seeking, setSeeking] = useState('');
  const [locationGranted, setLocationGranted] = useState(false);
  const [isRequestingLocation, setIsRequestingLocation] = useState(false);
  const [locationError, setLocationError] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [authError, setAuthError] = useState('');
  const [passwordConfirm, setPasswordConfirm] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showPasswordConfirm, setShowPasswordConfirm] = useState(false);
  const [showLoginPassword, setShowLoginPassword] = useState(false);

  const trimmedName = name.trim();
  const trimmedEmail = email.trim().toLowerCase();
  const passwordValue = password.trim();
  const birthYearNum = parseInt(birthYear, 10);
  const birthYearValid =
    birthYear.length === 4 &&
    birthYearNum >= 1900 &&
    birthYearNum <= CURRENT_YEAR - 13;
  const emailValid = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(trimmedEmail);
  const passwordValid = passwordValue.length >= 8;
  const passwordsMatch = passwordValue === passwordConfirm.trim();
  const birthYearOptionalValid = birthYear.length === 0 || birthYearValid;

  useEffect(() => {
    trackEvent('welcome_viewed', {
      surface: Platform.OS === 'web' ? 'web' : 'native',
    });
  }, []);

  const requestLocation = () => {
    setLocationError('');
    if (Platform.OS === 'web') {
      if (typeof navigator !== 'undefined' && navigator.geolocation) {
        setIsRequestingLocation(true);
        navigator.geolocation.getCurrentPosition(
          () => {
            setLocationGranted(true);
            setIsRequestingLocation(false);
          },
          () => {
            setIsRequestingLocation(false);
            setLocationError('Localisation refusée. Tu peux continuer sans et l\'activer plus tard.');
          },
          { timeout: 10000 }
        );
      } else {
        setLocationError('La géolocalisation n\'est pas disponible dans ce navigateur.');
      }
    } else {
      setLocationGranted(true);
    }
  };

  const handleRegister = async (entryPoint: 'quick' | 'details') => {
    if (isSubmitting) return;
    setAuthError('');
    setIsSubmitting(true);
    trackEvent('welcome_register_submit', {
      step,
      entryPoint,
      avatarCustomized: avatar !== AVATAR_OPTIONS[0],
      hasBirthYear: birthYear.length === 4,
      hasGender: Boolean(gender),
      hasSeeking: Boolean(seeking),
      locationGranted,
    });
    try {
      await completeOnboarding(trimmedName, avatar, birthYear, gender, seeking, trimmedEmail, passwordValue);
      trackEvent('welcome_register_success', {
        entryPoint,
        step,
        hasBirthYear: birthYear.length === 4,
        hasGender: Boolean(gender),
        hasSeeking: Boolean(seeking),
        locationGranted,
      });
    } catch (error) {
      setAuthError(error instanceof Error ? error.message : "Impossible de créer ton profil pour l'instant.");
      setIsSubmitting(false);
    }
  };

  const handleLogin = async () => {
    if (isSubmitting) return;
    setAuthError('');
    setIsSubmitting(true);
    trackEvent('welcome_login_submit', {
      surface: Platform.OS === 'web' ? 'web' : 'native',
    });
    try {
      await login(trimmedEmail, passwordValue);
      trackEvent('welcome_login_success', {
        surface: Platform.OS === 'web' ? 'web' : 'native',
      });
    } catch (error) {
      setAuthError(error instanceof Error ? error.message : 'Connexion impossible.');
      setIsSubmitting(false);
    }
  };

  const handleOpenDetails = () => {
    trackEvent('welcome_optional_details_opened', {
      surface: Platform.OS === 'web' ? 'web' : 'native',
    });
    setStep('details');
  };

  const renderAuthModeSwitch = () => (
    <View style={styles.authModeRow}>
      <TouchableOpacity
        style={[styles.authModePill, authMode === 'register' && styles.authModePillActive]}
        onPress={() => { setAuthMode('register'); setAuthError(''); }}
        activeOpacity={0.82}
      >
        <Text style={[styles.authModeText, authMode === 'register' && styles.authModeTextActive]}>Créer un compte</Text>
      </TouchableOpacity>
      <TouchableOpacity
        style={[styles.authModePill, authMode === 'login' && styles.authModePillActive]}
        onPress={() => { setAuthMode('login'); setAuthError(''); }}
        activeOpacity={0.82}
      >
        <Text style={[styles.authModeText, authMode === 'login' && styles.authModeTextActive]}>Se connecter</Text>
      </TouchableOpacity>
    </View>
  );

  if (authMode === 'login') {
    return (
      <WelcomeLayout styles={styles}>
        <Animated.View entering={FadeIn.duration(300)} style={styles.screen}>
          <View style={styles.topSection}>
            <BrandLogo variant="hero" align="center" />
            <Text style={styles.tagline}>Reconnecte ton compte sécurisé.</Text>
          </View>

          <Animated.View entering={FadeInDown.delay(100).duration(300)} style={styles.card}>
            {renderAuthModeSwitch()}
            <Text style={styles.cardTitle}>Connexion</Text>
            <Text style={styles.cardSub}>Retrouve immédiatement tes matchs, chats et réponses.</Text>

            <TextInput
              style={styles.input}
              value={email}
              onChangeText={(v) => { setEmail(v); setAuthError(''); }}
              placeholder="Email"
              placeholderTextColor={p.textMuted}
              autoCapitalize="none"
              autoCorrect={false}
              keyboardType="email-address"
            />

            <View style={styles.passwordRow}>
              <TextInput
                style={[styles.input, styles.passwordInput]}
                value={password}
                onChangeText={(v) => { setPassword(v); setAuthError(''); }}
                placeholder="Mot de passe"
                placeholderTextColor={p.textMuted}
                secureTextEntry={!showLoginPassword}
                autoCapitalize="none"
              />
              <TouchableOpacity
                style={styles.showHideBtn}
                onPress={() => setShowLoginPassword((p) => !p)}
                activeOpacity={0.7}
              >
                <Text style={styles.showHideText}>{showLoginPassword ? 'Masquer' : 'Afficher'}</Text>
              </TouchableOpacity>
            </View>

            {authError ? (
              <View style={styles.errorBox}>
                <Text style={styles.errorBoxText}>{authError}</Text>
              </View>
            ) : null}

            <TouchableOpacity
              style={[styles.btn, (!emailValid || !passwordValid || isSubmitting) && styles.btnDisabled]}
              onPress={() => { void handleLogin(); }}
              activeOpacity={0.85}
              disabled={!emailValid || !passwordValid || isSubmitting}
            >
              <Text style={styles.btnText}>{isSubmitting ? 'Connexion...' : 'Se connecter'}</Text>
            </TouchableOpacity>
          </Animated.View>
        </Animated.View>
      </WelcomeLayout>
    );
  }

  if (step === 'pseudo') {
    return (
      <WelcomeLayout styles={styles}>
        <Animated.View entering={FadeIn.duration(300)} style={styles.screen}>
          <View style={styles.topSection}>
            <BrandLogo variant="hero" align="center" />
            <Text style={styles.tagline}>Les dilemmes d'abord. Le reveal ensuite.</Text>
          </View>

          <Animated.View entering={FadeInDown.delay(100).duration(300)} style={styles.card}>
            {renderAuthModeSwitch()}
            <Text style={styles.stepLabel}>Étape 1 / 2</Text>
            <Text style={styles.cardTitle}>Sauvegarde ton signal</Text>
            <Text style={styles.cardSub}>Le minimum utile pour entrer est ici. Le reste peut venir juste après ou plus tard.</Text>

            <View style={styles.avatarRow}>
              <View style={styles.avatarPreview}>
                <Text style={styles.avatarPreviewText}>{avatar}</Text>
              </View>
              <View style={styles.avatarGrid}>
                {AVATAR_OPTIONS.map((opt) => (
                  <TouchableOpacity
                    key={opt}
                    style={[styles.avatarOpt, opt === avatar && styles.avatarOptSelected]}
                    onPress={() => setAvatar(opt)}
                    activeOpacity={0.7}
                  >
                    <Text style={styles.avatarOptText}>{opt}</Text>
                  </TouchableOpacity>
                ))}
              </View>
            </View>

            <TextInput
              style={styles.input}
              value={name}
              onChangeText={setName}
              placeholder="Ton pseudo"
              placeholderTextColor={p.textMuted}
              maxLength={24}
              autoCapitalize="words"
              autoCorrect={false}
            />

            <TextInput
              style={styles.input}
              value={email}
              onChangeText={(v) => { setEmail(v); setAuthError(''); }}
              placeholder="Email"
              placeholderTextColor={p.textMuted}
              autoCapitalize="none"
              autoCorrect={false}
              keyboardType="email-address"
            />

            <View style={styles.passwordRow}>
              <TextInput
                style={[styles.input, styles.passwordInput]}
                value={password}
                onChangeText={(v) => { setPassword(v); setAuthError(''); }}
                placeholder="Mot de passe (8 car. min)"
                placeholderTextColor={p.textMuted}
                secureTextEntry={!showPassword}
                autoCapitalize="none"
              />
              <TouchableOpacity
                style={styles.showHideBtn}
                onPress={() => setShowPassword((p) => !p)}
                activeOpacity={0.7}
              >
                <Text style={styles.showHideText}>{showPassword ? 'Masquer' : 'Afficher'}</Text>
              </TouchableOpacity>
            </View>

            <View style={styles.passwordRow}>
              <TextInput
                style={[styles.input, styles.passwordInput, passwordConfirm.length > 0 && !passwordsMatch && styles.inputError]}
                value={passwordConfirm}
                onChangeText={setPasswordConfirm}
                placeholder="Confirmer le mot de passe"
                placeholderTextColor={p.textMuted}
                secureTextEntry={!showPasswordConfirm}
                autoCapitalize="none"
              />
              <TouchableOpacity
                style={styles.showHideBtn}
                onPress={() => setShowPasswordConfirm((p) => !p)}
                activeOpacity={0.7}
              >
                <Text style={styles.showHideText}>{showPasswordConfirm ? 'Masquer' : 'Afficher'}</Text>
              </TouchableOpacity>
            </View>
            {passwordConfirm.length > 0 && !passwordsMatch ? (
              <Text style={styles.errorText}>Les mots de passe ne correspondent pas.</Text>
            ) : null}

            {authError ? (
              <View style={styles.errorBox}>
                <Text style={styles.errorBoxText}>{authError}</Text>
              </View>
            ) : null}

            <TouchableOpacity
              style={[styles.btn, (trimmedName.length < 2 || !emailValid || !passwordValid || !passwordsMatch || isSubmitting) && styles.btnDisabled]}
              onPress={() => { void handleRegister('quick'); }}
              activeOpacity={0.85}
              disabled={trimmedName.length < 2 || !emailValid || !passwordValid || !passwordsMatch || isSubmitting}
            >
              <Text style={styles.btnText}>{isSubmitting ? 'Création...' : 'Entrer dans Weto maintenant →'}</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={[styles.inlineSecondaryBtn, (trimmedName.length < 2 || !emailValid || !passwordValid || !passwordsMatch || isSubmitting) && styles.btnDisabled]}
              onPress={handleOpenDetails}
              activeOpacity={0.8}
              disabled={trimmedName.length < 2 || !emailValid || !passwordValid || !passwordsMatch || isSubmitting}
            >
              <Text style={styles.inlineSecondaryBtnText}>Ajouter plus de contexte avant d’entrer</Text>
            </TouchableOpacity>

            <Text style={styles.microcopy}>Tu pourras compléter les détails de base plus tard si tu veux juste entrer vite.</Text>
          </Animated.View>
        </Animated.View>
      </WelcomeLayout>
    );
  }

  if (step === 'details') {
    return (
      <WelcomeLayout styles={styles}>
        <Animated.View entering={FadeIn.duration(300)} style={styles.screen}>
          <View style={styles.topSection}>
            <BrandLogo variant="hero" align="center" />
            <Text style={styles.tagline}>Deux détails de plus, puis tu entres.</Text>
          </View>

          <Animated.View entering={FadeInDown.delay(80).duration(300)} style={styles.card}>
            <Text style={styles.stepLabel}>Étape 2 / 2</Text>
            <Text style={styles.cardTitle}>Affiner ton point de départ</Text>
            <Text style={styles.cardSub}>Ces infos restent optionnelles. Elles aident juste Weto à calibrer plus vite la compatibilité.</Text>

            <View style={styles.detailsSection}>
              <Text style={styles.sectionLabel}>Année de naissance</Text>
              <TextInput
                style={[styles.input, styles.inputLarge]}
                value={birthYear}
                onChangeText={(value) => setBirthYear(value.replace(/\D/g, '').slice(0, 4))}
                placeholder="Ex : 1995"
                placeholderTextColor={p.textMuted}
                keyboardType="numeric"
                maxLength={4}
              />

              {birthYear.length === 4 && !birthYearValid ? (
                <Text style={styles.errorText}>Année invalide</Text>
              ) : null}
            </View>

            <View style={styles.detailsSection}>
              <Text style={styles.sectionLabel}>Je suis</Text>
              <View style={styles.pillRow}>
                {GENDER_OPTIONS.map((value) => (
                  <TouchableOpacity
                    key={value}
                    style={[styles.pill, gender === value && styles.pillSelected]}
                    onPress={() => setGender(value)}
                    activeOpacity={0.75}
                  >
                    <Text style={[styles.pillText, gender === value && styles.pillTextSelected]}>{value}</Text>
                  </TouchableOpacity>
                ))}
              </View>
            </View>

            <View style={styles.detailsSection}>
              <Text style={styles.sectionLabel}>Je cherche</Text>
              <View style={styles.pillRow}>
                {SEEKING_OPTIONS.map((value) => (
                  <TouchableOpacity
                    key={value.label}
                    style={[styles.pill, seeking === value.label && styles.pillSelected]}
                    onPress={() => setSeeking(value.label)}
                    activeOpacity={0.75}
                  >
                    <View style={styles.pillIconRow}>
                      <Ionicons
                        name={value.icon}
                        size={14}
                        color={seeking === value.label ? p.accent : p.textSecondary}
                      />
                      <Text style={[styles.pillText, seeking === value.label && styles.pillTextSelected]}>{value.label}</Text>
                    </View>
                  </TouchableOpacity>
                ))}
              </View>
            </View>

            <View style={styles.detailsSection}>
              <Text style={styles.sectionLabel}>Localisation</Text>
              <Text style={styles.cardSub}>Optionnelle elle aussi, utile seulement pour rapprocher les matchs.</Text>

              {!locationGranted ? (
                <TouchableOpacity
                  style={[styles.btn, isRequestingLocation && styles.btnDisabled]}
                  onPress={requestLocation}
                  activeOpacity={0.85}
                  disabled={isRequestingLocation}
                >
                  <Text style={styles.btnText}>
                    {isRequestingLocation ? 'Activation...' : 'Activer ma localisation'}
                  </Text>
                </TouchableOpacity>
              ) : (
                <View style={styles.locationGrantedRow}>
                  <Text style={styles.locationGrantedText}>✓ Localisation activée</Text>
                </View>
              )}

              {locationError ? (
                <View style={styles.errorBox}>
                  <Text style={styles.errorBoxText}>{locationError}</Text>
                </View>
              ) : null}
            </View>

            {authError ? (
              <View style={styles.errorBox}>
                <Text style={styles.errorBoxText}>{authError}</Text>
              </View>
            ) : null}

            <TouchableOpacity
              style={[styles.btn, (!birthYearOptionalValid || isSubmitting) && styles.btnDisabled]}
              onPress={() => { void handleRegister('details'); }}
              activeOpacity={0.85}
              disabled={!birthYearOptionalValid || isSubmitting}
            >
              <Text style={styles.btnText}>{isSubmitting ? 'Création...' : 'Entrer dans Weto avec ces détails →'}</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={[styles.inlineSecondaryBtn, (!birthYearOptionalValid || isSubmitting) && styles.btnDisabled]}
              onPress={() => { void handleRegister('quick'); }}
              activeOpacity={0.8}
              disabled={!birthYearOptionalValid || isSubmitting}
            >
              <Text style={styles.inlineSecondaryBtnText}>Passer ces détails</Text>
            </TouchableOpacity>

            <TouchableOpacity onPress={() => setStep('pseudo')} style={styles.backBtn}>
              <Text style={styles.backBtnText}>← Retour</Text>
            </TouchableOpacity>
          </Animated.View>
        </Animated.View>
      </WelcomeLayout>
    );
  }

  return null;
}

function createStyles(p: ReturnType<typeof getThemeColors>) {
  return StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: p.background,
  },
  flex: {
    flex: 1,
  },
  scrollContent: {
    flexGrow: 1,
    justifyContent: 'center',
  },
  screen: {
    padding: Spacing.lg,
    gap: Spacing.lg,
  },
  topSection: {
    alignItems: 'center',
    gap: Spacing.sm,
  },
  logo: {
    fontSize: 28,
    fontWeight: '800',
    color: p.accent,
    letterSpacing: 3,
  },
  tagline: {
    ...Typography.body,
    color: p.textSecondary,
    textAlign: 'center',
  },
  card: {
    backgroundColor: p.card,
    borderRadius: Radius.lg,
    padding: Spacing.lg,
    gap: Spacing.md,
    ...Platform.select({
      web: { boxShadow: '0 4px 24px rgba(0,0,0,0.08)' },
      ios: { shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.07, shadowRadius: 12 },
      android: { elevation: 3 },
    }),
  },
  authModeRow: {
    flexDirection: 'row',
    gap: Spacing.sm,
  },
  authModePill: {
    flex: 1,
    paddingVertical: 10,
    borderRadius: Radius.pill,
    backgroundColor: p.background,
    borderWidth: 1,
    borderColor: p.border,
    alignItems: 'center',
  },
  authModePillActive: {
    backgroundColor: p.accentLight,
    borderColor: p.accent,
  },
  authModeText: {
    ...Typography.caption,
    color: p.textSecondary,
    fontWeight: '600',
  },
  authModeTextActive: {
    color: p.accent,
  },
  stepLabel: {
    fontSize: 11,
    fontWeight: '700',
    color: p.accent,
    letterSpacing: 0.5,
    textTransform: 'uppercase',
  },
  cardTitle: {
    ...Typography.title,
    color: p.text,
  },
  cardSub: {
    ...Typography.caption,
    color: p.textSecondary,
    lineHeight: 20,
  },
  detailsSection: {
    gap: Spacing.sm,
  },
  avatarRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.md,
  },
  avatarPreview: {
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: p.accentLight,
    alignItems: 'center',
    justifyContent: 'center',
  },
  avatarPreviewText: {
    fontSize: 28,
  },
  avatarGrid: {
    flex: 1,
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  avatarOpt: {
    width: 42,
    height: 42,
    borderRadius: 21,
    backgroundColor: p.background,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1.5,
    borderColor: 'transparent',
  },
  avatarOptSelected: {
    backgroundColor: p.accentLight,
    borderColor: p.accent,
  },
  avatarOptText: {
    fontSize: 20,
  },
  input: {
    backgroundColor: p.background,
    borderRadius: Radius.md,
    paddingHorizontal: Spacing.md,
    paddingVertical: 14,
    color: p.text,
    ...Typography.body,
    borderWidth: 1,
    borderColor: p.border,
  },
  inputError: {
    borderColor: '#e04040',
  },
  passwordRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.sm,
  },
  passwordInput: {
    flex: 1,
  },
  showHideBtn: {
    paddingHorizontal: Spacing.sm,
    paddingVertical: 14,
  },
  showHideText: {
    ...Typography.caption,
    color: p.accent,
    fontWeight: '600',
  },
  inlineSecondaryBtn: {
    alignItems: 'center',
    paddingVertical: 8,
  },
  inlineSecondaryBtnText: {
    ...Typography.captionBold,
    color: p.accent,
  },
  microcopy: {
    ...Typography.caption,
    color: p.textMuted,
    textAlign: 'center',
    lineHeight: 18,
  },
  errorBox: {
    backgroundColor: '#fff0f0',
    borderRadius: Radius.md,
    padding: Spacing.md,
    borderWidth: 1,
    borderColor: '#ffcccc',
  },
  errorBoxText: {
    ...Typography.caption,
    color: '#c0392b',
    textAlign: 'center',
    fontWeight: '600',
  },
  inputLarge: {
    fontSize: 28,
    textAlign: 'center',
    fontWeight: '700',
    letterSpacing: 4,
  },
  errorText: {
    ...Typography.caption,
    color: p.accent,
    textAlign: 'center',
  },
  btn: {
    backgroundColor: p.accent,
    borderRadius: Radius.md,
    paddingVertical: 16,
    alignItems: 'center',
  },
  btnSecondary: {
    backgroundColor: p.text,
  },
  btnDisabled: {
    opacity: 0.35,
  },
  btnText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '700',
  },
  backBtn: {
    alignItems: 'center',
    paddingVertical: 4,
  },
  backBtnText: {
    ...Typography.caption,
    color: p.textMuted,
  },
  locationIcon: {
    alignItems: 'center',
    paddingVertical: Spacing.md,
  },
  locationEmoji: {
    fontSize: 48,
  },
  locationGrantedRow: {
    backgroundColor: '#1a3a2a',
    borderRadius: Radius.md,
    padding: Spacing.md,
    alignItems: 'center',
  },
  locationGrantedText: {
    color: '#4cd964',
    fontWeight: '700',
    fontSize: 15,
  },
  sectionLabel: {
    ...Typography.captionBold,
    color: p.textSecondary,
    textTransform: 'uppercase' as const,
    letterSpacing: 0.5,
  },
  pillRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: Spacing.sm,
  },
  pill: {
    paddingHorizontal: Spacing.md,
    paddingVertical: 10,
    borderRadius: Radius.pill,
    backgroundColor: p.background,
    borderWidth: 1.5,
    borderColor: p.border,
  },
  pillSelected: {
    backgroundColor: p.accentLight,
    borderColor: p.accent,
  },
  pillText: {
    ...Typography.caption,
    color: p.text,
    fontWeight: '500',
  },
  pillTextSelected: {
    color: p.accent,
    fontWeight: '700',
  },
  pillIconRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  });
}