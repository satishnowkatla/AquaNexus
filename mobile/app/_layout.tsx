import { Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';

export default function RootLayout() {
  return (
    <>
      <StatusBar style="light" />
      <Stack screenOptions={{ headerShown: false }}>
        <Stack.Screen name="index" />
        <Stack.Screen name="onboarding" />
        <Stack.Screen name="auth" />
        <Stack.Screen name="(tabs)" />
        <Stack.Screen name="aquadoc" />
        <Stack.Screen name="aquavoice" />
        <Stack.Screen name="aquaadvisor" />
        <Stack.Screen name="aquafeed" />
        <Stack.Screen name="aquaconnect" />
      </Stack>
    </>
  );
}
