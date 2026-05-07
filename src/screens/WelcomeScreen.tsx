import React, { useState } from 'react';
import {
  SafeAreaView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
  Platform,
} from 'react-native';
import Animated, { FadeIn, FadeInDown } from 'react-native-reanimated';
import { Colors, Radius, Spacing, Typography } from '../theme/colors';
import { useWetoStore } from '../store/useWetoStore';

const AVATAR_OPTIONS = ['🫶', '😌', '🦊', '🌞', '🧠', '✨', '🎧', '🌊'];
const CURRENT_YEAR = new Date().getFullYear();
type Step = 'pseudo' | 'birth' | 'location';

export function WelcomeScreen() {
  const { completeOnboarding } = useWetoStore();
  const [step, setStep] = useState<Step>('pseudo');
  const [name, setName] = useState('');
  const [avatar, setAvatar] = useState('🫶');
  const [birthYear, setBirthYear] = useState('');
  const [locationGranted, setLocationGranted] = useState(false);

  const trimmedName = name.trim();
  const birthYearNum = parseInt(birthYear, 10);
  const birthYearValid =
    birthYear.length === 4 &&
    birthYearNum >= 1900 &&
    birthYearNum <= CURRENT_YEAR - 13;

  const requestLocation = () => {
    if (Platform.OS === 'web') {
      if (typeof navigator !== 'undefined' && navigator.geolocation) {
        navigator.geolocation.getCurrentPosition(
          () => setLocationGranted(true),
          () => setLocationGranted(false)
        );
      }
    } else {
      setLocationGranted(true);
    }
  };

  const handleEnter = () => {
    completeOnboarding(trimmedName, avatar, birthYear);
  };

  // ── STEP 1: Pseudo ─────────────────────────────────────────────
  if (step === 'pseudo') {
    return (
      <SafeAreaView style={styles.container}>
        <Animated.View entering={FadeIn.duration(300)} style={styles.screen}>
          <View style={styles.topSection}>
            <Text style={styles.logo}>WETO</Text>
            <Text style={styles.tagline}>Les dilemmes d'abord. Le reveal ensuite.</Text>
          </View>

          <Animated.View entering={FadeInDown.delay(100).duration(300)} style={styles.card}>
            <Text style={styles.stepLabel}>Étape 1 / 3</Text>
            <Text style={styles.cardTitle}>Ton pseudo</Text>
            <Text style={styles.cardSub}>
              Choisis un nom et un avatar. Ton vrai profil se construit via tes réponses.
            </Text>

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
              placeholderTextColor={Colors.textMuted}
              maxLength={24}
              autoCapitalize="words"
              autoCorrect={false}
            />

            <TouchableOpacity
              style={[styles.btn, trimmedName.length < 2 && styles.btnDisabled]}
              onPress={() => trimmedName.length >= 2 && setStep('birth')}
              activeOpacity={0.85}
            >
              <Text style={styles.btnText}>Continuer →</Text>
            </TouchableOpacity>
          </Animated.View>
        </Animated.View>
      </SafeAreaView>
    );
  }

  // ── STEP 2: Année de naissance ──────────────────────────────────
  if (step === 'birth') {
    return (
      <SafeAreaView style={styles.container}>
        <Animated.View entering={FadeIn.duration(300)} style={styles.screen}>
          <View style={styles.topSection}>
            <Text style={styles.logo}>WETO</Text>
            <Text style={styles.tagline}>{trimmedName}, quelques infos de base.</Text>
          </View>

          <Animated.View entering={FadeInDown.delay(80).duration(300)} style={styles.card}>
            <Text style={styles.stepLabel}>Étape 2 / 3</Text>
            <Text style={styles.cardTitle}>Ton année de naissance</Text>
            <Text style={styles.cardSub}>
              Pour calibrer les compatibilités. Pas affiché publiquement.
            </Text>

            <TextInput
              style={[styles.input, styles.inputLarge]}
              value={birthYear}
              onChangeText={(v) => setBirthYear(v.replace(/\D/g, '').slice(0, 4))}
              placeholder="Ex : 1995"
              placeholderTextColor={Colors.textMuted}
              keyboardType="numeric"
              maxLength={4}
            />

            {birthYear.length === 4 && !birthYearValid && (
              <Text style={styles.errorText}>Année invalide</Text>
            )}

            <TouchableOpacity
              style={[styles.btn, !birthYearValid && styles.btnDisabled]}
              onPress={() => birthYearValid && setStep('location')}
              activeOpacity={0.85}
            >
              <Text style={styles.btnText}>Continuer →</Text>
            </TouchableOpacity>

            <TouchableOpacity onPress={() => setStep('pseudo')} style={styles.backBtn}>
              <Text style={styles.backBtnText}>← Retour</Text>
            </TouchableOpacity>
          </Animated.View>
        </Animated.View>
      </SafeAreaView>
    );
  }

  // ── STEP 3: Localisation ────────────────────────────────────────
  return (
    <SafeAreaView style={styles.container}>
      <Animated.View entering={FadeIn.duration(300)} style={styles.screen}>
        <View style={styles.topSection}>
          <Text style={styles.logo}>WETO</Text>
          <Text style={styles.tagline}>Presque là.</Text>
        </View>

        <Animated.View entering={FadeInDown.delay(80).duration(300)} style={styles.card}>
          <Text style={styles.stepLabel}>Étape 3 / 3</Text>
          <Text style={styles.cardTitle}>Activer la localisation</Text>
          <Text style={styles.cardSub}>
            Pour trouver des matchs près de toi. Tu peux refuser et activer plus tard.
          </Text>

          <View style={styles.locationIcon}>
            <Text style={styles.locationEmoji}>📍</Text>
          </View>

          {!locationGranted ? (
            <TouchableOpacity style={styles.btn} onPress={requestLocation} activeOpacity={0.85}>
              <Text style={styles.btnText}>Activer la localisation</Text>
            </TouchableOpacity>
          ) : (
            <View style={styles.locationGrantedRow}>
              <Text style={styles.locationGrantedText}>✓ Localisation activée</Text>
            </View>
          )}

          <TouchableOpacity style={[styles.btn, styles.btnSecondary]} onPress={handleEnter} activeOpacity={0.85}>
            <Text style={styles.btnText}>
              {locationGranted ? 'Entrer dans Weto →' : 'Passer et entrer →'}
            </Text>
          </TouchableOpacity>

          <TouchableOpacity onPress={() => setStep('birth')} style={styles.backBtn}>
            <Text style={styles.backBtnText}>← Retour</Text>
          </TouchableOpacity>
        </Animated.View>
      </Animated.View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  screen: {
    flex: 1,
    padding: Spacing.lg,
    justifyContent: 'center',
    gap: Spacing.lg,
  },
  topSection: {
    alignItems: 'center',
    gap: Spacing.sm,
  },
  logo: {
    fontSize: 28,
    fontWeight: '800',
    color: Colors.accent,
    letterSpacing: 3,
  },
  tagline: {
    ...Typography.body,
    color: Colors.textSecondary,
    textAlign: 'center',
  },
  card: {
    backgroundColor: Colors.card,
    borderRadius: Radius.lg,
    padding: Spacing.lg,
    gap: Spacing.md,
    ...Platform.select({
      web: { boxShadow: '0 4px 24px rgba(0,0,0,0.08)' },
      ios: { shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.07, shadowRadius: 12 },
      android: { elevation: 3 },
    }),
  },
  stepLabel: {
    fontSize: 11,
    fontWeight: '700',
    color: Colors.accent,
    letterSpacing: 0.5,
    textTransform: 'uppercase',
  },
  cardTitle: {
    ...Typography.title,
    color: Colors.text,
  },
  cardSub: {
    ...Typography.caption,
    color: Colors.textSecondary,
    lineHeight: 20,
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
    backgroundColor: Colors.accentLight,
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
    backgroundColor: Colors.background,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1.5,
    borderColor: 'transparent',
  },
  avatarOptSelected: {
    backgroundColor: Colors.accentLight,
    borderColor: Colors.accent,
  },
  avatarOptText: {
    fontSize: 20,
  },
  input: {
    backgroundColor: Colors.background,
    borderRadius: Radius.md,
    paddingHorizontal: Spacing.md,
    paddingVertical: 14,
    color: Colors.text,
    ...Typography.body,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  inputLarge: {
    fontSize: 28,
    textAlign: 'center',
    fontWeight: '700',
    letterSpacing: 4,
  },
  errorText: {
    ...Typography.caption,
    color: '#FF3B30',
    textAlign: 'center',
  },
  btn: {
    backgroundColor: Colors.accent,
    borderRadius: Radius.md,
    paddingVertical: 16,
    alignItems: 'center',
  },
  btnSecondary: {
    backgroundColor: Colors.text,
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
    color: Colors.textMuted,
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
});