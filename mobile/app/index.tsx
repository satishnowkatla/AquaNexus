import { useEffect } from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { useRouter } from 'expo-router';
import { theme } from '../utils/theme';
import { supabase } from '../utils/supabase';

export default function Index() {
  const router = useRouter();

  useEffect(() => {
    const init = async () => {
      try {
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) {
          await supabase.auth.signInAnonymously();
        }
      } catch {}
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
