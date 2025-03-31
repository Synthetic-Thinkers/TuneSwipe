import { createNativeStackNavigator } from "@react-navigation/native-stack";
import IndexScreen from ".";
import OptionsScreen from "./options";
import SwipeScreen from "./swipe";
import PlaylistLoadingScreen from "./playlistLoading";

const Stack = createNativeStackNavigator();

export default function RootLayout() {
  return (
      <Stack.Navigator initialRouteName="Index">
        <Stack.Screen name="Index" component={IndexScreen} options={{ headerShown: false }} />
        <Stack.Screen name="Options" component={OptionsScreen} options={{ headerShown: false }} />
        <Stack.Screen name="Swipe" component={SwipeScreen} options={{ headerShown: false }} />
        <Stack.Screen name="PlaylistLoading" component={PlaylistLoadingScreen} options={{ headerShown: false }} />
      </Stack.Navigator>
  );
}
