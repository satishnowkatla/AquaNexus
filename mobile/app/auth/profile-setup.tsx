import { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, TextInput, ScrollView, KeyboardAvoidingView, Platform, Alert } from 'react-native';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { theme } from '../../utils/theme';
import { supabase } from '../../utils/supabase';
import { SPECIES_LIST } from '../../utils/constants';

export default function ProfileSetup() {
  const router = useRouter();
  const { phone } = useLocalSearchParams<{ phone: string }>();
  const [name, setName] = useState('');
  const [district, setDistrict] = useState('');
  const [village, setVillage] = useState('');
  const [species, setSpecies] = useState('');
  const [loading, setLoading] = useState(false);

  const canSubmit = name && district && species;

  const handleComplete = async () => {
    if (!canSubmit || !phone) return;
    setLoading(true);
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('Not logged in');

      const { error: userError } = await supabase
        .from('users')
        .upsert({ id: user.id, phone, full_name: name }, { onConflict: 'id' });
      if (userError) throw userError;

      const { error: profileError } = await supabase
        .from('profiles')
        .upsert({ user_id: user.id, district, village, primary_species: species }, { onConflict: 'user_id' });
      if (profileError) throw profileError;

      router.replace('/(tabs)/home');
    } catch (e: any) {
      Alert.alert('Error', e.message || 'Registration failed. Try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <SafeAreaView style={s.safe}>
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
          <View style={s.top}>
            <View style={s.iconBox}>
              <Text style={s.icon}>👤</Text>
            </View>
            <Text style={s.title}>Setup Profile</Text>
            <Text style={s.subtitle}>Tell us about your farm</Text>
          </View>

          <View style={s.bottom}>
            <Field label="Full Name *">
              <TextInput
                style={s.input}
                placeholder="Enter your name"
                placeholderTextColor={theme.colors.textLight}
                value={name}
                onChangeText={setName}
                returnKeyType="next"
              />
            </Field>

            <Field label="District *">
              <TextInput
                style={s.input}
                placeholder="e.g. East Godavari"
                placeholderTextColor={theme.colors.textLight}
                value={district}
                onChangeText={setDistrict}
                returnKeyType="next"
              />
            </Field>

            <Field label="Village">
              <TextInput
                style={s.input}
                placeholder="Enter your village"
                placeholderTextColor={theme.colors.textLight}
                value={village}
                onChangeText={setVillage}
                returnKeyType="next"
              />
            </Field>

            <Field label="Primary Species *">
              <ScrollView horizontal showsHorizontalScrollIndicator={false} style={s.chipRow}>
                {SPECIES_LIST.map((sp) => (
                  <TouchableOpacity
                    key={sp}
                    style={[s.chip, species === sp && s.chipActive]}
                    onPress={() => setSpecies(sp)}
                  >
                    <Text style={[s.chipText, species === sp && s.chipTextActive]}>{sp}</Text>
                  </TouchableOpacity>
                ))}
              </ScrollView>
            </Field>

            <TouchableOpacity
              style={[s.btn, (!canSubmit || loading) && s.btnDisabled]}
              onPress={handleComplete}
              disabled={!canSubmit || loading}
            >
              <Text style={s.btnText}>{loading ? 'Setting up...' : 'Complete Setup'}</Text>
            </TouchableOpacity>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <View style={{ marginBottom: 16 }}>
      <Text style={{ fontSize: 13, fontWeight: '600', color: theme.colors.text, marginBottom: 8 }}>{label}</Text>
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
    paddingBottom: 20,
  },
  top: {
    paddingTop: 30,
    paddingBottom: 24,
    alignItems: 'center',
  },
  iconBox: {
    width: 80,
    height: 80,
    borderRadius: 24,
    backgroundColor: theme.colors.primary + '12',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 20,
  },
  icon: { fontSize: 36 },
  title: {
    fontSize: 28,
    fontWeight: '800',
    color: theme.colors.text,
    textAlign: 'center',
  },
  subtitle: {
    fontSize: 15,
    color: theme.colors.textLight,
    textAlign: 'center',
    marginTop: 8,
  },
  bottom: {},
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
  chipRow: {
    flexDirection: 'row',
  },
  chip: {
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 20,
    backgroundColor: theme.colors.background,
    marginRight: 8,
    borderWidth: 1.5,
    borderColor: theme.colors.border,
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
    marginTop: 10,
  },
  btnDisabled: { opacity: 0.4 },
  btnText: {
    color: '#FFF',
    fontSize: 16,
    fontWeight: '700',
  },
});
