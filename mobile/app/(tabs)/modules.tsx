import { View, Text, StyleSheet, ScrollView, TouchableOpacity } from 'react-native';
import { useRouter } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { theme } from '../../utils/theme';
import { MODULES } from '../../utils/moduleConfig';

export default function ModulesScreen() {
  const router = useRouter();

  return (
    <SafeAreaView style={s.safe} edges={['top']}>
      <View style={s.header}>
        <Text style={s.headerTitle}>Modules</Text>
        <Text style={s.headerSub}>Select a module to get started</Text>
      </View>

      <ScrollView contentContainerStyle={s.scroll} showsVerticalScrollIndicator={false}>
        {MODULES.map((mod) => (
          <TouchableOpacity
            key={mod.id}
            style={s.card}
            onPress={() => router.push(`/${mod.id}`)}
            activeOpacity={0.7}
          >
            <View style={[s.cardIcon, { backgroundColor: mod.lightColor }]}>
              <Text style={{ fontSize: 28 }}>{mod.icon}</Text>
            </View>
            <View style={s.cardInfo}>
              <Text style={s.cardTitle}>{mod.title}</Text>
              <Text style={s.cardDesc}>{mod.description}</Text>
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
    paddingTop: theme.spacing.lg + 4,
    paddingBottom: theme.spacing.lg,
  },
  headerTitle: { fontSize: theme.fontSize.xxl, fontWeight: 'bold', color: theme.colors.white },
  headerSub: { fontSize: theme.fontSize.sm, color: theme.colors.white + 'BB', marginTop: 2 },
  scroll: {
    flex: 1,
    backgroundColor: theme.colors.background,
    borderTopLeftRadius: theme.borderRadius.xl,
    borderTopRightRadius: theme.borderRadius.xl,
    paddingHorizontal: theme.spacing.lg,
    paddingTop: theme.spacing.lg,
    paddingBottom: theme.spacing.lg,
  },
  card: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: theme.colors.card,
    borderRadius: theme.borderRadius.lg,
    padding: theme.spacing.md,
    marginBottom: theme.spacing.sm + 2,
    borderWidth: 1,
    borderColor: theme.colors.border,
  },
  cardIcon: {
    width: theme.layout.avatarXL,
    height: theme.layout.avatarXL,
    borderRadius: theme.borderRadius.xl,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: theme.spacing.sm + 6,
  },
  cardInfo: { flex: 1 },
  cardTitle: {
    fontSize: theme.fontSize.lg,
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
    fontSize: theme.fontSize.xl,
    color: theme.colors.textLight,
    marginLeft: theme.spacing.sm,
  },
});
