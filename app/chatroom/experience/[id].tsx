import React, { useEffect, useMemo, useState } from 'react';
import { Alert, ScrollView, StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Stack, useLocalSearchParams } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { Audio } from 'expo-av';
import { Image } from 'expo-image';
import { Container } from '@/components/ui';
import { colors, borderRadius, spacing, typography } from '@/constants/design';
import { useChatStore } from '@/store/useChatStore';
import { supabase } from '@/lib/supabase';

type SavedPoll = { id: string; question: string; options: string[]; votes: Record<string, number> };
const linkRegex = /(https?:\/\/[^\s]+)/g;

export default function MessagingExperienceScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const { messages } = useChatStore();
  const roomMessages = useMemo(() => messages[id as string] || [], [id, messages]);

  const [search, setSearch] = useState('');
  const [pinned, setPinned] = useState<string[]>([]);
  const [starred, setStarred] = useState<string[]>([]);
  const [archived, setArchived] = useState(false);
  const [scheduled, setScheduled] = useState<{ id: string; content: string; scheduledFor: string }[]>([]);
  const [polls, setPolls] = useState<SavedPoll[]>([]);
  const [pollDraft, setPollDraft] = useState('');
  const [voiceStatus, setVoiceStatus] = useState('Idle');
  const [readsByMessage, setReadsByMessage] = useState<Record<string, number>>({});
  const [recording, setRecording] = useState<Audio.Recording | null>(null);

  const storageKeys = useMemo(() => ({
    pinned: `room:${id}:pinned`,
    starred: `room:${id}:starred`,
    archived: `room:${id}:archived`,
    scheduled: `room:${id}:scheduled`,
    polls: `room:${id}:polls`,
    draft: `draft:${id}`,
  }), [id]);

  useEffect(() => {
    (async () => {
      const [pinnedRaw, starredRaw, archivedRaw, scheduledRaw, pollsRaw] = await Promise.all([
        AsyncStorage.getItem(storageKeys.pinned),
        AsyncStorage.getItem(storageKeys.starred),
        AsyncStorage.getItem(storageKeys.archived),
        AsyncStorage.getItem(storageKeys.scheduled),
        AsyncStorage.getItem(storageKeys.polls),
      ]);
      if (pinnedRaw) setPinned(JSON.parse(pinnedRaw));
      if (starredRaw) setStarred(JSON.parse(starredRaw));
      if (archivedRaw) setArchived(JSON.parse(archivedRaw));
      if (scheduledRaw) setScheduled(JSON.parse(scheduledRaw));
      if (pollsRaw) setPolls(JSON.parse(pollsRaw));
    })();
  }, [storageKeys]);

  useEffect(() => {
    (async () => {
      const ids = roomMessages.slice(-15).map((m) => m.id);
      if (!ids.length) return;
      const { data } = await supabase.from('message_reads').select('message_id').in('message_id', ids);
      const grouped: Record<string, number> = {};
      (data || []).forEach((row: any) => {
        grouped[row.message_id] = (grouped[row.message_id] || 0) + 1;
      });
      setReadsByMessage(grouped);
    })();
  }, [roomMessages]);

  const persist = async (key: string, value: unknown) => AsyncStorage.setItem(key, JSON.stringify(value));

  const filtered = roomMessages.filter((msg) => msg.content?.toLowerCase().includes(search.toLowerCase()));
  const mediaMessages = roomMessages.filter((msg) => msg.type === 'image' || msg.metadata?.fileUrl);
  const replies = roomMessages.filter((msg) => msg.reply_to);
  const sharedLinks = roomMessages.flatMap((msg) => (msg.content || '').match(linkRegex) || []);
  const pinnedMessages = roomMessages.filter((msg) => pinned.includes(msg.id));
  const starredMessages = roomMessages.filter((msg) => starred.includes(msg.id));

  const toggleMessage = async (ids: string[], setter: (next: string[]) => void, key: string, messageId: string) => {
    const next = ids.includes(messageId) ? ids.filter((mid) => mid !== messageId) : [...ids, messageId];
    setter(next);
    await persist(key, next);
  };

  const addSchedule = async () => {
    if (!search.trim()) return Alert.alert('Type message text in search first');
    const next = [...scheduled, { id: `${Date.now()}`, content: search.trim(), scheduledFor: new Date(Date.now() + 3600000).toISOString() }];
    setScheduled(next);
    await persist(storageKeys.scheduled, next);
    setSearch('');
  };

  const addPoll = async () => {
    if (!pollDraft.trim()) return;
    const next = [...polls, { id: `${Date.now()}`, question: pollDraft, options: ['Yes', 'No'], votes: { Yes: 0, No: 0 } }];
    setPolls(next);
    await persist(storageKeys.polls, next);
    setPollDraft('');
  };

  const votePoll = async (pollId: string, option: string) => {
    const next = polls.map((poll) => poll.id === pollId ? { ...poll, votes: { ...poll.votes, [option]: (poll.votes[option] || 0) + 1 } } : poll);
    setPolls(next);
    await persist(storageKeys.polls, next);
  };

  const startRecording = async () => {
    try {
      const permission = await Audio.requestPermissionsAsync();
      if (!permission.granted) return Alert.alert('Microphone permission is required.');
      await Audio.setAudioModeAsync({ allowsRecordingIOS: true, playsInSilentModeIOS: true });
      const { recording: rec } = await Audio.Recording.createAsync(Audio.RecordingOptionsPresets.HIGH_QUALITY);
      setRecording(rec);
      setVoiceStatus('Recording...');
    } catch {
      setVoiceStatus('Unable to record in this environment');
    }
  };

  const stopRecording = async () => {
    if (!recording) return;
    await recording.stopAndUnloadAsync();
    const uri = recording.getURI();
    setRecording(null);
    setVoiceStatus(uri ? `Saved note: ${uri.split('/').pop()}` : 'Saved note');
  };

  return (
    <Container style={styles.container}>
      <Stack.Screen options={{ title: 'Messaging Experience', headerBackTitle: 'Room' }} />
      <ScrollView contentContainerStyle={styles.content}>
        <View style={styles.card}><Text style={styles.cardTitle}>Message search within room</Text><TextInput style={styles.input} value={search} onChangeText={setSearch} placeholder="Search messages" placeholderTextColor={colors.textTertiary} /><Text style={styles.metaText}>{filtered.length} result(s)</Text></View>

        <View style={styles.card}><Text style={styles.cardTitle}>Media gallery / Shared links</Text><Text style={styles.metaText}>{mediaMessages.length} media • {sharedLinks.length} links</Text><ScrollView horizontal showsHorizontalScrollIndicator={false}>{mediaMessages.slice(0, 8).map((msg) => <Image key={msg.id} source={{ uri: msg.metadata?.imageUrl || msg.metadata?.fileUrl }} style={styles.galleryImage} />)}</ScrollView>{sharedLinks.slice(0, 3).map((link, index) => <Text key={`${link}-${index}`} style={styles.linkText}>{link}</Text>)}</View>

        <View style={styles.card}><Text style={styles.cardTitle}>Thread / Replies view</Text><Text style={styles.metaText}>{replies.length} replies from reply_to references.</Text></View>

        <View style={styles.card}>
          <Text style={styles.cardTitle}>Pinned / Starred / Reactions detail</Text>
          {roomMessages.slice(-5).map((msg) => (
            <View key={msg.id} style={styles.rowBetween}>
              <Text numberOfLines={1} style={styles.rowText}>{msg.content}</Text>
              <View style={styles.iconRow}>
                <TouchableOpacity onPress={() => toggleMessage(pinned, setPinned, storageKeys.pinned, msg.id)}><Ionicons name={pinned.includes(msg.id) ? 'pin' : 'pin-outline'} size={18} color={colors.text} /></TouchableOpacity>
                <TouchableOpacity onPress={() => toggleMessage(starred, setStarred, storageKeys.starred, msg.id)}><Ionicons name={starred.includes(msg.id) ? 'star' : 'star-outline'} size={18} color={colors.text} /></TouchableOpacity>
                <Text style={styles.metaText}>👍 {msg.metadata?.reactions?.length || 0}</Text>
              </View>
            </View>
          ))}
          <Text style={styles.metaText}>Pinned: {pinnedMessages.length} • Starred: {starredMessages.length}</Text>
        </View>

        <View style={styles.card}><Text style={styles.cardTitle}>Message info (read receipts)</Text>{roomMessages.slice(-5).map((msg) => <Text key={msg.id} style={styles.metaText}>• {msg.content?.slice(0, 30)} — read by {readsByMessage[msg.id] || 0}</Text>)}</View>

        <View style={styles.card}><Text style={styles.cardTitle}>Drafts / Scheduled messages</Text><Text style={styles.metaText}>Draft key: {storageKeys.draft}</Text><TouchableOpacity style={styles.btn} onPress={addSchedule}><Text style={styles.btnText}>Schedule from search text</Text></TouchableOpacity>{scheduled.map((item) => <Text key={item.id} style={styles.metaText}>⏰ {item.content} @ {new Date(item.scheduledFor).toLocaleString()}</Text>)}</View>

        <View style={styles.card}><Text style={styles.cardTitle}>Voice notes recorder/player</Text><Text style={styles.metaText}>{voiceStatus}</Text><View style={styles.iconRow}><TouchableOpacity style={styles.circleBtn} onPress={startRecording}><Ionicons name="mic" size={18} color={colors.white} /></TouchableOpacity><TouchableOpacity style={[styles.circleBtn, { backgroundColor: colors.error }]} onPress={stopRecording}><Ionicons name="stop" size={18} color={colors.white} /></TouchableOpacity></View></View>

        <View style={styles.card}><Text style={styles.cardTitle}>Polls creation + results</Text><TextInput style={styles.input} value={pollDraft} onChangeText={setPollDraft} placeholder="Poll question" placeholderTextColor={colors.textTertiary} /><TouchableOpacity style={styles.btn} onPress={addPoll}><Text style={styles.btnText}>Create poll</Text></TouchableOpacity>{polls.map((poll) => <View key={poll.id} style={styles.pollCard}><Text style={styles.rowText}>{poll.question}</Text>{poll.options.map((option) => <TouchableOpacity key={option} style={styles.voteRow} onPress={() => votePoll(poll.id, option)}><Text style={styles.metaText}>{option}</Text><Text style={styles.metaText}>{poll.votes[option] || 0}</Text></TouchableOpacity>)}</View>)}</View>

        <View style={styles.card}><Text style={styles.cardTitle}>Archived chats</Text><Text style={styles.metaText}>Status: {archived ? 'Archived' : 'Active'}</Text><TouchableOpacity style={styles.btn} onPress={async () => { const next = !archived; setArchived(next); await persist(storageKeys.archived, next); }}><Text style={styles.btnText}>{archived ? 'Unarchive' : 'Archive'} chat</Text></TouchableOpacity></View>
      </ScrollView>
    </Container>
  );
}

