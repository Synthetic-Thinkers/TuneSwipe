import React, { useState , useEffect, useRef} from "react";
import { View, Text, StyleSheet, Image, TouchableOpacity, Dimensions, Platform, ActivityIndicator } from "react-native";
import AsyncStorage from "@react-native-async-storage/async-storage";
import Swiper from 'react-native-deck-swiper';
import Ionicons from '@expo/vector-icons/Ionicons';
import { Entypo } from "@expo/vector-icons";
import { useFonts, Inter_400Regular, Inter_500Medium, Inter_600SemiBold, Inter_700Bold, Inter_800ExtraBold } from "@expo-google-fonts/inter";
import { useRoute } from '@react-navigation/native';
import { supabase } from "@/supabase";
import { BlurView } from "expo-blur";
import axios from "axios";
import { fetchTracks, fetchArtists } from "@/app/utils/spotifyUtils";

type ActivityLog = {
  _id: number;
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

export default function SwipeScreen({ navigation }) {
  const route = useRoute();

  const { spotifyID, mode, activityLog } = route.params as RouteParams;

  const [accessToken, setAccessToken] = useState<string | null>(null);
  const [index, setIndex] = useState(0);
  const [musicData, setMusicData] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [swipeResults, setSwipeResults] = useState(activityLog.swipeResults || []);
  const [sessionID, setSessionID] = useState<number>(activityLog._id);
  const [activityLogs, setActivityLogs] = useState<ActivityLog[]>([]);
  const [showBlur, setShowBlur] = useState(true);
  const swiperRef = useRef<Swiper<any>>(null);
  const [likedCards, setLikedCards] = useState<any[]>([]);
  const swipeResultsRef = useRef(swipeResults);
  const likedCardsRef = useRef<any[]>([]);
  const [gifLoaded, setGifLoaded] = useState(false);
  const [gifError, setGifError] = useState(false);
  const [likedArtists, setRandomArtists] = useState([]);

  const [fontsLoaded] = useFonts({
    Inter_400Regular,
    Inter_500Medium,
    Inter_600SemiBold,
    Inter_700Bold,
    Inter_800ExtraBold,
  });

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
    swipeResultsRef.current = swipeResults;
  }, [swipeResults]);

  useEffect(() => {
    likedCardsRef.current = likedCards;
  }, [likedCards]);

  const extractArtistsIds = (musicData) => {
    const allArtistsIds = musicData.flatMap(song => song.artistsID);
    console.log('All artists ids:', allArtistsIds);
    return allArtistsIds;
  };

  // const fetchArtistsDetails = async (artistsIDs, accessToken) => {
  //   if (artistsIDs.length === 0) return;

  //   try {
  //     const idsParam = artistsIDs.join(",");

  //     const response = await fetch(`https://api.spotify.com/v1/artists?ids=${idsParam}`, {
  //       headers: {
  //         Authorization: `Bearer ${accessToken}`,
  //       },
  //     });

  //     if (!response.ok) throw new Error("Failed to fetch artist details");

  //     const data = await response.json();

  //     const artistNames = data.artists.map((artist) => artist.name);
  //     console.log('Artists Names:', artistNames);
  //     return artistNames;
  //   } catch (error) {
  //     console.error("Error fetching artist details from Spotify:", error);
  //     return [];
  //   }
  // };

  const fetchData = async () => {
    let data;
    if (mode === 'songs') {
      try {
      const userInfo ={}
      const response = await fetch(`${process.env.EXPO_PUBLIC_API_URL}/swipe-recommendations`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(userInfo), // Include the user info in the body
      });
      const songIDs = await response.json();
      const songData = await fetchTracks(songIDs)
      setMusicData(songData)
      setLoading(false)
      } catch (error) {
      console.error("Error fetching search results:", error);
      }
    } else if (mode === 'artists') {
      try {
        // Fetch random artists from the backend
        const response = await fetch(`${process.env.EXPO_PUBLIC_API_URL}/random-artists?user_id=${spotifyID}`, {
          method: "GET",
          headers: {
            "Content-Type": "application/json",
          },
        });

          if (!response.ok) {
              throw new Error("Failed to fetch random artists");
          }
          const artistIDs = await response.json(); // Assuming the backend returns an array of artist IDs
          console.log("Fetched artist IDs:", artistIDs);
          // Fetch artist details using fetchArtists from spotifyUtils.js
        const artistData = await fetchArtists(artistIDs);
        console.log("Fetched artist data:", artistData);
          setMusicData(artistData);
          setLoading(false);
        } catch (error) {
            console.error("Error fetching artists:", error);
        }
    } else if (mode === 'genres') {
      const { data: genreData, error } = await supabase
        .from('Genre')
        .select('*')
        .limit(10)
      if (error) {
        console.error('Error fetching genres:', error);
        return;
      }
      data = genreData;
      console.log(data);
      setMusicData(data);
      setLoading(false);
    }
    // setMusicData(musicData || []);
  }

  const fetchActivityLogs = async () => {
  const { data, error } = await supabase
    .from("User")
    .select("activityLog")
    .eq("spotifyID", spotifyID)
    .single();

  if (error) {
    console.error("Error fetching activity logs:", error.message);
    return;
  }

  const existingLogs = data?.activityLog || [];
  setActivityLogs(existingLogs);
  console.log("Fetched activity logs:", existingLogs);
};


  useEffect(() => {
    if (accessToken) {
      fetchData();
      fetchActivityLogs();
    }
  }, [accessToken, mode]);

  if (loading || !fontsLoaded) {
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

  const handleSwipeRight = (cardIndex) => {
    // Every song swiped right will also be stored in an array for playlist.tsx (default for now)
    const likedCard = musicData[cardIndex].id;
    // Add the liked card to the likedCards array
    setLikedCards((prevLikedCards) => [...prevLikedCards, likedCard]);

    console.log("Liked Cards Array:", likedCardsRef.current);

    console.log(
      `Liked: ${musicData[cardIndex].name}`
    );
    setSwipeResults((prevResults) => {
      const newResults = [
        ...prevResults,
        { id: musicData[cardIndex].id, liked: true },
      ];
      return newResults;
    });
  };

  const handleSwipeLeft = (cardIndex) => {
    console.log(
      `Disliked: ${musicData[cardIndex].name}`
    );
    setSwipeResults((prevResults) => {
      const newResults = [
        ...prevResults,
        { id: musicData[cardIndex].id, liked: false },
      ];
      return newResults;
    });
  };

  const handleSwipedAll = async () => {
    setLoading(true);
    setTimeout(async () => {
      // pull latest update from swipeResults
      const latestSwipeResults = [...swipeResultsRef.current];

      console.log("LATEST SWIPE RESULTS:", latestSwipeResults);
      console.log("LIKED CARDS:", likedCardsRef.current);

      if (latestSwipeResults.length === musicData.length) {
        const updatedLogs = activityLogs.map((log) =>
          log._id === sessionID
            ? { ...log, swipeResults: latestSwipeResults }
            : log
        );

        try {
          const { error } = await supabase
            .from("User")
            .update({ activityLog: updatedLogs })
            .eq("spotifyID", spotifyID);

          if (error) throw error;

          navigation.navigate("Playlist", {
            spotifyID: spotifyID,
            mode: mode,
            activityLog: updatedLogs,
            sessionID: sessionID,
            likedCards: likedCardsRef.current,
          });
        } catch (error) {
          console.error("Error saving updated activity log:", error);
        }
      }
    }, 1000);
  };

  const onPressStart = () => setShowBlur(false);
  const firstCard = musicData[0];

  return (
    <TouchableOpacity style={styles.blurView} onPress={onPressStart} activeOpacity={1}>
      <View style={styles.container}>
        {/* Show BlurView and Instructions when 'showBlur' is true */}
        {showBlur && (
          <>
            <View style={styles.startCardContainer}>
              <Image
                source={
                  mode=='songs' && firstCard.album.images[0]
                    ? { uri: firstCard.album.images[0].url }
                    : require("../../../assets/images/defaultImage.png")
                }
                style={styles.image}
              />
              <View style={styles.textContainer}>
                  {mode === 'songs' ? (
                    <Text style={styles.songText}>
                      {firstCard.artistName} - {firstCard.title}
                    </Text>
                  ) : (
                    <Text style={styles.songText}>{firstCard.name}</Text>
                )}
                {mode !== 'genres' && firstCard.genres && (
                  <Text style={styles.genreText}>{firstCard.genres.join(' + ')}</Text>
                )}
                </View>
              <View style={styles.choiceContainer}>
                <View style={styles.rectangle}></View>
                <Ionicons name="close-circle-outline" size={80} color="#CC0058" />
                <Ionicons name="heart-circle-outline" size={80} color="#98F5E1" />
              </View>
            </View>
            <BlurView intensity={30} style={styles.blurView} tint="light" />
            <View style={styles.instructContainer}>
              <Text style={styles.swipeText}>Swipe</Text>
              <Text style={styles.directionsText}>
                <Text style={styles.rightText}>right</Text> to like, <Text style={styles.leftText}>left</Text> to dislike.
              </Text>
              <Text style={styles.tapText}>Tap anywhere to start swiping!</Text>
              <View style={styles.arrowContainer}>
                <Entypo name="arrow-left" size={80} style={styles.arrowIcon} />
                <Entypo name="arrow-right" size={80} style={styles.arrowIcon} />
              </View>
              </View>
          </>
        )}

        {/* Render Swiper only if 'showBlur' is false (after tapping) */}
        {!showBlur && (
          <Swiper
            cards={musicData}
            renderCard={(card) => (
              <View style={styles.cardContainer}>
                {mode === "songs" ? (
                  card.album.images[0] ? (
                    <Image
                      source={{ uri: card.album.images[0].url }}
                      style={styles.image}
                    />
                  ) : (
                    <Image
                      source={require("../../../assets/images/defaultImage.png")}
                      style={styles.image}
                    />
                  )
                ) : mode === "artists" ? (
                  card.imageUrl ? (
                    <Image
                      source={{ uri: card.imageUrl }}
                      style={styles.image}
                    />
                  ) : (
                    <Image
                      source={require("../../../assets/images/defaultImage.png")}
                      style={styles.image}
                    />
                  )
                ) : mode === "genres" ? (
                  card.image ? (
                    <Image source={{ uri: card.image }} style={styles.image} />
                  ) : (
                    <Image
                      source={require("../../../assets/images/defaultImage.png")}
                      style={styles.image}
                    />
                  )
                ) : null}
                <View style={styles.textContainer}>
                  {mode === "songs" ? (
                    <Text style={styles.songText}>
                      {card.artists.map(artist => artist.name).join(", ")} - {card.name}
                    </Text>
                  ) : (
                    <Text style={styles.songText}>{card.name}</Text>
                  )}
                  {mode !== "genres" && card.genres && (
                    <Text style={styles.genreText}>
                      {card.genres.join(" + ")}
                    </Text>
                  )}
                </View>
                <View style={styles.choiceContainer}>
                  <View style={styles.rectangle}></View>
                  <TouchableOpacity
                    style={styles.button}
                    onPress={() => swiperRef.current?.swipeLeft()} >
                    <Ionicons name="close-circle-outline" size={80} color="#CC0058" />
                  </TouchableOpacity>
                  <TouchableOpacity
                    style={styles.button}
                    onPress={() => swiperRef.current?.swipeRight()} >
                    <Ionicons name="heart-circle-outline" size={80} color="#98F5E1" />
                  </TouchableOpacity>
                </View>
              </View>
            )}
            ref={swiperRef}
            onSwipedRight={handleSwipeRight}
            onSwipedLeft={handleSwipeLeft}
            stackSize={10}
            backgroundColor="transparent"
            containerStyle={styles.swiperContainer}
            cardIndex={index}
            onSwiped={(swipeIndex) => {setIndex(swipeIndex + 1);}}
            onSwipedAll={handleSwipedAll}
            />
        )}
      </View>
    </TouchableOpacity>
  );
}

