import { useState, useRef } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, TextInput, KeyboardAvoidingView, Platform } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { theme } from '../utils/theme';
import { MODULE_COLOR_MAP } from '../utils/moduleConfig';
import { AQUAADVISOR_SUGGESTED, AQUAADVISOR_AI } from '../utils/mockData';

const MODULE_COLOR = MODULE_COLOR_MAP.aquaadvisor;

interface Msg { id: string; role: 'user' | 'ai'; text: string }

const WELCOME_MSG = 'Hello! I am AquaAdvisor. Ask me anything about fish farming — water quality, feed, diseases, harvesting.';

export default function AquaAdvisorScreen() {
  const router = useRouter();
  const [msgs, setMsgs] = useState<Msg[]>([
    { id: '0', role: 'ai', text: WELCOME_MSG },
  ]);
  const [input, setInput] = useState('');
  const scrollRef = useRef<ScrollView>(null);

  const getAI = (q: string) => {
    const l = q.toLowerCase();
    if (l.includes('water') || l.includes('quality') || l.includes('ph') || l.includes('oxygen')) return AQUAADVISOR_AI.water;
    if (l.includes('feed') || l.includes('food') || l.includes('shrimp')) return AQUAADVISOR_AI.feed;
    if (l.includes('white') || l.includes('spot') || l.includes('disease') || l.includes('sign')) return AQUAADVISOR_AI.white;
    if (l.includes('harvest') || l.includes('when')) return AQUAADVISOR_AI.harvest;
    return AQUAADVISOR_AI.default;
  };

  const send = (text?: string) => {
    const msg = text || input.trim();
    if (!msg) return;
    setMsgs(prev => [...prev, { id: Date.now().toString(), role: 'user', text: msg }]);
    setInput('');
    setTimeout(() => {
      setMsgs(prev => [...prev, { id: (Date.now() + 1).toString(), role: 'ai', text: getAI(msg) }]);
      scrollRef.current?.scrollToEnd({ animated: true });
    }, 600);
  };

  return (
    <SafeAreaView style={s.safe} edges={['top']}>
      <View style={s.nav}>
        <TouchableOpacity onPress={() => router.back()} style={s.backBtn}><Text style={s.backText}>←</Text></TouchableOpacity>
        <Text style={s.navTitle}>AquaAdvisor</Text>
        <View style={{ width: theme.layout.backButtonSize }} />
      </View>

      <KeyboardAvoidingView style={{ flex: 1 }} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
        <ScrollView
          ref={scrollRef}
          contentContainerStyle={s.chat}
          showsVerticalScrollIndicator={false}
          onContentSizeChange={() => scrollRef.current?.scrollToEnd({ animated: false })}
        >
          {msgs.map(m => (
            <View key={m.id} style={[s.bubble, m.role === 'user' ? s.bubbleUser : s.bubbleAI]}>
              {m.role === 'ai' && <Text style={s.avatar}>🤖</Text>}
              <View style={[s.bubbleBox, m.role === 'user' ? s.bubbleBoxUser : s.bubbleBoxAI]}>
                <Text style={[s.bubbleText, m.role === 'user' && { color: theme.colors.white }]}>{m.text}</Text>
              </View>
            </View>
          ))}
        </ScrollView>

        <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={s.suggestedRow}>
          {AQUAADVISOR_SUGGESTED.map((sg, i) => (
            <TouchableOpacity key={i} style={[s.suggestedChip, { borderColor: MODULE_COLOR + '35' }]} onPress={() => send(sg)}>
              <Text style={[s.suggestedText, { color: MODULE_COLOR }]}>{sg}</Text>
            </TouchableOpacity>
          ))}
        </ScrollView>

        <View style={s.inputRow}>
          <TextInput style={s.textInput} placeholder="Ask about aquaculture..." placeholderTextColor={theme.colors.textLight} value={input} onChangeText={setInput} onSubmitEditing={() => send()} />
          <TouchableOpacity style={[s.sendBtn, { backgroundColor: MODULE_COLOR }, !input.trim() && { opacity: 0.5 }]} onPress={() => send()} disabled={!input.trim()}>
            <Text style={s.sendIcon}>➤</Text>
          </TouchableOpacity>
        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const s = StyleSheet.create({
  safe: { flex: 1, backgroundColor: theme.colors.background },
  nav: { backgroundColor: MODULE_COLOR, flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingTop: theme.spacing.sm + 12, paddingBottom: theme.spacing.sm + 6, paddingHorizontal: theme.spacing.sm + 4 },
  backBtn: { width: theme.layout.backButtonSize, height: theme.layout.backButtonSize, justifyContent: 'center', alignItems: 'center' },
  backText: { color: theme.colors.white, fontSize: theme.fontSize.xxl, fontWeight: '600' },
  navTitle: { color: theme.colors.white, fontSize: theme.fontSize.lg, fontWeight: '700' },
  chat: { padding: theme.spacing.sm + 6, paddingBottom: theme.spacing.sm },
  bubble: { flexDirection: 'row', marginBottom: theme.spacing.sm + 2, maxWidth: '85%' },
  bubbleUser: { alignSelf: 'flex-end' },
  bubbleAI: { alignSelf: 'flex-start' },
  avatar: { fontSize: theme.fontSize.lg, marginRight: 6, marginTop: 4 },
  bubbleBox: { borderRadius: theme.borderRadius.xl, padding: theme.spacing.sm + 4 },
  bubbleBoxUser: { backgroundColor: theme.colors.primary, borderBottomRightRadius: theme.borderRadius.xs },
  bubbleBoxAI: { backgroundColor: theme.colors.card, borderBottomLeftRadius: theme.borderRadius.xs, borderWidth: 1, borderColor: theme.colors.border },
  bubbleText: { fontSize: 13, color: theme.colors.text, lineHeight: 20 },
  suggestedRow: { paddingHorizontal: theme.spacing.sm + 6, paddingVertical: 6, gap: theme.spacing.sm },
  suggestedChip: { backgroundColor: MODULE_COLOR + '15', borderRadius: 20, paddingHorizontal: 14, paddingVertical: 6, borderWidth: 1 },
  suggestedText: { fontSize: 11, fontWeight: '500' },
  inputRow: { flexDirection: 'row', padding: theme.spacing.sm + 2, backgroundColor: theme.colors.card, borderTopWidth: 1, borderTopColor: theme.colors.border, alignItems: 'center' },
  textInput: { flex: 1, backgroundColor: theme.colors.background, borderRadius: 20, paddingHorizontal: theme.spacing.md, paddingVertical: theme.spacing.sm + 2, fontSize: 13, color: theme.colors.text, borderWidth: 1, borderColor: theme.colors.border },
  sendBtn: { width: theme.layout.iconBtn, height: theme.layout.iconBtn, borderRadius: 20, justifyContent: 'center', alignItems: 'center', marginLeft: theme.spacing.sm },
  sendIcon: { color: theme.colors.white, fontSize: theme.fontSize.sm + 2 },
});
