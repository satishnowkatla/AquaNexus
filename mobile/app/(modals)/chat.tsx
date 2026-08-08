import { useState, useEffect, useRef, useCallback } from 'react';
import {
  View, Text, StyleSheet, TextInput, TouchableOpacity, FlatList, KeyboardAvoidingView, Platform, ActivityIndicator,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { theme } from '../../utils/theme';
import { supabase } from '../../utils/supabase';

type Message = {
  id: string;
  conversation_id: string;
  sender_id: string;
  content: string;
  created_at: string;
};

const FALLBACK_ID = '00000000-0000-0000-0000-000000000000';

export default function ChatScreen() {
  const router = useRouter();
  const { id, name } = useLocalSearchParams<{ id: string; name: string }>();
  const [messages, setMessages] = useState<Message[]>([]);
  const [conversationId, setConversationId] = useState<string | null>(null);
  const [text, setText] = useState('');
  const [myId, setMyId] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [sending, setSending] = useState(false);
  const listRef = useRef<FlatList>(null);

  const ensureConversation = useCallback(async () => {
    if (!id) return;
    const { data: { user } } = await supabase.auth.getUser();
    const userId = user?.id || FALLBACK_ID;
    setMyId(userId);

    const a = userId < id ? userId : id;
    const b = userId < id ? id : userId;

    const { data: existing } = await supabase
      .from('conversations')
      .select('id')
      .eq('farmer_a', a)
      .eq('farmer_b', b)
      .maybeSingle();

    if (existing) {
      setConversationId(existing.id);
    } else {
      const { data: created, error } = await supabase
        .from('conversations')
        .insert({ farmer_a: a, farmer_b: b })
        .select('id')
        .single();
      if (error) {
        const retry = await supabase
          .from('conversations')
          .select('id')
          .eq('farmer_a', a)
          .eq('farmer_b', b)
          .maybeSingle();
        if (retry.data) { setConversationId(retry.data.id); return; }
        setLoading(false);
        setError('Could not start a conversation. Please login with your phone number and try again.');
        return;
      }
      if (created) setConversationId(created.id);
    }
  }, [id]);

  useEffect(() => {
    ensureConversation();
  }, [ensureConversation]);

  useEffect(() => {
    if (!conversationId) return;
    const load = async () => {
      const { data } = await supabase
        .from('messages')
        .select('*')
        .eq('conversation_id', conversationId)
        .order('created_at', { ascending: true })
        .limit(200);
      if (data) setMessages(data);
      setLoading(false);
    };
    load();

    const channel = supabase
      .channel(`messages-${conversationId}`)
      .on('postgres_changes', {
        event: 'INSERT', schema: 'public', table: 'messages', filter: `conversation_id=eq.${conversationId}`,
      }, (payload) => {
        const msg = payload.new as Message;
        setMessages(prev => prev.some(m => m.id === msg.id) ? prev : [...prev, msg]);
      })
      .subscribe();
    return () => { supabase.removeChannel(channel); };
  }, [conversationId]);

  const send = async () => {
    if (!text.trim() || !conversationId || !myId) return;
    setSending(true);
    const content = text.trim();
    setText('');
    try {
      await supabase.from('messages').insert({ conversation_id: conversationId, sender_id: myId, content });
      await supabase.from('conversations').update({ last_message: content, last_message_at: new Date().toISOString() }).eq('id', conversationId);
    } finally {
      setSending(false);
    }
  };

  const formatTime = (ts: string) => {
    const d = new Date(ts);
    return d.toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' });
  };

  return (
    <SafeAreaView style={s.safe} edges={['top']}>
      <View style={s.nav}>
        <TouchableOpacity onPress={() => router.back()} style={s.backBtn}><Text style={s.backText}>←</Text></TouchableOpacity>
        <View style={s.navAvatar}>
          <Text style={s.navAvatarText}>{(name || 'F').slice(0, 1).toUpperCase()}</Text>
        </View>
        <View style={{ flex: 1 }}>
          <Text style={s.navTitle}>{name || 'Farmer'}</Text>
          <View style={s.navOnlineRow}>
            <View style={s.onlineDot} />
            <Text style={s.navSub}>Direct message</Text>
          </View>
        </View>
      </View>

      {loading ? (
        <View style={s.center}>
          <ActivityIndicator size="large" color={theme.colors.primary} />
          <Text style={s.centerText}>Loading chat...</Text>
        </View>
      ) : error ? (
        <View style={s.center}>
          <Text style={s.errorEmoji}>🔒</Text>
          <Text style={s.errorText}>{error}</Text>
        </View>
      ) : (
        <FlatList
          ref={listRef}
          data={messages}
          keyExtractor={m => m.id}
          contentContainerStyle={s.listContent}
          onContentSizeChange={() => listRef.current?.scrollToEnd({ animated: true })}
          ListEmptyComponent={<Text style={s.empty}>Say hello to start the conversation!</Text>}
          renderItem={({ item }) => {
            const mine = item.sender_id === myId;
            return (
              <View style={[s.bubbleWrap, mine ? s.mineWrap : s.theirsWrap]}>
                <View style={[s.bubble, mine ? s.mineBubble : s.theirsBubble]}>
                  <Text style={[s.bubbleText, mine && s.mineText]}>{item.content}</Text>
                  <Text style={[s.bubbleTime, mine && s.mineTime]}>{formatTime(item.created_at)}</Text>
                </View>
              </View>
            );
          }}
        />
      )}

      {!error && (
        <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : undefined} keyboardVerticalOffset={0}>
          <View style={s.inputBar}>
            <TextInput
              style={s.input}
              placeholder="Type a message..."
              placeholderTextColor={theme.colors.textLight}
              value={text}
              onChangeText={setText}
              multiline
            />
            <TouchableOpacity
              style={[s.sendBtn, { backgroundColor: theme.colors.primary, opacity: (!text.trim() || sending) ? 0.5 : 1 }]}
              onPress={send}
              disabled={!text.trim() || sending}
            >
              <Text style={s.sendText}>{sending ? '…' : '➤'}</Text>
            </TouchableOpacity>
          </View>
        </KeyboardAvoidingView>
      )}
    </SafeAreaView>
  );
}

