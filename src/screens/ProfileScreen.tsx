import React, { useState } from 'react';
import {
  View,
  Text,
  ScrollView,
  StyleSheet,
  TouchableOpacity,
  SafeAreaView,
  Platform,
  TextInput,
  Modal,
  Alert,
} from 'react-native';
import { AppButton } from '../components/AppButton';
import { ProgressRing } from '../components/ProgressRing';
import { Colors, Spacing, Radius, Typography } from '../theme/colors';
import { useWetoStore } from '../store/useWetoStore';
import { TRAIT_LABELS, getDominantTrait } from '../utils';
import { TraitKey } from '../types';
import { PROFILE_COMPLETION_TARGET } from '../data/scenarios';

const TRAIT_EMOJIS: Record<TraitKey, string> = {
  sociability: '🌍',
  humor: '😄',
  risk: '🎯',
  emotion: '💙',
  conflict: '🤝',
  stability: '⚖️',
};

const TRAIT_BAR_COLORS: Record<TraitKey, string> = {
  sociability: '#007AFF',
  humor: '#FF9500',
  risk: '#FF3B30',
  emotion: '#AF52DE',
  conflict: '#34C759',
  stability: '#5856D6',
};

const TRAIT_SUMMARIES: Record<TraitKey, string> = {
  sociability: 'Tu t actives dans la rencontre et tu lis vite les dynamiques sociales.',
  humor: 'Tu crées du lien par le decalage, la repartie et la legerete.',
  risk: 'Tu reagis bien a l incertitude et tu aimes les situations qui bougent.',
  emotion: 'Tu ressens fort, ce qui donne de l intensite a tes choix et a tes liens.',
  conflict: 'Tu n esquives pas facilement la friction quand quelque chose compte.',
  stability: 'Tu privilegies les signaux fiables, les cadres clairs et les relations solides.',
};

