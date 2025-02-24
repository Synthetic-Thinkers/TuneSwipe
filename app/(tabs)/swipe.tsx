import React, { useState } from 'react';
import { Text, View, StyleSheet, TouchableHighlight, Alert, Image, Modal } from 'react-native';
import { useFonts, Inter_400Regular, Inter_800ExtraBold } from '@expo-google-fonts/inter';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';

export default function SwipeScreen() {
  const [fontsLoaded] = useFonts({
    Inter_400Regular, // Regular Weight
    Inter_800ExtraBold, // Extra Bold Weight
  });

  if (!fontsLoaded) {
    // Show loading text until fonts are loaded
    return <Text>Loading...</Text>;
  }

  const onPressSongs = () => {
    Alert.alert('You selected Songs!');
  };

  const onPressArtists = () => {
    Alert.alert('You selected Artists!');
  };

  const onPressGenres = () => {
    Alert.alert('You selected Genres!');
  };

  const onPressHelp = () => {
    Alert.alert('You selected Instructions!');
  };

  return (
    <View style = {styles.container}>
      <Text style={styles.text}>Select Your Choice:</Text>

      <TouchableHighlight onPress={onPressHelp} style={styles.helpButton} underlayColor='transparent'>
        <Ionicons name="help-circle-outline" size={32} color='black'/>
      </TouchableHighlight>

      <TouchableHighlight style={styles.button} onPress={onPressSongs} underlayColor='#70A7FF'>
        <LinearGradient
          colors={['#98F5E1', '#3A86FF', '#A134BE']}
          start={{ x: 0, y: 0 }} // Gradient starts from top-left
          end={{ x: 1, y: 1 }} // Gradient ends at bottom-right
          style={styles.gradientBackground}
          locations={[ 0, 0.5, 1]}
        >
          <Text style={styles.buttonText}>Songs</Text>
          <Image source={require('../../assets/images/vinyls/TameImpalaVinyl.png')} style={styles.vinyl1} />
          <Image source={require('../../assets/images/vinyls/DrakeVinyl.png')} style={styles.vinyl2} />
          <Image source={require('../../assets/images/vinyls/ORVinyl.png')} style={styles.vinyl3} />
        </LinearGradient>
      </TouchableHighlight>
      <TouchableHighlight style={styles.button} onPress={onPressArtists} underlayColor='#70A7FF'>
         <LinearGradient
          colors={['#3A86FF', '#FF1493', '#A134BE']}
          start={{ x: 0, y: 0 }} // Gradient starts from top-left
          end={{ x: 1, y: 1 }} // Gradient ends at bottom-right
          style={styles.gradientBackground}
          locations={[ 0.1, 0.5, 1]}
        >
          <Text style={styles.artistsText}>Artists</Text>
          <Image source={require('../../assets/images/artists/DonToliver.png')} style={styles.artist1} />
          <Image source={require('../../assets/images/artists/BillieE.png')} style={styles.artist2} />
          <Image source={require('../../assets/images/artists/CharliXCX.png')} style={styles.artist3} />
        </LinearGradient>
      </TouchableHighlight>
      <TouchableHighlight style={styles.button} onPress={onPressGenres} underlayColor='#70A7FF'>
         <LinearGradient
          colors={['#FF69B4', '#FF006E', '#CF0101']}
          start={{ x: 0, y: 0 }} // Gradient starts from top-left
          end={{ x: 1, y: 1 }} // Gradient ends at bottom-right
          style={styles.gradientBackground}
          locations={[ 0.29, 0.77, 1]}
        >
          <Text style={styles.buttonText}>Genres</Text>
          <Image source={require('../../assets/images/genres/Dance.png')} style={styles.genre1} />
          <Image source={require('../../assets/images/genres/Folk.png')} style={styles.genre2} />
          <Image source={require('../../assets/images/genres/Indie.png')} style={styles.genre3} />
          <Image source={require('../../assets/images/genres/Jazz.png')} style={styles.genre4} />
          <Image source={require('../../assets/images/genres/Pop.png')} style={styles.genre5} />
          <Image source={require('../../assets/images/genres/Rock.png')} style={styles.genre6} />
        </LinearGradient>
      </TouchableHighlight>
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
    fontFamily: 'Inter_400Regular',
    fontSize: 16,
  },
  selectionContainer: {
    flex: 1,
    width: 375,
    maxHeight: 153,
    backgroundColor: '#2196F3',
    borderRadius: 30,
    justifyContent: 'center',
    alignContent: 'center',
    margin: 24,
  },
  button: {
    flex: 1,
    width: 383,
    maxHeight: 153,
    borderRadius: 30,
    justifyContent: 'center',
    alignContent: 'center',
    margin: 12,
    // overflow: 'hidden',
  },
  buttonText: {
    color: '#00000',
    fontFamily: 'Inter_400Regular',
    fontSize: 16,
    marginLeft: 58,
  },
  artistsText: {
    color: '#00000',
    fontFamily: 'Inter_400Regular',
    fontSize: 16,
    marginLeft: 273,
  },
  gradientBackground: {
    width: 383 ,
    height: 153,
    justifyContent: 'center',
    borderRadius: 30,
    opacity: 0.95
  },
  vinyl1: {
    width: 104,
    height: 103,
    position: 'absolute',
    left: 183,
    resizeMode: 'contain',
  },
  vinyl2: {
    width: 104,
    height: 103,
    position: 'absolute',
    left: 235,
    resizeMode: 'contain',
  },
  vinyl3: {
    width: 104,
    height: 103,
    position: 'absolute',
    left: 280,
    resizeMode: 'contain',
  },
  artist1: {
    width: 120,
    height: 140,
    position: 'absolute',
    top: 22,
    left: -15,
    resizeMode: 'contain',
  },
  artist2: {
    width: 115,
    height: 130,
    position: 'absolute',
    top: 35,
    left: 115,
    resizeMode: 'contain',
  },
  artist3: {
    width: 115,
    height: 130,
    position: 'absolute',
    top: 37,
    left: 55,
    resizeMode: 'contain',
  },
  genre1: {
    width: 50,
    height: 50,
    position: 'absolute',
    top: 5,
    left: 319,
    resizeMode: 'contain',
  },
  genre2: {
    width: 50,
    height: 50,
    position: 'absolute',
    top: 5,
    left: 208,
    resizeMode: 'contain',
  },
  genre3: {
    width: 50,
    height: 50,
    position: 'absolute',
    top: 60,
    left: 319,
    resizeMode: 'contain',
  },
  genre4: {
    width: 50,
    height: 50,
    position: 'absolute',
    top: 40,
    left: 255,
    resizeMode: 'contain',
  },
  genre5: {
    width: 50,
    height: 50,
    position: 'absolute',
    top: 80,
    left: 204,
    resizeMode: 'contain',
  },
  genre6: {
    width: 50,
    height: 50,
    position: 'absolute',
    top: 100,
    left: 280,
    resizeMode: 'contain',
  },
   helpButton: {
    position: 'absolute',
    top: 20,
    right:10,

  },

});
