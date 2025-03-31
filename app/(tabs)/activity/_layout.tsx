import { Stack } from 'expo-router';

export default function ActivityLayout() {
  return (
    <Stack>
      <Stack.Screen name="activity" options={{ headerShown: false }} />
    </Stack>
  );
}