const { width, height } = Dimensions.get('window');

// Set a BASE height
const BASE_HEIGHT = 715;

let dynamicHeight;

// If screen is on large devices, shrink it
if (height > 896) {
  dynamicHeight = Math.min(height * 0.7, 700);
}
// If screen is on small devices, shrink accordingly
else if (height < 896) {
  dynamicHeight = Math.min(height * 0.84, 620);
}
// Otherwise, keep the default height
else {
  dynamicHeight = BASE_HEIGHT;
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'white',
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
  },
  swiperContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    alignSelf: "center",
    backgroundColor: 'transparent',
  },
  blurView: {
    position: 'absolute',
    width: '100%',
    height: '100%',
  },
  swipeText: {
    color: 'white',
    fontFamily: 'Inter_800ExtraBold',
    fontSize: 32,
  },
  directionsText: {
    color: 'white',
    fontFamily: 'Inter_500Medium',
    fontSize: 20,
  },
  rightText: {
    fontFamily: 'Inter_700Bold',
    color: '#98F5E1',
    fontSize: 20,
  },
  leftText: {
    fontFamily: 'Inter_700Bold',
    color: '#FF006E',
    fontSize: 20,
  },
  tapText: {
    color: '#444',
    fontFamily: 'Inter_500Medium',
    fontSize: 12,
  },
  instructContainer: {
    position: "absolute",
    alignItems: 'center',
  },
  songText: {
    fontFamily: 'Inter_600SemiBold',
    fontSize: 24,
    color: '#ffff',
  },
  genreText: {
    fontFamily: 'Inter_400Regular',
    fontSize: 15,
    color: '#ffff',
    backgroundColor: 'black',
    alignSelf: 'flex-start',
    padding: 2,
    borderRadius: 12,
  },
    cardContainer: {
    borderRadius: 8,
    width: Math.min(width * 0.91, 377), // Keeps width consistent
    height: dynamicHeight, // Ensures card is not too tall
    bottom: Math.min(height * 0.06, 55),
    alignSelf: 'center',
    overflow: "hidden",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 5,
    elevation: Platform.OS === 'android' ? 5 : 0, // Android shadow fix
  },
  startCardContainer: {
    borderRadius: 8,
    width: Math.min(width * 0.91, 377), // Keeps width consistent
    height: dynamicHeight, // Ensures card is not too tall
    bottom: Math.min(height * 0.06, 55),
    alignSelf: 'center',
    overflow: "hidden",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 5,
    elevation: Platform.OS === 'android' ? 5 : 0, // Android shadow fix
    position: 'fixed',
    top: 1,
  },
  image: {
    borderRadius: 8,
    flex: 1,
    resizeMode: 'cover',
    width: 377,
    maxHeight: 715,
  },
  textContainer: {
    position: 'absolute',
    bottom: 83 + 10,
  },
  choiceContainer: {
    width: 377,
    height: 83,
    borderBottomLeftRadius: 8,
    borderBottomRightRadius: 8,
    position: 'absolute',
    bottom: 0,
    alignItems: 'center',
    justifyContent: 'center',
    flexDirection: 'row',
    gap: 50,
  },
  rectangle: {
    backgroundColor: 'black',
    width: 400,
    height: 83,
    borderBottomLeftRadius: 8,
    borderBottomRightRadius: 8,
    opacity: 0.4,
    position: 'absolute',
  },
  button: {
    marginHorizontal: 0,
  },
  arrowContainer: {
    flexDirection: 'row',
    alignContent: 'center',
    justifyContent: 'space-between',
    width: '100%',
    paddingHorizontal: 50,
  },
  arrowIcon: {
    color: '#C4C4C4',
  },
});
