import React, { useMemo, useState } from 'react';
import {
  View,
  Text,
  FlatList,
  StyleSheet,
  TouchableOpacity,
  SafeAreaView,
  Platform,
  TextInput,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { Ionicons } from '@expo/vector-icons';
import { Colors, Spacing, Radius, Typography, getThemeColors } from '../theme/colors';
import { useWetoStore } from '../store/useWetoStore';
import { StarfieldBackground } from '../components/StarfieldBackground';
import { ChatMessage, ChatThread } from '../types';
import { getAvatarMonogram } from '../utils';

function formatVoiceDuration(durationMs?: number) {
  const totalSeconds = Math.max(1, Math.round((durationMs ?? 0) / 1000));
  const minutes = Math.floor(totalSeconds / 60);
  const seconds = totalSeconds % 60;
  return `${minutes}:${String(seconds).padStart(2, '0')}`;
}

function getMessagePreview(message?: ChatMessage) {
  if (!message) return '';

  const firstLine = message.text.split('\n')[0]?.toLowerCase() ?? '';

  switch (message.type) {
    case 'call':
      return firstLine.includes('visio') || firstLine.includes('video')
        ? 'Invitation visio'
        : 'Invitation appel vocal';
    case 'image':
      if (message.ephemeral) return 'Photo - 1 seul visionnage';
      return message.text && message.text !== 'Photo' ? message.text : 'Photo';
    case 'video':
      if (message.ephemeral) return 'Video - 1 seul visionnage';
      return message.text && message.text !== 'Video' ? message.text : 'Video';
    case 'voice':
      return `Vocal - ${formatVoiceDuration(message.durationMs)}`;
    case 'flame':
      return 'Flamme';
    case 'dilemma':
      return 'Dilemme partagé';
    case 'dilemma-response':
      return message.dilemma?.selectedChoiceLabel
        ? `Réponse au dilemme: ${message.dilemma.selectedChoiceLabel}`
        : 'Réponse au dilemme';
    default:
      return message.text ?? '';
  }
}

export function ChatScreen() {
  const { chats, themeMode } = useWetoStore();
  const p = getThemeColors(themeMode);
  const styles = useMemo(() => createStyles(p), [themeMode]);
  const navigation = useNavigation<any>();
  const [query, setQuery] = useState('');

  const chatList = useMemo(
    () =>
      Object.values(chats).sort((a, b) => {
        const aLast = a.messages[a.messages.length - 1]?.timestamp || 0;
        const bLast = b.messages[b.messages.length - 1]?.timestamp || 0;
        return bLast - aLast;
      }),
    [chats]
  );

  const normalizedQuery = query.trim().toLowerCase();
  const filteredChats = useMemo(() => {
    if (!normalizedQuery) return chatList;

    return chatList.filter((thread) => {
      const lastMessage = getMessagePreview(thread.messages[thread.messages.length - 1]).toLowerCase();
      return (
        thread.contactName.toLowerCase().includes(normalizedQuery) ||
        lastMessage.includes(normalizedQuery)
      );
    });
  }, [chatList, normalizedQuery]);

  const renderItem = ({ item }: { item: ChatThread }) => {
    const lastMessage = item.messages[item.messages.length - 1];
    const avatarLabel = getAvatarMonogram(item.contactName, item.contactAvatar);

    return (
      <TouchableOpacity
        style={styles.chatRow}
        onPress={() => navigation.navigate('ChatDetail', { contactId: item.contactId })}
        activeOpacity={0.7}
      >
        <View style={styles.avatarContainer}>
          <View style={styles.avatarCircle}>
            <Text style={styles.avatarEmoji}>{avatarLabel}</Text>
          </View>
          {item.unread && <View style={styles.unreadDot} />}
        </View>

        <View style={styles.chatInfo}>
          <View style={styles.chatTopRow}>
            <Text style={[styles.contactName, item.unread && styles.contactNameBold]}>
              {item.contactName}
            </Text>
            <Text style={styles.timestamp}>
              {lastMessage
                ? new Date(lastMessage.timestamp).toLocaleTimeString([], {
                    hour: '2-digit',
                    minute: '2-digit',
                  })
                : ''}
            </Text>
          </View>
          <Text
            style={[styles.lastMessage, item.unread && styles.lastMessageBold]}
            numberOfLines={1}
          >
            {getMessagePreview(lastMessage)}
          </Text>
        </View>
      </TouchableOpacity>
    );
  };

  if (chatList.length === 0) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.header}>
          <Text style={styles.title}>Chat</Text>
        </View>
        <View style={styles.emptyContainer}>
          <View style={styles.emptyEmoji}>
            <Ionicons name="chatbubble-ellipses-outline" size={32} color={themeMode === 'dark' ? '#8BAED4' : '#4E6E92'} />
          </View>
          <Text style={styles.emptyTitle}>Pas encore de conversations</Text>
          <Text style={styles.emptySubtitle}>
            Tes conversations avec tes matchs apparaîtront ici.
          </Text>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      {themeMode === 'dark' && <StarfieldBackground />}
      <View style={styles.header}>
        <Text style={styles.title}>Chat</Text>
      </View>

      <View style={styles.searchContainer}>
        <View style={styles.searchIcon}>
          <Ionicons name="search-outline" size={16} color={themeMode === 'dark' ? '#5A7A9E' : '#4E6E92'} />
        </View>
        <TextInput
          style={styles.searchInput}
          placeholder="Rechercher une conversation..."
          placeholderTextColor={p.textMuted}
          value={query}
          onChangeText={setQuery}
          autoCapitalize="none"
          autoCorrect={false}
        />
        {query.length > 0 && (
          <TouchableOpacity onPress={() => setQuery('')} style={styles.clearSearchButton}>
            <Ionicons name="close" size={16} color={p.textSecondary} style={styles.clearSearchText} />
          </TouchableOpacity>
        )}
      </View>

      {filteredChats.length === 0 ? (
        <View style={styles.emptySearchContainer}>
          <View style={styles.emptySearchEmoji}>
            <Ionicons name="search-outline" size={22} color={themeMode === 'dark' ? '#8BAED4' : '#4E6E92'} />
          </View>
          <Text style={styles.emptySearchTitle}>Aucun resultat</Text>
          <Text style={styles.emptySearchSubtitle}>
            Essaie un prenom ou un mot du dernier message.
          </Text>
        </View>
      ) : (
        <FlatList
          data={filteredChats}
          keyExtractor={(item) => item.contactId}
          renderItem={renderItem}
          showsVerticalScrollIndicator={false}
          keyboardShouldPersistTaps="handled"
          contentContainerStyle={styles.listContent}
          ItemSeparatorComponent={() => <View style={styles.separator} />}
        />
      )}
    </SafeAreaView>
  );
}

