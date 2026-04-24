import React, { useCallback, useRef, useState } from 'react';
import {
  View,
  Text,
  FlatList,
  StyleSheet,
  TouchableOpacity,
  SafeAreaView,
  Alert,
  Platform,
} from 'react-native';
import { ScenarioCard } from '../components/ScenarioCard';
import { SkeletonCard } from '../components/SkeletonCard';
import { MatchModal } from '../components/MatchModal';
import { Colors, Spacing, Radius, Typography } from '../theme/colors';
import { useWetoStore } from '../store/useWetoStore';
import { SCENARIOS } from '../data/scenarios';

const BATCH_SIZE = 5;
const PREFETCH_THRESHOLD = 3;

export function FeedScreen() {
  const {
    currentIndex,
    scenarios,
    pendingMatch,
    dismissMatch,
    sendScenario,
    answers,
  } = useWetoStore();

  const flatListRef = useRef<FlatList>(null);
  const [loadedBatch, setLoadedBatch] = useState(1);
  const [isLoadingBatch, setIsLoadingBatch] = useState(false);

  const visibleScenarios = scenarios.slice(0, loadedBatch * BATCH_SIZE);
  const isComplete = currentIndex >= scenarios.length - 1 && answers.length === scenarios.length;

  const handleShare = useCallback((scenarioId: string) => {
    const scenario = scenarios.find((s) => s.id === scenarioId);
    if (!scenario) return;
    if (Platform.OS === 'web') {
      const url = `${window.location.origin}?share=${scenarioId}`;
      if (navigator.share) {
        navigator.share({ title: 'Weto – Dilemme', text: scenario.question, url }).catch(() => {});
      } else {
        navigator.clipboard?.writeText(url);
        Alert.alert('Lien copié !', 'Partage le dilemme avec tes contacts.');
      }
    } else {
      Alert.alert('Partager', `"${scenario.question}"`, [
        { text: 'Annuler', style: 'cancel' },
        { text: 'Envoyer en DM', onPress: () => sendScenario(scenarioId, 'contact_1') },
      ]);
    }
  }, [scenarios]);

  const handleViewableItemsChanged = useCallback(({ viewableItems }: any) => {
    if (!viewableItems.length) return;
    const lastVisible = viewableItems[viewableItems.length - 1];
    const itemIndex = lastVisible.index ?? 0;

    // Prefetch next batch
    if (
      itemIndex >= loadedBatch * BATCH_SIZE - PREFETCH_THRESHOLD &&
      loadedBatch * BATCH_SIZE < scenarios.length &&
      !isLoadingBatch
    ) {
      setIsLoadingBatch(true);
      setTimeout(() => {
        setLoadedBatch((prev) => prev + 1);
        setIsLoadingBatch(false);
      }, 800);
    }
  }, [loadedBatch, isLoadingBatch]);

  const renderItem = useCallback(({ item, index }: { item: typeof SCENARIOS[0]; index: number }) => {
    if (index < currentIndex) return null;
    if (index === currentIndex) {
      return (
        <ScenarioCard
          scenario={item}
          index={index}
          onShare={() => handleShare(item.id)}
        />
      );
    }
    return null;
  }, [currentIndex, handleShare]);

  const renderFooter = () => {
    if (isLoadingBatch) return <SkeletonCard />;
    return null;
  };

  return (
    <SafeAreaView style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.logo}>Weto</Text>
        <TouchableOpacity style={styles.headerIcon}>
          <Text style={styles.headerIconText}>✈</Text>
        </TouchableOpacity>
      </View>

      {/* Progress bar */}
      <View style={styles.progressBar}>
        <View
          style={[
            styles.progressFill,
            { width: `${((currentIndex) / scenarios.length) * 100}%` },
          ]}
        />
      </View>

      {/* Feed */}
      {isComplete ? (
        <View style={styles.completeContainer}>
          <Text style={styles.completeEmoji}>🎉</Text>
          <Text style={styles.completeTitle}>Profil établi !</Text>
          <Text style={styles.completeSubtitle}>
            Tu as répondu à tous les dilemmes. Weto analyse ta personnalité pour trouver tes matchs.
          </Text>
        </View>
      ) : (
        <FlatList
          ref={flatListRef}
          data={visibleScenarios}
          keyExtractor={(item) => item.id}
          renderItem={renderItem}
          onViewableItemsChanged={handleViewableItemsChanged}
          viewabilityConfig={{ itemVisiblePercentThreshold: 50 }}
          ListFooterComponent={renderFooter}
          showsVerticalScrollIndicator={false}
          contentContainerStyle={styles.listContent}
          scrollEnabled={false}
          getItemLayout={(_, index) => ({
            length: 420,
            offset: 420 * index,
            index,
          })}
          windowSize={5}
          maxToRenderPerBatch={5}
          removeClippedSubviews={true}
        />
      )}

      {/* Match Modal */}
      {pendingMatch && (
        <MatchModal
          match={pendingMatch}
          onDismiss={dismissMatch}
          onMessage={dismissMatch}
        />
      )}
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
    backgroundColor: Colors.background,
  },
  logo: {
    fontSize: 28,
    fontWeight: '700',
    color: Colors.text,
    letterSpacing: -1,
  },
  headerIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: Colors.card,
    alignItems: 'center',
    justifyContent: 'center',
    ...Platform.select({
      web: { boxShadow: '0 2px 8px rgba(0,0,0,0.08)' },
    }),
  },
  headerIconText: {
    fontSize: 18,
    color: Colors.textSecondary,
  },
  progressBar: {
    height: 2,
    backgroundColor: Colors.border,
    marginHorizontal: Spacing.md,
    borderRadius: 1,
    marginBottom: Spacing.sm,
  },
  progressFill: {
    height: 2,
    backgroundColor: Colors.accent,
    borderRadius: 1,
  },
  listContent: {
    paddingBottom: Spacing.xxl,
  },
  completeContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: Spacing.xl,
  },
  completeEmoji: {
    fontSize: 64,
    marginBottom: Spacing.md,
  },
  completeTitle: {
    ...Typography.title,
    color: Colors.text,
    textAlign: 'center',
    marginBottom: Spacing.sm,
  },
  completeSubtitle: {
    ...Typography.body,
    color: Colors.textSecondary,
    textAlign: 'center',
    lineHeight: 26,
  },
});
