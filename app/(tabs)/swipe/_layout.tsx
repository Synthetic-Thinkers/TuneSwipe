import { Stack } from 'expo-router';

export default function SwipeLayout() {
  return (
    <Stack>
      <Stack.Screen name='index' options={{ headerShown: false }} />
      <Stack.Screen name='swipe' options={{ headerShown: false }} />
    </Stack>
  )
}
