import { useState, useRef } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, TextInput, Alert, Platform } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { Audio } from 'expo-av';
import { theme } from '../utils/theme';

interface Tx { id: string; type: 'income' | 'expense'; amount: number; category: string; note: string; time: string }

const MOCK_TXS: Tx[] = [
  { id: '1', type: 'expense', amount: 12000, category: 'Feed', note: '30 bags shrimp feed', time: 'Today' },
  { id: '2', type: 'income', amount: 45000, category: 'Shrimp Sale', note: 'Sold 50kg to dealer', time: 'Yesterday' },
  { id: '3', type: 'expense', amount: 2500, category: 'Medicine', note: 'Probiotics + vitamins', time: '2 days ago' },
];

const CATS = { expense: ['Feed', 'Medicine', 'Seed', 'Labour', 'Transport'], income: ['Fish Sale', 'Shrimp Sale', 'Fingerling', 'Other'] };

export default function AquaVoiceScreen() {
  const router = useRouter();
  const [recording, setRecording] = useState(false);
  const [showAdd, setShowAdd] = useState(false);
  const [addType, setAddType] = useState<'income' | 'expense'>('expense');
  const [amount, setAmount] = useState('');
  const [category, setCategory] = useState('');
  const [note, setNote] = useState('');
  const [txs, setTxs] = useState<Tx[]>(MOCK_TXS);
  const recRef = useRef<Audio.Recording | null>(null);

  const startRec = async () => {
    try {
      await Audio.requestPermissionsAsync();
      await Audio.setAudioModeAsync({ allowsRecordingIOS: true, playsInSilentModeIOS: true });
      const { recording: r } = await Audio.Recording.createAsync(Audio.RecordingOptionsPresets.HIGH_QUALITY);
      recRef.current = r;
      setRecording(true);
    } catch { Alert.alert('Error', 'Could not start recording'); }
  };

  const stopRec = async () => {
    if (!recRef.current) return;
    await recRef.current.stopAndUnloadAsync();
    await Audio.setAudioModeAsync({ allowsRecordingIOS: false });
    setRecording(false);
    recRef.current = null;
    Alert.alert('Voice Captured!', 'Detected: "Spent 5000 on feed"\n\nAdd this?', [
      { text: 'Cancel', style: 'cancel' },
      { text: 'Add', onPress: () => { setAddType('expense'); setAmount('5000'); setCategory('Feed'); setShowAdd(true); } },
    ]);
  };

  const save = () => {
    if (!amount || !category) return;
    setTxs([{ id: Date.now().toString(), type: addType, amount: parseFloat(amount), category, note, time: 'Just now' }, ...txs]);
    setShowAdd(false); setAmount(''); setCategory(''); setNote('');
  };

  const totalIn = txs.filter(t => t.type === 'income').reduce((s, t) => s + t.amount, 0);
  const totalOut = txs.filter(t => t.type === 'expense').reduce((s, t) => s + t.amount, 0);

  return (
    <SafeAreaView style={s.safe} edges={['top']}>
      <View style={s.nav}>
        <TouchableOpacity onPress={() => router.back()} style={s.backBtn}><Text style={s.backText}>←</Text></TouchableOpacity>
        <Text style={s.navTitle}>AquaVoice</Text>
        <View style={{ width: 40 }} />
      </View>

      <ScrollView contentContainerStyle={s.scroll} showsVerticalScrollIndicator={false}>
        <View style={s.summaryRow}>
          <View style={[s.sumCard, { borderLeftColor: theme.colors.success }]}>
            <Text style={s.sumLabel}>Income</Text>
            <Text style={[s.sumAmt, { color: theme.colors.success }]}>₹{totalIn.toLocaleString()}</Text>
          </View>
          <View style={[s.sumCard, { borderLeftColor: theme.colors.danger }]}>
            <Text style={s.sumLabel}>Expense</Text>
            <Text style={[s.sumAmt, { color: theme.colors.danger }]}>₹{totalOut.toLocaleString()}</Text>
          </View>
        </View>

        <TouchableOpacity style={[s.recBtn, recording && s.recBtnActive]} onPress={recording ? stopRec : startRec}>
          <Text style={s.recIcon}>{recording ? '⏹️' : '🎙️'}</Text>
          <Text style={[s.recLabel, recording && { color: '#9B59B6', fontWeight: '700' }]}>{recording ? 'Stop Recording' : 'Tap to Record'}</Text>
        </TouchableOpacity>

        <View style={s.quickRow}>
          <TouchableOpacity style={[s.quickBtn, { backgroundColor: '#DC354518' }]} onPress={() => { setAddType('expense'); setShowAdd(true); }}>
            <Text style={s.quickIcon}>💸</Text><Text style={s.quickLabel}>Expense</Text>
          </TouchableOpacity>
          <TouchableOpacity style={[s.quickBtn, { backgroundColor: '#28A74518' }]} onPress={() => { setAddType('income'); setShowAdd(true); }}>
            <Text style={s.quickIcon}>💰</Text><Text style={s.quickLabel}>Income</Text>
          </TouchableOpacity>
        </View>

        {showAdd && (
          <View style={s.form}>
            <Text style={s.formTitle}>{addType === 'expense' ? 'Add Expense' : 'Add Income'}</Text>
            <TextInput style={s.input} placeholder="Amount (₹)" placeholderTextColor={theme.colors.textLight} keyboardType="numeric" value={amount} onChangeText={setAmount} />
            <ScrollView horizontal showsHorizontalScrollIndicator={false} style={{ marginBottom: 10 }}>
              {CATS[addType].map(c => (
                <TouchableOpacity key={c} style={[s.chip, category === c && s.chipActive]} onPress={() => setCategory(c)}>
                  <Text style={[s.chipText, category === c && s.chipTextActive]}>{c}</Text>
                </TouchableOpacity>
              ))}
            </ScrollView>
            <TextInput style={s.input} placeholder="Note (optional)" placeholderTextColor={theme.colors.textLight} value={note} onChangeText={setNote} />
            <View style={s.formActions}>
              <TouchableOpacity style={s.cancelBtn} onPress={() => setShowAdd(false)}><Text style={s.cancelText}>Cancel</Text></TouchableOpacity>
              <TouchableOpacity style={[s.saveBtn, (!amount || !category) && { opacity: 0.5 }]} onPress={save} disabled={!amount || !category}>
                <Text style={s.saveText}>Save</Text>
              </TouchableOpacity>
            </View>
          </View>
        )}

        <Text style={s.sectionTitle}>Recent Transactions</Text>
        {txs.map(tx => (
          <View key={tx.id} style={s.txCard}>
            <View style={[s.txDot, { backgroundColor: tx.type === 'income' ? theme.colors.success : theme.colors.danger }]} />
            <View style={{ flex: 1 }}>
              <Text style={s.txCategory}>{tx.category}</Text>
              <Text style={s.txNote}>{tx.note} • {tx.time}</Text>
            </View>
            <Text style={[s.txAmount, { color: tx.type === 'income' ? theme.colors.success : theme.colors.danger }]}>
              {tx.type === 'income' ? '+' : '-'}₹{tx.amount.toLocaleString()}
            </Text>
          </View>
        ))}
      </ScrollView>
    </SafeAreaView>
  );
}

