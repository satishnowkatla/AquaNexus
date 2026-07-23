import { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Image, Alert, Platform } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import * as ImagePicker from 'expo-image-picker';
import { theme } from '../utils/theme';

const MOCK_DIAGNOSIS = [
  {
    name: 'White Spot Disease',
    severity: 'High',
    confidence: 92,
    symptoms: ['White spots on body', 'Loss of appetite', 'Rubbing against objects'],
    treatment: 'Increase water temperature to 30°C, add salt (3g/L), use formalin bath',
  },
  {
    name: 'Tail Rot',
    severity: 'Medium',
    confidence: 87,
    symptoms: ['Decaying tail fin', 'Discoloration', 'Lethargy'],
    treatment: 'Remove affected fish, improve water quality, apply antibiotics',
  },
];

export default function AquaDocScreen() {
  const router = useRouter();
  const [image, setImage] = useState<string | null>(null);
  const [diagnosing, setDiagnosing] = useState(false);
  const [result, setResult] = useState<typeof MOCK_DIAGNOSIS[0] | null>(null);

  const pickImage = async () => {
    const permission = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (!permission.granted) { Alert.alert('Permission needed', 'Please grant gallery access'); return; }
    const res = await ImagePicker.launchImageLibraryAsync({ mediaTypes: ['images'], quality: 0.8 });
    if (!res.canceled) { setImage(res.assets[0].uri); setResult(null); }
  };

  const takePhoto = async () => {
    const permission = await ImagePicker.requestCameraPermissionsAsync();
    if (!permission.granted) { Alert.alert('Permission needed', 'Please grant camera access'); return; }
    const res = await ImagePicker.launchCameraAsync({ quality: 0.8 });
    if (!res.canceled) { setImage(res.assets[0].uri); setResult(null); }
  };

  const diagnose = () => {
    setDiagnosing(true);
    setTimeout(() => {
      setResult(MOCK_DIAGNOSIS[Math.floor(Math.random() * MOCK_DIAGNOSIS.length)]);
      setDiagnosing(false);
    }, 2000);
  };

  const sevColor = (s: string) => s === 'High' ? theme.colors.danger : s === 'Medium' ? theme.colors.warning : theme.colors.success;

  return (
    <SafeAreaView style={s.safe} edges={['top']}>
      <View style={s.nav}>
        <TouchableOpacity onPress={() => router.back()} style={s.backBtn}><Text style={s.backText}>←</Text></TouchableOpacity>
        <Text style={s.navTitle}>AquaDoc</Text>
        <View style={{ width: 40 }} />
      </View>

      <ScrollView contentContainerStyle={s.scroll} showsVerticalScrollIndicator={false}>
        <Text style={s.sectionTitle}>Capture Fish Photo</Text>
        <Text style={s.sectionDesc}>Take or upload a photo to diagnose fish diseases</Text>

        <View style={s.btnRow}>
          <TouchableOpacity style={s.captureBtn} onPress={takePhoto}>
            <Text style={s.captureIcon}>📷</Text>
            <Text style={s.captureLabel}>Camera</Text>
          </TouchableOpacity>
          <TouchableOpacity style={s.captureBtn} onPress={pickImage}>
            <Text style={s.captureIcon}>🖼️</Text>
            <Text style={s.captureLabel}>Gallery</Text>
          </TouchableOpacity>
        </View>

        {image && (
          <View style={s.preview}>
            <Image source={{ uri: image }} style={s.img} />
            <TouchableOpacity style={s.diagBtn} onPress={diagnose} disabled={diagnosing}>
              <Text style={s.diagBtnText}>{diagnosing ? 'Analyzing...' : '🔍 Diagnose Now'}</Text>
            </TouchableOpacity>
          </View>
        )}

        {diagnosing && <View style={s.loading}><Text style={s.loadingText}>🔬 Analyzing with AI...</Text></View>}

        {result && (
          <View style={s.result}>
            <View style={s.resultRow}>
              <Text style={s.resultName}>{result.name}</Text>
              <View style={[s.badge, { backgroundColor: sevColor(result.severity) }]}>
                <Text style={s.badgeText}>{result.severity}</Text>
              </View>
            </View>
            <Text style={s.conf}>Confidence: {result.confidence}%</Text>
            <Text style={s.label}>Symptoms</Text>
            {result.symptoms.map((sym, i) => <Text key={i} style={s.bullet}>• {sym}</Text>)}
            <Text style={s.label}>Treatment</Text>
            <Text style={s.treatment}>{result.treatment}</Text>
          </View>
        )}

        <Text style={[s.sectionTitle, { marginTop: 20 }]}>Recent Diagnoses</Text>
        <View style={s.historyItem}>
          <Text style={s.histName}>Epidemic Ulcerative Disease</Text>
          <Text style={s.histDate}>Today</Text>
        </View>
        <View style={s.historyItem}>
          <Text style={s.histName}>White Spot Disease</Text>
          <Text style={s.histDate}>Yesterday</Text>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const s = StyleSheet.create({
  safe: { flex: 1, backgroundColor: theme.colors.background },
  nav: { backgroundColor: '#E74C3C', flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingTop: 20, paddingBottom: 14, paddingHorizontal: 12 },
  backBtn: { width: 40, height: 40, justifyContent: 'center', alignItems: 'center' },
  backText: { color: '#FFF', fontSize: 24, fontWeight: '600' },
  navTitle: { color: '#FFF', fontSize: 18, fontWeight: '700' },
  scroll: { padding: theme.spacing.lg, paddingBottom: 30 },
  sectionTitle: { fontSize: theme.fontSize.md, fontWeight: '700', color: theme.colors.text },
  sectionDesc: { fontSize: theme.fontSize.sm, color: theme.colors.textLight, marginTop: 4, marginBottom: theme.spacing.md },
  btnRow: { flexDirection: 'row', gap: 12 },
  captureBtn: { flex: 1, backgroundColor: theme.colors.card, borderRadius: theme.borderRadius.lg, padding: 20, alignItems: 'center', borderWidth: 1, borderColor: theme.colors.border, borderStyle: 'dashed' },
  captureIcon: { fontSize: 32 },
  captureLabel: { fontSize: theme.fontSize.sm, color: theme.colors.text, marginTop: 8, fontWeight: '500' },
  preview: { marginTop: 16 },
  img: { width: '100%', height: 200, borderRadius: theme.borderRadius.md },
  diagBtn: { backgroundColor: '#E74C3C', paddingVertical: 12, borderRadius: theme.borderRadius.md, alignItems: 'center', marginTop: 10 },
  diagBtnText: { color: '#FFF', fontSize: theme.fontSize.md, fontWeight: '600' },
  loading: { padding: 20, alignItems: 'center' },
  loadingText: { fontSize: theme.fontSize.sm, color: theme.colors.textLight },
  result: { backgroundColor: theme.colors.card, borderRadius: theme.borderRadius.lg, padding: 16, marginTop: 16, borderWidth: 1, borderColor: theme.colors.border },
  resultRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  resultName: { fontSize: theme.fontSize.md, fontWeight: '700', color: theme.colors.text, flex: 1 },
  badge: { paddingHorizontal: 10, paddingVertical: 4, borderRadius: 6 },
  badgeText: { color: '#FFF', fontSize: 11, fontWeight: '600' },
  conf: { fontSize: 12, color: theme.colors.textLight, marginTop: 6 },
  label: { fontSize: 13, fontWeight: '600', color: theme.colors.text, marginTop: 14, marginBottom: 4 },
  bullet: { fontSize: 13, color: theme.colors.textLight, marginLeft: 8, lineHeight: 22 },
  treatment: { fontSize: 13, color: theme.colors.textLight, lineHeight: 22 },
  historyItem: { backgroundColor: theme.colors.card, borderRadius: theme.borderRadius.md, padding: 14, marginTop: 8, borderWidth: 1, borderColor: theme.colors.border, flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  histName: { fontSize: 13, fontWeight: '600', color: theme.colors.text, flex: 1 },
  histDate: { fontSize: 12, color: theme.colors.textLight },
});
