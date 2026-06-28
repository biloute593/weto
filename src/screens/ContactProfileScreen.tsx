import React, { useMemo, useState } from 'react';
import {
  View,
  Text,
  ScrollView,
  StyleSheet,
  TouchableOpacity,
  SafeAreaView,
  Platform,
  Image,
  Dimensions,
  Modal,
} from 'react-native';
import { useNavigation, useRoute } from '@react-navigation/native';
import { Ionicons } from '@expo/vector-icons';
import { Colors, Spacing, Radius, Typography, getThemeColors } from '../theme/colors';
import { useWetoStore } from '../store/useWetoStore';
import { SCENARIOS } from '../data/scenarios';
import { getAvatarMonogram } from '../utils';

const { width: SCREEN_WIDTH } = Dimensions.get('window');
const PHOTO_GRID_COLS = 3;
const PHOTO_CELL = Math.floor((SCREEN_WIDTH - 4) / PHOTO_GRID_COLS);

const TRAIT_LABELS: Record<string, string> = {
  sociability: 'Sociabilité',
  humor: 'Humour',
  risk: 'Prise de risque',
  emotion: 'Émotion',
  conflict: 'Gestion conflits',
  stability: 'Stabilité',
};

const TRAIT_BAR_COLORS: Record<string, string> = {
  sociability: '#7CCBFF',
  humor: '#9DDCFF',
  risk: '#B7E6FF',
  emotion: '#8FD6FF',
  conflict: '#A9E1FF',
  stability: '#C6ECFF',
};

