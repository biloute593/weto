import React, { useState } from 'react';
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
} from 'react-native';
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

export function ProfileScreen() {
  const {
    userVector,
    answers,
    matches,
    userName,
    userAvatar,
    resetProgress,
  } = useWetoStore();

  const [showCalc, setShowCalc] = useState(false);

  const traitKeys = Object.keys(userVector) as TraitKey[];
  const dominant = getDominantTrait(userVector);

  const handleDelete = () => {
    if (Platform.OS === 'web' && typeof window !== 'undefined') {
      const ok = window.confirm('Supprimer ton compte ? Cette action est irreversible.');
      if (ok) resetProgress();
      return;
    }
    Alert.alert(
      'Supprimer le compte',
      'Cette action est irreversible.',
      [
        { text: 'Annuler', style: 'cancel' },
        { text: 'Supprimer', style: 'destructive', onPress: resetProgress },
      ]
    );
  };

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.content}>

        <View style={styles.heroRow}>
          <View style={styles.avatar}>
            <Text style={styles.avatarText}>{userAvatar}</Text>
          </View>
          <View style={styles.heroInfo}>
            <Text style={styles.heroName}>{userName}</Text>
            <Text style={styles.heroSub}>{dominant.label} - {answers.length} reponses</Text>
          </View>
        </View>

        <View style={styles.statsRow}>
          <View style={styles.statBox}>
            <Text style={styles.statNum}>{answers.length}</Text>
            <Text style={styles.statLbl}>Reponses</Text>
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
          <Text style={styles.dominantEmoji}>{TRAIT_EMOJIS[dominant.key]}</Text>
          <View style={styles.dominantInfo}>
            <Text style={styles.dominantLabel}>Trait dominant</Text>
            <Text style={styles.dominantName}>{dominant.label}</Text>
          </View>
        </View>

        <View style={styles.separator} />

        <View style={styles.bottomRow}>
          <Text style={styles.bottomLabel}>Calculs</Text>
          <Switch
            value={showCalc}
            onValueChange={setShowCalc}
            trackColor={{ false: Colors.border, true: Colors.accent }}
            thumbColor={Colors.card}
          />
        </View>

        {showCalc && (
          <View style={styles.calcBlock}>
            {traitKeys.map((key) => (
              <View key={key} style={styles.traitRow}>
                <Text style={styles.traitEmoji}>{TRAIT_EMOJIS[key]}</Text>
                <Text style={styles.traitLabel}>{TRAIT_LABELS[key]}</Text>
                <View style={styles.traitBarBg}>
                  <View
                    style={[
                      styles.traitBarFg,
                      { width: `${userVector[key]}%` as any, backgroundColor: TRAIT_BAR_COLORS[key] },
                    ]}
                  />
                </View>
                <Text style={styles.traitPct}>{Math.round(userVector[key])}%</Text>
              </View>
            ))}
          </View>
        )}

        <TouchableOpacity style={styles.deleteBtn} onPress={handleDelete} activeOpacity={0.8}>
          <Text style={styles.deleteBtnText}>Supprimer mon compte</Text>
        </TouchableOpacity>

      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background,
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
    width: 72,
    height: 72,
    borderRadius: 36,
    backgroundColor: Colors.card,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 2,
    borderColor: Colors.accent,
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
    color: Colors.text,
  },
  heroSub: {
    ...Typography.caption,
    color: Colors.textSecondary,
  },
  statsRow: {
    flexDirection: 'row',
    gap: Spacing.sm,
  },
  statBox: {
    flex: 1,
    backgroundColor: Colors.card,
    borderRadius: Radius.md,
    padding: Spacing.md,
    alignItems: 'center',
    gap: 4,
  },
  statNum: {
    ...Typography.h1,
    color: Colors.text,
    fontSize: 22,
  },
  statLbl: {
    ...Typography.caption,
    color: Colors.textSecondary,
  },
  dominantCard: {
    backgroundColor: Colors.card,
    borderRadius: Radius.md,
    padding: Spacing.md,
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.md,
  },
  dominantEmoji: {
    fontSize: 36,
  },
  dominantInfo: {
    gap: 2,
  },
  dominantLabel: {
    ...Typography.caption,
    color: Colors.textSecondary,
  },
  dominantName: {
    ...Typography.bodyBold,
    color: Colors.text,
    fontSize: 18,
  },
  separator: {
    height: 1,
    backgroundColor: Colors.border,
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
    color: Colors.text,
    fontWeight: '600',
  },
  calcBlock: {
    backgroundColor: Colors.card,
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
    fontSize: 16,
    width: 22,
    textAlign: 'center',
  },
  traitLabel: {
    ...Typography.caption,
    color: Colors.textSecondary,
    width: 80,
  },
  traitBarBg: {
    flex: 1,
    height: 6,
    backgroundColor: Colors.border,
    borderRadius: 3,
  },
  traitBarFg: {
    height: 6,
    borderRadius: 3,
  },
  traitPct: {
    ...Typography.caption,
    color: Colors.textSecondary,
    width: 32,
    textAlign: 'right',
    fontWeight: '600',
  },
  deleteBtn: {
    marginTop: Spacing.sm,
    padding: Spacing.md,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#FF3B30',
    borderRadius: Radius.md,
  },
  deleteBtnText: {
    color: '#FF3B30',
    fontWeight: '600',
    fontSize: 14,
  },
});