import { View, Text, StyleSheet, ScrollView, TouchableOpacity } from 'react-native';
import { useRouter } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { theme } from '../../utils/theme';

const modules = [
  { id: 'aquadoc', icon: '🔬', title: 'AquaDoc', desc: 'AI Disease Diagnosis — snap a photo, get instant analysis', color: '#E74C3C', bg: '#FDEDEC' },
  { id: 'aquavoice', icon: '🎙️', title: 'AquaVoice', desc: 'Voice Accounting — speak to log expenses & income', color: '#9B59B6', bg: '#F4ECF7' },
  { id: 'aquaadvisor', icon: '💬', title: 'AquaAdvisor', desc: 'AI Chatbot — ask anything about fish farming', color: '#27AE60', bg: '#EAFAF1' },
  { id: 'aquafeed', icon: '🐟', title: 'AquaFeed', desc: 'Feed Optimizer — calculate optimal feed & cost', color: '#F39C12', bg: '#FEF5E7' },
  { id: 'aquaconnect', icon: '🤝', title: 'AquaConnect', desc: 'Cooperative — connect with local farmers', color: '#2980B9', bg: '#EBF5FB' },
];

export default function ModulesScreen() {
  const router = useRouter();

  return (
    <SafeAreaView style={s.safe} edges={['top']}>
      <View style={s.header}>
        <Text style={s.headerTitle}>Modules</Text>
        <Text style={s.headerSub}>Select a module to get started</Text>
      </View>

      <ScrollView contentContainerStyle={s.scroll} showsVerticalScrollIndicator={false}>
        {modules.map((mod) => (
          <TouchableOpacity
            key={mod.id}
            style={s.card}
            onPress={() => router.push(`/${mod.id}`)}
            activeOpacity={0.7}
          >
            <View style={[s.cardIcon, { backgroundColor: mod.bg }]}>
              <Text style={{ fontSize: 28 }}>{mod.icon}</Text>
            </View>
            <View style={s.cardInfo}>
              <Text style={s.cardTitle}>{mod.title}</Text>
              <Text style={s.cardDesc}>{mod.desc}</Text>
            </View>
            <Text style={s.arrow}>›</Text>
          </TouchableOpacity>
        ))}
      </ScrollView>
    </SafeAreaView>
  );
}

const s = StyleSheet.create({
  safe: { flex: 1, backgroundColor: theme.colors.primary },
  header: {
    backgroundColor: theme.colors.primary,
    paddingHorizontal: theme.spacing.lg,
    paddingTop: 24,
    paddingBottom: theme.spacing.lg,
  },
  headerTitle: { fontSize: theme.fontSize.xl, fontWeight: 'bold', color: '#FFF' },
  headerSub: { fontSize: theme.fontSize.sm, color: '#FFFFFFBB', marginTop: 2 },
  scroll: {
    flex: 1,
    backgroundColor: theme.colors.background,
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    paddingHorizontal: theme.spacing.lg,
    paddingTop: theme.spacing.lg,
    paddingBottom: 24,
  },
  card: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: theme.colors.card,
    borderRadius: theme.borderRadius.lg,
    padding: 16,
    marginBottom: 10,
    borderWidth: 1,
    borderColor: theme.colors.border,
  },
  cardIcon: {
    width: 54,
    height: 54,
    borderRadius: 16,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 14,
  },
  cardInfo: { flex: 1 },
  cardTitle: {
    fontSize: theme.fontSize.md,
    fontWeight: '600',
    color: theme.colors.text,
  },
  cardDesc: {
    fontSize: theme.fontSize.xs,
    color: theme.colors.textLight,
    marginTop: 4,
    lineHeight: 18,
  },
  arrow: {
    fontSize: 22,
    color: theme.colors.textLight,
    marginLeft: 8,
  },
});
