import React, { useState } from "react";
import { View, Text, TextInput, StyleSheet, TouchableHighlight, TouchableOpacity } from "react-native";
// import PlaylistCover from "./playlistCover";
import { useFonts, Inter_400Regular, Inter_500Medium, Inter_600SemiBold, Inter_700Bold, Inter_800ExtraBold } from "@expo-google-fonts/inter";
import { LinearGradient } from 'expo-linear-gradient';
import { useRoute } from '@react-navigation/native';

export default function PlaylistScreen({ navigation }) {

  const [text, setText] = useState('');
  const inputRef = React.useRef(null);

  const onPressCreate = () => {
    console.log('You created a new playlist!');
    console.log('Playlist name: ', text);
    navigation.navigate('PlaylistPreview', { playlistName: text });
  };

  return (
    <View style={styles.container}>
      <Text style={styles.text}>Give your playlist a name!</Text>
      <View style={styles.coverImage}></View>
      <TouchableOpacity
        style={styles.underlineContainer}
        onPress={() => inputRef.current.focus()}
        activeOpacity={1} // Prevents opacity effect
      >
        <TextInput
          ref={inputRef}
          style={styles.input}
          placeholder="Tap to type..."
          placeholderTextColor="gray"
          value={text}
          onChangeText={setText}
          keyboardType="default"
          maxLength={100}
          multiline={true}
          numberOfLines={2}
          blurOnSubmit={true}
        />
      </TouchableOpacity>

      {/* Underline */}
      <View style={styles.underline} />
      <TouchableHighlight style={styles.button} onPress={onPressCreate} underlayColor='#70A7FF'>
        <LinearGradient
          colors={['#3A86FF', '#FF1493', '#A134BE']}
          start={{ x: 0, y: 0 }} // Gradient starts from top-left
          end={{ x: 1, y: 1 }} // Gradient ends at bottom-right
          style={styles.gradientBackground}
          locations={[ 0, 0.5, 1]}
        >
          <Text style={styles.buttonText}>Create</Text>
        </LinearGradient>
      </TouchableHighlight>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'flex-start',
    alignItems: 'center',
  },
  text: {
    fontFamily: 'Inter_500Medium',
    fontSize: 20,
    color: 'black',
    marginTop: 30,
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
  },
   buttonText: {
    color: '#ffff',
    fontFamily: 'Inter_500Medium',
    fontSize: 16,
  },
  gradientBackground: {
  width: 121 ,
  height: 50,
  justifyContent: 'center',
  alignItems: 'center',
  borderRadius: 30,
  opacity: 0.95,

  },
  underlineContainer: {
    paddingVertical: 10,
  },
  input: {
    fontSize: 20,
    color: 'black',
    paddingHorizontal: 10,
    textAlignVertical: 'top',
  },
  underline: {
    height: 3,
    backgroundColor: 'black',
    width: 250,
  },
});
