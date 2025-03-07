import React, { useEffect } from "react";
import { Image, StyleSheet, Text, View } from "react-native";
import { useFonts, Inter_800ExtraBold } from "@expo-google-fonts/inter";
import { useNavigation } from "expo-router";
import likedData from "./swipe";

export default function PlaylistLoadingScreen({ navigation }) {

  useEffect(() => {
    // Simulate loading (e.g., checking backend or async storage)
    setTimeout(() => {
      navigation.replace("Playlist"); // Replace ensures user can't go back to loading screen
    }, 3000); // Simulate 3-second loading time
  }, []);

  const [fontsLoaded] = useFonts({
      Inter_800ExtraBold,
    });

    if (!fontsLoaded) {
      // Show loading text until fonts are loaded
      return <Text>Loading...</Text>;
  }


  return (
    <View style={styles.container}>
      <Text style={styles.text}>Getting your playlist ready... just a few beats away!</Text>
      <Image style={styles.turntableIcon} source={require('../../../assets/images/turntable.gif')} />
    </View>
  );
}

const styles = StyleSheet.create ({
  container: {
    flex: 1,
    backgroundColor: '#ffffff',
    justifyContent: 'center',
    alignItems: 'center',
    alignContent: 'center',
  },
  text: {
    fontFamily: 'Inter_800ExtraBold',
    fontSize: 24,
    color: '#00000',
    textAlign: 'center',
  },
  turntableIcon: {
    flex: 1,
    width: 100,
    maxHeight: 102,
    resizeMode: 'contain',
  }
})
