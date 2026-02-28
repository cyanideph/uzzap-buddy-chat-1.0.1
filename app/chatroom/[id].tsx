import React, { useState, useEffect, useRef } from 'react';
import { StyleSheet, View, Text, TextInput, TouchableOpacity, KeyboardAvoidingView, Platform, ActivityIndicator, Alert } from 'react-native';
import { FlashList } from '@shopify/flash-list';
import { useLocalSearchParams, Stack, useRouter } from 'expo-router';
import { supabase } from '@/lib/supabase';
import { colors, spacing, typography, borderRadius, shadows } from '@/constants/design';
import { Container, Avatar } from '@/components/ui';
import { Ionicons } from '@expo/vector-icons';
import { useAuthStore } from '@/store/useAuthStore';
import { useChatStore } from '@/store/useChatStore';
import { messageService } from '@/services/messageService';
import { chatroomService } from '@/services/chatroomService';

export default function ChatroomScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const { profile } = useAuthStore();
  const { messages: chatroomMessages, fetchMessages, subscribeToChatroom, activeChatroomId, setActiveChatroom } = useChatStore();
  const router = useRouter();
  const [message, setMessage] = useState('');
  const [room, setRoom] = useState<any>(null);
  const [roomLoading, setRoomLoading] = useState(true);
  const [sending, setSending] = useState(false);
  const flatListRef = useRef<FlashList<any>>(null);

  const messages = chatroomMessages[id as string] || [];

  useEffect(() => {
    if (!id || !profile) return;

    const setupChat = async () => {
      setRoomLoading(true);
      
      // Join chatroom (ensure membership for RLS)
      await chatroomService.joinChatroom(id as string, profile.id);
      
      // Get room info
      const { data } = await supabase.from('chatrooms').select('*').eq('id', id).single();
      setRoom(data);
      
      // Initial messages
      await fetchMessages(id as string);
      setRoomLoading(false);
      
      // Subscribe to realtime updates
      const unsubscribe = subscribeToChatroom(id as string);
      return unsubscribe;
    };

    const cleanup = setupChat();
    setActiveChatroom(id as string);

    return () => {
      cleanup.then(unsub => unsub?.());
      setActiveChatroom(null);
    };
  }, [id, profile]);

  const handleSendMessage = async () => {
    if (!message.trim() || !profile || !id) return;

    setSending(true);
    try {
      await messageService.sendMessage({
        chatroom_id: id as string,
        sender_id: profile.id,
        content: message.trim(),
      });
      setMessage('');
    } catch (error) {
      console.error('Error sending message:', error);
    } finally {
      setSending(false);
    }
  };

  const renderMessage = ({ item }: { item: any }) => {
    const isMe = item.sender_id === profile?.id;

    return (
      <View style={[styles.messageWrapper, isMe ? styles.myMessageWrapper : styles.theirMessageWrapper]}>
        {!isMe && (
          <Avatar source={{ uri: item.sender?.avatar_url }} size="sm" style={styles.messageAvatar} />
        )}
        <View style={[styles.messageBubble, isMe ? styles.myMessageBubble : styles.theirMessageBubble]}>
          {!isMe && <Text style={styles.messageUser}>{item.sender?.display_name || 'Anonymous'}</Text>}
          <Text style={[styles.messageText, isMe ? styles.myMessageText : styles.theirMessageText]}>
            {item.content}
          </Text>
          <Text style={styles.messageTime}>
            {new Date(item.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
          </Text>
        </View>
      </View>
    );
  };

  if (roomLoading) {
    return (
      <Container style={styles.centered}>
        <ActivityIndicator size="large" color={colors.primary} />
      </Container>
    );
  }

  return (
    <Container style={styles.container}>
      <Stack.Screen
        options={{
          headerShown: true,
          title: room?.name || 'Chatroom',
          headerRight: () => (
            <TouchableOpacity onPress={() => Alert.alert('Room Info', room?.description)}>
              <Ionicons name="information-circle-outline" size={24} color={colors.text} />
            </TouchableOpacity>
          ),
        }}
      />
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        style={{ flex: 1 }}
        keyboardVerticalOffset={Platform.OS === 'ios' ? 90 : 0}
      >
        <FlashList
          ref={flatListRef}
          data={messages}
          renderItem={renderMessage}
          keyExtractor={(item) => item.id}
          contentContainerStyle={styles.messageList}
          estimatedItemSize={100}
          onContentSizeChange={() => flatListRef.current?.scrollToEnd({ animated: true })}
        />

        <View style={styles.inputContainer}>
          <TextInput
            style={styles.input}
            placeholder="Type a message..."
            placeholderTextColor={colors.textTertiary}
            value={message}
            onChangeText={setMessage}
            multiline
          />
          <TouchableOpacity
            style={[styles.sendButton, !message.trim() && styles.sendButtonDisabled]}
            onPress={handleSendMessage}
            disabled={!message.trim() || sending}
          >
            {sending ? (
              <ActivityIndicator size="small" color={colors.white} />
            ) : (
              <Ionicons name="send" size={20} color={colors.white} />
            )}
          </TouchableOpacity>
        </View>
      </KeyboardAvoidingView>
    </Container>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: colors.background,
  },
  centered: {
    justifyContent: 'center',
    alignItems: 'center',
  },
  messageList: {
    padding: spacing.md,
    paddingBottom: spacing.xl,
  },
  messageWrapper: {
    flexDirection: 'row',
    marginBottom: spacing.md,
    maxWidth: '80%',
  },
  myMessageWrapper: {
    alignSelf: 'flex-end',
    flexDirection: 'row-reverse',
  },
  theirMessageWrapper: {
    alignSelf: 'flex-start',
  },
  messageAvatar: {
    marginRight: spacing.xs,
    marginTop: spacing.xs,
  },
  messageBubble: {
    padding: spacing.sm,
    paddingHorizontal: spacing.md,
    borderRadius: borderRadius.lg,
    ...shadows.xs,
  },
  myMessageBubble: {
    backgroundColor: colors.primary,
    borderBottomRightRadius: 2,
  },
  theirMessageBubble: {
    backgroundColor: colors.backgroundTertiary,
    borderBottomLeftRadius: 2,
    marginLeft: spacing.xs,
  },
  messageUser: {
    ...typography.tiny,
    color: colors.accent,
    fontWeight: '700',
    marginBottom: 2,
  },
  messageText: {
    ...typography.body,
    fontSize: 15,
  },
  myMessageText: {
    color: colors.white,
  },
  theirMessageText: {
    color: colors.text,
  },
  messageTime: {
    ...typography.tiny,
    color: 'rgba(255,255,255,0.5)',
    alignSelf: 'flex-end',
    marginTop: 2,
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: spacing.sm,
    backgroundColor: colors.backgroundSecondary,
    borderTopWidth: 1,
    borderTopColor: colors.border,
  },
  input: {
    flex: 1,
    backgroundColor: colors.background,
    borderRadius: borderRadius.full,
    paddingHorizontal: spacing.md,
    paddingVertical: Platform.OS === 'ios' ? 10 : 8,
    color: colors.text,
    ...typography.body,
    maxHeight: 100,
  },
  sendButton: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: colors.primary,
    justifyContent: 'center',
    alignItems: 'center',
    marginLeft: spacing.sm,
  },
  sendButtonDisabled: {
    opacity: 0.5,
  },
});
