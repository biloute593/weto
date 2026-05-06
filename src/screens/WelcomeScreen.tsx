import React, { useMemo, useState } from 'react';
import {
  SafeAreaView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';
import Animated, { FadeIn, FadeInDown, FadeInUp, ZoomIn } from 'react-native-reanimated';
import { AppButton } from '../components/AppButton';
import { Colors, Radius, Spacing, Typography } from '../theme/colors';
import { useWetoStore } from '../store/useWetoStore';

const AVATAR_OPTIONS = ['🫶', '😌', '🦊', '🌞', '🧠', '✨', '🎧', '🌊'];

export function WelcomeScreen() {
  const { completeOnboarding } = useWetoStore();
  const [name, setName] = useState('');
  const [avatar, setAvatar] = useState('🫶');

  const trimmedName = name.trim();
  const canContinue = trimmedName.length >= 2;
  const welcomeNote = useMemo(() => {
    if (!trimmedName) {
      return 'Choisis une identite minimale. Les photos resteront masquees jusqu au premier match.';
    }

    return `${trimmedName}, ton profil commencera par tes reactions, pas par ton image.`;
  }, [trimmedName]);

  return (
    <SafeAreaView style={styles.container}>
      <Animated.View entering={ZoomIn.delay(60).duration(360)} style={styles.backgroundShapeTop} />
      <Animated.View entering={ZoomIn.delay(120).duration(360)} style={styles.backgroundShapeBottom} />

      <View style={styles.content}>
        <Animated.View entering={FadeInDown.duration(360)} style={styles.heroCard}>
          <Animated.Text entering={FadeIn.delay(80).duration(280)} style={styles.eyebrow}>WETO</Animated.Text>
          <Animated.Text entering={FadeInDown.delay(120).duration(320)} style={styles.title}>Les dilemmes d abord. Le reveal ensuite.</Animated.Text>
          <Animated.Text entering={FadeInDown.delay(180).duration(320)} style={styles.subtitle}>
            Weto observe ton humour, tes valeurs et ton style relationnel avant d ouvrir la porte aux photos.
          </Animated.Text>

          <View style={styles.pointList}>
            <Animated.View entering={FadeInDown.delay(220).duration(260)} style={styles.pointRow}>
              <Text style={styles.pointIcon}>01</Text>
              <Text style={styles.pointText}>Tu reponds a des dilemmes courts et assumés.</Text>
            </Animated.View>
            <Animated.View entering={FadeInDown.delay(280).duration(260)} style={styles.pointRow}>
              <Text style={styles.pointIcon}>02</Text>
              <Text style={styles.pointText}>Ton profil psychologique se densifie en silence.</Text>
            </Animated.View>
            <Animated.View entering={FadeInDown.delay(340).duration(260)} style={styles.pointRow}>
              <Text style={styles.pointIcon}>03</Text>
              <Text style={styles.pointText}>Si la compatibilite est forte, le match se revele.</Text>
            </Animated.View>
          </View>
        </Animated.View>

        <Animated.View entering={FadeInUp.delay(200).duration(360)} style={styles.identityCard}>
          <Text style={styles.sectionTitle}>Ton point de depart</Text>
          <Text style={styles.helperText}>{welcomeNote}</Text>

          <Animated.View entering={ZoomIn.delay(320).duration(300)} style={styles.avatarPreview}>
            <Text style={styles.avatarPreviewText}>{avatar}</Text>
          </Animated.View>

          <TextInput
            style={styles.input}
            value={name}
            onChangeText={setName}
            placeholder="Ton prenom"
            placeholderTextColor={Colors.textMuted}
            maxLength={24}
            autoCapitalize="words"
            autoCorrect={false}
          />

          <View style={styles.avatarGrid}>
            {AVATAR_OPTIONS.map((option) => {
              const selected = option === avatar;

              return (
                <TouchableOpacity
                  key={option}
                  style={[styles.avatarOption, selected && styles.avatarOptionSelected]}
                  activeOpacity={0.8}
                  onPress={() => setAvatar(option)}
                >
                  <Text style={styles.avatarOptionText}>{option}</Text>
                </TouchableOpacity>
              );
            })}
          </View>

          <AppButton
            title="Entrer dans Weto"
            onPress={() => completeOnboarding(trimmedName, avatar)}
            fullWidth
            disabled={!canContinue}
          />
        </Animated.View>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  backgroundShapeTop: {
    position: 'absolute',
    top: -120,
    right: -40,
    width: 240,
    height: 240,
    borderRadius: 120,
    backgroundColor: '#DCEEFF',
  },
  backgroundShapeBottom: {
    position: 'absolute',
    bottom: -100,
    left: -30,
    width: 200,
    height: 200,
    borderRadius: 100,
    backgroundColor: '#FFF4D8',
  },
  content: {
    flex: 1,
    justifyContent: 'center',
    padding: Spacing.lg,
    gap: Spacing.md,
  },
  heroCard: {
    backgroundColor: Colors.card,
    borderRadius: Radius.lg,
    padding: Spacing.lg,
    gap: Spacing.md,
  },
  eyebrow: {
    ...Typography.small,
    color: Colors.accent,
    letterSpacing: 1.2,
    textTransform: 'uppercase',
  },
  title: {
    ...Typography.title,
    color: Colors.text,
    lineHeight: 34,
  },
  subtitle: {
    ...Typography.body,
    color: Colors.textSecondary,
  },
  pointList: {
    gap: Spacing.sm,
  },
  pointRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.sm,
  },
  pointIcon: {
    ...Typography.captionBold,
    color: Colors.accent,
    width: 22,
  },
  pointText: {
    ...Typography.caption,
    color: Colors.text,
    flex: 1,
    lineHeight: 20,
  },
  identityCard: {
    backgroundColor: Colors.card,
    borderRadius: Radius.lg,
    padding: Spacing.lg,
    gap: Spacing.md,
  },
  sectionTitle: {
    ...Typography.h2,
    color: Colors.text,
  },
  helperText: {
    ...Typography.caption,
    color: Colors.textSecondary,
    lineHeight: 20,
  },
  avatarPreview: {
    width: 72,
    height: 72,
    borderRadius: 36,
    backgroundColor: Colors.accentLight,
    alignItems: 'center',
    justifyContent: 'center',
    alignSelf: 'center',
  },
  avatarPreviewText: {
    fontSize: 34,
  },
  input: {
    backgroundColor: Colors.background,
    borderRadius: Radius.md,
    paddingHorizontal: Spacing.md,
    paddingVertical: 14,
    color: Colors.text,
    ...Typography.body,
  },
  avatarGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: Spacing.sm,
    justifyContent: 'center',
  },
  avatarOption: {
    width: 52,
    height: 52,
    borderRadius: 26,
    backgroundColor: Colors.background,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: 'transparent',
  },
  avatarOptionSelected: {
    backgroundColor: Colors.accentLight,
    borderColor: Colors.accent,
  },
  avatarOptionText: {
    fontSize: 24,
  },
});