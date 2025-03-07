import { createNativeStackNavigator } from "@react-navigation/native-stack";
import IndexScreen from ".";
import OptionsScreen from "./options";
import LoadingScreen from "./loading";
import SwipeScreen from "./swipe";
import PlaylistLoadingScreen from "./playlistLoading";
import PlaylistScreen from "./playlist";
import PlaylistPreview from "./playlistPreview";

const Stack = createNativeStackNavigator();

export default function RootLayout() {
  return (
      <Stack.Navigator initialRouteName="Index">
        <Stack.Screen name="Index" component={IndexScreen} options={{ headerShown: false }} />
        <Stack.Screen name="Options" component={OptionsScreen} options={{ headerShown: false }} />
        <Stack.Screen name="Loading" component={LoadingScreen} options={{ headerShown: false }} />
        <Stack.Screen name="Swipe" component={SwipeScreen} options={{ headerShown: false }} />
        <Stack.Screen name="PlaylistLoading" component={PlaylistLoadingScreen} options={{ headerShown: false }} />
        <Stack.Screen name="Playlist" component={PlaylistScreen} options={{ headerShown: false }} />
        <Stack.Screen name="PlaylistPreview" component={PlaylistPreview} options={{ headerShown: false }} />
      </Stack.Navigator>
  );
}
