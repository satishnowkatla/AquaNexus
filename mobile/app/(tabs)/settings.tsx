import { useState, useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Switch, Alert } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { theme } from '../../utils/theme';
import { LANGUAGE_OPTIONS, APP_VERSION, APP_TAGLINE } from '../../utils/mockData';
import { tokenStore } from '../../utils/api';
import { supabase } from '../../utils/supabase';

export default function SettingsScreen() {
  const router = useRouter();
  const [notif, setNotif] = useState(true);
  const [dark, setDark] = useState(false);
  const [lang, setLang] = useState<'en' | 'te' | 'hi'>('en');
  const [profile, setProfile] = useState({ name: 'Ravi Kumar', phone: '+91 98765 43210' });

  useEffect(() => {
    const load = async () => {
      try {
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) return;
        const { data } = await supabase
          .from('users')
          .select('full_name, phone')
          .eq('id', user.id)
          .maybeSingle();
        if (data) {
          setProfile(p => ({
            name: data.full_name || p.name,
            phone: data.phone ? '+91 ' + data.phone : p.phone,
          }));
        }
      } catch (e) {
        // keep default profile
      }
    };
    load();
  }, []);

  const initials = profile.name
    .trim()
    .split(/\s+/)
    .slice(0, 2)
    .map(w => w[0])
    .join('')
    .toUpperCase();

  const logout = () => {
    Alert.alert('Logout', 'Are you sure you want to logout?', [
      { text: 'Cancel', style: 'cancel' },
      { text: 'Logout', style: 'destructive', onPress: async () => { await supabase.auth.signOut(); router.replace('/auth/login'); } },
    ]);
  };

  const showPonds = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) { Alert.alert('My Ponds', 'You are not signed in.'); return; }
      const { data, error } = await supabase
        .from('ponds')
        .select('name, area_acres, species, status')
        .eq('farmer_id', user.id)
        .order('created_at', { ascending: true });
      if (error) throw error;
      if (!data || data.length === 0) {
        Alert.alert('My Ponds', 'No ponds yet. Add your first pond in Edit Profile.');
        return;
      }
      const lines = data.map((p, i) => `${i + 1}. ${p.name || 'Pond ' + (i + 1)} — ${p.area_acres} acres, ${p.species} (${p.status})`);
      Alert.alert(`My Ponds (${data.length})`, lines.join('\n'));
    } catch (e: any) {
      Alert.alert('Error', e.message || 'Could not load ponds.');
    }
  };

  const showTransactions = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) { Alert.alert('Transactions', 'You are not signed in.'); return; }
      const { data, error } = await supabase
        .from('transactions')
        .select('type, category, amount, transaction_date')
        .eq('farmer_id', user.id)
        .order('transaction_date', { ascending: false })
        .limit(10);
      if (error) throw error;
      if (!data || data.length === 0) {
        Alert.alert('Transactions', 'No transactions yet. Try AquaVoice to log income and expense.');
        return;
      }
      let income = 0;
      let expense = 0;
      data.forEach(t => { if (t.type === 'income') income += t.amount; else expense += t.amount; });
      const recent = data.slice(0, 5).map(t => `${t.transaction_date || '—'} · ${t.category || t.type}: ₹${t.amount}`).join('\n');
      Alert.alert('Transactions', `Income: ₹${income}\nExpense: ₹${expense}\n\n${recent}`);
    } catch (e: any) {
      Alert.alert('Error', e.message || 'Could not load transactions.');
    }
  };

  return (
    <SafeAreaView style={s.safe} edges={['top']}>
      <View style={s.header}>
        <TouchableOpacity onPress={() => router.back()} style={s.backBtn}>
          <Text style={s.backArrow}>←</Text>
        </TouchableOpacity>
        <Text style={s.headerTitle}>Settings</Text>
        <View style={{ width: theme.layout.backButtonSize }} />
      </View>

      <ScrollView contentContainerStyle={s.scroll} showsVerticalScrollIndicator={false}>
        <View style={s.profile}>
          <View style={s.avatar}><Text style={s.avatarText}>{initials || 'RK'}</Text></View>
          <Text style={s.name}>{profile.name}</Text>
          <Text style={s.phone}>{profile.phone}</Text>
          <TouchableOpacity style={s.editBtn} onPress={() => router.push('/edit-profile')}>
            <Text style={s.editText}>Edit Profile</Text>
          </TouchableOpacity>
        </View>

        <Text style={s.groupLabel}>Account</Text>
        <View style={s.group}>
          <Row icon="👤" text="Personal Information" onPress={() => router.push('/edit-profile')} />
          <Row icon="📍" text="My Ponds" onPress={showPonds} />
          <Row icon="📊" text="Transaction History" onPress={showTransactions} />
        </View>

        <Text style={s.groupLabel}>Preferences</Text>
        <View style={s.group}>
          <View style={s.row}>
            <Text style={s.rowIcon}>🔔</Text>
            <Text style={s.rowText}>Notifications</Text>
            <Switch value={notif} onValueChange={setNotif} trackColor={{ false: theme.colors.grey[400], true: theme.colors.primary + '60' }} thumbColor={notif ? theme.colors.primary : theme.colors.white} />
          </View>
          <View style={s.divider} />
          <View style={s.row}>
            <Text style={s.rowIcon}>🌙</Text>
            <Text style={s.rowText}>Dark Mode</Text>
            <Switch value={dark} onValueChange={setDark} trackColor={{ false: theme.colors.grey[400], true: theme.colors.primary + '60' }} thumbColor={dark ? theme.colors.primary : theme.colors.white} />
          </View>
        </View>

        <Text style={s.groupLabel}>Language</Text>
        <View style={s.group}>
          {LANGUAGE_OPTIONS.map((opt, i) => (
            <TouchableOpacity key={opt.value} style={[s.row, i < LANGUAGE_OPTIONS.length - 1 && { borderBottomWidth: 1, borderBottomColor: theme.colors.border }]} onPress={() => setLang(opt.value as 'en' | 'te' | 'hi')}>
              <Text style={s.rowText}>{opt.label}</Text>
              {lang === opt.value && <Text style={s.check}>✓</Text>}
            </TouchableOpacity>
          ))}
        </View>

        <Text style={s.groupLabel}>About</Text>
        <View style={s.group}>
          <Row icon="ℹ️" text="About AquaNexus" onPress={() => Alert.alert('About AquaNexus', `${APP_TAGLINE}\n\nVersion ${APP_VERSION}\nAI-powered tools for disease diagnosis, farming advice, and more.`)} />
          <Row icon="📋" text="Version" value={APP_VERSION} />
        </View>

        <TouchableOpacity style={s.logoutBtn} onPress={logout}>
          <Text style={s.logoutText}>Logout</Text>
        </TouchableOpacity>

        <Text style={s.footer}>{APP_TAGLINE}</Text>
      </ScrollView>
    </SafeAreaView>
  );
}

