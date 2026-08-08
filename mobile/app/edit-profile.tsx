import { useState, useEffect } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, TextInput, ScrollView, KeyboardAvoidingView, Platform, Alert } from 'react-native';
import { useRouter } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { theme } from '../utils/theme';
import { supabase } from '../utils/supabase';
import { SPECIES_LIST, AP_DISTRICTS } from '../utils/constants';
import { saveUser, saveProfile, upsertPond } from '../utils/profileApi';
import { Header } from '../components/shared/Header';
import { Loading } from '../components/ui/Loading';

export default function EditProfileScreen() {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [district, setDistrict] = useState('');
  const [village, setVillage] = useState('');
  const [pincode, setPincode] = useState('');
  const [species, setSpecies] = useState('');
  const [pondSize, setPondSize] = useState('');
  const [experience, setExperience] = useState('');

  useEffect(() => {
    const load = async () => {
      try {
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) return;
        const [userRes, profileRes, pondRes] = await Promise.all([
          supabase.from('users').select('full_name, phone').eq('id', user.id).maybeSingle(),
          supabase.from('profiles').select('*').eq('user_id', user.id).maybeSingle(),
          supabase.from('ponds').select('id, area_acres, species').eq('farmer_id', user.id).order('created_at', { ascending: true }).limit(1).maybeSingle(),
        ]);
        if (userRes.data) {
          setName(userRes.data.full_name || '');
          setPhone(userRes.data.phone || '');
        }
        if (profileRes.data) {
          setDistrict(profileRes.data.district || '');
          setVillage(profileRes.data.village || '');
          setPincode(profileRes.data.pincode || '');
          setSpecies(profileRes.data.primary_species || '');
          setPondSize(profileRes.data.total_pond_area ? String(profileRes.data.total_pond_area) : '');
          setExperience(profileRes.data.years_experience ? String(profileRes.data.years_experience) : '');
        } else if (pondRes.data) {
          setPondSize(pondRes.data.area_acres ? String(pondRes.data.area_acres) : '');
          setSpecies(pondRes.data.species || '');
        }
      } catch (e) {
        // fall back to empty form
      } finally {
        setLoading(false);
      }
    };
    load();
  }, []);

  const canSave = name && district && species && pondSize;

  const handleSave = async () => {
    if (!canSave) return;
    setSaving(true);
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('Not logged in');

      const { error: userError } = await saveUser(user.id, phone, name);
      if (userError) throw userError;

      const { error: profileError } = await saveProfile(user.id, {
        district,
        village,
        pincode,
        primary_species: species,
        total_pond_area: parseFloat(pondSize) || 0,
        years_experience: experience ? parseInt(experience, 10) : null,
      });
      if (profileError) throw profileError;

      const pondRes = await supabase.from('ponds').select('id').eq('farmer_id', user.id).limit(1).maybeSingle();
      const { error: pondError } = await upsertPond(user.id, {
        id: pondRes.data?.id,
        area_acres: parseFloat(pondSize) || 0,
        species,
      });
      if (pondError) throw pondError;

      Alert.alert('Saved', 'Your profile has been updated.', [
        { text: 'OK', onPress: () => router.back() },
      ]);
    } catch (e: any) {
      Alert.alert('Error', e.message || 'Failed to save. Try again.');
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <SafeAreaView style={s.safe} edges={['top']}>
        <Header title="Edit Profile" showBack />
        <Loading message="Loading profile" />
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={s.safe} edges={['top']}>
      <Header title="Edit Profile" showBack />
      <KeyboardAvoidingView
        style={s.flex}
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        keyboardVerticalOffset={Platform.OS === 'ios' ? 0 : 20}
      >
        <ScrollView
          contentContainerStyle={s.scroll}
          keyboardShouldPersistTaps="handled"
          keyboardDismissMode="interactive"
          showsVerticalScrollIndicator={false}
        >
          <View style={s.section}>
            <Text style={s.sectionTitle}>Personal Information</Text>
            <Field label="Full Name *">
              <TextInput
                style={s.input}
                placeholder="Your name"
                placeholderTextColor={theme.colors.textLight}
                value={name}
                onChangeText={setName}
                returnKeyType="next"
              />
            </Field>
            <Field label="Mobile Number">
              <TextInput
                style={[s.input, { color: theme.colors.textLight }]}
                placeholder="Your mobile number"
                placeholderTextColor={theme.colors.textLight}
                value={phone}
                editable={false}
              />
            </Field>
            <Field label="District *">
              <ScrollView horizontal showsHorizontalScrollIndicator={false} style={s.chipRow}>
                {AP_DISTRICTS.map((d) => (
                  <Chip key={d} label={d} active={district === d} onPress={() => setDistrict(d)} />
                ))}
              </ScrollView>
            </Field>
            <Field label="Village">
              <TextInput
                style={s.input}
                placeholder="Your village"
                placeholderTextColor={theme.colors.textLight}
                value={village}
                onChangeText={setVillage}
                returnKeyType="next"
              />
            </Field>
            <View style={s.row}>
              <View style={s.rowCol}>
                <Field label="Pincode">
                  <TextInput
                    style={s.input}
                    placeholder="6 digit"
                    placeholderTextColor={theme.colors.textLight}
                    value={pincode}
                    onChangeText={setPincode}
                    keyboardType="number-pad"
                    maxLength={6}
                  />
                </Field>
              </View>
              <View style={s.rowCol}>
                <Field label="Experience (yrs)">
                  <TextInput
                    style={s.input}
                    placeholder="e.g. 5"
                    placeholderTextColor={theme.colors.textLight}
                    value={experience}
                    onChangeText={setExperience}
                    keyboardType="number-pad"
                  />
                </Field>
              </View>
            </View>
          </View>

          <View style={s.section}>
            <Text style={s.sectionTitle}>Farm Details</Text>
            <Field label="What do you grow? *">
              <ScrollView horizontal showsHorizontalScrollIndicator={false} style={s.chipRow}>
                {SPECIES_LIST.map((sp) => (
                  <Chip key={sp} label={sp} active={species === sp} onPress={() => setSpecies(sp)} />
                ))}
              </ScrollView>
            </Field>
            <Field label="Pond Size (acres) *">
              <TextInput
                style={s.input}
                placeholder="e.g. 2.5"
                placeholderTextColor={theme.colors.textLight}
                value={pondSize}
                onChangeText={setPondSize}
                keyboardType="decimal-pad"
              />
            </Field>
          </View>

          <TouchableOpacity
            style={[s.btn, (!canSave || saving) && s.btnDisabled]}
            onPress={handleSave}
            disabled={!canSave || saving}
          >
            <Text style={s.btnText}>{saving ? 'Saving...' : 'Save Changes'}</Text>
          </TouchableOpacity>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

function Chip({ label, active, onPress }: { label: string; active: boolean; onPress: () => void }) {
  return (
    <TouchableOpacity
      style={[s.chip, active && s.chipActive]}
      onPress={onPress}
      activeOpacity={0.8}
    >
      <Text style={[s.chipText, active && s.chipTextActive]}>{label}</Text>
    </TouchableOpacity>
  );
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <View style={{ marginBottom: 16 }}>
      <Text style={s.label}>{label}</Text>
      {children}
    </View>
  );
}