const styles = StyleSheet.create({
  container: { backgroundColor: colors.background },
  content: { padding: spacing.md, gap: spacing.md, paddingBottom: spacing.xxxl },
  card: { borderWidth: 1, borderColor: colors.border, borderRadius: borderRadius.lg, backgroundColor: colors.backgroundSecondary, padding: spacing.md, gap: spacing.xs },
  cardTitle: { ...typography.smallBold, color: colors.text },
  metaText: { ...typography.caption, color: colors.textSecondary },
  input: { borderWidth: 1, borderColor: colors.border, borderRadius: borderRadius.md, paddingHorizontal: spacing.sm, paddingVertical: spacing.xs, color: colors.text, backgroundColor: colors.background },
  galleryImage: { width: 88, height: 88, borderRadius: borderRadius.md, marginRight: spacing.xs, backgroundColor: colors.background },
  linkText: { ...typography.caption, color: colors.primary },
  rowBetween: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', gap: spacing.sm },
  rowText: { ...typography.caption, color: colors.text, flex: 1 },
  iconRow: { flexDirection: 'row', alignItems: 'center', gap: spacing.sm },
  btn: { borderRadius: borderRadius.md, backgroundColor: colors.primary, paddingVertical: spacing.xs, paddingHorizontal: spacing.sm, alignSelf: 'flex-start' },
  btnText: { ...typography.smallBold, color: colors.white },
  circleBtn: { width: 34, height: 34, borderRadius: 17, alignItems: 'center', justifyContent: 'center', backgroundColor: colors.primary },
  pollCard: { borderWidth: 1, borderColor: colors.border, borderRadius: borderRadius.md, padding: spacing.sm, marginTop: spacing.xs },
  voteRow: { flexDirection: 'row', justifyContent: 'space-between', paddingVertical: 2 },
});
