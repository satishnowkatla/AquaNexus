import { useState, useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, TextInput, Alert } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { theme } from '../utils/theme';
import { MODULE_COLOR_MAP } from '../utils/moduleConfig';
import { supabase } from '../utils/supabase';

const MODULE_COLOR = MODULE_COLOR_MAP.aquafeed;

interface FeedResult {
  daily: number;
  dailyCost: number;
  monthly: number;
  schedule: { time: string; pct: number }[];
  feedType?: string;
  feedGrade?: string;
  notes?: string;
}

interface SavedSchedule {
  id: string;
  feed_type: string;
  total_daily_kg: number;
  cumulative_cost: number;
  feed_grade: string;
  morning_kg: number;
  evening_kg: number;
  created_at: string;
}

export default function AquaFeedScreen() {
  const router = useRouter();
  const [pondSize, setPondSize] = useState('');
  const [depth, setDepth] = useState('');
  const [stockCount, setStockCount] = useState('');
  const [avgWeight, setAvgWeight] = useState('');
  const [feedPrice, setFeedPrice] = useState('65');
  const [saving, setSaving] = useState(false);
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<FeedResult | null>(null);
  const [saved, setSaved] = useState<SavedSchedule[]>([]);

  useEffect(() => { loadSaved(); }, []);

  const loadSaved = async () => {
    const { data } = await supabase
      .from('feed_schedules')
      .select('*')
      .order('created_at', { ascending: false })
      .limit(5);
    if (data) setSaved(data);
  };

  const calc = () => {
    setLoading(true);
    const stock = parseInt(stockCount) || 0;
    const weight = parseFloat(avgWeight) || 0;
    const price = parseFloat(feedPrice) || 65;
    const biomass = (stock * weight) / 1000;
    const daily = (biomass * 0.04) / 1.4;
    setResult({
      daily: +daily.toFixed(1),
      dailyCost: +(daily * price).toFixed(0),
      monthly: +(daily * price * 30).toFixed(0),
      schedule: [
        { time: '7:00 AM', pct: 35 },
        { time: '12:00 PM', pct: 30 },
        { time: '5:00 PM', pct: 25 },
        { time: '9:00 PM', pct: 10 },
      ],
      feedType: 'Sinking Pellets',
      feedGrade: '32% Protein',
      notes: 'Feed 3-4% of body weight daily. Adjust based on water temperature.',
    });
    setLoading(false);
  };

  const saveSchedule = async () => {
    if (!result) return;
    setSaving(true);
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) { Alert.alert('Error', 'Not logged in'); return; }

      const { error } = await supabase.from('feed_schedules').insert({
        feed_type: result.feedType || 'Sinking Pellets',
        morning_kg: +(result.daily * 0.35).toFixed(2),
        evening_kg: +(result.daily * 0.65).toFixed(2),
        total_daily_kg: result.daily,
        feed_grade: result.feedGrade || '32% Protein',
        cumulative_cost: result.dailyCost,
        start_date: new Date().toISOString().split('T')[0],
      });
      if (error) throw error;
      Alert.alert('Saved', 'Feed schedule saved successfully!');
      loadSaved();
    } catch (e: any) {
      Alert.alert('Error', e.message || 'Failed to save');
    } finally {
      setSaving(false);
    }
  };

  const reset = () => { setResult(null); setPondSize(''); setDepth(''); setStockCount(''); setAvgWeight(''); };

  return (
    <SafeAreaView style={s.safe} edges={['top']}>
      <View style={s.nav}>
        <TouchableOpacity onPress={() => router.back()} style={s.backBtn}><Text style={s.backText}>←</Text></TouchableOpacity>
        <Text style={s.navTitle}>AquaFeed</Text>
        <View style={{ width: theme.layout.backButtonSize }} />
      </View>

      <ScrollView contentContainerStyle={s.scroll} showsVerticalScrollIndicator={false}>
        <Text style={s.sectionTitle}>Pond Details</Text>

        <Text style={s.label}>Pond Size (acres) *</Text>
        <TextInput style={s.input} placeholder="e.g. 1" placeholderTextColor={theme.colors.textLight} keyboardType="numeric" value={pondSize} onChangeText={setPondSize} />

        <Text style={s.label}>Depth (meters)</Text>
        <TextInput style={s.input} placeholder="e.g. 1.2" placeholderTextColor={theme.colors.textLight} keyboardType="numeric" value={depth} onChangeText={setDepth} />

        <Text style={s.label}>Total Stock Count *</Text>
        <TextInput style={s.input} placeholder="e.g. 50000" placeholderTextColor={theme.colors.textLight} keyboardType="numeric" value={stockCount} onChangeText={setStockCount} />

        <Text style={s.label}>Average Weight (grams) *</Text>
        <TextInput style={s.input} placeholder="e.g. 25" placeholderTextColor={theme.colors.textLight} keyboardType="numeric" value={avgWeight} onChangeText={setAvgWeight} />

        <Text style={s.label}>Feed Price (₹/kg)</Text>
        <TextInput style={s.input} placeholder="e.g. 65" placeholderTextColor={theme.colors.textLight} keyboardType="numeric" value={feedPrice} onChangeText={setFeedPrice} />

        <View style={s.btnRow}>
          <TouchableOpacity style={[s.calcBtn, (!pondSize || !stockCount || !avgWeight || loading) && { opacity: 0.5 }]} onPress={calc} disabled={!pondSize || !stockCount || !avgWeight || loading}>
            <Text style={s.calcBtnText}>{loading ? 'Calculating...' : 'Calculate'}</Text>
          </TouchableOpacity>
          <TouchableOpacity style={s.resetBtn} onPress={reset}>
            <Text style={s.resetText}>Reset</Text>
          </TouchableOpacity>
        </View>

        {result && (
          <>
            <Text style={[s.sectionTitle, { marginTop: theme.spacing.xl }]}>Results</Text>
            <View style={s.resultGrid}>
              {[
                { label: 'Daily Feed', value: `${result.daily} kg`, color: theme.colors.primary },
                { label: 'Daily Cost', value: `₹${result.dailyCost}`, color: theme.colors.danger },
                { label: 'Monthly Cost', value: `₹${result.monthly.toLocaleString()}`, color: theme.colors.danger },
                { label: 'Feed Type', value: result.feedGrade || '32%', color: theme.colors.success },
              ].map((r, i) => (
                <View key={i} style={s.resultCard}>
                  <Text style={s.resultLabel}>{r.label}</Text>
                  <Text style={[s.resultValue, { color: r.color }]}>{r.value}</Text>
                </View>
              ))}
            </View>

            {result.notes && (
              <View style={s.notesCard}>
                <Text style={s.notesLabel}>💡 Tips</Text>
                <Text style={s.notesText}>{result.notes}</Text>
              </View>
            )}

            <Text style={[s.sectionTitle, { marginTop: theme.spacing.xl }]}>Feeding Schedule</Text>
            {result.schedule.map((sch, i) => (
              <View key={i} style={s.scheduleRow}>
                <Text style={s.scheduleTime}>{sch.time}</Text>
                <View style={s.bar}>
                  <View style={[s.barFill, { width: `${sch.pct}%` }]} />
                </View>
                <Text style={s.scheduleKg}>{+(result.daily * sch.pct / 100).toFixed(1)}kg</Text>
              </View>
            ))}

            <TouchableOpacity style={[s.saveBtn, saving && { opacity: 0.5 }]} onPress={saveSchedule} disabled={saving}>
              <Text style={s.saveBtnText}>{saving ? 'Saving...' : '💾 Save Schedule'}</Text>
            </TouchableOpacity>
          </>
        )}

        {saved.length > 0 && (
          <>
            <Text style={[s.sectionTitle, { marginTop: theme.spacing.xl }]}>Recent Schedules</Text>
            {saved.map(sch => (
              <View key={sch.id} style={s.historyCard}>
                <Text style={s.histFeed}>{sch.feed_type}</Text>
                <Text style={s.histDetail}>{sch.total_daily_kg} kg/day • ₹{sch.cumulative_cost}/day</Text>
                <Text style={s.histDate}>{new Date(sch.created_at).toLocaleDateString()}</Text>
              </View>
            ))}
          </>
        )}
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
  sectionTitle: { fontSize: theme.fontSize.sm + 2, fontWeight: '700', color: theme.colors.text, marginBottom: theme.spacing.sm + 4 },
  label: { fontSize: theme.fontSize.xs, color: theme.colors.textLight, marginBottom: 4, marginTop: theme.spacing.sm + 2 },
  input: { backgroundColor: theme.colors.card, borderRadius: theme.borderRadius.sm, borderWidth: 1, borderColor: theme.colors.border, padding: theme.spacing.sm + 4, fontSize: theme.fontSize.sm, color: theme.colors.text },
  btnRow: { flexDirection: 'row', gap: theme.spacing.sm + 2, marginTop: theme.spacing.xl },
  calcBtn: { flex: 3, backgroundColor: MODULE_COLOR, paddingVertical: theme.spacing.sm + 4, borderRadius: theme.borderRadius.md, alignItems: 'center' },
  calcBtnText: { color: theme.colors.white, fontSize: theme.fontSize.sm, fontWeight: '600' },
  resetBtn: { flex: 1, backgroundColor: theme.colors.card, paddingVertical: theme.spacing.sm + 4, borderRadius: theme.borderRadius.md, alignItems: 'center', borderWidth: 1, borderColor: theme.colors.border },
  resetText: { color: theme.colors.textLight, fontSize: theme.fontSize.sm },
  resultGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: theme.spacing.sm + 2 },
  resultCard: { width: '48%', backgroundColor: theme.colors.card, borderRadius: theme.borderRadius.md, padding: theme.spacing.sm + 6, borderWidth: 1, borderColor: theme.colors.border },
  resultLabel: { fontSize: 11, color: theme.colors.textLight },
  resultValue: { fontSize: theme.fontSize.xl, fontWeight: '700', marginTop: 4 },
  notesCard: { backgroundColor: theme.colors.primary + '10', borderRadius: theme.borderRadius.md, padding: theme.spacing.md, marginTop: theme.spacing.md, borderWidth: 1, borderColor: theme.colors.primary + '30' },
  notesLabel: { fontSize: 13, fontWeight: '700', color: theme.colors.primary, marginBottom: 4 },
  notesText: { fontSize: 12, color: theme.colors.textLight, lineHeight: 18 },
  scheduleRow: { flexDirection: 'row', alignItems: 'center', marginBottom: theme.spacing.sm, backgroundColor: theme.colors.card, borderRadius: theme.borderRadius.md, padding: theme.spacing.sm + 4, borderWidth: 1, borderColor: theme.colors.border },
  scheduleTime: { fontSize: theme.fontSize.xs, fontWeight: '600', color: theme.colors.text, width: 70 },
  bar: { flex: 1, height: 6, backgroundColor: theme.colors.background, borderRadius: 3, marginHorizontal: theme.spacing.sm + 2, overflow: 'hidden' },
  barFill: { height: '100%', backgroundColor: MODULE_COLOR, borderRadius: 3 },
  scheduleKg: { fontSize: theme.fontSize.xs, fontWeight: '600', color: MODULE_COLOR, width: 50, textAlign: 'right' },
  saveBtn: { backgroundColor: MODULE_COLOR, paddingVertical: theme.spacing.sm + 4, borderRadius: theme.borderRadius.md, alignItems: 'center', marginTop: theme.spacing.xl },
  saveBtnText: { color: theme.colors.white, fontSize: theme.fontSize.sm, fontWeight: '600' },
  historyCard: { backgroundColor: theme.colors.card, borderRadius: theme.borderRadius.md, padding: theme.spacing.sm + 6, marginBottom: theme.spacing.sm, borderWidth: 1, borderColor: theme.colors.border },
  histFeed: { fontSize: 13, fontWeight: '600', color: theme.colors.text },
  histDetail: { fontSize: 11, color: theme.colors.textLight, marginTop: 4 },
  histDate: { fontSize: 11, color: theme.colors.textLight, marginTop: 2 },
});
