import React, { useState } from "react";
import {Image, StyleSheet, Text, View, TouchableHighlight, ActivityIndicator} from "react-native";
import { useFonts, Inter_400Regular, Inter_500Medium, Inter_600SemiBold, Inter_700Bold, Inter_800ExtraBold } from "@expo-google-fonts/inter";
import { LinearGradient } from 'expo-linear-gradient';
import { useRoute } from '@react-navigation/native';
import { useRouter } from 'expo-router';

type Playlist = {
  playlistName: string;
  playlistCover: string;
};

export default function PlaylistPreview( navigation ) {
  const route = useRoute();
  const router = useRouter();
  const { playlistName, playlistCover } = route.params as Playlist || {};
  const [gifLoaded, setGifLoaded] = useState(false);
  const [gifError, setGifError] = useState(false);

  const [fontsLoaded] = useFonts({
      Inter_400Regular,
      Inter_500Medium,
      Inter_600SemiBold,
      Inter_700Bold,
      Inter_800ExtraBold,
  });

  const onPressListen = () => {
    console.log('You are now listening to your new playlist!');
    router.push('/(tabs)');
  };

  const onPressView = () => {
    console.log('You are now viewing your new playlist!');
    router.push('/(tabs)/library');
  };

  if (!fontsLoaded) {
      return (
        <View style={styles.loadingContainer}>
          <Text style={styles.text}>Loading your next vibe check... almost there!</Text>
          {!gifLoaded && <ActivityIndicator size="large" color="#fff" style={{ marginBottom: 20 }} />}

          {gifError ? (
            <Image
              style={styles.turntableIcon}
              source={require('../../../assets/images/TurnTable.png')}
            />
          ) : (
            <Image
              style={styles.turntableIcon}
              source={{ uri: 'https://ierqhxlamotfahrwcsdz.supabase.co/storage/v1/object/public/assests//turntable.gif' }}
              onLoad={() => setGifLoaded(true)}
              onError={() => {
                setGifLoaded(true);
                setGifError(true);
              }}
            />
          )}
        </View>
      );
    }

  return (
    <View style={styles.container}>
      <Text style={styles.text}>Hit play and dive into your</Text><Text style={styles.text}>freshly curated playlist!</Text>
      <View style={styles.shadowContainer}>
        <Image source={{ uri: playlistCover }} style={styles.coverImage} />
      </View>
      <Text style={styles.playlistName}>{playlistName || 'Playlist Name'}</Text>
      <View style={styles.buttonContainer}>
        <TouchableHighlight style={styles.button} onPress={onPressListen} underlayColor='#70A7FF'>
          <LinearGradient
            colors={['#3A86FF', '#FF1493', '#A134BE']}
            start={{ x: 0, y: 0 }} // Gradient starts from top-left
            end={{ x: 1, y: 1 }} // Gradient ends at bottom-right
            style={styles.gradientBackground}
            locations={[ 0, 0.5, 1]}
          >
            <Text style={styles.buttonText}>Listen Now</Text>
          </LinearGradient>
        </TouchableHighlight>
        <TouchableHighlight style={styles.button} onPress={onPressView} underlayColor='#808080'>
            <Text style={styles.buttonText}>View Playlist</Text>
        </TouchableHighlight>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: '#ffff',
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  buttonContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
  },
  text: {
    fontFamily: 'Inter_500Medium',
    fontSize: 20,
    color: 'black',
  },
  playlistName: {
    fontFamily: 'Inter_600SemiBold',
    fontSize: 20,
    color: 'black',
    marginTop: 20,
    textAlign: 'center',
    paddingHorizontal: 5,
  },
  shadowContainer: {
    width: 300,
    height: 300,
    borderRadius: 15,
    shadowColor: "rgba(0, 0, 0, 0.3)",
    shadowOffset: { width: 0, height: 10 },
    shadowRadius: 7,
    elevation: 7,
    shadowOpacity: 1,
  },
  coverImage: {
    width: 300,
    height: 300,
    borderRadius: 15,
    marginTop: 5,
  },
  gradient: {
    width: 75,
    height: 75,
    borderRadius: 75 / 2,
  },
  button: {
    flexShrink: 0,
    borderRadius: 30,
    justifyContent: 'center',
    alignItems: 'center',
    margin: 13,
    backgroundColor: '#333333',
    width: 120,
    height: 40,
  },
  buttonText: {
    color: '#ffff',
    fontFamily: 'Inter_500Medium',
    fontSize: 16,
  },
  gradientBackground: {
    width: 120,
    height: 40,
    justifyContent: 'center',
    alignItems: 'center',
    borderRadius: 30,
    opacity: 0.95,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'white',
  },
  turntableIcon: {
    flex: 1,
    width: 100,
    maxHeight: 102,
    resizeMode: 'contain',
  },
});
