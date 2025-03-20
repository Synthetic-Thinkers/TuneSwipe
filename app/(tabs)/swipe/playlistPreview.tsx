import React from "react";
import {Image, StyleSheet, Text, View, TouchableHighlight} from "react-native";
import { useFonts, Inter_400Regular, Inter_500Medium, Inter_600SemiBold, Inter_700Bold, Inter_800ExtraBold } from "@expo-google-fonts/inter";
import { LinearGradient } from 'expo-linear-gradient';
import { useRoute } from '@react-navigation/native';

type Playlist = {
  playlistName: string;
};

export default function PlaylistPreview() {
  const route = useRoute();
  const { playlistName } = route.params as Playlist || {};

  const onPressListen = () => {
    console.log('You are now listening to your new playlist!');
  };

  const onPressView = () => {
    console.log('You are now viewing your new playlist!');
  };


  return (
    <View style={styles.container}>
      <Text style={styles.text}>Give your playlist a name!</Text>
      <View style={styles.coverImage}></View>
      <Text style={styles.text}>{playlistName || 'Playlist Name'}</Text>
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
        <TouchableHighlight style={styles.button} onPress={onPressView} underlayColor='#70A7FF'>
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
    marginTop: 20,
  },
  coverImage: {
    width: 300,
    height: 300,
    marginTop: 20,
    backgroundColor: 'navy',
    borderRadius: 15,
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
})
