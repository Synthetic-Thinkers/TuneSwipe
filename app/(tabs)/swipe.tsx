import React from 'react';
import { Text, View, StyleSheet } from 'react-native';
import { useFonts, Inter_400Regular, Inter_800ExtraBold } from '@expo-google-fonts/inter';

export default function SwipeScreen() {
  const [fontsLoaded] = useFonts({
    Inter_400Regular, // Regular Weight
    Inter_800ExtraBold, // Extra Bold Weight
  });

  if (!fontsLoaded) {
    // Show loading text until fonts are loaded
    return <Text>Loading...</Text>;
  }
  return (
    <View style = {styles.container}>
      <Text style = {styles.text}>Select Your Choice:</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#ffffff',
    justifyContent: 'center',
    alignItems: 'center',
  },
  text: {
    color: '#00000',
    fontFamily: 'Inter_400Regular'
  },
  Logotext: {
    color: '#00000',
    fontFamily: 'Inter_800ExtraBold',
    fontSize: 24,
  },
});
