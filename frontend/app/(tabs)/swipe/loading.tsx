import React, { useEffect } from "react";
import { Image, StyleSheet, Text, View } from "react-native";
import { useFonts, Inter_800ExtraBold } from "@expo-google-fonts/inter";
import { useRoute } from '@react-navigation/native';

type ActivityLog = {
  id: string;
  mode: string;
  playlistId: string;
  swipeResults: Array<{
    id: string;
    liked: boolean;
  }>;
  timestamp: string;
};

type RouteParams = {
  spotifyID: string;
  mode: string;
  activityLog: ActivityLog;
};

export default function LoadingScreen({ navigation }) {
  const route = useRoute();

  const { spotifyID, mode, activityLog } = route.params as RouteParams;

  useEffect(() => {
    setTimeout(() => {
    }, 3000); // 3-second loading time
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
      <Text style={styles.text}>Loading your next vibe check... almost there!</Text>
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
