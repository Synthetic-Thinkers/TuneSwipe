import React, { useState, useEffect} from 'react';
import { Text, View, StyleSheet, TouchableHighlight, Alert, Image, TouchableOpacity, Dimensions } from 'react-native';
import { useFonts, Inter_400Regular, Inter_500Medium, Inter_600SemiBold } from '@expo-google-fonts/inter';
import { LinearGradient } from 'expo-linear-gradient';
import AsyncStorage from "@react-native-async-storage/async-storage";
import { Ionicons } from '@expo/vector-icons';
import { BlurView } from 'expo-blur';
import { supabase } from '../../../supabase';
import axios from 'axios';

export default function IndexScreen({ navigation }) {
  const [spotifyID, setSpotifyID] = useState<string | null>(null);
  const [username, setUsername] = useState<string | null>(null);
  const [avatarURL, setAvatarURL] = useState<string | null>(null);
   const [recentTracks, setRecentTracks] = useState<any[]>([]);
  const [accessToken, setAccessToken] = useState<string | null>(null);

  useEffect(() => {
    async function getToken() {
      try {
        const token = await AsyncStorage.getItem("accessToken");
        if (token) {
          console.log('Token:', token);
          setAccessToken(token);
        } else {
          console.log("No Token Found.")
        }
      } catch (error) {
        console.error("Error retrieving Token:", error);
      }
    }

    getToken();
  }, []);


  useEffect(() => {
  async function fetchUser() {
    try {
      const storedID = await AsyncStorage.getItem("spotifyID");
      if (storedID) {
        setSpotifyID(storedID);
        console.log("Retrieved Spotify ID:", storedID);
      } else {
        console.log("No Spotify ID found.");
      }
    } catch (error) {
      console.error("Error retrieving Spotify ID:", error);
    }
  }

  fetchUser();
}, [])

  useEffect(() => {
  if (spotifyID) {
    async function getUser() {
      const { data, error } = await supabase
        .from('User')
        .select('userName, avatarURL')
        .eq('spotifyID', spotifyID)
        .maybeSingle();

      if (error) {
        console.error("Error fetching data:", error);
      } else if (data) {
        setUsername(data.userName);
        setAvatarURL(data.avatarURL);
      } else {
        console.log("No user found with this Spotify ID.");
      }
    }

    getUser();  // Fetch user when spotifyID is available

    // Fetch recent tracks after fetching user info
    async function getRecentTracks() {
      const { data, error } = await supabase
        .from("User")
        .select("recentlyPlayed")
        .eq("spotifyID", spotifyID);

      if (error) {
        console.error("Error fetching recent tracks:", error);
      } else if (data) {
        const tracks = data[0]?.recentlyPlayed || [];
        setRecentTracks(tracks);
        console.log("Fetched recent tracks: ", data[0]?.recentlyPlayed || []);
      } else {
        console.log("No recent tracks found for this Spotify ID.");
      }
    }
    getRecentTracks();
  }
  }, [spotifyID]);

  useEffect(() => {

    async function getTrackInfo(recentTracks, accessToken) {
      console.log("Access Token:", accessToken);
      console.log("Recent Tracks:", recentTracks);
      const url = `https://api.spotify.com/v1/tracks?ids=${recentTracks.join(',')}`;
      const response = await fetch(url, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${accessToken}`,
        },
      });

      if (!response.ok) throw new Error("Failed to fetch artist details");

      const data = await response.json();
      const artists = data.tracks.map(track => {
        return track.artists.map(artist => artist.name);
      });
      console.log(artists)

      // Send recent tracks to backend
      try {
        const response = await axios.post(`${process.env.EXPO_PUBLIC_API_URL}/recent-tracks`, {
          user_id: spotifyID,
          artists: artists,
        });
        console.log("Backend response:", response.data);
      } catch (error) {
        console.error("Error sending data to backend:", error);
      }
    }
    getTrackInfo(recentTracks, accessToken);
  }, [recentTracks, accessToken]);

  const onPressStart = () => navigation.replace("Options", {
    spotifyID: spotifyID,
    username: username,
    avatarURL: avatarURL,
  });

  const [fontsLoaded] = useFonts({
    Inter_400Regular, // Regular Weight
    Inter_600SemiBold, // Extra Bold Weight
    Inter_500Medium,  // Medium Weight
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
    <TouchableOpacity style={styles.container} onPress={onPressStart} activeOpacity={1}>
      <View style={styles.container}>
        {/* Contains welcoming user with the user's name & displays the user's profile picture */}
        <View style={styles.userContainer}>
          {/* Contains making both username & user profile align in a row format */}
          <View style={styles.rowContainer}>
            {/* Contains a 'Welcome' text with the User's name */}
            <View style={styles.userGreeting}>
              <Text style={styles.text}>Welcome,</Text>
              {/* <Text style={styles.usersName}>User</Text> */}
              <Text style={styles.usersName}>{username || 'User'}</Text>
            </View>
            {/* Contains a gradient outline around the user's profile picture */}
            <View style={styles.profileContainer}>
              <LinearGradient
                colors={['rgba(131, 56, 236, 0.9)',
                         'rgba(255, 0, 110, 0.9)',
                         'rgba(58, 134, 255, 0.9)',
                         'rgba(152, 245, 225, 0.9)']}
                style={styles.gradient}
                start={{ x: 0, y: 0.5 }}
                end={{ x: 1, y: 0.5 }}
                locations={[0, 0.3, 0.58, 1]}
              >
                <Image
                  source={
                    avatarURL
                      ? { uri: avatarURL }
                      : require('../../../assets/images/default-profile-picture.png')
                  }
                  style={styles.userPicture}
                />
              </LinearGradient>
            </View>
          </View>
        </View>
        {/* Contains text, help icon, & all buttons */}
        <View style={styles.selectionContainer}>
          {/* Makes everything inside aligned in a row format */}
          <View style={styles.rowContainer}>
            <Text style={styles.selectText}>Select Your Choice:</Text>
            {/* Help Icon to give users guidance */}
            <TouchableHighlight onPress={onPressHelp} style={styles.helpButton} underlayColor='transparent'>
              <Ionicons name="help-circle-outline" size={24} color='black' />
            </TouchableHighlight>
          </View>
          {/* Songs Button */}
          <View style={styles.shadowContainer}>
          <TouchableHighlight style={styles.button} onPress={onPressSongs} underlayColor='#70A7FF'>
            <LinearGradient
              colors={['#98F5E1', '#3A86FF', '#A134BE']}
              start={{ x: 0, y: 0 }} // Gradient starts from top-left
              end={{ x: 1, y: 1 }} // Gradient ends at bottom-right
              style={styles.gradientBackground}
              locations={[ 0, 0.5, 1]}
            >
              <Text style={styles.buttonText}>Songs</Text>
              <Image source={require('../../../assets/images/vinyls/TameImpalaVinyl.png')} style={styles.vinyl1} />
              <Image source={require('../../../assets/images/vinyls/DrakeVinyl.png')} style={styles.vinyl2} />
              <Image source={require('../../../assets/images/vinyls/ORVinyl.png')} style={styles.vinyl3} />
            </LinearGradient>
          </TouchableHighlight>
          </View>
          {/* Artists Button */}
          <View style={styles.shadowContainer}>
            <TouchableHighlight style={styles.button} onPress={onPressArtists} underlayColor='#70A7FF'>
             <LinearGradient
              colors={['#3A86FF', '#FF1493', '#A134BE']}
              start={{ x: 0, y: 0 }} // Gradient starts from top-left
              end={{ x: 1, y: 1 }} // Gradient ends at bottom-right
              style={styles.gradientBackground}
              locations={[ 0.1, 0.5, 1]}
            >
              <Text style={styles.artistsText}>Artists</Text>
                <Image source={require('../../../assets/images/artists/DonToliver.png')} style={styles.artist1} />
                <Image source={require('../../../assets/images/artists/BillieE.png')} style={styles.artist2} />
                <Image source={require('../../../assets/images/artists/CharliXCX.png')} style={styles.artist3} />
            </LinearGradient>
            </TouchableHighlight>
          </View>
          {/* Genres Button */}
          <View style={styles.shadowContainer}>
            <TouchableHighlight style={styles.button} onPress={onPressGenres} underlayColor='#70A7FF'>
             <LinearGradient
              colors={['#FF69B4', '#FF006E', '#CF0101']}
              start={{ x: 0, y: 0 }} // Gradient starts from top-left
              end={{ x: 1, y: 1 }} // Gradient ends at bottom-right
              style={styles.gradientBackground}
              locations={[ 0.29, 0.77, 1]}
            >
              <Text style={styles.buttonText}>Genres</Text>
              <Image source={require('../../../assets/images/genres/Dance.png')} style={styles.genre1} />
              <Image source={require('../../../assets/images/genres/Folk.png')} style={styles.genre2} />
              <Image source={require('../../../assets/images/genres/Indie.png')} style={styles.genre3} />
              <Image source={require('../../../assets/images/genres/Jazz.png')} style={styles.genre4} />
              <Image source={require('../../../assets/images/genres/Pop.png')} style={styles.genre5} />
              <Image source={require('../../../assets/images/genres/Rock.png')} style={styles.genre6} />
            </LinearGradient>
            </TouchableHighlight>
          </View>
        </View>
        <BlurView intensity={30} style={styles.blurView} tint="light" />
        <View style={styles.instructContainer}>
          <Text style={styles.pickText}>Pick your vibe:</Text>
          <Text style={styles.optionsText}>Songs, Artists, or Genres</Text>
          <Text style={styles.tapText}>Tap anywhere to start swiping!</Text>
        </View>
      </View>
    </TouchableOpacity>
  );
}


const { width, height } = Dimensions.get('window');
// BASE dimensions (from iPhone 11 example)
const BASE_WIDTH = 385;
const BASE_HEIGHT = 130;

let dynamicWidth;
let dynamicHeight;

// Responsive height logic
if (height > 896) {
  dynamicHeight = Math.min(height * 0.18, 130); // ~130/715 = 0.18
} else if (height < 896) {
  dynamicHeight = Math.min(height * 0.18, 80); // scale slightly smaller
} else {
  dynamicHeight = BASE_HEIGHT;
}

// Responsive width logic
if (width > 414) {
  dynamicWidth = Math.min(width * 0.93, 385); // ~385/414 = 0.93
} else if (width < 414) {
  dynamicWidth = Math.min(width * 0.93, 370);
} else {
  dynamicWidth = BASE_WIDTH;
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#ffffff',
    alignItems: 'center',
  },
  text: {
    color: '#00000',
    fontFamily: 'Inter_400Regular',
    fontSize: 16,
  },
  selectText: {
    color: '#00000',
    fontFamily: 'Inter_400Regular',
    fontSize: 16,
    marginLeft: 12,
  },
  blurView: {
    position: 'absolute',
    width: '100%',
    height: '100%',
  },
  pickText: {
  color: '#00000',
    fontFamily: 'Inter_500Medium',
    fontSize: 40,
  },
  optionsText: {
    color: '#00000',
    fontFamily: 'Inter_500Medium',
    fontSize: 20,
  },
  tapText: {
    color: '#444',
    fontFamily: 'Inter_500Medium',
    fontSize: 13,
  },
  instructContainer: {
    top: 320,
    left: 57,
    position: "absolute",
    alignItems:'center',
  },
  selectionContainer: {
    flexShrink: 0,
  },
  rowContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    // justifyContent: 'flex-start',
  },
  userContainer: {
    width: dynamicWidth,
    height: dynamicHeight,
    alignContent: 'center',
    justifyContent: 'center',
    paddingHorizontal: 10,
  },
  userGreeting: {
    flexWrap: 'nowrap',
    flex: 1,
  },
  usersName: {
    color: 'black',
    fontFamily: 'Inter_600SemiBold',
    fontSize: 24,
    flexShrink: 1,
    overflow: 'hidden',
  },
  profileContainer: {
    width: 75,
    height: 75,
    borderRadius: 75 / 2,
    padding: 3,
  },
  gradient: {
    width: 75,
    height: 75,
    borderRadius: 75 / 2,
  },
  circle: {
    width: 75,
    height: 75,
    borderRadius: 75 / 2,
  },
  userPicture: {
    width: 75,
    height: 75,
    borderRadius: 75 / 2,
    borderWidth: 2,
    borderColor: 'transparent',
    overflow: 'hidden',
  },
  button: {
    flexShrink: 0,
    width: 383,
    maxHeight: 153,
    borderRadius: 30,
    justifyContent: 'center',
    alignContent: 'center',
    margin: 12,
    overflow: 'hidden',
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
  shadowContainer: {
    shadowColor: "rgba(0, 0, 0, 0.3)",
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 1,
    shadowRadius: 7,
    elevation: 7,
    borderRadius: 30,
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
    top: 23,
    resizeMode: 'contain',
  },
  artist2: {
    width: 115,
    height: 130,
    position: 'absolute',
    top: 29,
    left: 115,
    resizeMode: 'contain',
  },
  artist3: {
    width: 115,
    height: 130,
    position: 'absolute',
    top: 31,
    left: 62,
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
    marginLeft: 210,
    flexShrink: 0,
    padding: 5,
  },
});