const s = StyleSheet.create({
  safe: { flex: 1, backgroundColor: theme.colors.background },
  nav: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingTop: theme.spacing.sm + 12,
    paddingBottom: theme.spacing.sm + 6,
    paddingHorizontal: theme.spacing.sm + 4,
    gap: 10,
    backgroundColor: theme.colors.primary,
  },
  backBtn: { width: theme.layout.backButtonSize, height: theme.layout.backButtonSize, justifyContent: 'center', alignItems: 'center' },
  backText: { color: theme.colors.white, fontSize: theme.fontSize.xxl, fontWeight: '600' },
  navAvatar: {
    width: 38,
    height: 38,
    borderRadius: 19,
    backgroundColor: 'rgba(255,255,255,0.22)',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.45)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  navAvatarText: { color: '#fff', fontSize: 16, fontWeight: '800' },
  navTitle: { color: theme.colors.white, fontSize: theme.fontSize.lg, fontWeight: '700' },
  navOnlineRow: { flexDirection: 'row', alignItems: 'center', gap: 6, marginTop: 2 },
  onlineDot: { width: 7, height: 7, borderRadius: 3.5, backgroundColor: '#A7F3D0' },
  navSub: { color: 'rgba(255,255,255,0.85)', fontSize: 11, fontWeight: '600' },
  center: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  centerText: { marginTop: 12, color: theme.colors.textLight, fontSize: 14 },
  errorEmoji: { fontSize: 40, marginBottom: 12 },
  errorText: { textAlign: 'center', color: theme.colors.textLight, fontSize: 14, paddingHorizontal: 40, lineHeight: 20 },
  listContent: { padding: theme.spacing.lg, flexGrow: 1 },
  empty: { textAlign: 'center', color: theme.colors.textLight, fontSize: 13, marginTop: 40 },
  bubbleWrap: { marginVertical: 4, flexDirection: 'row' },
  mineWrap: { justifyContent: 'flex-end' },
  theirsWrap: { justifyContent: 'flex-start' },
  bubble: { maxWidth: '78%', paddingHorizontal: 14, paddingVertical: 10, borderRadius: 18 },
  mineBubble: { backgroundColor: theme.colors.primary, borderBottomRightRadius: 6 },
  theirsBubble: { backgroundColor: theme.colors.card, borderBottomLeftRadius: 6, borderWidth: 1, borderColor: theme.colors.border },
  bubbleText: { fontSize: 14, color: theme.colors.text, lineHeight: 20 },
  mineText: { color: theme.colors.white },
  bubbleTime: { fontSize: 10, color: theme.colors.textLight, marginTop: 4, alignSelf: 'flex-end' },
  mineTime: { color: 'rgba(255,255,255,0.8)' },
  inputBar: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    gap: 8,
    marginHorizontal: theme.spacing.md,
    marginBottom: theme.spacing.sm + 4,
    padding: theme.spacing.sm + 2,
    backgroundColor: theme.colors.card,
    borderRadius: theme.borderRadius.md,
    borderWidth: 1,
    borderColor: theme.colors.border,
  },
  input: {
    flex: 1,
    borderRadius: theme.borderRadius.xl,
    paddingHorizontal: 14,
    paddingVertical: 10,
    fontSize: 14,
    color: theme.colors.text,
    maxHeight: 100,
    backgroundColor: theme.colors.grey[50],
  },
  sendBtn: { width: 44, height: 44, borderRadius: 22, justifyContent: 'center', alignItems: 'center' },
  sendText: { color: theme.colors.white, fontSize: 18 },
});
