import React, { useState, useEffect, useRef, useMemo } from 'react';
import { StyleSheet, View, Text, TextInput, TouchableOpacity, KeyboardAvoidingView, Platform, ActivityIndicator, Alert } from 'react-native';
import { FlashList } from '@shopify/flash-list';
import { useLocalSearchParams, Stack } from 'expo-router';
import { supabase } from '@/lib/supabase';
import { colors, spacing, typography, borderRadius, shadows } from '@/constants/design';
import { Container, Avatar } from '@/components/ui';
import { Image } from 'expo-image';
import { Ionicons } from '@expo/vector-icons';
import { useAuthStore } from '@/store/useAuthStore';
import { useChatStore } from '@/store/useChatStore';
import { messageService } from '@/services/messageService';
import { chatroomService } from '@/services/chatroomService';
import * as ImagePicker from 'expo-image-picker';

export default function ChatroomScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const { profile } = useAuthStore();
  const { messages: chatroomMessages, fetchMessages, subscribeToChatroom, setActiveChatroom, setTyping, typingUsers } = useChatStore();
  const [message, setMessage] = useState('');
  const [room, setRoom] = useState<any>(null);
  const [roomLoading, setRoomLoading] = useState(true);
  const [sending, setSending] = useState(false);
  const flatListRef = useRef<FlashList<any>>(null);
  const typingTimeoutRef = useRef<any>(null);

  const messages = useMemo(() => chatroomMessages[id as string] || [], [chatroomMessages, id]);
  const activeTyping = Array.from(typingUsers[id as string] || []).filter((userId) => userId !== profile?.id);

  useEffect(() => {
    if (!id || !profile) return;

    const setupChat = async () => {
      setRoomLoading(true);

      await chatroomService.joinChatroom(id as string, profile.id);

      const { data } = await supabase.from('chatrooms').select('*').eq('id', id).single();
      setRoom(data);

      await fetchMessages(id as string);
      setRoomLoading(false);

      const unsubscribe = subscribeToChatroom(id as string);
      return unsubscribe;
    };

    const cleanup = setupChat();
    setActiveChatroom(id as string);

    return () => {
      cleanup.then((unsub) => unsub?.());
      setActiveChatroom(null);
    };
  }, [id, profile, fetchMessages, setActiveChatroom, subscribeToChatroom]);


  useEffect(() => {
    if (!profile || !messages.length) return;
    messages
      .filter((m) => m.sender_id !== profile.id)
      .slice(-20)
      .forEach((m) => {
        messageService.markAsRead(m.id, profile.id);
      });
  }, [messages, profile]);

  const handleTyping = (nextValue: string) => {
    setMessage(nextValue);
    if (!profile || !id) return;

    setTyping(id as string, profile.id, !!nextValue.trim());
    if (typingTimeoutRef.current) clearTimeout(typingTimeoutRef.current);
    typingTimeoutRef.current = setTimeout(() => {
      setTyping(id as string, profile.id, false);
    }, 1200);
  };

  const handleSendMessage = async () => {
    if (!message.trim() || !profile || !id) return;

    setSending(true);
    try {
      await messageService.sendMessage({
        chatroom_id: id as string,
        sender_id: profile.id,
        content: message.trim(),
        type: 'text',
      });
      setMessage('');
      setTyping(id as string, profile.id, false);
    } catch (error) {
      console.error('Error sending message:', error);
    } finally {
      setSending(false);
    }
  };

  const handleSendImage = async () => {
    if (!profile || !id) return;
    const permission = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (!permission.granted) {
      Alert.alert('Permission needed', 'Please allow photo access to send images.');
      return;
    }

    const result = await ImagePicker.launchImageLibraryAsync({ mediaTypes: ['images'], quality: 0.8 });
    if (result.canceled || !result.assets[0]?.uri) return;

    setSending(true);
    try {
      const imageUrl = await messageService.uploadMessageImage(result.assets[0].uri, profile.id);
      if (!imageUrl) throw new Error('Unable to upload image');

      await messageService.sendMessage({
        chatroom_id: id as string,
        sender_id: profile.id,
        content: '📷 Image',
        type: 'image',
        metadata: { imageUrl },
      });
    } catch (error: any) {
      Alert.alert('Image send failed', error.message || 'Unable to send image.');
    } finally {
      setSending(false);
    }
  };

  const handleDeleteMessage = async (messageId: string) => {
    Alert.alert('Delete message', 'Do you want to delete this message?', [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Delete',
        style: 'destructive',
        onPress: async () => {
          await messageService.deleteMessage(messageId);
          await fetchMessages(id as string);
        },
      },
    ]);
  };

  const renderMessage = ({ item }: { item: any }) => {
    const isMe = item.sender_id === profile?.id;

    return (
      <TouchableOpacity
        style={[styles.messageWrapper, isMe ? styles.myMessageWrapper : styles.theirMessageWrapper]}
        onLongPress={() => isMe && handleDeleteMessage(item.id)}
        delayLongPress={300}
      >
        {!isMe && <Avatar source={{ uri: item.sender?.avatar_url }} size="sm" style={styles.messageAvatar} />}
        <View style={[styles.messageBubble, isMe ? styles.myMessageBubble : styles.theirMessageBubble]}>
          {!isMe && <Text style={styles.messageUser}>{item.sender?.display_name || 'Anonymous'}</Text>}
          {item.type === 'image' && item.metadata?.imageUrl ? (
            <Image source={{ uri: item.metadata.imageUrl }} style={styles.messageImage} contentFit="cover" />
          ) : (
            <Text style={[styles.messageText, isMe ? styles.myMessageText : styles.theirMessageText]}>{item.is_deleted ? 'Message deleted' : item.content}</Text>
          )}
          <Text style={styles.messageTime}>
            {new Date(item.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
          </Text>
        </View>
      </TouchableOpacity>
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

        {activeTyping.length > 0 && (
          <Text style={styles.typingText}>Someone is typing...</Text>
        )}

        <View style={styles.inputContainer}>
          <TouchableOpacity style={styles.mediaBtn} onPress={handleSendImage}>
            <Ionicons name="image-outline" size={22} color={colors.textSecondary} />
          </TouchableOpacity>
          <TextInput
            style={styles.input}
            placeholder="Type a message..."
            placeholderTextColor={colors.textTertiary}
            value={message}
            onChangeText={handleTyping}
            multiline
          />
          <TouchableOpacity
            style={[styles.sendButton, !message.trim() && styles.sendButtonDisabled]}
            onPress={handleSendMessage}
            disabled={!message.trim() || sending}
          >
            {sending ? <ActivityIndicator size="small" color={colors.white} /> : <Ionicons name="send" size={20} color={colors.white} />}
          </TouchableOpacity>
        </View>
      </KeyboardAvoidingView>
    </Container>
  );
}

const styles = StyleSheet.create({
  container: { backgroundColor: colors.background },
  centered: { justifyContent: 'center', alignItems: 'center' },
  messageList: { padding: spacing.md, paddingBottom: spacing.xl },
  messageWrapper: { flexDirection: 'row', marginBottom: spacing.md, maxWidth: '80%' },
  myMessageWrapper: { alignSelf: 'flex-end', flexDirection: 'row-reverse' },
  theirMessageWrapper: { alignSelf: 'flex-start' },
  messageAvatar: { marginRight: spacing.xs, marginTop: spacing.xs },
  messageBubble: { padding: spacing.sm, paddingHorizontal: spacing.md, borderRadius: borderRadius.lg, ...shadows.xs },
  myMessageBubble: { backgroundColor: colors.primary, borderBottomRightRadius: 2 },
  theirMessageBubble: { backgroundColor: colors.backgroundTertiary, borderBottomLeftRadius: 2, marginLeft: spacing.xs },
  messageUser: { ...typography.tiny, color: colors.accent, fontWeight: '700', marginBottom: 2 },
  messageText: { ...typography.body, fontSize: 15 },
  myMessageText: { color: colors.white },
  theirMessageText: { color: colors.text },
  messageTime: { ...typography.tiny, color: 'rgba(255,255,255,0.5)', alignSelf: 'flex-end', marginTop: 2 },
  messageImage: { width: 180, height: 180, borderRadius: borderRadius.md },
  typingText: { ...typography.caption, color: colors.textSecondary, marginLeft: spacing.md, marginBottom: spacing.xs },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: spacing.sm,
    backgroundColor: colors.backgroundSecondary,
    borderTopWidth: 1,
    borderTopColor: colors.border,
    gap: spacing.xs,
  },
  mediaBtn: {
    width: 36,
    height: 36,
    borderRadius: 18,
    justifyContent: 'center',
    alignItems: 'center',
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
  sendButtonDisabled: { opacity: 0.5 },
});
