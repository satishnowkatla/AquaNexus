import { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Image, Alert } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import * as ImagePicker from 'expo-image-picker';
import { theme } from '../utils/theme';
import { MODULE_COLOR_MAP } from '../utils/moduleConfig';
import { MOCK_DIAGNOSIS } from '../utils/mockData';

const MODULE_COLOR = MODULE_COLOR_MAP.aquadoc;

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

  const sevColor = (sev: string) => sev === 'high' || sev === 'High' ? theme.colors.danger : sev === 'medium' || sev === 'Medium' ? theme.colors.warning : theme.colors.success;

  return (
    <SafeAreaView style={s.safe} edges={['top']}>
      <View style={s.nav}>
        <TouchableOpacity onPress={() => router.back()} style={s.backBtn}><Text style={s.backText}>←</Text></TouchableOpacity>
        <Text style={s.navTitle}>AquaDoc</Text>
        <View style={{ width: theme.layout.backButtonSize }} />
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
            <TouchableOpacity style={[s.diagBtn, { backgroundColor: MODULE_COLOR }]} onPress={diagnose} disabled={diagnosing}>
              <Text style={s.diagBtnText}>{diagnosing ? 'Analyzing...' : '🔍 Diagnose Now'}</Text>
            </TouchableOpacity>
          </View>
        )}

        {diagnosing && <View style={s.loading}><Text style={s.loadingText}>🔬 Analyzing with AI...</Text></View>}

        {result && (
          <View style={s.result}>
            <View style={s.resultRow}>
              <Text style={s.resultName}>{result.diseaseName}</Text>
              <View style={[s.badge, { backgroundColor: sevColor(result.severity) }]}>
                <Text style={s.badgeText}>{result.severity}</Text>
              </View>
            </View>
            <Text style={s.conf}>Confidence: {result.confidence}%</Text>
            <Text style={s.label}>Symptoms</Text>
            <Text style={s.bullet}>• {result.description}</Text>
            <Text style={s.label}>Date</Text>
            <Text style={s.bullet}>{result.date}</Text>
          </View>
        )}

        <Text style={[s.sectionTitle, { marginTop: theme.spacing.xl }]}>Recent Diagnoses</Text>
        {MOCK_DIAGNOSIS.map((d) => (
          <View key={d.id} style={s.historyItem}>
            <Text style={s.histName}>{d.diseaseName}</Text>
            <Text style={s.histDate}>{d.date}</Text>
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
  sectionTitle: { fontSize: theme.fontSize.lg, fontWeight: '700', color: theme.colors.text },
  sectionDesc: { fontSize: theme.fontSize.sm, color: theme.colors.textLight, marginTop: 4, marginBottom: theme.spacing.md },
  btnRow: { flexDirection: 'row', gap: theme.spacing.sm + 4 },
  captureBtn: { flex: 1, backgroundColor: theme.colors.card, borderRadius: theme.borderRadius.lg, padding: theme.spacing.xl, alignItems: 'center', borderWidth: 1, borderColor: theme.colors.border, borderStyle: 'dashed' },
  captureIcon: { fontSize: 32 },
  captureLabel: { fontSize: theme.fontSize.sm, color: theme.colors.text, marginTop: theme.spacing.sm, fontWeight: '500' },
  preview: { marginTop: theme.spacing.md },
  img: { width: '100%', height: 200, borderRadius: theme.borderRadius.md },
  diagBtn: { paddingVertical: theme.spacing.sm + 4, borderRadius: theme.borderRadius.md, alignItems: 'center', marginTop: theme.spacing.sm + 2 },
  diagBtnText: { color: theme.colors.white, fontSize: theme.fontSize.lg, fontWeight: '600' },
  loading: { padding: theme.spacing.xl, alignItems: 'center' },
  loadingText: { fontSize: theme.fontSize.sm, color: theme.colors.textLight },
  result: { backgroundColor: theme.colors.card, borderRadius: theme.borderRadius.lg, padding: theme.spacing.md, marginTop: theme.spacing.md, borderWidth: 1, borderColor: theme.colors.border },
  resultRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  resultName: { fontSize: theme.fontSize.lg, fontWeight: '700', color: theme.colors.text, flex: 1 },
  badge: { paddingHorizontal: 10, paddingVertical: 4, borderRadius: theme.borderRadius.xs },
  badgeText: { color: theme.colors.white, fontSize: 11, fontWeight: '600' },
  conf: { fontSize: theme.fontSize.xs, color: theme.colors.textLight, marginTop: 6 },
  label: { fontSize: 13, fontWeight: '600', color: theme.colors.text, marginTop: 14, marginBottom: 4 },
  bullet: { fontSize: 13, color: theme.colors.textLight, marginLeft: theme.spacing.sm, lineHeight: 22 },
  historyItem: { backgroundColor: theme.colors.card, borderRadius: theme.borderRadius.md, padding: theme.spacing.sm + 6, marginTop: theme.spacing.sm, borderWidth: 1, borderColor: theme.colors.border, flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  histName: { fontSize: 13, fontWeight: '600', color: theme.colors.text, flex: 1 },
  histDate: { fontSize: theme.fontSize.xs, color: theme.colors.textLight },
});
