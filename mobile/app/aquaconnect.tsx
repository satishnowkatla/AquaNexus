import { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { theme } from '../utils/theme';
import { MODULE_COLOR_MAP } from '../utils/moduleConfig';
import { AQUACONNECT_ALERTS, AQUACONNECT_MEMBERS, AQUACONNECT_RESOURCES, AQUACONNECT_STATS } from '../utils/mockData';

const MODULE_COLOR = MODULE_COLOR_MAP.aquaconnect;
const DOT_COLORS: Record<string, string> = {
  info: theme.colors.blue,
  urgent: theme.colors.red,
  warning: theme.colors.amber,
};

export default function AquaConnectScreen() {
  const router = useRouter();
  const [tab, setTab] = useState<'alerts' | 'members' | 'resources'>('alerts');

  return (
    <SafeAreaView style={s.safe} edges={['top']}>
      <View style={s.nav}>
        <TouchableOpacity onPress={() => router.back()} style={s.backBtn}><Text style={s.backText}>←</Text></TouchableOpacity>
        <Text style={s.navTitle}>AquaConnect</Text>
        <View style={{ width: theme.layout.backButtonSize }} />
      </View>

      <ScrollView contentContainerStyle={s.scroll} showsVerticalScrollIndicator={false}>
        <View style={s.statsRow}>
          {AQUACONNECT_STATS.map((st, i) => (
            <View key={i} style={s.statCard}>
              <Text style={{ fontSize: theme.fontSize.xl }}>{st.icon}</Text>
              <Text style={s.statVal}>{st.value}</Text>
              <Text style={s.statLabel}>{st.label}</Text>
            </View>
          ))}
        </View>

        <View style={s.tabRow}>
          {(['alerts', 'members', 'resources'] as const).map(t => (
            <TouchableOpacity key={t} style={[s.tabBtn, tab === t && { backgroundColor: MODULE_COLOR }]} onPress={() => setTab(t)}>
              <Text style={[s.tabText, tab === t && { color: theme.colors.white, fontWeight: '600' }]}>{t.charAt(0).toUpperCase() + t.slice(1)}</Text>
            </TouchableOpacity>
          ))}
        </View>

        {tab === 'alerts' && AQUACONNECT_ALERTS.map(a => (
          <View key={a.id} style={s.alertCard}>
            <View style={[s.alertDot, { backgroundColor: DOT_COLORS[a.type] || theme.colors.textLight }]} />
            <View style={{ flex: 1 }}>
              <Text style={s.alertTitle}>{a.text}</Text>
              <Text style={s.alertTime}>{a.date}</Text>
            </View>
          </View>
        ))}

        {tab === 'members' && AQUACONNECT_MEMBERS.map((m, i) => (
          <View key={i} style={s.memberCard}>
            <View style={[s.avatar, { backgroundColor: theme.colors.green + '20' }]}>
              <Text style={s.avatarText}>{m.name.charAt(0)}</Text>
            </View>
            <View style={{ flex: 1 }}>
              <Text style={s.memberName}>{m.name}</Text>
              <Text style={s.memberInfo}>{m.ponds} ponds • Joined {m.joined}</Text>
            </View>
            <View style={[s.dot, { backgroundColor: theme.colors.success }]} />
          </View>
        ))}

        {tab === 'resources' && AQUACONNECT_RESOURCES.map((r, i) => (
          <View key={i} style={s.resourceCard}>
            <Text style={{ fontSize: 26, marginRight: theme.spacing.sm + 4 }}>{r.type === 'document' ? '📄' : r.type === 'contact' ? '📞' : '🔗'}</Text>
            <View style={{ flex: 1 }}>
              <Text style={s.resourceTitle}>{r.title}</Text>
            </View>
            <TouchableOpacity style={[s.joinBtn, { backgroundColor: MODULE_COLOR }]}><Text style={s.joinText}>View</Text></TouchableOpacity>
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
  statsRow: { flexDirection: 'row', flexWrap: 'wrap', gap: theme.spacing.sm + 2, marginBottom: theme.spacing.md },
  statCard: { width: '47%', backgroundColor: theme.colors.card, borderRadius: theme.borderRadius.md, padding: theme.spacing.sm + 6, alignItems: 'center', borderWidth: 1, borderColor: theme.colors.border },
  statVal: { fontSize: theme.fontSize.xl, fontWeight: '700', color: theme.colors.text, marginTop: 4 },
  statLabel: { fontSize: 11, color: theme.colors.textLight, marginTop: 2 },
  tabRow: { flexDirection: 'row', backgroundColor: theme.colors.card, borderRadius: theme.borderRadius.md, overflow: 'hidden', borderWidth: 1, borderColor: theme.colors.border, marginBottom: theme.spacing.md },
  tabBtn: { flex: 1, paddingVertical: theme.spacing.sm + 2, alignItems: 'center' },
  tabText: { fontSize: theme.fontSize.xs, color: theme.colors.textLight, fontWeight: '500' },
  alertCard: { flexDirection: 'row', backgroundColor: theme.colors.card, borderRadius: theme.borderRadius.md, padding: theme.spacing.sm + 6, marginBottom: theme.spacing.sm, borderWidth: 1, borderColor: theme.colors.border },
  alertDot: { width: 4, borderRadius: 2, marginRight: theme.spacing.sm + 4, alignSelf: 'stretch' },
  alertTitle: { fontSize: 13, fontWeight: '600', color: theme.colors.text },
  alertTime: { fontSize: 11, color: theme.colors.textLight, marginTop: 6 },
  memberCard: { flexDirection: 'row', alignItems: 'center', backgroundColor: theme.colors.card, borderRadius: theme.borderRadius.md, padding: theme.spacing.sm + 6, marginBottom: theme.spacing.sm, borderWidth: 1, borderColor: theme.colors.border },
  avatar: { width: theme.layout.avatarMd, height: theme.layout.avatarMd, borderRadius: theme.layout.avatarMd / 2, justifyContent: 'center', alignItems: 'center', marginRight: theme.spacing.sm + 4 },
  avatarText: { fontSize: theme.fontSize.lg, fontWeight: '700', color: theme.colors.text },
  memberName: { fontSize: 13, fontWeight: '600', color: theme.colors.text },
  memberInfo: { fontSize: 11, color: theme.colors.textLight, marginTop: 2 },
  dot: { width: 10, height: 10, borderRadius: 5 },
  resourceCard: { flexDirection: 'row', alignItems: 'center', backgroundColor: theme.colors.card, borderRadius: theme.borderRadius.md, padding: theme.spacing.sm + 6, marginBottom: theme.spacing.sm, borderWidth: 1, borderColor: theme.colors.border },
  resourceTitle: { fontSize: 13, fontWeight: '600', color: theme.colors.text },
  joinBtn: { paddingHorizontal: 14, paddingVertical: 6, borderRadius: theme.borderRadius.sm },
  joinText: { color: theme.colors.white, fontSize: 11, fontWeight: '600' },
});
