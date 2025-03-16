import { Tabs } from "expo-router";
import { Ionicons } from "@expo/vector-icons";

export default function TabLayout() {
  return (
    <Tabs
      screenOptions={{
        tabBarActiveTintColor: '#FF006E',
        headerShown: false
      }}
    >
      <Tabs.Screen
        name='swipe'
        options={{
          title: 'Swipe',
          tabBarIcon: ({ color, focused }) => (
            <Ionicons name={focused ? 'swap-horizontal' : 'swap-horizontal-outline'} color={color} size={24}/>
          ),
        }}
      />
      <Tabs.Screen
        name='index'
        options={{
          title: 'Listen',
          tabBarIcon: ({ color, focused }) => (
            <Ionicons name={focused ? 'musical-notes' : 'musical-notes-outline'} color={color} size={24} />
          ),
        }}
      />
       <Tabs.Screen
        name='library'
        options={{
          title: 'Library',
          tabBarIcon: ({ color, focused }) => (
            <Ionicons name={focused ? 'heart-sharp' : 'heart-outline'} color={color} size={24}/>
          ),
        }}
      />
       <Tabs.Screen
        name='profile'
        options={{
          title: 'Profile',
          tabBarIcon: ({ color, focused }) => (
            <Ionicons name={focused ? 'person-circle' : 'person-circle-outline'} color={color} size={24}/>
          ),
        }}
      />
    </Tabs>
  );
}
