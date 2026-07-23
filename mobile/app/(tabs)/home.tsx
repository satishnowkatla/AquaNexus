import { View, Text, StyleSheet, ScrollView } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { theme } from '../../utils/theme';

const stats = [
  { label: 'Total Ponds', value: '2', icon: '🏞️', color: '#2980B9' },
  { label: 'Active Species', value: '3', icon: '🐟', color: '#27AE60' },
  { label: 'This Month', value: '₹12,500', icon: '💸', color: '#E74C3C' },
  { label: 'Diseases', value: '1', icon: '🔬', color: '#F39C12' },
];

const recentActivity = [
  { icon: '🔬', text: 'Disease diagnosed: White Spot', time: 'Today, 2:30 PM', color: '#E74C3C' },
  { icon: '🎙️', text: 'Expense logged: ₹12,000 (Feed)', time: 'Today, 10:30 AM', color: '#9B59B6' },
  { icon: '💬', text: 'Asked Advisor about water pH', time: 'Yesterday', color: '#27AE60' },
  { icon: '💰', text: 'Income logged: ₹45,000 (Sale)', time: '2 days ago', color: '#28A745' },
];

export default function Home() {
  return (
    <SafeAreaView style={s.safe} edges={['top']}>
      <View style={s.header}>
        <Text style={s.greeting}>AquaNexus AI</Text>
        <Text style={s.subtitle}>Your aquaculture dashboard</Text>
      </View>

      <ScrollView contentContainerStyle={s.scroll} showsVerticalScrollIndicator={false}>
        <Text style={s.sectionTitle}>Overview</Text>
        <View style={s.statsGrid}>
          {stats.map((st, i) => (
            <View key={i} style={s.statCard}>
              <Text style={s.statIcon}>{st.icon}</Text>
              <Text style={[s.statValue, { color: st.color }]}>{st.value}</Text>
              <Text style={s.statLabel}>{st.label}</Text>
            </View>
          ))}
        </View>

        <Text style={s.sectionTitle}>Recent Activity</Text>
        {recentActivity.map((act, i) => (
          <View key={i} style={s.activityCard}>
            <View style={[s.activityDot, { backgroundColor: act.color }]} />
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
    paddingTop: 24,
    paddingBottom: theme.spacing.lg,
  },
  greeting: { fontSize: theme.fontSize.xl, fontWeight: 'bold', color: '#FFF' },
  subtitle: { fontSize: theme.fontSize.sm, color: '#FFFFFFBB', marginTop: 2 },
  scroll: {
    flex: 1,
    backgroundColor: theme.colors.background,
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    paddingHorizontal: theme.spacing.lg,
    paddingTop: theme.spacing.lg,
    paddingBottom: 24,
  },
  sectionTitle: {
    fontSize: theme.fontSize.md,
    fontWeight: '700',
    color: theme.colors.text,
    marginBottom: 12,
  },
  statsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 10,
    marginBottom: 20,
  },
  statCard: {
    width: '47%',
    backgroundColor: theme.colors.card,
    borderRadius: theme.borderRadius.lg,
    padding: 16,
    borderWidth: 1,
    borderColor: theme.colors.border,
  },
  statIcon: { fontSize: 22 },
  statValue: {
    fontSize: 20,
    fontWeight: '700',
    marginTop: 8,
  },
  statLabel: {
    fontSize: 12,
    color: theme.colors.textLight,
    marginTop: 4,
  },
  activityCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: theme.colors.card,
    borderRadius: theme.borderRadius.md,
    padding: 14,
    marginBottom: 8,
    borderWidth: 1,
    borderColor: theme.colors.border,
  },
  activityDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    marginRight: 12,
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
