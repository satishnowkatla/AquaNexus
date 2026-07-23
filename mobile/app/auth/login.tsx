import { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, TextInput, KeyboardAvoidingView, Platform, ScrollView } from 'react-native';
import { useRouter } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { theme } from '../../utils/theme';

export default function Login() {
  const router = useRouter();
  const [phone, setPhone] = useState('');

  const handleSendOTP = () => {
    if (phone.length === 10) {
      router.push('/auth/otp-verify');
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
            <View style={s.logoBox}>
              <Text style={s.logoText}>🐟</Text>
            </View>
            <Text style={s.title}>AquaNexus AI</Text>
            <Text style={s.subtitle}>Smart Aquaculture Companion</Text>
          </View>

          <View style={s.bottom}>
            <Text style={s.label}>Enter your mobile number</Text>
            <View style={s.phoneRow}>
              <View style={s.countryCode}>
                <Text style={s.codeText}>🇮🇳 +91</Text>
              </View>
              <TextInput
                style={s.phoneInput}
                placeholder="98765 43210"
                placeholderTextColor={theme.colors.textLight}
                keyboardType="phone-pad"
                maxLength={10}
                value={phone}
                onChangeText={setPhone}
                returnKeyType="done"
              />
            </View>

            {phone.length > 0 && phone.length < 10 && (
              <Text style={s.hint}>Please enter a valid 10-digit number</Text>
            )}

            <TouchableOpacity
              style={[s.btn, phone.length !== 10 && s.btnDisabled]}
              onPress={handleSendOTP}
              disabled={phone.length !== 10}
            >
              <Text style={s.btnText}>Continue</Text>
            </TouchableOpacity>

            <Text style={s.terms}>
              By continuing, you agree to our{'\n'}Terms of Service and Privacy Policy
            </Text>
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
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    minHeight: 200,
  },
  logoBox: {
    width: 80,
    height: 80,
    borderRadius: 24,
    backgroundColor: theme.colors.primary + '12',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 20,
  },
  logoText: { fontSize: 36 },
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
  label: {
    fontSize: 13,
    fontWeight: '600',
    color: theme.colors.text,
    marginBottom: 10,
  },
  phoneRow: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: theme.colors.background,
    borderRadius: 14,
    borderWidth: 1.5,
    borderColor: theme.colors.border,
    height: 56,
  },
  countryCode: {
    paddingHorizontal: 14,
    borderRightWidth: 1,
    borderRightColor: theme.colors.border,
    height: '100%',
    justifyContent: 'center',
  },
  codeText: { fontSize: 15, fontWeight: '600', color: theme.colors.text },
  phoneInput: {
    flex: 1,
    fontSize: 17,
    paddingHorizontal: 14,
    color: theme.colors.text,
    fontWeight: '500',
    letterSpacing: 1,
  },
  hint: {
    fontSize: 12,
    color: theme.colors.danger,
    marginTop: 8,
  },
  btn: {
    backgroundColor: theme.colors.primary,
    height: 54,
    borderRadius: 14,
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 20,
  },
  btnDisabled: { opacity: 0.4 },
  btnText: {
    color: '#FFF',
    fontSize: 16,
    fontWeight: '700',
  },
  terms: {
    fontSize: 11,
    color: theme.colors.textLight,
    textAlign: 'center',
    marginTop: 16,
    lineHeight: 18,
  },
});
