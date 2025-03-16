import { createNativeStackNavigator } from "@react-navigation/native-stack";
import IndexScreen from ".";
import OptionsScreen from "./options";
import LoadingScreen from "./loading";

const Stack = createNativeStackNavigator();

export default function RootLayout() {
  return (
      <Stack.Navigator initialRouteName="Index">
        <Stack.Screen name="Index" component={IndexScreen} options={{ headerShown: false }} />
        <Stack.Screen name="Options" component={OptionsScreen} options={{ headerShown: false }} />
        <Stack.Screen name="Loading" component={LoadingScreen} options={{ headerShown: false }} />
      </Stack.Navigator>
  );
}
