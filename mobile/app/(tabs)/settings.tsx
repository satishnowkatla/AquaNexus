import { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Switch, Alert } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { theme } from '../../utils/theme';
import { LANGUAGE_OPTIONS, APP_VERSION, APP_TAGLINE } from '../../utils/mockData';
import { tokenStore } from '../../utils/api';

export default function SettingsScreen() {
  const router = useRouter();
  const [notif, setNotif] = useState(true);
  const [dark, setDark] = useState(false);
  const [lang, setLang] = useState<'en' | 'te' | 'hi'>('en');

  const logout = () => {
    Alert.alert('Logout', 'Are you sure you want to logout?', [
      { text: 'Cancel', style: 'cancel' },
      { text: 'Logout', style: 'destructive', onPress: async () => { await tokenStore.clear(); router.replace('/onboarding'); } },
    ]);
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
          <Row icon="ℹ️" text="About AquaNexus" />
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
