import { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Platform } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { theme } from '../utils/theme';

const ALERTS = [
  { id: '1', title: 'Feed Bulk Order', desc: 'Group order for 100 bags @ ₹58/kg. Confirm by tomorrow.', time: '2h ago', type: 'info' },
  { id: '2', title: 'Disease Alert', desc: 'White spot outbreak in 3 farms near Kakinada.', time: '5h ago', type: 'urgent' },
  { id: '3', title: 'Harvest Coordination', desc: '5 members planning harvest next week.', time: '1d ago', type: 'warning' },
];

const MEMBERS = [
  { name: 'Ravi Kumar', ponds: 3, species: 'Vannamei', active: true },
  { name: 'Suresh Babu', ponds: 2, species: 'Rohu', active: true },
  { name: 'Lakshmi Devi', ponds: 1, species: 'Catla', active: true },
  { name: 'Venkat Rao', ponds: 4, species: 'Vannamei', active: false },
  { name: 'Prasad Reddy', ponds: 2, species: 'Murrel', active: true },
];

const RESOURCES = [
  { icon: '📦', title: 'Bulk Feed Orders', desc: '15-20% discount on group orders' },
  { icon: '🚜', title: 'Shared Equipment', desc: 'Aerators, kits, nets available' },
  { icon: '🚛', title: 'Transport Sharing', desc: 'Split harvest transport costs' },
  { icon: '🧑‍⚕️', title: 'Expert Consultations', desc: 'Weekly shared vet visits' },
];

export default function AquaConnectScreen() {
  const router = useRouter();
  const [tab, setTab] = useState<'alerts' | 'members' | 'resources'>('alerts');
  const dotColor = (t: string) => t === 'urgent' ? '#E74C3C' : t === 'warning' ? '#F39C12' : '#2980B9';

  return (
    <SafeAreaView style={s.safe} edges={['top']}>
      <View style={s.nav}>
        <TouchableOpacity onPress={() => router.back()} style={s.backBtn}><Text style={s.backText}>←</Text></TouchableOpacity>
        <Text style={s.navTitle}>AquaConnect</Text>
        <View style={{ width: 40 }} />
      </View>

      <ScrollView contentContainerStyle={s.scroll} showsVerticalScrollIndicator={false}>
        <View style={s.statsRow}>
          {[
            { icon: '👥', val: '24', label: 'Members' },
            { icon: '🐟', val: '47', label: 'Ponds' },
            { icon: '📦', val: '3', label: 'Orders' },
            { icon: '💰', val: '₹1.2L', label: 'Saved' },
          ].map((st, i) => (
            <View key={i} style={s.statCard}>
              <Text style={{ fontSize: 20 }}>{st.icon}</Text>
              <Text style={s.statVal}>{st.val}</Text>
              <Text style={s.statLabel}>{st.label}</Text>
            </View>
          ))}
        </View>

        <View style={s.tabRow}>
          {(['alerts', 'members', 'resources'] as const).map(t => (
            <TouchableOpacity key={t} style={[s.tabBtn, tab === t && s.tabActive]} onPress={() => setTab(t)}>
              <Text style={[s.tabText, tab === t && s.tabTextActive]}>{t.charAt(0).toUpperCase() + t.slice(1)}</Text>
            </TouchableOpacity>
          ))}
        </View>

        {tab === 'alerts' && ALERTS.map(a => (
          <View key={a.id} style={s.alertCard}>
            <View style={[s.alertDot, { backgroundColor: dotColor(a.type) }]} />
            <View style={{ flex: 1 }}>
              <Text style={s.alertTitle}>{a.title}</Text>
              <Text style={s.alertDesc}>{a.desc}</Text>
              <Text style={s.alertTime}>{a.time}</Text>
            </View>
          </View>
        ))}

        {tab === 'members' && MEMBERS.map((m, i) => (
          <View key={i} style={s.memberCard}>
            <View style={[s.avatar, { backgroundColor: m.active ? '#27AE6020' : '#6C757D20' }]}>
              <Text style={s.avatarText}>{m.name.charAt(0)}</Text>
            </View>
            <View style={{ flex: 1 }}>
              <Text style={s.memberName}>{m.name}</Text>
              <Text style={s.memberInfo}>{m.ponds} ponds • {m.species}</Text>
            </View>
            <View style={[s.dot, { backgroundColor: m.active ? theme.colors.success : theme.colors.textLight }]} />
          </View>
        ))}

        {tab === 'resources' && RESOURCES.map((r, i) => (
          <View key={i} style={s.resourceCard}>
            <Text style={{ fontSize: 26, marginRight: 12 }}>{r.icon}</Text>
            <View style={{ flex: 1 }}>
              <Text style={s.resourceTitle}>{r.title}</Text>
              <Text style={s.resourceDesc}>{r.desc}</Text>
            </View>
            <TouchableOpacity style={s.joinBtn}><Text style={s.joinText}>Join</Text></TouchableOpacity>
          </View>
        ))}
      </ScrollView>
    </SafeAreaView>
  );
}