export function ContactProfileScreen() {
  const route = useRoute<any>();
  const navigation = useNavigation<any>();
  const { contactId } = route.params as { contactId: string };
  const { matches, chats, themeMode } = useWetoStore();
  const p = getThemeColors(themeMode);
  const styles = useMemo(() => createStyles(p), [themeMode]);
  const [lightboxUri, setLightboxUri] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<'profile' | 'media' | 'dilemmas'>('profile');

  const matchedProfile = useMemo(
    () => matches.find((m) => m.id === contactId) ?? null,
    [contactId, matches]
  );

  const thread = chats[contactId];
  const isPrivate = matchedProfile?.profileVisibility === 'private';
  const profilePhotos = matchedProfile?.profilePhotos ?? [];
  const favoriteScenarioIds = matchedProfile?.favoriteScenarioIds ?? [];
  const favoriteDilemmas = useMemo(
    () => SCENARIOS.filter((s) => favoriteScenarioIds.includes(s.id)),
    [favoriteScenarioIds]
  );

  const traitEntries = useMemo(() => {
    if (!matchedProfile || isPrivate) return [];
    return Object.entries(matchedProfile.traits).sort((a, b) => b[1] - a[1]);
  }, [matchedProfile, isPrivate]);

  const contactName = matchedProfile?.name ?? thread?.contactName ?? '?';
  const contactAvatar = matchedProfile?.avatar ?? thread?.contactAvatar ?? '?';
  const avatarLabel = getAvatarMonogram(contactName, contactAvatar);
  const isOnline = thread?.isContactOnline ?? false;

  const handleMessagePress = () => {
    navigation.navigate('ChatDetail', { contactId });
  };

  if (!matchedProfile && !thread) {
    return (
      <SafeAreaView style={styles.container}>
        <TouchableOpacity style={styles.backBtn} onPress={() => navigation.goBack()}>
          <Ionicons name="chevron-back" size={24} color="#64748B" />
        </TouchableOpacity>
        <View style={styles.emptyState}>
          <Text style={styles.emptyTitle}>Profil introuvable</Text>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      {/* Back button floating over hero */}
      <TouchableOpacity style={styles.backBtn} onPress={() => navigation.goBack()}>
        <Ionicons name="chevron-back" size={24} color="#FFFFFF" />
      </TouchableOpacity>

      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
      >
        {/* Hero section — avatar + name */}
        <View style={styles.heroSection}>
          <View style={styles.heroGradient} />
          <View style={styles.avatarHeroWrap}>
            <View style={styles.avatarHero}>
              <Text style={styles.avatarHeroText}>{avatarLabel}</Text>
            </View>
            {isOnline && <View style={styles.onlineDot} />}
          </View>
          <Text style={styles.heroName}>{contactName}</Text>
          {isPrivate ? (
            <View style={styles.privateBadge}>
              <Ionicons name="lock-closed-outline" size={12} color="#64748B" />
              <Text style={styles.privateBadgeText}>Profil privé</Text>
            </View>
          ) : (
            matchedProfile && (
              <View style={styles.heroScoreRow}>
                <Ionicons name="heart-outline" size={14} color="#7CCBFF" />
                <Text style={styles.heroScoreText}>Compatibilité {matchedProfile.compatibilityScore}%</Text>
              </View>
            )
          )}
          <TouchableOpacity style={styles.messageBtn} onPress={handleMessagePress} activeOpacity={0.85}>
            <Ionicons name="chatbubble-ellipses-outline" size={18} color="#FFFFFF" />
            <Text style={styles.messageBtnText}>Envoyer un message</Text>
          </TouchableOpacity>
        </View>

        {/* Tab bar */}
        {!isPrivate && (
          <View style={styles.tabBar}>
            <TouchableOpacity
              style={[styles.tab, activeTab === 'profile' && styles.tabActive]}
              onPress={() => setActiveTab('profile')}
              activeOpacity={0.8}
            >
              <Text style={[styles.tabText, activeTab === 'profile' && styles.tabTextActive]}>Profil</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[styles.tab, activeTab === 'media' && styles.tabActive]}
              onPress={() => setActiveTab('media')}
              activeOpacity={0.8}
            >
              <Text style={[styles.tabText, activeTab === 'media' && styles.tabTextActive]}>Médias</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[styles.tab, activeTab === 'dilemmas' && styles.tabActive]}
              onPress={() => setActiveTab('dilemmas')}
              activeOpacity={0.8}
            >
              <Text style={[styles.tabText, activeTab === 'dilemmas' && styles.tabTextActive]}>Dilemmes</Text>
            </TouchableOpacity>
          </View>
        )}

        {/* Profile tab */}
        {(activeTab === 'profile' || isPrivate) && matchedProfile && !isPrivate && (
          <View style={styles.section}>
            {/* Compatibility bar */}
            <View style={styles.compatCard}>
              <View style={styles.compatLabelRow}>
                <Text style={styles.compatLabel}>Compatibilité</Text>
                <Text style={styles.compatPercent}>{matchedProfile.compatibilityScore}%</Text>
              </View>
              <View style={styles.compatBarBg}>
                <View style={[styles.compatBarFill, { width: `${matchedProfile.compatibilityScore}%` }]} />
              </View>
            </View>

            {/* Compatibility reasons */}
            {matchedProfile.compatibilityReasons.length > 0 && (
              <View style={styles.card}>
                <Text style={styles.cardTitle}>Analyse visible</Text>
                {matchedProfile.compatibilityReasons.map((reason, i) => (
                  <View key={i} style={styles.reasonRow}>
                    <Ionicons name="checkmark-circle-outline" size={16} color="#7CCBFF" />
                    <Text style={styles.reasonText}>{reason}</Text>
                  </View>
                ))}
              </View>
            )}

            {/* Trait bars */}
            {traitEntries.length > 0 && (
              <View style={styles.card}>
                <Text style={styles.cardTitle}>Traits dominants</Text>
                {traitEntries.slice(0, 6).map(([trait, value]) => (
                  <View key={trait} style={styles.traitRow}>
                    <Text style={styles.traitLabel}>{TRAIT_LABELS[trait] ?? trait}</Text>
                    <View style={styles.traitBarBg}>
                      <View
                        style={[
                          styles.traitBarFill,
                          {
                            width: `${Math.round(value)}%`,
                            backgroundColor: TRAIT_BAR_COLORS[trait] ?? '#7CCBFF',
                          },
                        ]}
                      />
                    </View>
                    <Text style={styles.traitValue}>{Math.round(value)}%</Text>
                  </View>
                ))}
              </View>
            )}
          </View>
        )}

        {/* Private profile stub */}
        {isPrivate && (
          <View style={styles.privateInfo}>
            <Ionicons name="lock-closed-outline" size={32} color="#CBD5E1" />
            <Text style={styles.privateInfoTitle}>Profil privé</Text>
            <Text style={styles.privateInfoSubtitle}>
              Seuls le pseudo et la photo de profil sont visibles.
            </Text>
          </View>
        )}

        {/* Media tab */}
        {activeTab === 'media' && !isPrivate && (
          <View style={styles.mediaTabContent}>
            {profilePhotos.length === 0 ? (
              <View style={styles.emptyMediaState}>
                <Ionicons name="images-outline" size={36} color="#CBD5E1" />
                <Text style={styles.emptyMediaTitle}>Pas encore de photos</Text>
                <Text style={styles.emptyMediaSub}>Cette personne n'a pas encore partagé de photos ou vidéos.</Text>
              </View>
            ) : (
              <View style={styles.photoGrid}>
                {profilePhotos.map((uri, index) => (
                  <TouchableOpacity
                    key={index}
                    style={styles.photoCell}
                    activeOpacity={0.88}
                    onPress={() => setLightboxUri(uri)}
                  >
                    <Image source={{ uri }} style={styles.photoThumb} resizeMode="cover" />
                  </TouchableOpacity>
                ))}
              </View>
            )}
          </View>
        )}

        {/* Dilemmas tab */}
        {activeTab === 'dilemmas' && !isPrivate && (
          <View style={styles.dilemmaTabContent}>
            {favoriteDilemmas.length === 0 ? (
              <View style={styles.emptyMediaState}>
                <Ionicons name="help-circle-outline" size={36} color="#CBD5E1" />
                <Text style={styles.emptyMediaTitle}>Pas encore de dilemmes favoris</Text>
                <Text style={styles.emptyMediaSub}>Cette personne n'a pas encore sélectionné de dilemmes favoris.</Text>
              </View>
            ) : (
              favoriteDilemmas.map((scenario) => (
                <View key={scenario.id} style={styles.dilemmaCard}>
                  <Text style={styles.dilemmaQuestion}>{scenario.question}</Text>
                  <View style={styles.dilemmaChoices}>
                    {scenario.choices.slice(0, 2).map((choice, i) => (
                      <View key={i} style={styles.dilemmaChoicePill}>
                        <Text style={styles.dilemmaChoiceText}>{choice.label}</Text>
                      </View>
                    ))}
                  </View>
                </View>
              ))
            )}
          </View>
        )}
      </ScrollView>

      {/* Lightbox for photo */}
      <Modal
        visible={Boolean(lightboxUri)}
        transparent
        animationType="fade"
        onRequestClose={() => setLightboxUri(null)}
      >
        <TouchableOpacity
          style={styles.lightboxOverlay}
          activeOpacity={1}
          onPress={() => setLightboxUri(null)}
        >
          {lightboxUri && (
            <Image source={{ uri: lightboxUri }} style={styles.lightboxImage} resizeMode="contain" />
          )}
          <TouchableOpacity style={styles.lightboxClose} onPress={() => setLightboxUri(null)}>
            <Ionicons name="close" size={28} color="#FFFFFF" />
          </TouchableOpacity>
        </TouchableOpacity>
      </Modal>
    </SafeAreaView>
  );
}

