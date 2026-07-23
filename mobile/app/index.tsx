import { useEffect } from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { useRouter } from 'expo-router';
import { theme } from '../utils/theme';
import { supabase } from '../utils/supabase';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { STORAGE_KEYS } from '../utils/constants';

export default function Index() {
  const router = useRouter();

  useEffect(() => {
    const init = async () => {
      const [session, onboardingDone] = await Promise.all([
        supabase.auth.getSession(),
        AsyncStorage.getItem(STORAGE_KEYS.ONBOARDING_DONE),
      ]);

      await new Promise(r => setTimeout(r, 2000));

      if (session.data.session) {
        router.replace('/(tabs)/home');
      } else if (onboardingDone) {
        router.replace('/auth/login');
      } else {
        router.replace('/onboarding');
      }
    };
    init();
  }, []);

  return (
    <View style={styles.container}>
      <Text style={styles.logo}>AquaNexus</Text>
      <Text style={styles.tagline}>AI-Powered Aquaculture</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: theme.colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
  },
  logo: {
    fontSize: theme.fontSize.xxl,
    fontWeight: 'bold',
    color: '#FFFFFF',
  },
  tagline: {
    fontSize: theme.fontSize.md,
    color: '#FFFFFF',
    marginTop: theme.spacing.sm,
  },
});
