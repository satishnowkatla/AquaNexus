import { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, TextInput, Platform } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { theme } from '../utils/theme';

export default function AquaFeedScreen() {
  const router = useRouter();
  const [pondSize, setPondSize] = useState('');
  const [depth, setDepth] = useState('');
  const [stockCount, setStockCount] = useState('');
  const [avgWeight, setAvgWeight] = useState('');
  const [feedPrice, setFeedPrice] = useState('65');
  const [result, setResult] = useState<any>(null);

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
        <View style={{ width: 40 }} />
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
            <Text style={[s.sectionTitle, { marginTop: 24 }]}>Results</Text>
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

            <Text style={[s.sectionTitle, { marginTop: 20 }]}>Feeding Schedule</Text>
            {result.schedule.map((sch: any, i: number) => (
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
  nav: { backgroundColor: '#F39C12', flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingTop: 20, paddingBottom: 14, paddingHorizontal: 12 },
  backBtn: { width: 40, height: 40, justifyContent: 'center', alignItems: 'center' },
  backText: { color: '#FFF', fontSize: 24, fontWeight: '600' },
  navTitle: { color: '#FFF', fontSize: 18, fontWeight: '700' },
  scroll: { padding: theme.spacing.lg, paddingBottom: 30 },
  sectionTitle: { fontSize: 14, fontWeight: '700', color: theme.colors.text, marginBottom: 12 },
  label: { fontSize: 12, color: theme.colors.textLight, marginBottom: 4, marginTop: 10 },
  input: { backgroundColor: theme.colors.card, borderRadius: 8, borderWidth: 1, borderColor: theme.colors.border, padding: 12, fontSize: 14, color: theme.colors.text },
  btnRow: { flexDirection: 'row', gap: 10, marginTop: 20 },
  calcBtn: { flex: 3, backgroundColor: '#F39C12', paddingVertical: 12, borderRadius: 10, alignItems: 'center' },
  calcBtnText: { color: '#FFF', fontSize: 14, fontWeight: '600' },
  resetBtn: { flex: 1, backgroundColor: theme.colors.card, paddingVertical: 12, borderRadius: 10, alignItems: 'center', borderWidth: 1, borderColor: theme.colors.border },
  resetText: { color: theme.colors.textLight, fontSize: 14 },
  resultGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 10 },
  resultCard: { width: '48%', backgroundColor: theme.colors.card, borderRadius: 10, padding: 14, borderWidth: 1, borderColor: theme.colors.border },
  resultLabel: { fontSize: 11, color: theme.colors.textLight },
  resultValue: { fontSize: 20, fontWeight: '700', marginTop: 4 },
  scheduleRow: { flexDirection: 'row', alignItems: 'center', marginBottom: 8, backgroundColor: theme.colors.card, borderRadius: 10, padding: 12, borderWidth: 1, borderColor: theme.colors.border },
  scheduleTime: { fontSize: 12, fontWeight: '600', color: theme.colors.text, width: 70 },
  bar: { flex: 1, height: 6, backgroundColor: theme.colors.background, borderRadius: 3, marginHorizontal: 10, overflow: 'hidden' },
  barFill: { height: '100%', backgroundColor: '#F39C12', borderRadius: 3 },
  scheduleKg: { fontSize: 12, fontWeight: '600', color: '#F39C12', width: 50, textAlign: 'right' },
});