const s = StyleSheet.create({
  safe: { flex: 1, backgroundColor: '#FFFFFF' },
  flex: { flex: 1 },
  scroll: {
    flexGrow: 1,
    paddingHorizontal: 28,
    paddingTop: 8,
    paddingBottom: 32,
  },
  section: {
    backgroundColor: theme.colors.card,
    borderRadius: theme.borderRadius.md,
    borderWidth: 1,
    borderColor: theme.colors.border,
    paddingHorizontal: 16,
    paddingTop: 14,
    marginBottom: theme.spacing.md,
  },
  sectionTitle: {
    fontSize: 13,
    fontWeight: '700',
    color: theme.colors.primary,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
    marginBottom: 12,
  },
  label: {
    fontSize: 13,
    fontWeight: '600',
    color: theme.colors.text,
    marginBottom: 8,
  },
  input: {
    backgroundColor: theme.colors.background,
    borderRadius: 14,
    borderWidth: 1.5,
    borderColor: theme.colors.border,
    height: 54,
    paddingHorizontal: 16,
    fontSize: 15,
    color: theme.colors.text,
  },
  row: { flexDirection: 'row' },
  rowCol: { flex: 1, marginRight: 10 },
  chipRow: { flexDirection: 'row' },
  chip: {
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 20,
    backgroundColor: theme.colors.background,
    marginRight: 8,
    borderWidth: 1.5,
    borderColor: theme.colors.border,
    marginBottom: 8,
  },
  chipActive: {
    backgroundColor: theme.colors.primary,
    borderColor: theme.colors.primary,
  },
  chipText: {
    fontSize: 13,
    fontWeight: '500',
    color: theme.colors.text,
  },
  chipTextActive: {
    color: '#FFF',
    fontWeight: '600',
  },
  btn: {
    backgroundColor: theme.colors.primary,
    height: 54,
    borderRadius: 14,
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 6,
  },
  btnDisabled: { opacity: 0.4 },
  btnText: {
    color: '#FFF',
    fontSize: 16,
    fontWeight: '700',
  },
});
