import { View, Text, StyleSheet, ScrollView } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { theme } from '../../utils/theme';
import { HOME_STATS, RECENT_ACTIVITY } from '../../utils/mockData';

const COLOR_MAP: Record<string, string> = {
  infoBlue: theme.colors.infoBlue,
  green: theme.colors.green,
  red: theme.colors.red,
  amber: theme.colors.amber,
  purple: theme.colors.purple,
  success: theme.colors.success,
};

export default function Home() {
  return (
    <SafeAreaView style={s.safe} edges={['top']}>
      <View style={s.header}>
        <Text style={s.greeting}>AquaNexus AI</Text>
        <Text style={s.subtitle}>Your aquaculture dashboard</Text>
      </View>

      <ScrollView style={s.scrollContainer} contentContainerStyle={s.scroll} showsVerticalScrollIndicator={false}>
        <Text style={s.sectionTitle}>Overview</Text>
        <View style={s.statsGrid}>
          {HOME_STATS.map((st, i) => (
            <View key={i} style={s.statCard}>
              <Text style={s.statIcon}>{st.icon}</Text>
              <Text style={[s.statValue, { color: COLOR_MAP[st.color] || theme.colors.text }]}>{st.value}</Text>
              <Text style={s.statLabel}>{st.label}</Text>
            </View>
          ))}
        </View>

        <Text style={s.sectionTitle}>Recent Activity</Text>
        {RECENT_ACTIVITY.map((act, i) => (
          <View key={i} style={s.activityCard}>
            <View style={[s.activityDot, { backgroundColor: COLOR_MAP[act.color] || theme.colors.textLight }]} />
            <View style={s.activityInfo}>
              <Text style={s.activityText}>{act.text}</Text>
              <Text style={s.activityTime}>{act.time}</Text>
            </View>
          </View>
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
  greeting: { fontSize: theme.fontSize.xxl, fontWeight: 'bold', color: theme.colors.white },
  subtitle: { fontSize: theme.fontSize.sm, color: theme.colors.white + 'BB', marginTop: 2 },
  scrollContainer: { flex: 1 },
  scroll: {
    flexGrow: 1,
    backgroundColor: theme.colors.background,
    borderTopLeftRadius: theme.borderRadius.xl,
    borderTopRightRadius: theme.borderRadius.xl,
    paddingHorizontal: theme.spacing.lg,
    paddingTop: theme.spacing.lg,
    paddingBottom: theme.spacing.lg,
  },
  sectionTitle: {
    fontSize: theme.fontSize.lg,
    fontWeight: '700',
    color: theme.colors.text,
    marginBottom: theme.spacing.sm + 4,
  },
  statsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: theme.spacing.sm + 2,
    marginBottom: theme.spacing.xl,
  },
  statCard: {
    width: '47%',
    backgroundColor: theme.colors.card,
    borderRadius: theme.borderRadius.lg,
    padding: theme.spacing.md,
    borderWidth: 1,
    borderColor: theme.colors.border,
  },
  statIcon: { fontSize: theme.fontSize.xl },
  statValue: {
    fontSize: theme.fontSize.xl,
    fontWeight: '700',
    marginTop: theme.spacing.sm,
  },
  statLabel: {
    fontSize: theme.fontSize.xs,
    color: theme.colors.textLight,
    marginTop: 4,
  },
  activityCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: theme.colors.card,
    borderRadius: theme.borderRadius.md,
    padding: theme.spacing.sm + 6,
    marginBottom: theme.spacing.sm,
    borderWidth: 1,
    borderColor: theme.colors.border,
  },
  activityDot: {
    width: theme.spacing.sm,
    height: theme.spacing.sm,
    borderRadius: theme.spacing.sm / 2,
    marginRight: theme.spacing.sm + 4,
  },
  activityInfo: { flex: 1 },
  activityText: {
    fontSize: 13,
    fontWeight: '500',
    color: theme.colors.text,
  },
  activityTime: {
    fontSize: 11,
    color: theme.colors.textLight,
    marginTop: 2,
  },
});
