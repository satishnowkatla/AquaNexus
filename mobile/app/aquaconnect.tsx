import { useState, useEffect, useCallback } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, ActivityIndicator, RefreshControl } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { supabase } from '../utils/supabase';
import { theme } from '../utils/theme';
import { MODULE_COLOR_MAP } from '../utils/moduleConfig';
import { AQUACONNECT_RESOURCES } from '../utils/mockData';

const MODULE_COLOR = MODULE_COLOR_MAP.aquaconnect;
const DOT_COLORS: Record<string, string> = {
  info: theme.colors.blue,
  urgent: theme.colors.red,
  warning: theme.colors.amber,
  high: theme.colors.red,
  medium: theme.colors.amber,
  low: theme.colors.green,
};

type Cooperative = { id: string; name: string; district: string; member_count: number };
type Alert = { id: string; title: string; message: string; alert_type: string; priority: string; created_at: string };
type Member = { user_id: string; joined_at: string; users: { full_name: string; phone: string } | null };

export default function AquaConnectScreen() {
  const router = useRouter();
  const [tab, setTab] = useState<'alerts' | 'members' | 'resources'>('alerts');
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [cooperative, setCooperative] = useState<Cooperative | null>(null);
  const [alerts, setAlerts] = useState<Alert[]>([]);
  const [members, setMembers] = useState<Member[]>([]);
  const [isMember, setIsMember] = useState(false);

  const [debug, setDebug] = useState('');

  const joinCooperative = async (coopId: string, userId: string) => {
    const { error: userErr } = await supabase.from('users').upsert({ id: userId, phone: `dev-${userId.slice(0, 8)}`, full_name: 'Dev User' }, { onConflict: 'id' });
    if (userErr) { setDebug('user upsert: ' + userErr.message); return; }
    const { error: memberErr } = await supabase.from('cooperative_members').insert({ cooperative_id: coopId, user_id: userId });
    if (memberErr) { setDebug('member insert: ' + memberErr.message); return; }
  };

  const fetchData = useCallback(async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) { setDebug('no user'); return; }
      setDebug('user: ' + user.id.slice(0, 8));

      // Check membership
      let { data: membership, error: memErr } = await supabase
        .from('cooperative_members')
        .select('cooperative_id')
        .eq('user_id', user.id)
        .maybeSingle();

      if (memErr) { setDebug('coop query: ' + memErr.message); return; }
      setDebug('membership: ' + JSON.stringify(membership));

      // Auto-join first available cooperative if not a member
      if (!membership) {
        const { data: coops, error: coopErr } = await supabase.from('cooperatives').select('id').limit(1);
        if (coopErr) { setDebug('coop list: ' + coopErr.message); return; }
        setDebug('coops found: ' + (coops?.length || 0));
        if (coops && coops.length > 0) {
          await joinCooperative(coops[0].id, user.id);
          membership = { cooperative_id: coops[0].id };
        }
      }

      if (!membership) {
        setIsMember(false);
        setCooperative(null);
        setAlerts([]);
        setMembers([]);
        return;
      }

      setIsMember(true);
      const coopId = membership.cooperative_id;

      // Fetch cooperative, alerts, members in parallel
      const [coopRes, alertsRes, membersRes] = await Promise.all([
        supabase.from('cooperatives').select('id, name, district, member_count').eq('id', coopId).single(),
        supabase.from('cooperative_alerts').select('*').eq('cooperative_id', coopId).order('created_at', { ascending: false }).limit(20),
        supabase.from('cooperative_members').select('user_id, joined_at, users(full_name, phone)').eq('cooperative_id', coopId),
      ]);

      if (coopRes.data) setCooperative(coopRes.data);
      if (alertsRes.data) setAlerts(alertsRes.data as Alert[]);
      if (membersRes.data) setMembers(membersRes.data as unknown as Member[]);
    } catch (err) {
      console.warn('AquaConnect fetch error:', err);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  useEffect(() => { fetchData(); }, [fetchData]);

  const onRefresh = () => { setRefreshing(true); fetchData(); };

  const getStats = () => {
    if (!isMember || !cooperative) {
      return [
        { icon: '👥', value: '--', label: 'Members' },
        { icon: '🐟', value: '--', label: 'Total Ponds' },
        { icon: '📊', value: '--', label: 'Avg Revenue' },
      ];
    }
    return [
      { icon: '👥', value: String(members.length || cooperative.member_count), label: 'Members' },
      { icon: '🐟', value: String(members.length * 3), label: 'Total Ponds' },
      { icon: '📊', value: '₹2.4L', label: 'Avg Revenue' },
    ];
  };

  if (loading) {
    return (
      <SafeAreaView style={s.safe} edges={['top']}>
        <View style={s.nav}>
          <TouchableOpacity onPress={() => router.back()} style={s.backBtn}><Text style={s.backText}>←</Text></TouchableOpacity>
          <Text style={s.navTitle}>AquaConnect</Text>
          <View style={{ width: theme.layout.backButtonSize }} />
        </View>
        <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
          <ActivityIndicator size="large" color={MODULE_COLOR} />
          <Text style={{ marginTop: 12, color: theme.colors.textLight }}>Loading cooperative...</Text>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={s.safe} edges={['top']}>
      <View style={s.nav}>
        <TouchableOpacity onPress={() => router.back()} style={s.backBtn}><Text style={s.backText}>←</Text></TouchableOpacity>
        <Text style={s.navTitle}>AquaConnect</Text>
        <View style={{ width: theme.layout.backButtonSize }} />
      </View>

      <ScrollView
        contentContainerStyle={s.scroll}
        showsVerticalScrollIndicator={false}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} colors={[MODULE_COLOR]} tintColor={MODULE_COLOR} />}
      >
        <Text style={{ fontSize: 10, color: 'red', marginBottom: 8 }}>DEBUG: {debug}</Text>

        {!isMember ? (
          <View style={s.emptyState}>
            <Text style={s.emptyIcon}>🏘️</Text>
            <Text style={s.emptyTitle}>No Cooperative Found</Text>
            <Text style={s.emptyDesc}>Join a cooperative to connect with other farmers in your area.</Text>
            <TouchableOpacity style={[s.joinBtn, { backgroundColor: MODULE_COLOR }]}><Text style={s.joinText}>Join Cooperative</Text></TouchableOpacity>
          </View>
        ) : (
          <>
            {cooperative && (
              <View style={s.coopBanner}>
                <Text style={s.coopName}>{cooperative.name}</Text>
                <Text style={s.coopDistrict}>{cooperative.district} District</Text>
              </View>
            )}

            <View style={s.statsRow}>
              {getStats().map((st, i) => (
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

            {tab === 'alerts' && alerts.length === 0 && (
              <Text style={s.emptyTab}>No alerts yet</Text>
            )}
            {tab === 'alerts' && alerts.map(a => (
              <View key={a.id} style={s.alertCard}>
                <View style={[s.alertDot, { backgroundColor: DOT_COLORS[a.alert_type] || DOT_COLORS[a.priority] || theme.colors.textLight }]} />
                <View style={{ flex: 1 }}>
                  <Text style={s.alertTitle}>{a.title}</Text>
                  <Text style={s.alertMsg}>{a.message}</Text>
                  <Text style={s.alertTime}>{new Date(a.created_at).toLocaleDateString('en-IN', { day: 'numeric', month: 'short' })}</Text>
                </View>
              </View>
            ))}

            {tab === 'members' && members.length === 0 && (
              <Text style={s.emptyTab}>No members found</Text>
            )}
            {tab === 'members' && members.map((m, i) => (
              <View key={i} style={s.memberCard}>
                <View style={[s.avatar, { backgroundColor: theme.colors.green + '20' }]}>
                  <Text style={s.avatarText}>{m.users?.full_name?.charAt(0) || '?'}</Text>
                </View>
                <View style={{ flex: 1 }}>
                  <Text style={s.memberName}>{m.users?.full_name || 'Unknown'}</Text>
                  <Text style={s.memberInfo}>Joined {new Date(m.joined_at).toLocaleDateString('en-IN', { month: 'short', year: 'numeric' })}</Text>
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
  coopBanner: { backgroundColor: MODULE_COLOR + '10', borderRadius: theme.borderRadius.md, padding: theme.spacing.sm + 8, marginBottom: theme.spacing.md, borderWidth: 1, borderColor: MODULE_COLOR + '30' },
  coopName: { fontSize: theme.fontSize.md, fontWeight: '700', color: theme.colors.text },
  coopDistrict: { fontSize: 12, color: MODULE_COLOR, marginTop: 2 },
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
  alertMsg: { fontSize: 12, color: theme.colors.textLight, marginTop: 4, lineHeight: 18 },
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
  emptyState: { alignItems: 'center', paddingTop: 60 },
  emptyIcon: { fontSize: 48 },
  emptyTitle: { fontSize: theme.fontSize.md, fontWeight: '700', color: theme.colors.text, marginTop: 16 },
  emptyDesc: { fontSize: 13, color: theme.colors.textLight, marginTop: 8, textAlign: 'center', paddingHorizontal: 20 },
  emptyTab: { textAlign: 'center', color: theme.colors.textLight, fontSize: 13, paddingVertical: 20 },
});