function createStyles(p: ReturnType<typeof getThemeColors>) {
  return StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: p.background,
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
    color: p.text,
  },
  emptyContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: Spacing.xl,
  },
  emptyEmoji: {
    width: 72,
    height: 72,
    borderRadius: 36,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'rgba(124,203,255,0.18)',
    marginBottom: Spacing.md,
  },
  emptyTitle: {
    ...Typography.h1,
    color: p.text,
    textAlign: 'center',
    marginBottom: Spacing.sm,
  },
  emptySubtitle: {
    ...Typography.body,
    color: p.textSecondary,
    textAlign: 'center',
    lineHeight: 24,
  },
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: p.card,
    marginHorizontal: Spacing.md,
    borderRadius: Radius.md,
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.sm,
    marginBottom: Spacing.sm,
    gap: Spacing.sm,
    ...Platform.select({
      web: { boxShadow: '0 2px 8px rgba(0,0,0,0.05)' },
    }),
  },
  searchIcon: {
    width: 28,
    height: 28,
    borderRadius: 14,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'rgba(124,203,255,0.18)',
  },
  searchPlaceholder: {
    ...Typography.body,
    color: p.textMuted,
  },
  searchInput: {
    flex: 1,
    ...Typography.body,
    color: p.text,
    paddingVertical: 0,
  },
  clearSearchButton: {
    width: 24,
    height: 24,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: p.background,
  },
  clearSearchText: {
    textAlign: 'center',
  },
  emptySearchContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: Spacing.xl,
    gap: Spacing.sm,
  },
  emptySearchEmoji: {
    width: 52,
    height: 52,
    borderRadius: 26,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'rgba(124,203,255,0.16)',
  },
  emptySearchTitle: {
    ...Typography.h2,
    color: p.text,
  },
  emptySearchSubtitle: {
    ...Typography.body,
    color: p.textSecondary,
    textAlign: 'center',
  },
  listContent: {
    paddingHorizontal: Spacing.md,
    paddingBottom: Spacing.xxl,
  },
  chatRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: Spacing.md,
    gap: Spacing.md,
  },
  avatarContainer: {
    position: 'relative',
  },
  avatarCircle: {
    width: 54,
    height: 54,
    borderRadius: 27,
    backgroundColor: p.accentLight,
    alignItems: 'center',
    justifyContent: 'center',
  },
  avatarEmoji: {
    fontSize: 20,
    fontWeight: '700',
    color: '#1E293B',
    letterSpacing: 0.4,
  },
  unreadDot: {
    position: 'absolute',
    bottom: 0,
    right: 0,
    width: 14,
    height: 14,
    borderRadius: 7,
    backgroundColor: p.accent,
    borderWidth: 2,
    borderColor: p.background,
  },
  chatInfo: {
    flex: 1,
    gap: 4,
  },
  chatTopRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  contactName: {
    ...Typography.bodyBold,
    color: p.text,
  },
  contactNameBold: {
    fontWeight: '700',
  },
  timestamp: {
    ...Typography.caption,
    color: p.textMuted,
  },
  lastMessage: {
    ...Typography.body,
    color: p.textSecondary,
  },
  lastMessageBold: {
    color: p.text,
    fontWeight: '600',
  },
  separator: {
    height: 1,
    backgroundColor: p.border,
    marginLeft: 54 + Spacing.md,
  },
  });
}