function createStyles(p: ReturnType<typeof getThemeColors>) {
  return StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: p.background,
  },
  scrollContent: {
    paddingBottom: 40,
  },
  backBtn: {
    position: 'absolute',
    top: Platform.OS === 'ios' ? 54 : 16,
    left: 14,
    zIndex: 10,
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: 'rgba(15,23,42,0.4)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  heroSection: {
    alignItems: 'center',
    paddingTop: 72,
    paddingBottom: 28,
    backgroundColor: '#1E293B',
    position: 'relative',
    overflow: 'hidden',
  },
  heroGradient: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: '#0F172A',
    opacity: 0.85,
  },
  avatarHeroWrap: {
    position: 'relative',
    marginBottom: 14,
  },
  avatarHero: {
    width: 96,
    height: 96,
    borderRadius: 48,
    backgroundColor: '#334155',
    borderWidth: 3,
    borderColor: 'rgba(124,203,255,0.4)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  avatarHeroText: {
    fontSize: 38,
    fontWeight: '800',
    color: '#E2E8F0',
    letterSpacing: 0.5,
  },
  onlineDot: {
    position: 'absolute',
    bottom: 4,
    right: 4,
    width: 16,
    height: 16,
    borderRadius: 8,
    backgroundColor: '#22C55E',
    borderWidth: 2,
    borderColor: '#1E293B',
  },
  heroName: {
    fontSize: 24,
    fontWeight: '800',
    color: '#F1F5F9',
    letterSpacing: 0.3,
    marginBottom: 6,
  },
  privateBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 20,
    backgroundColor: 'rgba(255,255,255,0.12)',
    marginBottom: 16,
  },
  privateBadgeText: {
    fontSize: 12,
    color: '#94A3B8',
    fontWeight: '600',
  },
  heroScoreRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
    marginBottom: 16,
  },
  heroScoreText: {
    fontSize: 13,
    color: '#7CCBFF',
    fontWeight: '600',
  },
  messageBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    paddingHorizontal: 22,
    paddingVertical: 11,
    borderRadius: 24,
    backgroundColor: '#4E6E92',
    marginTop: 4,
  },
  messageBtnText: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '700',
  },
  tabBar: {
    flexDirection: 'row',
    backgroundColor: p.card,
    borderBottomWidth: 1,
    borderBottomColor: '#E2E8F0',
  },
  tab: {
    flex: 1,
    paddingVertical: 13,
    alignItems: 'center',
  },
  tabActive: {
    borderBottomWidth: 2,
    borderBottomColor: '#7CCBFF',
  },
  tabText: {
    fontSize: 13,
    fontWeight: '600',
    color: '#94A3B8',
  },
  tabTextActive: {
    color: '#3D5F84',
  },
  section: {
    padding: Spacing.md,
    gap: Spacing.md,
  },
  card: {
    backgroundColor: p.card,
    borderRadius: Radius.lg,
    padding: Spacing.md,
    gap: 10,
    ...Platform.select({
      web: { boxShadow: '0 2px 8px rgba(0,0,0,0.05)' },
    }),
  },
  cardTitle: {
    fontSize: 13,
    fontWeight: '700',
    color: '#4E6E92',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
    marginBottom: 4,
  },
  compatCard: {
    backgroundColor: p.card,
    borderRadius: Radius.lg,
    padding: Spacing.md,
    gap: 10,
    ...Platform.select({
      web: { boxShadow: '0 2px 8px rgba(0,0,0,0.05)' },
    }),
  },
  compatLabelRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  compatLabel: {
    fontSize: 13,
    fontWeight: '700',
    color: '#4E6E92',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  compatPercent: {
    fontSize: 18,
    fontWeight: '800',
    color: '#1E3A5F',
  },
  compatBarBg: {
    height: 8,
    borderRadius: 4,
    backgroundColor: '#E2E8F0',
    overflow: 'hidden',
  },
  compatBarFill: {
    height: '100%',
    borderRadius: 4,
    backgroundColor: '#7CCBFF',
  },
  reasonRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  reasonText: {
    fontSize: 14,
    color: '#334155',
    flex: 1,
    lineHeight: 20,
  },
  traitRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  traitLabel: {
    fontSize: 12,
    color: '#64748B',
    width: 110,
    fontWeight: '600',
  },
  traitBarBg: {
    flex: 1,
    height: 6,
    borderRadius: 3,
    backgroundColor: '#E2E8F0',
    overflow: 'hidden',
  },
  traitBarFill: {
    height: '100%',
    borderRadius: 3,
  },
  traitValue: {
    fontSize: 12,
    color: '#64748B',
    width: 34,
    textAlign: 'right',
    fontWeight: '600',
  },
  privateInfo: {
    alignItems: 'center',
    paddingVertical: 48,
    paddingHorizontal: Spacing.xl,
    gap: 10,
  },
  privateInfoTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#334155',
  },
  privateInfoSubtitle: {
    fontSize: 14,
    color: '#94A3B8',
    textAlign: 'center',
    lineHeight: 20,
  },
  mediaTabContent: {
    padding: 2,
  },
  photoGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
  },
  photoCell: {
    width: PHOTO_CELL,
    height: PHOTO_CELL,
    margin: 1,
    backgroundColor: '#E2E8F0',
  },
  photoThumb: {
    width: '100%',
    height: '100%',
  },
  emptyState: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  emptyTitle: {
    fontSize: 16,
    color: '#94A3B8',
    fontWeight: '600',
  },
  emptyMediaState: {
    alignItems: 'center',
    paddingVertical: 48,
    paddingHorizontal: Spacing.xl,
    gap: 10,
  },
  emptyMediaTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: '#334155',
  },
  emptyMediaSub: {
    fontSize: 13,
    color: '#94A3B8',
    textAlign: 'center',
    lineHeight: 19,
  },
  dilemmaTabContent: {
    padding: Spacing.md,
    gap: Spacing.md,
  },
  dilemmaCard: {
    backgroundColor: p.card,
    borderRadius: Radius.lg,
    padding: Spacing.md,
    gap: 10,
    marginBottom: Spacing.sm,
    ...Platform.select({
      web: { boxShadow: '0 2px 8px rgba(0,0,0,0.05)' },
    }),
  },
  dilemmaQuestion: {
    fontSize: 14,
    fontWeight: '700',
    color: '#1E293B',
    lineHeight: 20,
  },
  dilemmaChoices: {
    flexDirection: 'row',
    gap: 8,
    flexWrap: 'wrap',
  },
  dilemmaChoicePill: {
    paddingHorizontal: 12,
    paddingVertical: 5,
    borderRadius: 20,
    backgroundColor: '#EEF4FB',
    borderWidth: 1,
    borderColor: 'rgba(61,95,132,0.14)',
  },
  dilemmaChoiceText: {
    fontSize: 12,
    color: '#3D5F84',
    fontWeight: '600',
  },
  lightboxOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.92)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  lightboxImage: {
    width: SCREEN_WIDTH,
    height: SCREEN_WIDTH * 1.3,
  },
  lightboxClose: {
    position: 'absolute',
    top: 52,
    right: 16,
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(255,255,255,0.15)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  });
}
