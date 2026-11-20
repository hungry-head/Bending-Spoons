import { Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { DevicePreview } from '@/design-system/components';
import { palette } from '@/design-system/theme/tokens';

export default function RootLayout() {
  return <DevicePreview>
    <StatusBar style="dark" />
    <Stack screenOptions={{ headerShown: false, contentStyle: { backgroundColor: palette.canvas }, animation: 'slide_from_right' }}>
      <Stack.Screen name="(tabs)" />
      <Stack.Screen name="trip/[id]" />
      <Stack.Screen name="design-system" />
      <Stack.Screen name="assistant" options={{ animation: 'fade_from_bottom' }} />
    </Stack>
  </DevicePreview>;
}
