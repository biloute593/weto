import React, { useState } from 'react';
import {
  Modal,
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  Platform,
  Switch,
  KeyboardAvoidingView,
  ScrollView,
} from 'react-native';
import { Colors, Radius, Spacing, Typography } from '../theme/colors';
import { useWetoStore } from '../store/useWetoStore';

const CURRENT_YEAR = new Date().getFullYear();
const MIN_AGE = 13;
const MAX_AGE = 99;
const GENDER_OPTIONS = ['Homme', 'Femme', 'Autre'];

function isValidYear(y: string): boolean {
  const n = parseInt(y, 10);
  return Number.isFinite(n) && n >= CURRENT_YEAR - MAX_AGE && n <= CURRENT_YEAR - MIN_AGE;
}

export function QuickRegisterModal() {
  const { quickRegister, dismissMatch } = useWetoStore();
  const [pseudo, setPseudo] = useState('');
  const [birthYear, setBirthYear] = useState('');
  const [gender, setGender] = useState('');
  const [locationEnabled, setLocationEnabled] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const canSubmit = pseudo.trim().length >= 2 && isValidYear(birthYear) && gender.length > 0 && !loading;

  const handleSubmit = async () => {
    if (!canSubmit) return;
    setError('');
    setLoading(true);
    try {
      await quickRegister(pseudo.trim(), birthYear.trim(), 'A', gender);
    } catch {
      setError("Impossible de créer le profil. Vérifie ta connexion.");
    } finally {
      setLoading(false);
    }
  };

  const handleSkip = () => {
    dismissMatch();
  };

  return (
    <Modal
      visible
      transparent
      animationType="slide"
      statusBarTranslucent
    >
      <KeyboardAvoidingView
        style={styles.overlay}
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      >
        <ScrollView
          contentContainerStyle={styles.scrollContent}
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}
          bounces={false}
        >
          <View style={styles.card}>
            {/* Badge match */}
            <View style={styles.matchBadge}>
              <Text style={styles.matchBadgeText}>Tu as un match !</Text>
            </View>

            <Text style={styles.title}>Crée ton profil{'\n'}en 10 secondes</Text>
            <Text style={styles.subtitle}>
              Quelqu'un pense comme toi. Donne-lui un moyen de te trouver.
            </Text>

            {/* Pseudo */}
            <Text style={styles.label}>Ton pseudo</Text>
            <TextInput
              style={styles.input}
              value={pseudo}
              onChangeText={setPseudo}
              placeholder="Ex : Alex, Luna, Kira..."
              placeholderTextColor={Colors.textMuted}
              maxLength={24}
              autoFocus
              autoCapitalize="words"
              returnKeyType="next"
            />

            {/* Année de naissance */}
            <Text style={styles.label}>Année de naissance</Text>
            <TextInput
              style={styles.input}
              value={birthYear}
              onChangeText={setBirthYear}
              placeholder={`Ex : ${CURRENT_YEAR - 24}`}
              placeholderTextColor={Colors.textMuted}
              keyboardType="number-pad"
              maxLength={4}
              returnKeyType="done"
            />

            <Text style={styles.label}>Ton sexe</Text>
            <View style={styles.genderRow}>
              {GENDER_OPTIONS.map((option) => (
                <TouchableOpacity
                  key={option}
                  style={[styles.genderPill, gender === option && styles.genderPillActive]}
                  onPress={() => setGender(option)}
                  activeOpacity={0.85}
                >
                  <Text style={[styles.genderText, gender === option && styles.genderTextActive]}>{option}</Text>
                </TouchableOpacity>
              ))}
            </View>

            {/* Localisation */}
            <View style={styles.locationRow}>
              <View style={styles.locationTextWrap}>
                <Text style={styles.locationLabel}>Partager ma ville</Text>
                <Text style={styles.locationHint}>
                  Pour trouver des profils compatibles près de toi
                </Text>
              </View>
              <Switch
                value={locationEnabled}
                onValueChange={setLocationEnabled}
                thumbColor={locationEnabled ? Colors.white : Colors.textMuted}
                trackColor={{ false: Colors.border, true: Colors.accent }}
              />
            </View>

            {error ? <Text style={styles.errorText}>{error}</Text> : null}

            {/* CTA */}
            <TouchableOpacity
              style={[styles.submitBtn, !canSubmit && styles.submitBtnDisabled]}
              onPress={handleSubmit}
              disabled={!canSubmit}
              activeOpacity={0.85}
            >
              <Text style={styles.submitBtnText}>
                {loading ? 'Création...' : 'Voir mon match'}
              </Text>
            </TouchableOpacity>

            {/* Skip */}
            <TouchableOpacity style={styles.skipBtn} onPress={handleSkip} activeOpacity={0.7}>
              <Text style={styles.skipBtnText}>Passer pour l'instant</Text>
            </TouchableOpacity>

            {/* Privacy micro-notice */}
            <Text style={styles.privacyNote}>
              Pas d'email · Pas de mot de passe · Tes données restent les tiennes.
            </Text>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.65)',
    justifyContent: 'flex-end',
  },
  scrollContent: {
    justifyContent: 'flex-end',
    flexGrow: 1,
  },
  card: {
    backgroundColor: Colors.card,
    borderTopLeftRadius: Radius.lg,
    borderTopRightRadius: Radius.lg,
    paddingTop: Spacing.lg,
    paddingBottom: Platform.OS === 'ios' ? 40 : Spacing.lg,
    paddingHorizontal: Spacing.lg,
  },
  matchBadge: {
    alignSelf: 'center',
    backgroundColor: Colors.accentLight,
    borderRadius: Radius.pill,
    paddingHorizontal: 16,
    paddingVertical: 6,
    marginBottom: Spacing.md,
  },
  matchBadgeText: {
    ...Typography.small,
    color: Colors.accent,
    fontWeight: '700',
  },
  title: {
    ...Typography.h2,
    color: Colors.text,
    textAlign: 'center',
    marginBottom: Spacing.sm,
  },
  subtitle: {
    ...Typography.body,
    color: Colors.textMuted,
    textAlign: 'center',
    marginBottom: Spacing.lg,
  },
  label: {
    ...Typography.small,
    color: Colors.textMuted,
    marginBottom: 6,
    marginTop: Spacing.sm,
    fontWeight: '600',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  input: {
    backgroundColor: Colors.background,
    borderRadius: Radius.md,
    borderWidth: 1,
    borderColor: Colors.border,
    color: Colors.text,
    paddingHorizontal: 14,
    paddingVertical: 12,
    ...Typography.body,
    marginBottom: 4,
  },
  locationRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: Colors.background,
    borderRadius: Radius.md,
    paddingHorizontal: 14,
    paddingVertical: 12,
    marginTop: Spacing.sm,
    marginBottom: Spacing.md,
  },
  genderRow: {
    flexDirection: 'row',
    gap: 8,
    marginTop: 4,
    marginBottom: 8,
  },
  genderPill: {
    flex: 1,
    borderRadius: Radius.pill,
    borderWidth: 1,
    borderColor: Colors.border,
    backgroundColor: Colors.card,
    alignItems: 'center',
    paddingVertical: 10,
  },
  genderPillActive: {
    borderColor: Colors.accent,
    backgroundColor: Colors.accentLight,
  },
  genderText: {
    ...Typography.captionBold,
    color: Colors.textSecondary,
  },
  genderTextActive: {
    color: Colors.text,
  },
  locationTextWrap: {
    flex: 1,
    marginRight: 12,
  },
  locationLabel: {
    ...Typography.body,
    color: Colors.text,
    fontWeight: '600',
  },
  locationHint: {
    ...Typography.small,
    color: Colors.textMuted,
    marginTop: 2,
  },
  errorText: {
    ...Typography.small,
    color: '#FF5F7A',
    textAlign: 'center',
    marginBottom: Spacing.sm,
  },
  submitBtn: {
    backgroundColor: Colors.accent,
    borderRadius: Radius.pill,
    paddingVertical: 14,
    alignItems: 'center',
    marginTop: Spacing.sm,
  },
  submitBtnDisabled: {
    opacity: 0.45,
  },
  submitBtnText: {
    ...Typography.body,
    color: Colors.white,
    fontWeight: '700',
    fontSize: 16,
  },
  skipBtn: {
    alignItems: 'center',
    paddingVertical: 12,
    marginTop: 4,
  },
  skipBtnText: {
    ...Typography.body,
    color: Colors.textMuted,
  },
  privacyNote: {
    ...Typography.small,
    color: Colors.textMuted,
    textAlign: 'center',
    marginTop: 4,
    opacity: 0.7,
  },
});