function Row({ icon, text, value, onPress }: { icon: string; text: string; value?: string; onPress?: () => void }) {
  return (
    <TouchableOpacity
      style={rS.row}
      onPress={onPress}
      disabled={!onPress}
      activeOpacity={0.6}
    >
      <Text style={rS.icon}>{icon}</Text>
      <Text style={rS.text}>{text}</Text>
      {value ? <Text style={rS.value}>{value}</Text> : <Text style={rS.arrow}>›</Text>}
    </TouchableOpacity>
  );
}

const rS = StyleSheet.create({
  row: { flexDirection: 'row', alignItems: 'center', paddingHorizontal: 14, paddingVertical: 14, borderBottomWidth: 1, borderBottomColor: theme.colors.grey[100] },
  icon: { fontSize: theme.fontSize.lg, marginRight: theme.spacing.sm + 4 },
  text: { flex: 1, fontSize: theme.fontSize.sm, color: theme.colors.text },
  arrow: { fontSize: theme.fontSize.lg, color: theme.colors.textLight },
  value: { fontSize: 13, color: theme.colors.textLight },
});

const s = StyleSheet.create({
  safe: { flex: 1, backgroundColor: theme.colors.background },
  header: {
    backgroundColor: theme.colors.primary,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingTop: theme.spacing.sm + 12,
    paddingBottom: theme.spacing.md,
    paddingHorizontal: theme.spacing.sm + 4,
  },
  backBtn: { width: theme.layout.backButtonSize, height: theme.layout.backButtonSize, justifyContent: 'center', alignItems: 'center' },
  backArrow: { color: theme.colors.white, fontSize: theme.fontSize.xxl, fontWeight: '600' },
  headerTitle: { color: theme.colors.white, fontSize: theme.fontSize.lg, fontWeight: '700' },
  scroll: { paddingBottom: 40 },
  profile: { backgroundColor: theme.colors.card, alignItems: 'center', paddingVertical: theme.spacing.lg, borderBottomWidth: 1, borderBottomColor: theme.colors.border },
  avatar: { width: theme.layout.avatarXL + theme.spacing.sm, height: theme.layout.avatarXL + theme.spacing.sm, borderRadius: (theme.layout.avatarXL + theme.spacing.sm) / 2, backgroundColor: theme.colors.primary + '20', justifyContent: 'center', alignItems: 'center', marginBottom: theme.spacing.sm + 2 },
  avatarText: { fontSize: theme.fontSize.xxl, fontWeight: '700', color: theme.colors.primary },
  name: { fontSize: theme.fontSize.lg, fontWeight: '700', color: theme.colors.text },
  phone: { fontSize: 13, color: theme.colors.textLight, marginTop: 4 },
  editBtn: { marginTop: 10, paddingHorizontal: 20, paddingVertical: 6, borderRadius: 20, borderWidth: 1, borderColor: theme.colors.primary },
  editText: { fontSize: theme.fontSize.xs, color: theme.colors.primary, fontWeight: '600' },
  groupLabel: { fontSize: 11, fontWeight: '600', color: theme.colors.textLight, textTransform: 'uppercase', letterSpacing: 1, paddingHorizontal: theme.spacing.lg, paddingTop: 20, paddingBottom: 8 },
  group: { backgroundColor: theme.colors.card, marginHorizontal: theme.spacing.lg, borderRadius: theme.borderRadius.md, borderWidth: 1, borderColor: theme.colors.border, overflow: 'hidden' },
  row: { flexDirection: 'row', alignItems: 'center', paddingHorizontal: 14, paddingVertical: 14 },
  rowIcon: { fontSize: theme.fontSize.lg, marginRight: theme.spacing.sm + 4 },
  rowText: { flex: 1, fontSize: theme.fontSize.sm, color: theme.colors.text },
  check: { fontSize: theme.fontSize.lg, color: theme.colors.primary, fontWeight: '700' },
  divider: { height: 1, backgroundColor: theme.colors.border, marginLeft: 48 },
  logoutBtn: { marginHorizontal: theme.spacing.lg, marginTop: 24, backgroundColor: theme.colors.lightRed, paddingVertical: theme.spacing.md, borderRadius: theme.borderRadius.md, alignItems: 'center', borderWidth: 1, borderColor: theme.colors.lightDanger },
  logoutText: { fontSize: theme.fontSize.sm, color: theme.colors.danger, fontWeight: '600' },
  footer: { textAlign: 'center', fontSize: 11, color: theme.colors.textLight, marginTop: 24 },
});
