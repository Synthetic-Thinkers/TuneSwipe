import React, { useState } from "react";
import { View, Text, StyleSheet, Image, TouchableHighlight} from "react-native";
import Swiper from 'react-native-deck-swiper';
import Ionicons from '@expo/vector-icons/Ionicons';
import { useFonts, Inter_400Regular, Inter_500Medium, Inter_600SemiBold, Inter_700Bold, Inter_800ExtraBold } from "@expo-google-fonts/inter";

export default function SwipeScreen({ navigation }) {
  const [index, setIndex] = useState(0);
  // const [likedData, setLikedData] = useState([]);


  const [fontsLoaded] = useFonts({
    Inter_400Regular,
    Inter_500Medium,
    Inter_600SemiBold,
    Inter_700Bold,
    Inter_800ExtraBold,
      });

      if (!fontsLoaded) {
        // Show loading text until fonts are loaded
        return <Text>Loading...</Text>;
  }


  const musicData = [
    { id: 1, artist: "Don Toliver", title: 'BANDIT', genre: 'Hip-Hop + Rap', image: require('../../../assets/images/tempImage.jpg') },
    { id: 2, artist: "Clario", title: 'Sexy to Someone', genre: 'Indie + Alternative + Folk', image: require('../../../assets/images/tempImage2.jpg') },
    { id: 3, artist: 'The Weekend', title: 'Die For You', genre: 'Pop + R&B', image: require('../../../assets/images/tempImage3.jpg') },
    { id: 4, artist: 'Artic Monkeys', title: 'R U Mine?', genre: 'Inide + Rock + R&B', image: require('../../../assets/images/tempImage4.jpg') }
  ];
  // const likedData = [];

  const handleSwipeRight = (cardIndex) => {
    console.log(`Liked: ${musicData[cardIndex].title}`);
    // likedData.push(musicData[cardIndex]);
    // setLikedData( musicData[cardIndex] );
  }

  const handleSwipeLeft = (cardIndex) => {
    console.log(`Disliked: ${musicData[cardIndex].title}`);
  }

  const handleSwipedAll = () => {
    navigation.navigate('PlaylistLoading');  // Replace 'LoadingScreen' with your desired screen name
  }

  return (
    <View style={styles.container}>
      <Swiper
        cards={musicData}
        renderCard={(card) => (
          <View style={styles.cardContainer}>
            <Image source={card.image} style={styles.image} />
            <View style={styles.textContainer}>
              <Text style={styles.songText}>{card.artist} - {card.title}</Text>
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
        stackSize={4} // Shows 3 cards stacked
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
