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
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) {
        await supabase.auth.signInAnonymously();
      }
      await new Promise(r => setTimeout(r, 2000));

      // TODO: Re-enable auth check before final submission
      router.replace('/(tabs)/home');
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
