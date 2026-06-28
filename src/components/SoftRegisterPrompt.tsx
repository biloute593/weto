import React, { useEffect, useRef, useState } from 'react';
import {
  Animated,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
  Platform,
  KeyboardAvoidingView,
} from 'react-native';
import { Colors, Radius, Spacing, Typography } from '../theme/colors';
import { useWetoStore } from '../store/useWetoStore';

const GENDER_OPTIONS = ['Homme', 'Femme', 'Autre'];

export function SoftRegisterPrompt() {
  const { softRegisterNudge, hasQuickRegistered, dismissSoftNudge, quickRegister, answers, isLocalOnly } = useWetoStore();
  const slideAnim = useRef(new Animated.Value(120)).current;
  const [pseudo, setPseudo] = useState('');
  const [birthYear, setBirthYear] = useState('');
  const [gender, setGender] = useState('');
  const [loading, setLoading] = useState(false);
  const [step, setStep] = useState<'nudge' | 'form'>('nudge');

  const visible = softRegisterNudge && !hasQuickRegistered;

  useEffect(() => {
    if (visible) {
      Animated.spring(slideAnim, {
        toValue: 0,
        damping: 18,
        stiffness: 160,
        useNativeDriver: true,
      }).start();
    } else {
      Animated.timing(slideAnim, {
        toValue: 120,
        duration: 220,
        useNativeDriver: true,
      }).start();
    }
  }, [visible]);

  if (!visible) return null;

  const isValidYear = (y: string) => {
    const n = parseInt(y, 10);
    const currentYear = new Date().getFullYear();
    return !isNaN(n) && n >= currentYear - 99 && n <= currentYear - 13;
  };

  const canSubmit = pseudo.trim().length >= 2 && isValidYear(birthYear) && gender.length > 0 && !loading;

  const handleSubmit = async () => {
    if (!canSubmit) return;
    setLoading(true);
    try {
      await quickRegister(pseudo.trim(), birthYear.trim(), 'A', gender);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Animated.View
      style={[styles.wrapper, { transform: [{ translateY: slideAnim }] }]}
      pointerEvents="box-none"
    >
      <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
        <View style={styles.card}>
          {step === 'nudge' ? (
            <>
              <View style={styles.nudgeRow}>
                <View style={styles.nudgeText}>
                  <Text style={styles.nudgeTitle}>Ton profil a déjà commencé</Text>
                  <Text style={styles.nudgeBody}>
                    {isLocalOnly
                      ? `Tes ${answers.length} réponse${answers.length > 1 ? 's' : ''} sont déjà gardée${answers.length > 1 ? 's' : ''} sur cet appareil.`
                      : `Tes ${answers.length} réponse${answers.length > 1 ? 's' : ''} sont déjà enregistrée${answers.length > 1 ? 's' : ''}. Crée juste ton profil pour ne rien perdre.`}
                  </Text>
                </View>
                <TouchableOpacity onPress={dismissSoftNudge} style={styles.closeBtn} activeOpacity={0.7}>
                  <Text style={styles.closeText}>×</Text>
                </TouchableOpacity>
              </View>
              <View style={styles.nudgeActions}>
                <TouchableOpacity
                  style={styles.btnPrimary}
                  activeOpacity={0.85}
                  onPress={() => setStep('form')}
                >
                  <Text style={styles.btnPrimaryText}>Créer mon profil</Text>
                </TouchableOpacity>
                <TouchableOpacity
                  style={styles.btnSkip}
                  activeOpacity={0.7}
                  onPress={dismissSoftNudge}
                >
                  <Text style={styles.btnSkipText}>Plus tard</Text>
                </TouchableOpacity>
              </View>
            </>
          ) : (
            <>
              <View style={styles.formHeader}>
                <Text style={styles.nudgeTitle}>Choisis ton pseudo</Text>
                <TouchableOpacity onPress={dismissSoftNudge} style={styles.closeBtn} activeOpacity={0.7}>
                  <Text style={styles.closeText}>×</Text>
                </TouchableOpacity>
              </View>
              <View style={styles.formRow}>
                <TextInput
                  style={styles.input}
                  placeholder="Pseudo (min. 2 caractères)"
                  placeholderTextColor={Colors.textMuted}
                  value={pseudo}
                  onChangeText={setPseudo}
                  autoCorrect={false}
                  maxLength={20}
                />
                <TextInput
                  style={[styles.input, styles.inputYear]}
                  placeholder="Année de naissance"
                  placeholderTextColor={Colors.textMuted}
                  value={birthYear}
                  onChangeText={setBirthYear}
                  keyboardType="numeric"
                  maxLength={4}
                />
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
              </View>
              <Text style={styles.privacyNote}>Pseudo + année + sexe. Pas d'email, pas de mot de passe.</Text>
              <TouchableOpacity
                style={[styles.btnPrimary, !canSubmit && styles.btnPrimaryDisabled]}
                activeOpacity={canSubmit ? 0.85 : 1}
                onPress={handleSubmit}
              >
                <Text style={styles.btnPrimaryText}>{loading ? 'Sauvegarde...' : 'Sauvegarder →'}</Text>
              </TouchableOpacity>
            </>
          )}
        </View>
      </KeyboardAvoidingView>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  wrapper: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    zIndex: 60,
  },
  card: {
    backgroundColor: Colors.card,
    borderTopLeftRadius: Radius.lg,
    borderTopRightRadius: Radius.lg,
    padding: Spacing.lg,
    gap: Spacing.sm,
    ...Platform.select({
      ios: { shadowColor: '#000', shadowOffset: { width: 0, height: -4 }, shadowOpacity: 0.08, shadowRadius: 16 },
      android: { elevation: 8 },
      web: { boxShadow: '0 -4px 24px rgba(0,0,0,0.10)' },
    }),
  },
  nudgeRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: Spacing.sm,
  },
  nudgeText: {
    flex: 1,
    gap: 4,
  },
  nudgeTitle: {
    ...Typography.bodyBold,
    color: Colors.text,
  },
  nudgeBody: {
    ...Typography.small,
    color: Colors.textSecondary,
    lineHeight: 18,
  },
  closeBtn: {
    padding: 4,
  },
  closeText: {
    fontSize: 22,
    color: Colors.textMuted,
    lineHeight: 22,
  },
  nudgeActions: {
    flexDirection: 'row',
    gap: Spacing.sm,
    marginTop: 4,
  },
  btnPrimary: {
    flex: 1,
    backgroundColor: Colors.accent,
    borderRadius: Radius.md,
    paddingVertical: 11,
    alignItems: 'center',
  },
  btnPrimaryDisabled: {
    opacity: 0.45,
  },
  btnPrimaryText: {
    ...Typography.bodyBold,
    color: Colors.white,
  },
  btnSkip: {
    paddingHorizontal: 16,
    paddingVertical: 11,
    alignItems: 'center',
    justifyContent: 'center',
  },
  btnSkipText: {
    ...Typography.body,
    color: Colors.textSecondary,
  },
  formHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  formRow: {
    gap: 8,
  },
  genderRow: {
    flexDirection: 'row',
    gap: 8,
    flexWrap: 'wrap',
  },
  genderPill: {
    flex: 1,
    minWidth: 82,
    borderRadius: Radius.pill,
    borderWidth: 1,
    borderColor: Colors.border,
    paddingVertical: 9,
    alignItems: 'center',
    backgroundColor: Colors.card,
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
  input: {
    backgroundColor: Colors.background,
    borderRadius: Radius.md,
    borderWidth: 1,
    borderColor: Colors.border,
    paddingHorizontal: Spacing.md,
    paddingVertical: 12,
    ...Typography.body,
    color: Colors.text,
  },
  inputYear: {},
  privacyNote: {
    ...Typography.small,
    color: Colors.textMuted,
    textAlign: 'center',
  },
});
