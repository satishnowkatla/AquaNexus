import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { useRouter } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { theme } from '../../utils/theme';
import { STORAGE_KEYS } from '../../utils/constants';

export default function Onboarding() {
  const router = useRouter();

  return (
    <SafeAreaView style={s.safe}>
      <View style={s.container}>
        <View style={s.content}>
          <View style={s.iconBox}>
            <Text style={s.icon}>🐟</Text>
          </View>
          <Text style={s.title}>AquaNexus AI</Text>
          <Text style={s.subtitle}>
            Your smart aquaculture companion.{'\n\n'}
            Disease diagnosis, voice accounting,{'\n'}
            feed optimization, and expert advice —{'\n'}
            all in one app.
          </Text>
        </View>

        <View style={s.buttons}>
          <TouchableOpacity
            style={s.primaryBtn}
            onPress={async () => {
              await AsyncStorage.setItem(STORAGE_KEYS.ONBOARDING_DONE, 'true');
              router.replace('/auth/login');
            }}
          >
            <Text style={s.primaryText}>Get Started</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={s.secondaryBtn}
            onPress={async () => {
              await AsyncStorage.setItem(STORAGE_KEYS.ONBOARDING_DONE, 'true');
              router.replace('/auth/login');
            }}
          >
            <Text style={s.secondaryText}>I already have an account</Text>
          </TouchableOpacity>
        </View>
      </View>
    </SafeAreaView>
  );
}

const s = StyleSheet.create({
  safe: { flex: 1, backgroundColor: '#FFFFFF' },
  container: {
    flex: 1,
    justifyContent: 'space-between',
    paddingHorizontal: 28,
    paddingBottom: 20,
  },
  content: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  iconBox: {
    width: 100,
    height: 100,
    borderRadius: 28,
    backgroundColor: theme.colors.primary + '12',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 28,
  },
  icon: { fontSize: 48 },
  title: {
    fontSize: 30,
    fontWeight: '800',
    color: theme.colors.text,
    textAlign: 'center',
  },
  subtitle: {
    fontSize: 15,
    color: theme.colors.textLight,
    textAlign: 'center',
    marginTop: 16,
    lineHeight: 24,
  },
  buttons: {
    gap: 12,
  },
  primaryBtn: {
    backgroundColor: theme.colors.primary,
    height: 54,
    borderRadius: 14,
    justifyContent: 'center',
    alignItems: 'center',
  },
  primaryText: {
    color: '#FFF',
    fontSize: 16,
    fontWeight: '700',
  },
  secondaryBtn: {
    height: 54,
    borderRadius: 14,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1.5,
    borderColor: theme.colors.border,
  },
  secondaryText: {
    color: theme.colors.text,
    fontSize: 15,
    fontWeight: '600',
  },
});
