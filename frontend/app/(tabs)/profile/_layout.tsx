import { Stack } from 'expo-router';
import { MenuProvider } from 'react-native-popup-menu';

export default function RootLayout() {
  return (
    <Stack>
      <Stack.Screen name="index" options={{ headerShown: false }} />
      <Stack.Screen name="likedArtists" options={{ headerShown: false }} />
      <Stack.Screen name="dislikedArtists" options={{ headerShown: false }} />
      <Stack.Screen name="likedSongs" options={{ headerShown: false }} />
      <Stack.Screen name="dislikedSongs" options={{ headerShown: false }} />
      <Stack.Screen name="addArtists" options={{ headerShown: false }} />
    </Stack>
  );
}