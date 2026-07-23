import { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, TextInput, ScrollView, KeyboardAvoidingView, Platform } from 'react-native';
import { useRouter } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { theme } from '../../utils/theme';

export default function ProfileSetup() {
  const router = useRouter();
  const [name, setName] = useState('');
  const [district, setDistrict] = useState('');
  const [village, setVillage] = useState('');
  const [species, setSpecies] = useState('');

  const canSubmit = name && district && species;

  const handleComplete = () => {
    if (canSubmit) {
      router.replace('/(tabs)/home');
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
            <View style={s.field}>
              <Text style={s.label}>Full Name *</Text>
              <TextInput
                style={s.input}
                placeholder="Enter your name"
                placeholderTextColor={theme.colors.textLight}
                value={name}
                onChangeText={setName}
                returnKeyType="next"
              />
            </View>

            <View style={s.field}>
              <Text style={s.label}>District *</Text>
              <TextInput
                style={s.input}
                placeholder="e.g. East Godavari"
                placeholderTextColor={theme.colors.textLight}
                value={district}
                onChangeText={setDistrict}
                returnKeyType="next"
              />
            </View>

            <View style={s.field}>
              <Text style={s.label}>Village</Text>
              <TextInput
                style={s.input}
                placeholder="Enter your village"
                placeholderTextColor={theme.colors.textLight}
                value={village}
                onChangeText={setVillage}
                returnKeyType="next"
              />
            </View>

            <View style={s.field}>
              <Text style={s.label}>Primary Species *</Text>
              <TextInput
                style={s.input}
                placeholder="e.g. Shrimp, Rohu, Catla"
                placeholderTextColor={theme.colors.textLight}
                value={species}
                onChangeText={setSpecies}
                returnKeyType="done"
              />
            </View>

            <TouchableOpacity
              style={[s.btn, !canSubmit && s.btnDisabled]}
              onPress={handleComplete}
              disabled={!canSubmit}
            >
              <Text style={s.btnText}>Complete Setup</Text>
            </TouchableOpacity>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
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
  field: {
    marginBottom: 16,
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
