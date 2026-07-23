import { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, TextInput } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { theme } from '../utils/theme';
import { MODULE_COLOR_MAP } from '../utils/moduleConfig';

const MODULE_COLOR = MODULE_COLOR_MAP.aquafeed;
const DEFAULT_FEED_PRICE = '65';

export default function AquaFeedScreen() {
  const router = useRouter();
  const [pondSize, setPondSize] = useState('');
  const [depth, setDepth] = useState('');
  const [stockCount, setStockCount] = useState('');
  const [avgWeight, setAvgWeight] = useState('');
  const [feedPrice, setFeedPrice] = useState(DEFAULT_FEED_PRICE);
  const [result, setResult] = useState<{
    daily: number;
    dailyCost: number;
    monthly: number;
    schedule: { time: string; pct: number }[];
  } | null>(null);

  const calc = () => {
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
        { time: '7:00 AM', pct: 35 }, { time: '12:00 PM', pct: 30 },
        { time: '5:00 PM', pct: 25 }, { time: '9:00 PM', pct: 10 },
      ],
    });
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
          <TouchableOpacity style={[s.calcBtn, (!pondSize || !stockCount || !avgWeight) && { opacity: 0.5 }]} onPress={calc} disabled={!pondSize || !stockCount || !avgWeight}>
            <Text style={s.calcBtnText}>Calculate</Text>
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
                { label: 'Target FCR', value: '1.4', color: theme.colors.success },
              ].map((r, i) => (
                <View key={i} style={s.resultCard}>
                  <Text style={s.resultLabel}>{r.label}</Text>
                  <Text style={[s.resultValue, { color: r.color }]}>{r.value}</Text>
                </View>
              ))}
            </View>

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
  scheduleRow: { flexDirection: 'row', alignItems: 'center', marginBottom: theme.spacing.sm, backgroundColor: theme.colors.card, borderRadius: theme.borderRadius.md, padding: theme.spacing.sm + 4, borderWidth: 1, borderColor: theme.colors.border },
  scheduleTime: { fontSize: theme.fontSize.xs, fontWeight: '600', color: theme.colors.text, width: 70 },
  bar: { flex: 1, height: 6, backgroundColor: theme.colors.background, borderRadius: 3, marginHorizontal: theme.spacing.sm + 2, overflow: 'hidden' },
  barFill: { height: '100%', backgroundColor: MODULE_COLOR, borderRadius: 3 },
  scheduleKg: { fontSize: theme.fontSize.xs, fontWeight: '600', color: MODULE_COLOR, width: 50, textAlign: 'right' },
});
