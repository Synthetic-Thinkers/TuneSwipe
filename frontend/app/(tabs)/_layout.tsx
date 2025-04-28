import { Tabs } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import { StyleSheet, Text, View } from "react-native";
import { useFonts, Inter_800ExtraBold } from '@expo-google-fonts/inter';
import { LinearGradient } from 'expo-linear-gradient';
import MaskedView from '@react-native-masked-view/masked-view';
import { StatusBar, Platform } from "react-native";

export default function TabLayout() {

  // Load the Inter font
  const [fontsLoaded] = useFonts({
      Inter_800ExtraBold, // Extra Bold Weight
    });

    if (!fontsLoaded) {
      // Show loading text until fonts are loaded
      return <View><Text>Loading...</Text></View>;
    }
  return (
    <>
      {/* Changing the status bar text color on IOS from white to black */}
      <StatusBar
        barStyle={Platform.OS === 'ios' ? 'dark-content' : 'default'}
      />
      <Tabs
        screenOptions={{
          tabBarActiveTintColor: '#FF006E',
          tabBarInactiveTintColor: '#00000',
          tabBarStyle: {
            backgroundColor: '#D9D9D9',
            borderTopLeftRadius: 20,
            borderTopRightRadius: 20,
            height: 74,
            paddingBottom: 5,
          }
        }}
      >
        <Tabs.Screen
          name='swipe'
          options={{
            headerTitle: () => <CustomerHeader />,
            title: 'Swipe',
            tabBarIcon: ({ color, focused }) => (
              <Ionicons name={focused ? 'swap-horizontal' : 'swap-horizontal-outline'} color={color} size={24}/>
            ),
          }}
        />
        <Tabs.Screen
          name='listen'
          options={{
            headerTitle: () => <CustomerHeader />,
            title: 'Listen',
            tabBarIcon: ({ color, focused }) => (
              <Ionicons name={focused ? 'musical-notes' : 'musical-notes-outline'} color={color} size={24} />
            ),
          }}
        />
         <Tabs.Screen
          name='library'
          options={{
            headerTitle: () => <CustomerHeader />,
            title: 'Library',
            tabBarIcon: ({ color, focused }) => (
              <Ionicons name={focused ? 'heart-sharp' : 'heart-outline'} color={color} size={24}/>
            ),
          }}
        />
         <Tabs.Screen
          name='profile'
          options={{
            headerTitle: () => <CustomerHeader />,
            title: 'Profile',
            tabBarIcon: ({ color, focused }) => (
              <Ionicons name={focused ? 'person-circle' : 'person-circle-outline'} color={color} size={24}/>
            ),
          }}
        />
      </Tabs>
    </>
  );
}

const CustomerHeader = () => (
  <View style={styles.container}>
        <MaskedView
          style={styles.maskedView}
          maskElement={
            <Text style={styles.logoText}>TuneSwipe</Text>
          }
        >
          <LinearGradient
            colors={['#8338EC', '#FF006E', '#3A86FF', '#98F5E1']} // Gradient colors
            style={styles.gradient} // Style for the container
            start={{ x: 0, y: 0.5 }} // Start from left
            end={{ x: 1, y: 0.5 }} // End at right
            locations={[ 0, 0.5, 0.75, 1]}
          />
        </MaskedView>
    </View>
)

const styles = StyleSheet.create({
  container: {
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#transparent",
    alignSelf: 'flex-start',
    width: 135,
    height: 40,
  },
  maskedView: {
    flexDirection: 'row',
    width: '100%',
    height: '100%',
  },
  logoText: {
    fontSize: 24,
    fontFamily: 'Inter_800ExtraBold',
    backgroundClip: 'text',
    textAlign: 'center',
  },
  gradient: {
    flex: 1,
  },
})
