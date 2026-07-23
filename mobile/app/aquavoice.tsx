import { useState, useRef } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, TextInput, Alert } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { Audio } from 'expo-av';
import { theme } from '../utils/theme';
import { MODULE_COLOR_MAP } from '../utils/moduleConfig';
import { MOCK_VOICE_TXS, EXPENSE_CATEGORIES, INCOME_CATEGORIES } from '../utils/mockData';

const MODULE_COLOR = MODULE_COLOR_MAP.aquavoice;
const CATS = { expense: EXPENSE_CATEGORIES, income: INCOME_CATEGORIES };

interface Tx { id: string; type: 'income' | 'expense'; amount: number; category: string; note: string; time: string }

export default function AquaVoiceScreen() {
  const router = useRouter();
  const [recording, setRecording] = useState(false);
  const [showAdd, setShowAdd] = useState(false);
  const [addType, setAddType] = useState<'income' | 'expense'>('expense');
  const [amount, setAmount] = useState('');
  const [category, setCategory] = useState('');
  const [note, setNote] = useState('');
  const [txs, setTxs] = useState<Tx[]>(MOCK_VOICE_TXS.map(t => ({ ...t, note: t.description, time: t.date })));
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
        <View style={{ width: theme.layout.backButtonSize }} />
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

        <TouchableOpacity style={[s.recBtn, recording && { backgroundColor: MODULE_COLOR + '15', borderColor: MODULE_COLOR }]} onPress={recording ? stopRec : startRec}>
          <Text style={s.recIcon}>{recording ? '⏹️' : '🎙️'}</Text>
          <Text style={[s.recLabel, recording && { color: MODULE_COLOR, fontWeight: '700' }]}>{recording ? 'Stop Recording' : 'Tap to Record'}</Text>
        </TouchableOpacity>

        <View style={s.quickRow}>
          <TouchableOpacity style={[s.quickBtn, { backgroundColor: theme.colors.danger + '18' }]} onPress={() => { setAddType('expense'); setShowAdd(true); }}>
            <Text style={s.quickIcon}>💸</Text><Text style={s.quickLabel}>Expense</Text>
          </TouchableOpacity>
          <TouchableOpacity style={[s.quickBtn, { backgroundColor: theme.colors.success + '18' }]} onPress={() => { setAddType('income'); setShowAdd(true); }}>
            <Text style={s.quickIcon}>💰</Text><Text style={s.quickLabel}>Income</Text>
          </TouchableOpacity>
        </View>

        {showAdd && (
          <View style={s.form}>
            <Text style={s.formTitle}>{addType === 'expense' ? 'Add Expense' : 'Add Income'}</Text>
            <TextInput style={s.input} placeholder="Amount (₹)" placeholderTextColor={theme.colors.textLight} keyboardType="numeric" value={amount} onChangeText={setAmount} />
            <ScrollView horizontal showsHorizontalScrollIndicator={false} style={{ marginBottom: theme.spacing.sm + 2 }}>
              {CATS[addType].map(c => (
                <TouchableOpacity key={c} style={[s.chip, category === c && { backgroundColor: MODULE_COLOR, borderColor: MODULE_COLOR }]} onPress={() => setCategory(c)}>
                  <Text style={[s.chipText, category === c && { color: theme.colors.white, fontWeight: '600' }]}>{c}</Text>
                </TouchableOpacity>
              ))}
            </ScrollView>
            <TextInput style={s.input} placeholder="Note (optional)" placeholderTextColor={theme.colors.textLight} value={note} onChangeText={setNote} />
            <View style={s.formActions}>
              <TouchableOpacity style={s.cancelBtn} onPress={() => setShowAdd(false)}><Text style={s.cancelText}>Cancel</Text></TouchableOpacity>
              <TouchableOpacity style={[s.saveBtn, { backgroundColor: MODULE_COLOR }, (!amount || !category) && { opacity: 0.5 }]} onPress={save} disabled={!amount || !category}>
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
  nav: { backgroundColor: MODULE_COLOR, flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingTop: theme.spacing.sm + 12, paddingBottom: theme.spacing.sm + 6, paddingHorizontal: theme.spacing.sm + 4 },
  backBtn: { width: theme.layout.backButtonSize, height: theme.layout.backButtonSize, justifyContent: 'center', alignItems: 'center' },
  backText: { color: theme.colors.white, fontSize: theme.fontSize.xxl, fontWeight: '600' },
  navTitle: { color: theme.colors.white, fontSize: theme.fontSize.lg, fontWeight: '700' },
  scroll: { padding: theme.spacing.lg, paddingBottom: 30 },
  summaryRow: { flexDirection: 'row', gap: theme.spacing.sm + 2, marginBottom: theme.spacing.md },
  sumCard: { flex: 1, backgroundColor: theme.colors.card, borderRadius: theme.borderRadius.md, padding: theme.spacing.sm + 6, borderLeftWidth: 3, borderWidth: 1, borderColor: theme.colors.border },
  sumLabel: { fontSize: theme.fontSize.xs, color: theme.colors.textLight },
  sumAmt: { fontSize: theme.fontSize.lg + 2, fontWeight: '700', marginTop: 4 },
  recBtn: { backgroundColor: theme.colors.card, borderRadius: theme.borderRadius.lg, padding: theme.spacing.xl, alignItems: 'center', borderWidth: 2, borderColor: theme.colors.border, borderStyle: 'dashed', marginBottom: theme.spacing.md },
  recIcon: { fontSize: 36 },
  recLabel: { fontSize: 13, color: theme.colors.textLight, marginTop: theme.spacing.sm },
  quickRow: { flexDirection: 'row', gap: theme.spacing.sm + 2, marginBottom: theme.spacing.md },
  quickBtn: { flex: 1, borderRadius: theme.borderRadius.md, padding: theme.spacing.sm + 6, alignItems: 'center', flexDirection: 'row', justifyContent: 'center', gap: 8 },
  quickIcon: { fontSize: 20 },
  quickLabel: { fontSize: 13, fontWeight: '600', color: theme.colors.text },
  form: { backgroundColor: theme.colors.card, borderRadius: theme.borderRadius.lg, padding: theme.spacing.md, marginBottom: theme.spacing.md, borderWidth: 1, borderColor: theme.colors.border },
  formTitle: { fontSize: theme.fontSize.sm, fontWeight: '700', color: theme.colors.text, marginBottom: theme.spacing.sm + 4 },
  input: { backgroundColor: theme.colors.background, borderRadius: theme.borderRadius.sm, borderWidth: 1, borderColor: theme.colors.border, padding: theme.spacing.sm + 4, fontSize: theme.fontSize.sm, color: theme.colors.text, marginBottom: theme.spacing.sm + 2 },
  chip: { paddingHorizontal: 14, paddingVertical: theme.spacing.sm, borderRadius: 20, backgroundColor: theme.colors.background, marginRight: theme.spacing.sm, borderWidth: 1, borderColor: theme.colors.border },
  chipText: { fontSize: theme.fontSize.xs, color: theme.colors.text },
  formActions: { flexDirection: 'row', gap: theme.spacing.sm + 2 },
  cancelBtn: { flex: 1, paddingVertical: theme.spacing.sm + 2, borderRadius: theme.borderRadius.sm, alignItems: 'center', backgroundColor: theme.colors.background },
  cancelText: { fontSize: 13, color: theme.colors.textLight },
  saveBtn: { flex: 1, paddingVertical: theme.spacing.sm + 2, borderRadius: theme.borderRadius.sm, alignItems: 'center' },
  saveText: { fontSize: 13, color: theme.colors.white, fontWeight: '600' },
  sectionTitle: { fontSize: theme.fontSize.sm, fontWeight: '700', color: theme.colors.text, marginBottom: theme.spacing.sm + 2 },
  txCard: { flexDirection: 'row', alignItems: 'center', backgroundColor: theme.colors.card, borderRadius: theme.borderRadius.md, padding: theme.spacing.sm + 6, marginBottom: theme.spacing.sm, borderWidth: 1, borderColor: theme.colors.border },
  txDot: { width: 4, height: 36, borderRadius: 2, marginRight: theme.spacing.sm + 4 },
  txCategory: { fontSize: 13, fontWeight: '600', color: theme.colors.text },
  txNote: { fontSize: 11, color: theme.colors.textLight, marginTop: 2 },
  txAmount: { fontSize: theme.fontSize.sm, fontWeight: '700' },
});
