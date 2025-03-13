import { Stack } from 'expo-router';
import { MenuProvider } from 'react-native-popup-menu';

export default function RootLayout() {
  return (
    <MenuProvider>
      <Stack>
        <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
        <Stack.Screen name="+not-found" />
      </Stack>
    </MenuProvider>
  );
}
