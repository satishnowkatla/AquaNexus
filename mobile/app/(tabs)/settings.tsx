import { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Switch, Alert } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { theme } from '../../utils/theme';

export default function SettingsScreen() {
  const router = useRouter();
  const [notif, setNotif] = useState(true);
  const [dark, setDark] = useState(false);
  const [lang, setLang] = useState<'en' | 'te' | 'hi'>('en');

  const logout = () => {
    Alert.alert('Logout', 'Are you sure you want to logout?', [
      { text: 'Cancel', style: 'cancel' },
      { text: 'Logout', style: 'destructive', onPress: () => router.replace('/onboarding') },
    ]);
  };

  return (
    <SafeAreaView style={s.safe} edges={['top']}>
      <View style={s.header}>
        <TouchableOpacity onPress={() => router.back()} style={s.backBtn}>
          <Text style={s.backArrow}>←</Text>
        </TouchableOpacity>
        <Text style={s.headerTitle}>Settings</Text>
        <View style={{ width: 40 }} />
      </View>

      <ScrollView contentContainerStyle={s.scroll} showsVerticalScrollIndicator={false}>
        <View style={s.profile}>
          <View style={s.avatar}><Text style={s.avatarText}>RK</Text></View>
          <Text style={s.name}>Ravi Kumar</Text>
          <Text style={s.phone}>+91 98765 43210</Text>
          <TouchableOpacity style={s.editBtn}><Text style={s.editText}>Edit Profile</Text></TouchableOpacity>
        </View>

        <Text style={s.groupLabel}>Account</Text>
        <View style={s.group}>
          <Row icon="👤" text="Personal Information" />
          <Row icon="📍" text="My Ponds" />
          <Row icon="📊" text="Transaction History" />
        </View>

        <Text style={s.groupLabel}>Preferences</Text>
        <View style={s.group}>
          <View style={s.row}>
            <Text style={s.icon}>🔔</Text>
            <Text style={s.rowText}>Notifications</Text>
            <Switch value={notif} onValueChange={setNotif} trackColor={{ false: '#CCC', true: theme.colors.primary + '60' }} thumbColor={notif ? theme.colors.primary : '#FFF'} />
          </View>
          <View style={s.divider} />
          <View style={s.row}>
            <Text style={s.icon}>🌙</Text>
            <Text style={s.rowText}>Dark Mode</Text>
            <Switch value={dark} onValueChange={setDark} trackColor={{ false: '#CCC', true: theme.colors.primary + '60' }} thumbColor={dark ? theme.colors.primary : '#FFF'} />
          </View>
        </View>

        <Text style={s.groupLabel}>Language</Text>
        <View style={s.group}>
          {([['en', 'English'], ['te', 'తెలుగు (Telugu)'], ['hi', 'हिन्दी (Hindi)']] as const).map(([code, label], i) => (
            <TouchableOpacity key={code} style={[s.row, i < 2 && { borderBottomWidth: 1, borderBottomColor: theme.colors.border }]} onPress={() => setLang(code)}>
              <Text style={s.rowText}>{label}</Text>
              {lang === code && <Text style={s.check}>✓</Text>}
            </TouchableOpacity>
          ))}
        </View>

        <Text style={s.groupLabel}>About</Text>
        <View style={s.group}>
          <Row icon="ℹ️" text="About AquaNexus" />
          <Row icon="📋" text="Version" value="1.0.0" />
        </View>

        <TouchableOpacity style={s.logoutBtn} onPress={logout}>
          <Text style={s.logoutText}>Logout</Text>
        </TouchableOpacity>

        <Text style={s.footer}>AquaNexus AI — B.Tech Final Year Project</Text>
      </ScrollView>
    </SafeAreaView>
  );
}

function Row({ icon, text, value }: { icon: string; text: string; value?: string }) {
  return (
    <View style={rS.row}>
      <Text style={rS.icon}>{icon}</Text>
      <Text style={rS.text}>{text}</Text>
      {value ? <Text style={rS.value}>{value}</Text> : <Text style={rS.arrow}>›</Text>}
    </View>
  );
}

const rS = StyleSheet.create({
  row: { flexDirection: 'row', alignItems: 'center', paddingHorizontal: 14, paddingVertical: 14, borderBottomWidth: 1, borderBottomColor: '#F0F0F0' },
  icon: { fontSize: 18, marginRight: 12 },
  text: { flex: 1, fontSize: 14, color: theme.colors.text },
  arrow: { fontSize: 18, color: theme.colors.textLight },
  value: { fontSize: 13, color: theme.colors.textLight },
});

const s = StyleSheet.create({
  safe: { flex: 1, backgroundColor: theme.colors.background },
  header: {
    backgroundColor: theme.colors.primary,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingTop: 20,
    paddingBottom: 16,
    paddingHorizontal: 12,
  },
  backBtn: { width: 40, height: 40, justifyContent: 'center', alignItems: 'center' },
  backArrow: { color: '#FFF', fontSize: 24, fontWeight: '600' },
  headerTitle: { color: '#FFF', fontSize: 18, fontWeight: '700' },
  scroll: { paddingBottom: 40 },
  profile: { backgroundColor: theme.colors.card, alignItems: 'center', paddingVertical: 24, borderBottomWidth: 1, borderBottomColor: theme.colors.border },
  avatar: { width: 72, height: 72, borderRadius: 36, backgroundColor: theme.colors.primary + '20', justifyContent: 'center', alignItems: 'center', marginBottom: 10 },
  avatarText: { fontSize: 24, fontWeight: '700', color: theme.colors.primary },
  name: { fontSize: 16, fontWeight: '700', color: theme.colors.text },
  phone: { fontSize: 13, color: theme.colors.textLight, marginTop: 4 },
  editBtn: { marginTop: 10, paddingHorizontal: 20, paddingVertical: 6, borderRadius: 20, borderWidth: 1, borderColor: theme.colors.primary },
  editText: { fontSize: 12, color: theme.colors.primary, fontWeight: '600' },
  groupLabel: { fontSize: 11, fontWeight: '600', color: theme.colors.textLight, textTransform: 'uppercase', letterSpacing: 1, paddingHorizontal: theme.spacing.lg, paddingTop: 20, paddingBottom: 8 },
  group: { backgroundColor: theme.colors.card, marginHorizontal: theme.spacing.lg, borderRadius: 10, borderWidth: 1, borderColor: theme.colors.border, overflow: 'hidden' },
  row: { flexDirection: 'row', alignItems: 'center', paddingHorizontal: 14, paddingVertical: 14 },
  icon: { fontSize: 18, marginRight: 12 },
  rowText: { flex: 1, fontSize: 14, color: theme.colors.text },
  check: { fontSize: 18, color: theme.colors.primary, fontWeight: '700' },
  divider: { height: 1, backgroundColor: theme.colors.border, marginLeft: 48 },
  logoutBtn: { marginHorizontal: theme.spacing.lg, marginTop: 24, backgroundColor: '#FDEDEC', paddingVertical: 14, borderRadius: 10, alignItems: 'center', borderWidth: 1, borderColor: '#F5C6CB' },
  logoutText: { fontSize: 14, color: theme.colors.danger, fontWeight: '600' },
  footer: { textAlign: 'center', fontSize: 11, color: theme.colors.textLight, marginTop: 24 },
});
