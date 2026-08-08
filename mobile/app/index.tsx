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
      const onboarded = await AsyncStorage.getItem(STORAGE_KEYS.ONBOARDING_DONE);

      if (session && !session.user.is_anonymous) {
        const userId = session.user.id;
        const { data: profile } = await supabase
          .from('profiles')
          .select('user_id')
          .eq('user_id', userId)
          .maybeSingle();

        if (profile) {
          router.replace('/(tabs)/home');
          return;
        }
        router.replace({ pathname: '/auth/profile-setup', params: { phone: session.user.phone || '' } });
        return;
      }

      if (session?.user.is_anonymous) {
        await supabase.auth.signOut();
      }

      router.replace(onboarded ? '/auth/login' : '/onboarding');
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