const s = StyleSheet.create({
  safe: { flex: 1, backgroundColor: theme.colors.background },
  nav: { backgroundColor: '#9B59B6', flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingTop: 20, paddingBottom: 14, paddingHorizontal: 12 },
  backBtn: { width: 40, height: 40, justifyContent: 'center', alignItems: 'center' },
  backText: { color: '#FFF', fontSize: 24, fontWeight: '600' },
  navTitle: { color: '#FFF', fontSize: 18, fontWeight: '700' },
  scroll: { padding: theme.spacing.lg, paddingBottom: 30 },
  summaryRow: { flexDirection: 'row', gap: 10, marginBottom: 16 },
  sumCard: { flex: 1, backgroundColor: theme.colors.card, borderRadius: theme.borderRadius.md, padding: 14, borderLeftWidth: 3, borderWidth: 1, borderColor: theme.colors.border },
  sumLabel: { fontSize: 12, color: theme.colors.textLight },
  sumAmt: { fontSize: 18, fontWeight: '700', marginTop: 4 },
  recBtn: { backgroundColor: theme.colors.card, borderRadius: theme.borderRadius.lg, padding: 20, alignItems: 'center', borderWidth: 2, borderColor: theme.colors.border, borderStyle: 'dashed', marginBottom: 16 },
  recBtnActive: { backgroundColor: '#9B59B615', borderColor: '#9B59B6' },
  recIcon: { fontSize: 36 },
  recLabel: { fontSize: 13, color: theme.colors.textLight, marginTop: 8 },
  quickRow: { flexDirection: 'row', gap: 10, marginBottom: 16 },
  quickBtn: { flex: 1, borderRadius: theme.borderRadius.md, padding: 14, alignItems: 'center', flexDirection: 'row', justifyContent: 'center', gap: 8 },
  quickIcon: { fontSize: 20 },
  quickLabel: { fontSize: 13, fontWeight: '600', color: theme.colors.text },
  form: { backgroundColor: theme.colors.card, borderRadius: theme.borderRadius.lg, padding: 16, marginBottom: 16, borderWidth: 1, borderColor: theme.colors.border },
  formTitle: { fontSize: 14, fontWeight: '700', color: theme.colors.text, marginBottom: 12 },
  input: { backgroundColor: theme.colors.background, borderRadius: 8, borderWidth: 1, borderColor: theme.colors.border, padding: 12, fontSize: 14, color: theme.colors.text, marginBottom: 10 },
  chip: { paddingHorizontal: 14, paddingVertical: 8, borderRadius: 20, backgroundColor: theme.colors.background, marginRight: 8, borderWidth: 1, borderColor: theme.colors.border },
  chipActive: { backgroundColor: '#9B59B6', borderColor: '#9B59B6' },
  chipText: { fontSize: 12, color: theme.colors.text },
  chipTextActive: { color: '#FFF', fontWeight: '600' },
  formActions: { flexDirection: 'row', gap: 10 },
  cancelBtn: { flex: 1, paddingVertical: 10, borderRadius: 8, alignItems: 'center', backgroundColor: theme.colors.background },
  cancelText: { fontSize: 13, color: theme.colors.textLight },
  saveBtn: { flex: 1, paddingVertical: 10, borderRadius: 8, alignItems: 'center', backgroundColor: '#9B59B6' },
  saveText: { fontSize: 13, color: '#FFF', fontWeight: '600' },
  sectionTitle: { fontSize: 14, fontWeight: '700', color: theme.colors.text, marginBottom: 10 },
  txCard: { flexDirection: 'row', alignItems: 'center', backgroundColor: theme.colors.card, borderRadius: theme.borderRadius.md, padding: 14, marginBottom: 8, borderWidth: 1, borderColor: theme.colors.border },
  txDot: { width: 4, height: 36, borderRadius: 2, marginRight: 12 },
  txCategory: { fontSize: 13, fontWeight: '600', color: theme.colors.text },
  txNote: { fontSize: 11, color: theme.colors.textLight, marginTop: 2 },
  txAmount: { fontSize: 14, fontWeight: '700' },
});
