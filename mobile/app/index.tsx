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
      const { data: { user }, error } = await supabase.auth.signInAnonymously();
      console.log('Anonymous sign-in:', user ? 'OK ' + user.id.slice(0, 8) : 'FAILED', error?.message || '');
      await new Promise(r => setTimeout(r, 2000));
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
