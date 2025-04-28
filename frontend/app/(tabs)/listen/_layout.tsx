import { Stack } from 'expo-router';

export default function ListenLayout() {
  return (
    <Stack>
      <Stack.Screen name="listen" options={{ headerShown: false }} />
    </Stack>
  );
}