export function ProfileScreen() {
  const {
    userVector,
    profileCompletion,
    answers,
    matches,
    userName,
    userAvatar,
    updateProfile,
    resetProgress,
  } = useWetoStore();

  const [isEditModalVisible, setEditModalVisible] = useState(false);
  const [editName, setEditName] = useState(userName);
  const [editAvatar, setEditAvatar] = useState(userAvatar);

  const traitKeys = Object.keys(userVector) as TraitKey[];
  const dominant = getDominantTrait(userVector);
  const remainingAnswers = Math.max(0, PROFILE_COMPLETION_TARGET - answers.length);
  const hasReliableSignal = answers.length >= PROFILE_COMPLETION_TARGET;

  const handleSaveProfile = () => {
    updateProfile(editName || 'Moi', editAvatar || '👤');
    setEditModalVisible(false);
  };

  const handleReset = () => {
    if (Platform.OS === 'web' && typeof window !== 'undefined') {
      const shouldReset = window.confirm('Tu es sûr·e de vouloir recommencer à zéro ?');
      if (shouldReset) {
        resetProgress();
      }
      return;
    }

    Alert.alert(
      'Réinitialiser',
      'Tu es sûr·e de vouloir recommencer à zéro ?',
      [
        { text: 'Annuler', style: 'cancel' },
        { text: 'Réinitialiser', style: 'destructive', onPress: resetProgress },
      ]
    );
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Mon profil</Text>
        <TouchableOpacity
          style={styles.settingsButton}
          onPress={() => {
            setEditName(userName);
            setEditAvatar(userAvatar);
            setEditModalVisible(true);
          }}
        >
          <Text style={styles.settingsIcon}>⚙️</Text>
        </TouchableOpacity>
      </View>

      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.content}
      >
        {/* Profile completion card */}
        <View style={styles.completionCard}>
          <ProgressRing progress={profileCompletion} size={80} strokeWidth={7}>
            <Text style={styles.completionPercent}>{profileCompletion}%</Text>
          </ProgressRing>
          <View style={styles.completionInfo}>
            <Text style={styles.completionTitle}>
              {hasReliableSignal ? 'Profil lisible' : 'Profil en construction'}
            </Text>
            <Text style={styles.completionSubtitle}>
              {hasReliableSignal
                ? 'Le signal est assez net pour matcher, puis continuer a s affiner.'
                : `${answers.length} reponse${answers.length > 1 ? 's' : ''} enregistree${answers.length > 1 ? 's' : ''} · profil lisible autour de ${PROFILE_COMPLETION_TARGET} dilemmes`}
            </Text>
            {/* Progress bar */}
            <View style={styles.progressBg}>
              <View
                style={[styles.progressFg, { width: `${profileCompletion}%` as any }]}
              />
            </View>
          </View>
        </View>

        {/* Stats row */}
        <View style={styles.statsRow}>
          <View style={styles.statCard}>
            <Text style={styles.statNumber}>{answers.length}</Text>
            <Text style={styles.statLabel}>Réponses</Text>
          </View>
          <View style={styles.statCard}>
            <Text style={styles.statNumber}>{matches.length}</Text>
            <Text style={styles.statLabel}>Matchs</Text>
          </View>
          <View style={styles.statCard}>
            <Text style={styles.statEmoji}>{TRAIT_EMOJIS[dominant.key]}</Text>
            <Text style={styles.statLabel}>{dominant.label}</Text>
          </View>
        </View>

        <View style={styles.identityCard}>
          <View style={styles.identityAvatar}>
            <Text style={styles.identityAvatarText}>{userAvatar}</Text>
          </View>
          <View style={styles.identityInfo}>
            <Text style={styles.identityName}>{userName}</Text>
            <Text style={styles.identityTag}>Signature actuelle: {dominant.label}</Text>
            <Text style={styles.identitySummary}>{TRAIT_SUMMARIES[dominant.key]}</Text>
          </View>
        </View>

        <View style={styles.signalCard}>
          <Text style={styles.signalEyebrow}>Lecture Weto</Text>
          <Text style={styles.signalTitle}>
            {hasReliableSignal
              ? 'Le profil est deja assez net pour matcher.'
              : 'Encore quelques dilemmes et la lecture devient fiable.'}
          </Text>
          <Text style={styles.signalBody}>
            {hasReliableSignal
              ? 'A partir de la, Weto peut matcher de facon serieuse. Si tu continues a repondre, tu affines surtout les nuances plutot que le socle.'
              : `Encore ${remainingAnswers} dilemme${remainingAnswers > 1 ? 's' : ''} environ pour stabiliser les zones les moins lisibles et rendre les matchs plus solides.`}
          </Text>
        </View>

        {/* Traits */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Mes traits</Text>
          <View style={styles.traitsContainer}>
            {traitKeys.map((key) => (
              <View key={key} style={styles.traitRow}>
                <View style={styles.traitLabelRow}>
                  <Text style={styles.traitEmoji}>{TRAIT_EMOJIS[key]}</Text>
                  <Text style={styles.traitLabel}>{TRAIT_LABELS[key]}</Text>
                  <Text style={styles.traitValue}>{Math.round(userVector[key])}%</Text>
                </View>
                <View style={styles.traitBarBg}>
                  <View
                    style={[
                      styles.traitBarFg,
                      {
                        width: `${userVector[key]}%` as any,
                        backgroundColor: TRAIT_BAR_COLORS[key],
                      },
                    ]}
                  />
                </View>
              </View>
            ))}
          </View>
        </View>

        {/* Reset */}
        <TouchableOpacity style={styles.resetButton} onPress={handleReset}>
          <Text style={styles.resetButtonText}>Réinitialiser (Démo)</Text>
        </TouchableOpacity>
      </ScrollView>

      {/* Edit Profile Modal */}
      <Modal visible={isEditModalVisible} transparent animationType="fade">
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>Modifier le profil</Text>

            <Text style={styles.inputLabel}>Avatar (Emoji)</Text>
            <TextInput
              style={styles.textInput}
              value={editAvatar}
              onChangeText={setEditAvatar}
              maxLength={2}
              placeholder="👤"
              placeholderTextColor={Colors.textMuted}
            />

            <Text style={styles.inputLabel}>Prénom</Text>
            <TextInput
              style={styles.textInput}
              value={editName}
              onChangeText={setEditName}
              maxLength={20}
              placeholder="Ton prénom"
              placeholderTextColor={Colors.textMuted}
            />

            <View style={styles.modalActions}>
              <AppButton
                title="Annuler"
                onPress={() => setEditModalVisible(false)}
                variant="secondary"
                size="md"
                style={styles.modalActionButton}
              />
              <AppButton
                title="Sauvegarder"
                onPress={handleSaveProfile}
                size="md"
                style={styles.modalActionButton}
              />
            </View>
          </View>
        </View>
      </Modal>
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
    alignItems: 'center',
    paddingHorizontal: Spacing.lg,
    paddingVertical: Spacing.md,
  },
  title: {
    ...Typography.title,
    color: Colors.text,
  },
  settingsButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: Colors.card,
    alignItems: 'center',
    justifyContent: 'center',
    ...Platform.select({
      web: { boxShadow: '0 2px 8px rgba(0,0,0,0.07)' },
    }),
  },
  settingsIcon: {
    fontSize: 18,
  },
  content: {
    padding: Spacing.md,
    gap: Spacing.md,
    paddingBottom: Spacing.xxl,
  },
  completionCard: {
    backgroundColor: Colors.card,
    borderRadius: Radius.lg,
    padding: Spacing.lg,
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.md,
    ...Platform.select({
      web: { boxShadow: '0 4px 20px rgba(0,0,0,0.07)' },
      ios: { shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.07, shadowRadius: 12 },
      android: { elevation: 3 },
    }),
  },
  completionPercent: {
    ...Typography.h1,
    color: Colors.accent,
  },
  completionInfo: {
    flex: 1,
    gap: Spacing.xs,
  },
  completionTitle: {
    ...Typography.bodyBold,
    color: Colors.text,
  },
  completionSubtitle: {
    ...Typography.caption,
    color: Colors.textSecondary,
    lineHeight: 18,
  },
  progressBg: {
    height: 4,
    backgroundColor: Colors.border,
    borderRadius: 2,
    marginTop: Spacing.xs,
  },
  progressFg: {
    height: 4,
    backgroundColor: Colors.accent,
    borderRadius: 2,
  },
  statsRow: {
    flexDirection: 'row',
    gap: Spacing.sm,
  },
  statCard: {
    flex: 1,
    backgroundColor: Colors.card,
    borderRadius: Radius.md,
    padding: Spacing.md,
    alignItems: 'center',
    gap: 4,
    ...Platform.select({
      web: { boxShadow: '0 2px 12px rgba(0,0,0,0.06)' },
      ios: { shadowColor: '#000', shadowOffset: { width: 0, height: 1 }, shadowOpacity: 0.05, shadowRadius: 8 },
      android: { elevation: 2 },
    }),
  },
  statNumber: {
    ...Typography.h1,
    color: Colors.accent,
  },
  statEmoji: {
    fontSize: 24,
  },
  statLabel: {
    ...Typography.small,
    color: Colors.textSecondary,
    textAlign: 'center',
  },
  identityCard: {
    backgroundColor: Colors.card,
    borderRadius: Radius.lg,
    padding: Spacing.lg,
    flexDirection: 'row',
    gap: Spacing.md,
    alignItems: 'center',
    ...Platform.select({
      web: { boxShadow: '0 4px 20px rgba(0,0,0,0.07)' },
      ios: { shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.06, shadowRadius: 12 },
      android: { elevation: 2 },
    }),
  },
  identityAvatar: {
    width: 72,
    height: 72,
    borderRadius: 36,
    backgroundColor: Colors.accentLight,
    alignItems: 'center',
    justifyContent: 'center',
  },
  identityAvatarText: {
    fontSize: 34,
  },
  identityInfo: {
    flex: 1,
    gap: 4,
  },
  identityName: {
    ...Typography.h2,
    color: Colors.text,
  },
  identityTag: {
    ...Typography.captionBold,
    color: Colors.accent,
  },
  identitySummary: {
    ...Typography.body,
    color: Colors.textSecondary,
  },
  signalCard: {
    backgroundColor: Colors.card,
    borderRadius: Radius.lg,
    padding: Spacing.lg,
    gap: Spacing.xs,
    ...Platform.select({
      web: { boxShadow: '0 4px 20px rgba(0,0,0,0.07)' },
      ios: { shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.06, shadowRadius: 12 },
      android: { elevation: 2 },
    }),
  },
  signalEyebrow: {
    ...Typography.small,
    color: Colors.textMuted,
    textTransform: 'uppercase',
    letterSpacing: 0.8,
  },
  signalTitle: {
    ...Typography.bodyBold,
    color: Colors.text,
  },
  signalBody: {
    ...Typography.body,
    color: Colors.textSecondary,
  },
  section: {
    gap: Spacing.md,
  },
  sectionTitle: {
    ...Typography.h2,
    color: Colors.text,
  },
  traitsContainer: {
    backgroundColor: Colors.card,
    borderRadius: Radius.lg,
    padding: Spacing.lg,
    gap: Spacing.md,
    ...Platform.select({
      web: { boxShadow: '0 4px 20px rgba(0,0,0,0.07)' },
      ios: { shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.06, shadowRadius: 12 },
      android: { elevation: 2 },
    }),
  },
  traitRow: {
    gap: Spacing.xs,
  },
  traitLabelRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.sm,
  },
  traitEmoji: {
    fontSize: 16,
  },
  traitLabel: {
    ...Typography.body,
    color: Colors.text,
    flex: 1,
  },
  traitValue: {
    ...Typography.captionBold,
    color: Colors.textSecondary,
  },
  traitBarBg: {
    height: 6,
    backgroundColor: Colors.border,
    borderRadius: 3,
  },
  traitBarFg: {
    height: 6,
    borderRadius: 3,
  },
  resetButton: {
    paddingVertical: Spacing.md,
    alignItems: 'center',
    marginTop: Spacing.md,
  },
  resetButtonText: {
    ...Typography.bodyBold,
    color: '#FF3B30',
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: Spacing.lg,
  },
  modalContent: {
    backgroundColor: Colors.card,
    borderRadius: Radius.lg,
    padding: Spacing.xl,
    width: '100%',
    maxWidth: 400,
  },
  modalTitle: {
    ...Typography.h1,
    color: Colors.text,
    marginBottom: Spacing.lg,
  },
  inputLabel: {
    ...Typography.captionBold,
    color: Colors.textSecondary,
    marginBottom: Spacing.xs,
  },
  textInput: {
    backgroundColor: Colors.background,
    borderRadius: Radius.md,
    padding: Spacing.md,
    marginBottom: Spacing.md,
    ...Typography.body,
    color: Colors.text,
  },
  modalActions: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    gap: Spacing.md,
    marginTop: Spacing.md,
  },
  modalActionButton: {
    flex: 1,
  },
});
