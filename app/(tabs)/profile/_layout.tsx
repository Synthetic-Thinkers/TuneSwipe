import { Stack } from 'expo-router';

export default function RootLayout() {
  return (
    <Stack>
      <Stack.Screen name="index" options={{ headerShown: false }} />
      <Stack.Screen name="likedArtists" options={{ headerShown: false }} />
      <Stack.Screen name="dislikedArtists" options={{ headerShown: false }} />
      <Stack.Screen name="likedSongs" options={{ headerShown: false }} />
      <Stack.Screen name="dislikedSongs" options={{ headerShown: false }} />
    </Stack>
  );
}