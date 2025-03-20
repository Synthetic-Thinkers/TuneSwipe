import React, { useState , useEffect} from "react";
import { View, Text, StyleSheet, Image, Animated, Easing} from "react-native";
import Swiper from 'react-native-deck-swiper';
import Ionicons from '@expo/vector-icons/Ionicons';
import { useFonts, Inter_400Regular, Inter_500Medium, Inter_600SemiBold, Inter_700Bold, Inter_800ExtraBold } from "@expo-google-fonts/inter";
import { useRoute } from '@react-navigation/native';
import { supabase } from "@/supabase";

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

export default function SwipeScreen({ navigation }) {
  const route = useRoute();

  const { spotifyID, mode, activityLog } = route.params as RouteParams;

  const [index, setIndex] = useState(0);
  const [musicData, setMusicData] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [swipeResults, setSwipeResults] = useState(activityLog.swipeResults || []);


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
    }
    setMusicData(data || []);
  }

  useEffect(() => {
    fetchData();
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
    const updatedActivityLog = {
      ...activityLog,
      swipeResults: swipeResults,
    };
    try {
      console.log("Saved updated acticity log:", updatedActivityLog);


      // const { data, error } = await supabase
      //   .from('Test')
      //   .update({
      //     activityLog: updatedActivityLog,
      //   })
      //   .eq('id', userId);

      // if (error) {
      //   throw new Error(error.message);
      // }

      // console.log('Activity log saved successfully:', data);

      navigation.navigate('PlaylistLoading');

    } catch (error) {
      console.error("Error saving updated activity log:", error);
    }
  };


  return (
    <View style={styles.container}>
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
              ) : (
                card.image ? (
                  <Image source={{ uri: card.image }} style={styles.image} />
               ) : (
                  <Image source={require('../../../assets/images/defaultImage.png')} style={styles.image} />
              )
            )}
            <View style={styles.textContainer}>
              {mode === 'songs' ? (
                <Text style={styles.songText}>
                  {card.artistID} - {card.title}
                </Text>
              ) : mode === 'artists' ? (
                <Text style={styles.songText}>
                  {card.name}
                </Text>
                ) : (
                <Text style={styles.songText}>Genre Mode - Coming Soon!</Text>
              )}
              <Text style={styles.genreText}>{card.genre}</Text>
            </View>
            <View style={styles.choiceContainer}>
              <View style={styles.rectangle}></View>
              <Ionicons name="close-circle-outline" size={80} style={styles.dislikeIcon} />
              <Ionicons name="heart-circle-outline" size={80} style={styles.likeIcon} />
            </View>
            </View>
        )}
        onSwipedRight={handleSwipeRight}
        onSwipedLeft={handleSwipeLeft}
        stackSize={10}
        backgroundColor="transparent"
        containerStyle={styles.swiperContainer}
        cardIndex={index}
        onSwiped={(swipeIndex) => setIndex(swipeIndex + 1)}
        onSwipedAll={handleSwipedAll}
      />
    </View>

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
    justifyContent: "center",
    alignItems: "center",
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
    borderRadius: 8,
    width: 400,
    maxHeight: 730,
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
});
