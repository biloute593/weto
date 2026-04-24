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
} from 'react-native';
import { Colors, Spacing, Radius, Typography } from '../theme/colors';
import { useWetoStore, UserTraits } from '../store/useWetoStore';

const TRAIT_LABELS: Record<keyof UserTraits, string> = {
  sociability: 'Approche sociale',
  emotionalReactivity: 'Réactivité émotionnelle',
  riskTolerance: 'Tolérance au risque',
  humorStyle: "Style d'humour",
  conflictStyle: 'Gestion des conflits',
  stability: 'Stabilité',
};

const TRAIT_COLORS: Record<keyof UserTraits, string> = {
  sociability: '#007AFF',
  emotionalReactivity: '#FF6B9D',
  riskTolerance: '#FF9500',
  humorStyle: '#34C759',
  conflictStyle: '#AF52DE',
  stability: '#5AC8FA',
};

export function ProfileScreen() {
  const { userTraits, profileCompletion, answers, matches, userName, userAvatar, updateProfile, resetProgress } = useWetoStore();
  const [isEditModalVisible, setEditModalVisible] = useState(false);
  const [editName, setEditName] = useState(userName);
  const [editAvatar, setEditAvatar] = useState(userAvatar);

  const traitKeys = Object.keys(userTraits) as (keyof UserTraits)[];

  const dominantTrait = traitKeys.reduce((a, b) =>
    userTraits[a] > userTraits[b] ? a : b
  );

  const handleSaveProfile = () => {
    updateProfile(editName || 'Moi', editAvatar || '👤');
    setEditModalVisible(false);
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <View style={styles.headerTitleRow}>
          <Text style={styles.headerAvatar}>{userAvatar}</Text>
          <Text style={styles.title}>{userName}</Text>
        </View>
        <TouchableOpacity style={styles.settingsButton} onPress={() => setEditModalVisible(true)}>
          <Text style={styles.settingsIcon}>✏️</Text>
        </TouchableOpacity>
      </View>

      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.content}
      >
        {/* Profile completion card */}
        <View style={styles.completionCard}>
          <View style={styles.completionCircle}>
            <Text style={styles.completionPercent}>{profileCompletion}%</Text>
          </View>
          <View style={styles.completionInfo}>
            <Text style={styles.completionTitle}>
              {profileCompletion < 100 ? 'Profil en construction' : 'Profil complet !'}
            </Text>
            <Text style={styles.completionSubtitle}>
              {profileCompletion < 100
                ? 'Plus tu joues, plus les matchs seront pertinents.'
                : `Tu as répondu à ${answers.length} dilemmes. 🎉`}
            </Text>
            {/* Progress bar */}
            <View style={styles.progressBg}>
              <View
                style={[styles.progressFg, { width: `${profileCompletion}%` as any }]}
              />
            </View>
          </View>
        </View>

        {/* Stats */}
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
            <Text style={[styles.statNumber, { fontSize: 20 }]}>
              {TRAIT_LABELS[dominantTrait]?.split(' ')[0] ?? '—'}
            </Text>
            <Text style={styles.statLabel}>Dominant</Text>
          </View>
        </View>

        {/* Traits */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Mes traits (calculés)</Text>
          <View style={styles.traitsContainer}>
            {traitKeys.map((key) => (
              <View key={key} style={styles.traitRow}>
                <View style={styles.traitLabelRow}>
                  <View
                    style={[
                      styles.traitDot,
                      { backgroundColor: TRAIT_COLORS[key] },
                    ]}
                  />
                  <Text style={styles.traitLabel}>{TRAIT_LABELS[key]}</Text>
                  <Text style={styles.traitValue}>{Math.round(userTraits[key])}%</Text>
                </View>
                <View style={styles.traitBarBg}>
                  <View
                    style={[
                      styles.traitBarFg,
                      {
                        width: `${userTraits[key]}%` as any,
                        backgroundColor: TRAIT_COLORS[key],
                      },
                    ]}
                  />
                </View>
              </View>
            ))}
          </View>
        </View>

        {/* Dominant trait card */}
        <View style={styles.dominantCard}>
          <Text style={styles.dominantEmoji}>🧬</Text>
          <View style={{ flex: 1 }}>
            <Text style={styles.dominantTitle}>Trait dominant</Text>
            <Text style={styles.dominantName}>{TRAIT_LABELS[dominantTrait]}</Text>
            <Text style={styles.dominantValue}>{Math.round(userTraits[dominantTrait])} / 100</Text>
          </View>
        </View>

        <TouchableOpacity style={styles.resetButton} onPress={resetProgress}>
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
            />

            <Text style={styles.inputLabel}>Prénom</Text>
            <TextInput 
              style={styles.textInput}
              value={editName}
              onChangeText={setEditName}
              maxLength={20}
            />

            <View style={styles.modalActions}>
              <TouchableOpacity style={styles.modalBtnSecondary} onPress={() => setEditModalVisible(false)}>
                <Text style={styles.modalBtnTextSecondary}>Annuler</Text>
              </TouchableOpacity>
              <TouchableOpacity style={styles.modalBtnPrimary} onPress={handleSaveProfile}>
                <Text style={styles.modalBtnTextPrimary}>Sauvegarder</Text>
              </TouchableOpacity>
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
  headerTitleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.sm,
  },
  headerAvatar: {
    fontSize: 24,
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
  completionCircle: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: Colors.accentLight,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 3,
    borderColor: Colors.accent,
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
    }),
  },
  statNumber: {
    ...Typography.h1,
    color: Colors.accent,
  },
  statLabel: {
    ...Typography.small,
    color: Colors.textSecondary,
    textAlign: 'center',
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
  traitDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
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
  dominantCard: {
    backgroundColor: Colors.accentLight,
    borderRadius: Radius.lg,
    padding: Spacing.lg,
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.md,
    borderWidth: 1,
    borderColor: Colors.accent + '30',
  },
  dominantEmoji: {
    fontSize: 36,
  },
  dominantTitle: {
    ...Typography.caption,
    color: Colors.accent,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  dominantName: {
    ...Typography.h2,
    color: Colors.text,
  },
  dominantValue: {
    ...Typography.caption,
    color: Colors.textSecondary,
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
  modalBtnSecondary: {
    paddingVertical: Spacing.sm,
    paddingHorizontal: Spacing.md,
    borderRadius: Radius.pill,
  },
  modalBtnTextSecondary: {
    ...Typography.bodyBold,
    color: Colors.textSecondary,
  },
  modalBtnPrimary: {
    backgroundColor: Colors.accent,
    paddingVertical: Spacing.sm,
    paddingHorizontal: Spacing.lg,
    borderRadius: Radius.pill,
  },
  modalBtnTextPrimary: {
    ...Typography.bodyBold,
    color: Colors.white,
  },
});

