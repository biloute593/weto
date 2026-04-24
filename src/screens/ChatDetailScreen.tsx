import React, { useState, useEffect, useRef } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  FlatList,
  StyleSheet,
  SafeAreaView,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import { useNavigation, useRoute } from '@react-navigation/native';
import { Colors, Spacing, Radius, Typography } from '../theme/colors';
import { useWetoStore } from '../store/useWetoStore';

export function ChatDetailScreen() {
  const route = useRoute<any>();
  const navigation = useNavigation();
  const contactId = route.params?.contactId;
  const { chats, sendMessage, markChatRead } = useWetoStore();
  const [inputText, setInputText] = useState('');
  const flatListRef = useRef<FlatList>(null);

  const thread = chats[contactId];

  useEffect(() => {
    if (thread && thread.unread) {
      markChatRead(contactId);
    }
  }, [thread?.messages.length]); // mark read when messages arrive while screen is open

  if (!thread) {
    return (
      <SafeAreaView style={styles.container}>
        <Text>Discussion introuvable.</Text>
      </SafeAreaView>
    );
  }

  const handleSend = () => {
    if (!inputText.trim()) return;
    sendMessage(contactId, inputText.trim());
    setInputText('');
  };

  const renderMessage = ({ item }: { item: any }) => {
    const isMe = item.senderId === 'me';
    const isSystem = item.senderId === 'system';

    if (isSystem) {
      return (
        <View style={styles.systemMessage}>
          <Text style={styles.systemMessageText}>{item.text}</Text>
        </View>
      );
    }

    return (
      <View style={[styles.messageRow, isMe ? styles.messageRowMe : styles.messageRowThem]}>
        {!isMe && (
          <View style={styles.avatarCircleSmall}>
            <Text style={styles.avatarEmojiSmall}>{thread.contactAvatar}</Text>
          </View>
        )}
        <View style={[styles.messageBubble, isMe ? styles.messageBubbleMe : styles.messageBubbleThem]}>
          <Text style={[styles.messageText, isMe && styles.messageTextMe]}>
            {item.text}
          </Text>
        </View>
      </View>
    );
  };

  return (
    <SafeAreaView style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity style={styles.backButton} onPress={() => navigation.goBack()}>
          <Text style={styles.backButtonIcon}>‹</Text>
        </TouchableOpacity>
        <View style={styles.headerInfo}>
          <View style={styles.avatarCircle}>
            <Text style={styles.avatarEmoji}>{thread.contactAvatar}</Text>
          </View>
          <Text style={styles.headerName}>{thread.contactName}</Text>
        </View>
        <View style={{ width: 40 }} />
      </View>

      {/* Chat Area */}
      <KeyboardAvoidingView 
        style={styles.keyboardView} 
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      >
        <FlatList
          ref={flatListRef}
          data={thread.messages}
          keyExtractor={(item) => item.id}
          renderItem={renderMessage}
          contentContainerStyle={styles.messageList}
          onContentSizeChange={() => flatListRef.current?.scrollToEnd({ animated: true })}
          onLayout={() => flatListRef.current?.scrollToEnd({ animated: true })}
        />

        {/* Input Area */}
        <View style={styles.inputContainer}>
          <TextInput
            style={styles.input}
            placeholder="Écrivez un message..."
            placeholderTextColor={Colors.textMuted}
            value={inputText}
            onChangeText={setInputText}
            multiline
            maxLength={300}
          />
          <TouchableOpacity 
            style={[styles.sendButton, !inputText.trim() && styles.sendButtonDisabled]}
            onPress={handleSend}
            disabled={!inputText.trim()}
          >
            <Text style={styles.sendButtonText}>↗</Text>
          </TouchableOpacity>
        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.background },
  keyboardView: { flex: 1 },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.sm,
    backgroundColor: Colors.card,
    borderBottomWidth: 1,
    borderBottomColor: Colors.border,
    ...Platform.select({
      web: { boxShadow: '0 2px 10px rgba(0,0,0,0.05)' },
    }),
  },
  backButton: { width: 40, height: 40, justifyContent: 'center', alignItems: 'center' },
  backButtonIcon: { fontSize: 32, color: Colors.text, lineHeight: 32, marginTop: -4 },
  headerInfo: { flexDirection: 'row', alignItems: 'center', gap: Spacing.sm },
  avatarCircle: { width: 36, height: 36, borderRadius: 18, backgroundColor: Colors.accentLight, alignItems: 'center', justifyContent: 'center' },
  avatarEmoji: { fontSize: 20 },
  headerName: { ...Typography.bodyBold, color: Colors.text },
  messageList: { padding: Spacing.md, gap: Spacing.sm, paddingBottom: Spacing.lg },
  systemMessage: { alignItems: 'center', marginVertical: Spacing.md },
  systemMessageText: { ...Typography.caption, color: Colors.textMuted, backgroundColor: Colors.card, paddingHorizontal: Spacing.md, paddingVertical: 4, borderRadius: Radius.pill, overflow: 'hidden' },
  messageRow: { flexDirection: 'row', alignItems: 'flex-end', marginBottom: 4 },
  messageRowMe: { justifyContent: 'flex-end' },
  messageRowThem: { justifyContent: 'flex-start', gap: Spacing.xs },
  avatarCircleSmall: { width: 28, height: 28, borderRadius: 14, backgroundColor: Colors.accentLight, alignItems: 'center', justifyContent: 'center' },
  avatarEmojiSmall: { fontSize: 16 },
  messageBubble: { maxWidth: '75%', paddingHorizontal: Spacing.md, paddingVertical: 10, borderRadius: Radius.md },
  messageBubbleMe: { backgroundColor: Colors.accent, borderBottomRightRadius: 4 },
  messageBubbleThem: { backgroundColor: Colors.card, borderBottomLeftRadius: 4, ...Platform.select({ web: { boxShadow: '0 1px 4px rgba(0,0,0,0.05)' } }) },
  messageText: { ...Typography.body, color: Colors.text, lineHeight: 22 },
  messageTextMe: { color: Colors.white },
  inputContainer: { flexDirection: 'row', padding: Spacing.md, gap: Spacing.sm, backgroundColor: Colors.card, borderTopWidth: 1, borderTopColor: Colors.border },
  input: { flex: 1, backgroundColor: Colors.background, borderRadius: Radius.pill, paddingHorizontal: Spacing.md, paddingTop: 12, paddingBottom: 12, minHeight: 44, maxHeight: 100, ...Typography.body, color: Colors.text },
  sendButton: { width: 44, height: 44, borderRadius: 22, backgroundColor: Colors.accent, alignItems: 'center', justifyContent: 'center' },
  sendButtonDisabled: { backgroundColor: Colors.border },
  sendButtonText: { color: Colors.white, fontSize: 18, fontWeight: '700' },
});
