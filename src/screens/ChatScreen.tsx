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
import { Colors, Spacing, Radius, Typography } from '../theme/colors';
import { useWetoStore } from '../store/useWetoStore';
import { ChatThread } from '../types';

export function ChatScreen() {
  const { chats } = useWetoStore();
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
      const lastMessage = thread.messages[thread.messages.length - 1]?.text?.toLowerCase() ?? '';
      return (
        thread.contactName.toLowerCase().includes(normalizedQuery) ||
        lastMessage.includes(normalizedQuery)
      );
    });
  }, [chatList, normalizedQuery]);

  const renderItem = ({ item }: { item: ChatThread }) => {
    const lastMessage = item.messages[item.messages.length - 1];

    return (
      <TouchableOpacity
        style={styles.chatRow}
        onPress={() => navigation.navigate('ChatDetail', { contactId: item.contactId })}
        activeOpacity={0.7}
      >
        <View style={styles.avatarContainer}>
          <View style={styles.avatarCircle}>
            <Text style={styles.avatarEmoji}>{item.contactAvatar}</Text>
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
            {lastMessage ? lastMessage.text : ''}
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
          <Text style={styles.emptyEmoji}>💬</Text>
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
      <View style={styles.header}>
        <Text style={styles.title}>Chat</Text>
      </View>

      <View style={styles.searchContainer}>
        <Text style={styles.searchIcon}>🔍</Text>
        <TextInput
          style={styles.searchInput}
          placeholder="Rechercher une conversation..."
          placeholderTextColor={Colors.textMuted}
          value={query}
          onChangeText={setQuery}
          autoCapitalize="none"
          autoCorrect={false}
        />
        {query.length > 0 && (
          <TouchableOpacity onPress={() => setQuery('')} style={styles.clearSearchButton}>
            <Text style={styles.clearSearchText}>×</Text>
          </TouchableOpacity>
        )}
      </View>

      {filteredChats.length === 0 ? (
        <View style={styles.emptySearchContainer}>
          <Text style={styles.emptySearchEmoji}>🫥</Text>
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
          contentContainerStyle={styles.listContent}
          ItemSeparatorComponent={() => <View style={styles.separator} />}
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
  },
  title: {
    ...Typography.title,
    color: Colors.text,
  },
  emptyContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: Spacing.xl,
  },
  emptyEmoji: {
    fontSize: 60,
    marginBottom: Spacing.md,
  },
  emptyTitle: {
    ...Typography.h1,
    color: Colors.text,
    textAlign: 'center',
    marginBottom: Spacing.sm,
  },
  emptySubtitle: {
    ...Typography.body,
    color: Colors.textSecondary,
    textAlign: 'center',
    lineHeight: 24,
  },
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.card,
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
    fontSize: 16,
  },
  searchPlaceholder: {
    ...Typography.body,
    color: Colors.textMuted,
  },
  searchInput: {
    flex: 1,
    ...Typography.body,
    color: Colors.text,
    paddingVertical: 0,
  },
  clearSearchButton: {
    width: 24,
    height: 24,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: Colors.background,
  },
  clearSearchText: {
    color: Colors.textSecondary,
    fontSize: 18,
    lineHeight: 18,
  },
  emptySearchContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: Spacing.xl,
    gap: Spacing.sm,
  },
  emptySearchEmoji: {
    fontSize: 42,
  },
  emptySearchTitle: {
    ...Typography.h2,
    color: Colors.text,
  },
  emptySearchSubtitle: {
    ...Typography.body,
    color: Colors.textSecondary,
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
    backgroundColor: Colors.accentLight,
    alignItems: 'center',
    justifyContent: 'center',
  },
  avatarEmoji: {
    fontSize: 26,
  },
  unreadDot: {
    position: 'absolute',
    bottom: 0,
    right: 0,
    width: 14,
    height: 14,
    borderRadius: 7,
    backgroundColor: Colors.accent,
    borderWidth: 2,
    borderColor: Colors.background,
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
    color: Colors.text,
  },
  contactNameBold: {
    fontWeight: '700',
  },
  timestamp: {
    ...Typography.caption,
    color: Colors.textMuted,
  },
  lastMessage: {
    ...Typography.body,
    color: Colors.textSecondary,
  },
  lastMessageBold: {
    color: Colors.text,
    fontWeight: '600',
  },
  separator: {
    height: 1,
    backgroundColor: Colors.border,
    marginLeft: 54 + Spacing.md,
  },
});
