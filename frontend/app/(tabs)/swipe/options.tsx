import React, { useState, useEffect } from 'react';
import { useRoute } from '@react-navigation/native';
import { Text, View, StyleSheet, TouchableHighlight, Image, Dimensions, Platform } from 'react-native';
import { useFonts, Inter_400Regular, Inter_600SemiBold } from '@expo-google-fonts/inter';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { supabase } from '../../../supabase';

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
  username: string;
  avatarURL: string;
  activityLog: ActivityLog;
};

export default function OptionsScreen({ navigation }) {
  const route = useRoute();
  const { spotifyID, username, avatarURL } = route.params as RouteParams || {};
  const [selectedMode, setSelectedMode] = useState<string | null>(null);

  const handleSelection = async (mode: string) => {
    setSelectedMode(mode);

    const getNextId = async () => {
      const { data, error } = await supabase
        .from("User")
        .select("activityLog")
        .eq("spotifyID", spotifyID)
        .limit(1);

      if (error) {
        console.error("Error fetching latest ID:", error.message);
        return 1; // Return 1 if error occurs
      }

      if (!data || data.length === 0 || !data[0].activityLog) {
        console.log("No records found, starting with ID: 1");
        return 1; // No records exist, start with ID 1
      }

      const lastId = data[0].activityLog.length;
      console.log("Last ID found:", lastId); // Log the last ID

      return lastId + 1;
    };

    const { data, error } = await supabase
      .from("User")
      .select("activityLog")
      .eq("spotifyID", spotifyID)
      .single();

    if (error) {
     console.error("Error fetching user:", error.message);
    } else {
     console.log("Fetched activity log:", data.activityLog);
    }

    const existingLogs = data?.activityLog || [];
    const nextId = await getNextId();

    console.log("Next ID:", nextId);

    const newLogEntry = {
      _id: nextId,
      mode: mode,
      swipeResults: [],
      playlistId: null,
      completedAt: null,
    };

    const updatedLogs = [...existingLogs, newLogEntry];

    const { error: updatedError } = await supabase
      .from("User")
      .update({ activityLog: updatedLogs })
      .eq("spotifyID", spotifyID)

    if (updatedError) {
      console.error("Error updating activity log:", updatedError.message);
    } else {
      console.log("Mode selection saved:", mode);
      navigation.navigate("Swipe", {
        spotifyID: spotifyID,
        mode: mode,
        activityLog: newLogEntry,
      });
    }
  };

  const [fontsLoaded] = useFonts({
    Inter_400Regular, // Regular Weight
    Inter_600SemiBold, // Extra Bold Weight
  });

  if (!fontsLoaded) {
    // Show loading text until fonts are loaded
    return (
      <View style={styles.container}>
        <Text>Loading...</Text>
      </View>
    )
  }

  const onPressSongs = () => {
    handleSelection("songs");
    // navigation.navigate("Loading");
    console.log('You selected Songs!');
  };

  const onPressArtists = () => {
    handleSelection("artists");
    // navigation.navigate("Loading");
    console.log('You selected Artists!');
  };

  const onPressGenres = () => {
    handleSelection("genres");
    // navigation.navigate("Loading");
    console.log('You selected Genres!');
  };

  const onPressHelp = () => {
    console.log('You selected Instructions!');
  };

  return (
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
    </View>
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
    // backgroundColor: '#ffffff',
    alignItems: 'center',
  },
  text: {
    color: 'black',
    fontFamily: 'Inter_400Regular',
    fontSize: 16,
  },
  selectText: {
    color: 'black',
    fontFamily: 'Inter_400Regular',
    fontSize: 16,
    marginLeft: 12,
  },
  selectionContainer: {
    flexShrink: 0,
  },
  rowContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    // justifyContent: 'flex-start',
    // justifyContent: 'space-between',
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
    color: 'black',
    fontFamily: 'Inter_400Regular',
    fontSize: 16,
    marginLeft: 58,
  },
  artistsText: {
    color: 'black',
    fontFamily: 'Inter_400Regular',
    fontSize: 16,
    marginLeft: 273,
  },
  shadowContainer: {
     ...Platform.select({
        ios: {
          shadowColor: "rgba(0, 0, 0, 0.3)",
          shadowOffset: { width: 0, height: 6 },
          shadowOpacity: 1,
          shadowRadius: 7,
          borderRadius: 30,
        },
        android: {
          backgroundColor: 'transparent', // required or Android shows shadow
        },
      }),
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