const s = StyleSheet.create({
  safe: { flex: 1, backgroundColor: theme.colors.background },
  nav: { backgroundColor: '#2980B9', flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingTop: 20, paddingBottom: 14, paddingHorizontal: 12 },
  backBtn: { width: 40, height: 40, justifyContent: 'center', alignItems: 'center' },
  backText: { color: '#FFF', fontSize: 24, fontWeight: '600' },
  navTitle: { color: '#FFF', fontSize: 18, fontWeight: '700' },
  scroll: { padding: theme.spacing.lg, paddingBottom: 30 },
  statsRow: { flexDirection: 'row', flexWrap: 'wrap', gap: 10, marginBottom: 16 },
  statCard: { width: '47%', backgroundColor: theme.colors.card, borderRadius: 10, padding: 14, alignItems: 'center', borderWidth: 1, borderColor: theme.colors.border },
  statVal: { fontSize: 20, fontWeight: '700', color: theme.colors.text, marginTop: 4 },
  statLabel: { fontSize: 11, color: theme.colors.textLight, marginTop: 2 },
  tabRow: { flexDirection: 'row', backgroundColor: theme.colors.card, borderRadius: 10, overflow: 'hidden', borderWidth: 1, borderColor: theme.colors.border, marginBottom: 16 },
  tabBtn: { flex: 1, paddingVertical: 10, alignItems: 'center' },
  tabActive: { backgroundColor: '#2980B9' },
  tabText: { fontSize: 12, color: theme.colors.textLight, fontWeight: '500' },
  tabTextActive: { color: '#FFF', fontWeight: '600' },
  alertCard: { flexDirection: 'row', backgroundColor: theme.colors.card, borderRadius: 10, padding: 14, marginBottom: 8, borderWidth: 1, borderColor: theme.colors.border },
  alertDot: { width: 4, borderRadius: 2, marginRight: 12, alignSelf: 'stretch' },
  alertTitle: { fontSize: 13, fontWeight: '600', color: theme.colors.text },
  alertDesc: { fontSize: 12, color: theme.colors.textLight, marginTop: 4, lineHeight: 18 },
  alertTime: { fontSize: 11, color: theme.colors.textLight, marginTop: 6 },
  memberCard: { flexDirection: 'row', alignItems: 'center', backgroundColor: theme.colors.card, borderRadius: 10, padding: 14, marginBottom: 8, borderWidth: 1, borderColor: theme.colors.border },
  avatar: { width: 42, height: 42, borderRadius: 21, justifyContent: 'center', alignItems: 'center', marginRight: 12 },
  avatarText: { fontSize: 16, fontWeight: '700', color: theme.colors.text },
  memberName: { fontSize: 13, fontWeight: '600', color: theme.colors.text },
  memberInfo: { fontSize: 11, color: theme.colors.textLight, marginTop: 2 },
  dot: { width: 10, height: 10, borderRadius: 5 },
  resourceCard: { flexDirection: 'row', alignItems: 'center', backgroundColor: theme.colors.card, borderRadius: 10, padding: 14, marginBottom: 8, borderWidth: 1, borderColor: theme.colors.border },
  resourceTitle: { fontSize: 13, fontWeight: '600', color: theme.colors.text },
  resourceDesc: { fontSize: 11, color: theme.colors.textLight, marginTop: 2 },
  joinBtn: { backgroundColor: '#2980B9', paddingHorizontal: 14, paddingVertical: 6, borderRadius: 8 },
  joinText: { color: '#FFF', fontSize: 11, fontWeight: '600' },
});
