import { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, TextInput, KeyboardAvoidingView, Platform, ScrollView } from 'react-native';
import { useRouter } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { theme } from '../../utils/theme';

export default function OTPVerify() {
  const router = useRouter();
  const [otp, setOtp] = useState('');

  const handleVerify = () => {
    if (otp.length === 6) {
      router.replace('/auth/profile-setup');
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
              <Text style={s.icon}>📱</Text>
            </View>
            <Text style={s.title}>Verification</Text>
            <Text style={s.subtitle}>
              Enter the 6-digit code sent to{'\n'}+91 98765 43210
            </Text>
          </View>

          <View style={s.bottom}>
            <TextInput
              style={s.otpInput}
              placeholder="0 0 0 0 0 0"
              placeholderTextColor={theme.colors.textLight}
              keyboardType="number-pad"
              maxLength={6}
              value={otp}
              onChangeText={setOtp}
              textAlign="center"
              returnKeyType="done"
            />

            {otp.length > 0 && otp.length < 6 && (
              <Text style={s.hint}>{6 - otp.length} digits remaining</Text>
            )}

            <TouchableOpacity
              style={[s.btn, otp.length !== 6 && s.btnDisabled]}
              onPress={handleVerify}
              disabled={otp.length !== 6}
            >
              <Text style={s.btnText}>Verify</Text>
            </TouchableOpacity>

            <TouchableOpacity style={s.resend}>
              <Text style={s.resendText}>Resend OTP</Text>
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
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    minHeight: 200,
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
    lineHeight: 22,
  },
  bottom: {},
  otpInput: {
    fontSize: 24,
    fontWeight: '700',
    letterSpacing: 10,
    backgroundColor: theme.colors.background,
    borderRadius: 14,
    borderWidth: 1.5,
    borderColor: theme.colors.border,
    height: 60,
    color: theme.colors.text,
  },
  hint: {
    fontSize: 12,
    color: theme.colors.textLight,
    textAlign: 'center',
    marginTop: 10,
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
  resend: {
    paddingVertical: 16,
    alignItems: 'center',
  },
  resendText: {
    color: theme.colors.primary,
    fontSize: 14,
    fontWeight: '600',
  },
});
