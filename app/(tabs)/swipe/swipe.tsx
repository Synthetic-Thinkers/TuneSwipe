import React, { useState , useEffect, useRef} from "react";
import { View, Text, StyleSheet, Image, TouchableOpacity} from "react-native";
import Swiper from 'react-native-deck-swiper';
import Ionicons from '@expo/vector-icons/Ionicons';
import { Entypo } from "@expo/vector-icons";
import { useFonts, Inter_400Regular, Inter_500Medium, Inter_600SemiBold, Inter_700Bold, Inter_800ExtraBold } from "@expo-google-fonts/inter";
import { useRoute } from '@react-navigation/native';
import { supabase } from "@/supabase";
import { BlurView } from "expo-blur";

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

  const [index, setIndex] = useState(0);
  const [musicData, setMusicData] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [swipeResults, setSwipeResults] = useState(activityLog.swipeResults || []);
  const [sessionID, setSessionID] = useState<number>(activityLog._id);
  const [activityLogs, setActivityLogs] = useState<ActivityLog[]>([]);
  const [showBlur, setShowBlur] = useState(true);
  const swiperRef = useRef<Swiper<any>>(null);

  const [fontsLoaded] = useFonts({
    Inter_400Regular,
    Inter_500Medium,
    Inter_600SemiBold,
    Inter_700Bold,
    Inter_800ExtraBold,
  });

  const fetchData = async () => {
    let data;
    if (mode === 'songs') {
      const { data: songData, error } = await supabase
        .from('Song')
        .select('*')
        .limit(10);
      if (error) {
        console.error("Error fetching songs:", error);
        return;
      }
      data = songData;
      console.log(data);
      setLoading(false);
    } else if (mode === 'artists') {
      const { data: artistData, error } = await supabase
        .from('Artist')
        .select('*')
        .limit(10);
      if (error) {
        console.error('Error fetching artists:', error);
        return;
      }
      data = artistData;
      console.log(data);
      setLoading(false);
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
      setLoading(false);
    }
    setMusicData(data || []);
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
    fetchData();
    fetchActivityLogs();
  }, [mode]);

  if (loading || !fontsLoaded) {
    return (
      <View style={styles.container}>
        <Text style={styles.text}>Loading your next vibe check... almost there!</Text>
        <Image style={styles.turntableIcon} source={require('../../../assets/images/turntable.gif')} />
      </View>
    );
  }


  const handleSwipeRight = (cardIndex) => {
    console.log(`Liked: ${musicData[cardIndex].title || musicData[cardIndex].name}`);
    setSwipeResults((prevResults) => [
      ...prevResults,
      { id: musicData[cardIndex].id, liked: true }
    ]);
  };

  const handleSwipeLeft = (cardIndex) => {
    console.log(`Disliked: ${musicData[cardIndex].title || musicData[cardIndex].name}`);
    setSwipeResults((prevResults) => [
      ...prevResults,
      { id: musicData[cardIndex].id, liked: false }
    ]);
  };

  const handleSwipedAll = async () => {
    const updatedLogs = activityLogs.map(log =>
    log._id === sessionID ? { ...log, swipeResults } : log
  );

  try {
    const { error } = await supabase
      .from("User")
      .update({ activityLog: updatedLogs })
      .eq("spotifyID", spotifyID);

    if (error) {
      throw error;
    }

    console.log("Successfully updated activity logs:", updatedLogs);
    navigation.navigate("PlaylistLoading");
  } catch (error) {
    console.error("Error saving updated activity log:", error);
  }
    console.log('Swipe Results:', swipeResults);
      navigation.navigate('PlaylistLoading');
  };

  const onPressStart = () => setShowBlur(false);
  const firstCard = musicData[0];

  return (
    <TouchableOpacity style={styles.blurView} onPress={onPressStart} activeOpacity={1}>
      <View style={styles.container}>
        {/* Show BlurView and Instructions when 'showBlur' is true */}
        {showBlur && (
          <>
            <Image
             source={firstCard.imageUrl ? { uri: firstCard.imageUrl } : require('../../../assets/images/defaultImage.png')}
             style={styles.image}
            />
            <View style={styles.choiceContainer}>
              <View style={styles.rectangle}></View>
              <Ionicons name="close-circle-outline" size={80} style={styles.dislikeIcon} />
              <Ionicons name="heart-circle-outline" size={80} style={styles.likeIcon} />
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
                {mode === 'songs' ? (
                  card.image ? (
                    <Image source={{ uri: card.image }} style={styles.image} />
                  ) : (
                    <Image source={require('../../../assets/images/defaultImage.png')} style={styles.image} />
                  )
                ) : mode === 'artists' ? (
                  card.imageUrl ? (
                    <Image source={{ uri: card.imageUrl }} style={styles.image} />
                  ) : (
                    <Image source={require('../../../assets/images/defaultImage.png')} style={styles.image} />
                  )
                ) : mode === 'genres' ? (
                  card.image ? (
                    <Image source={{ uri: card.image }} style={styles.image} />
                  ) : (
                    <Image source={require('../../../assets/images/defaultImage.png')} style={styles.image} />
                  )
                ) : null}
                <View style={styles.textContainer}>
                  {mode === 'songs' ? (
                    <Text style={styles.songText}>
                      {card.artistID} - {card.title}
                    </Text>
                  ) : (
                    <Text style={styles.songText}>{card.name}</Text>
                  )}
                  <Text style={styles.genreText}>{card.genre}</Text>
                </View>
                <View style={styles.choiceContainer}>
                  <View style={styles.rectangle}></View>
                  <TouchableOpacity
                    style={styles.dislikeButton}
                    onPress={() => swiperRef.current?.swipeLeft()} >
                    <Ionicons name="close-circle-outline" size={80} style={styles.dislikeButton} />
                  </TouchableOpacity>
                  <TouchableOpacity
                    style={styles.likeButton}
                    onPress={() => swiperRef.current?.swipeRight()} >
                    <Ionicons name="heart-circle-outline" size={80} style={styles.likeButton} />
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

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#ffff',
    justifyContent: 'center',
    alignItems: 'center',
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
    top: 320,
    position: "absolute",
    alignItems:'center',
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
  image: {
    borderRadius: 8,
    flex: 1,
    width: 400,
    maxHeight: 715,
  },
  cardContainer: {
    flex: 1,
    // borderRadius: 8,
    // maxWidth: 400,
    maxHeight: 715,
    alignSelf: 'center',
    bottom: 55,
    overflow: "hidden",
  },
  textContainer: {
    position: 'absolute',
    top: 570,
  },
  choiceContainer: {
    width: 400,
    height: 83,
    borderBottomLeftRadius: 8,
    borderBottomRightRadius: 8,
    position: 'absolute',
    top: 632,
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
  dislikeIcon: {
    color: '#CC0058',
    position: 'absolute',
    left: 97,
  },
  likeIcon: {
    color: '#98F5E1',
    position: 'absolute',
    left: 216,
  },
  dislikeButton: {
    color: '#CC0058',
    position: 'absolute',
    left: 48,
  },
  likeButton: {
    color: '#98F5E1',
    position: 'absolute',
    left: 110,
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
