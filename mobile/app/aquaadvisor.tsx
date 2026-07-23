import { useState, useRef } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, TextInput, KeyboardAvoidingView, Platform } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { theme } from '../utils/theme';

interface Msg { id: string; role: 'user' | 'ai'; text: string }

const SUGGESTED = ['Water quality tips', 'Best feed for shrimp?', 'White spot signs?', 'When to harvest?'];

const AI: Record<string, string> = {
  water: 'For optimal water quality:\n\n• Maintain DO above 5mg/L — use aerators at night\n• pH between 7.0-8.5 — use lime if needed\n• Ammonia below 0.02mg/L — use probiotics\n• Weekly 10-15% water changes\n• Test water daily during morning rounds',
  feed: 'Vannamei shrimp feeding guide:\n\n• Starter (Week 1-2): 0.3-0.5mm, 8-10% body weight/day\n• Grower (Week 3-8): 0.8-1.2mm, 5-7% body weight/day\n• Finisher (Week 9+): 1.5mm, 3-4% body weight/day\n\nFeed 3-4 times daily. Target FCR: 1.2-1.5',
  white: 'White Spot Disease (WSSV) signs:\n\n• White circular spots (0.5-2mm) on shell\n• Sudden loss of appetite\n• Lethargy — floating at surface\n• Rubbing against pond walls\n\nAction: Increase temp to 30°C, salt bath 3ppt, isolate stock. Prevention via biosecurity is key.',
  harvest: 'Harvest timing:\n\n• Target size: 25-30g shrimp, 500g+ fish\n• Stop feeding when FCR > 1.8\n• Check local mandi rates\n• If survival >60% continue, <40% harvest early\n\nDrain pond gradually over 24hrs. Use drag nets. Ice immediately.',
  default: 'I can help with aquaculture topics:\n\n• Water quality management\n• Feed optimization\n• Disease identification\n• Harvest planning\n• Pond preparation\n\nPlease ask a specific question!',
};

export default function AquaAdvisorScreen() {
  const router = useRouter();
  const [msgs, setMsgs] = useState<Msg[]>([
    { id: '0', role: 'ai', text: 'Hello! I am AquaAdvisor. Ask me anything about fish farming — water quality, feed, diseases, harvesting.' },
  ]);
  const [input, setInput] = useState('');
  const scrollRef = useRef<ScrollView>(null);

  const getAI = (q: string) => {
    const l = q.toLowerCase();
    if (l.includes('water') || l.includes('quality') || l.includes('ph') || l.includes('oxygen')) return AI.water;
    if (l.includes('feed') || l.includes('food') || l.includes('shrimp')) return AI.feed;
    if (l.includes('white') || l.includes('spot') || l.includes('disease') || l.includes('sign')) return AI.white;
    if (l.includes('harvest') || l.includes('when')) return AI.harvest;
    return AI.default;
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
        <View style={{ width: 40 }} />
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
                <Text style={[s.bubbleText, m.role === 'user' && { color: '#FFF' }]}>{m.text}</Text>
              </View>
            </View>
          ))}
        </ScrollView>

        <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={s.suggestedRow}>
          {SUGGESTED.map((sg, i) => (
            <TouchableOpacity key={i} style={s.suggestedChip} onPress={() => send(sg)}>
              <Text style={s.suggestedText}>{sg}</Text>
            </TouchableOpacity>
          ))}
        </ScrollView>

        <View style={s.inputRow}>
          <TextInput style={s.textInput} placeholder="Ask about aquaculture..." placeholderTextColor={theme.colors.textLight} value={input} onChangeText={setInput} onSubmitEditing={() => send()} />
          <TouchableOpacity style={[s.sendBtn, !input.trim() && { opacity: 0.5 }]} onPress={() => send()} disabled={!input.trim()}>
            <Text style={s.sendIcon}>➤</Text>
          </TouchableOpacity>
        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const s = StyleSheet.create({
  safe: { flex: 1, backgroundColor: theme.colors.background },
  nav: { backgroundColor: '#27AE60', flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingTop: 20, paddingBottom: 14, paddingHorizontal: 12 },
  backBtn: { width: 40, height: 40, justifyContent: 'center', alignItems: 'center' },
  backText: { color: '#FFF', fontSize: 24, fontWeight: '600' },
  navTitle: { color: '#FFF', fontSize: 18, fontWeight: '700' },
  chat: { padding: 14, paddingBottom: 8 },
  bubble: { flexDirection: 'row', marginBottom: 10, maxWidth: '85%' },
  bubbleUser: { alignSelf: 'flex-end' },
  bubbleAI: { alignSelf: 'flex-start' },
  avatar: { fontSize: 18, marginRight: 6, marginTop: 4 },
  bubbleBox: { borderRadius: 16, padding: 12 },
  bubbleBoxUser: { backgroundColor: theme.colors.primary, borderBottomRightRadius: 4 },
  bubbleBoxAI: { backgroundColor: theme.colors.card, borderBottomLeftRadius: 4, borderWidth: 1, borderColor: theme.colors.border },
  bubbleText: { fontSize: 13, color: theme.colors.text, lineHeight: 20 },
  suggestedRow: { paddingHorizontal: 14, paddingVertical: 6, gap: 8 },
  suggestedChip: { backgroundColor: '#27AE6015', borderRadius: 20, paddingHorizontal: 14, paddingVertical: 6, borderWidth: 1, borderColor: '#27AE6035' },
  suggestedText: { fontSize: 11, color: '#27AE60', fontWeight: '500' },
  inputRow: { flexDirection: 'row', padding: 10, backgroundColor: theme.colors.card, borderTopWidth: 1, borderTopColor: theme.colors.border, alignItems: 'center' },
  textInput: { flex: 1, backgroundColor: theme.colors.background, borderRadius: 20, paddingHorizontal: 16, paddingVertical: 10, fontSize: 13, color: theme.colors.text, borderWidth: 1, borderColor: theme.colors.border },
  sendBtn: { width: 40, height: 40, borderRadius: 20, backgroundColor: '#27AE60', justifyContent: 'center', alignItems: 'center', marginLeft: 8 },
  sendIcon: { color: '#FFF', fontSize: 16 },
});
