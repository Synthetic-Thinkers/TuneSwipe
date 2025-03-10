import { Text, View, StyleSheet, Image, TouchableOpacity, FlatList, SafeAreaView, StatusBar, Dimensions } from 'react-native';
import { Colors } from 'react-native/Libraries/NewAppScreen';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons, Feather, FontAwesome } from "@expo/vector-icons";
import React, { useState } from 'react';

// Types
interface Song {
  id: string;
  title: string;
  artist: string;
  cover: any;
}

const SCREEN_WIDTH = Dimensions.get('window').width;

export default function PlayerScreen() {
  // Current playing song state
  const [currentSong, setCurrentSong] = useState({
    id: '1',
    title: 'Good 4 U',
    artist: 'Olivia Rodrigo',
    cover: require('./assets/olivia.jpeg'),
  });

  // Queue state
  const [queue, setQueue] = useState([
    { id: '2', title: 'Sexy To Someone', artist: 'Clairo', cover: require('./assets/clairo_charm.jpeg') },
    { id: '3', title: 'Video Games', artist: 'Lana Del Rey', cover: require('./assets/lana.jpeg') },
    { id: '4', title: 'Die For You', artist: 'The Weeknd', cover: require('./assets/theweeknd.jpeg') },
    { id: '5', title: 'R U Mine?', artist: 'Arctic Monkeys', cover: require('./assets/articmonkeys.jpeg') },
    { id: '6', title: 'Stargazing', artist: 'The Neighbourhood', cover: require('./assets/theneighborhood.jpg') },
    { id: '7', title: 'Telepatia', artist: 'Kali Uchis', cover: require('./assets/kaliuchis.jpeg') },
    { id: '8', title: 'No One Noticed', artist: 'The Marias', cover: require('./assets/themarias.jpeg') },
  ]);

  // Player state
  const [isPlaying, setIsPlaying] = useState(true);
  const [currentTime, setCurrentTime] = useState('0:36');
  const [totalTime, setTotalTime] = useState('3:40');
  const [liked, setLiked] = useState(false);

  // These functions will be connected to Spotify API later
  const handlePlayPause = () => {
    setIsPlaying(!isPlaying);
    // Will connect to Spotify play/pause API in the future
    console.log("Play/Pause toggled");
  };

  const handleLike = () => {
    setLiked(!liked);
    // Will connect to Spotify liked tracks API in the future
    console.log("Like toggled for track:", currentSong.id);
  };

  const handleSkipNext = () => {
    // Simulate track change with mock data
    if (queue.length > 0) {
      // Move current song to end of queue
      const updatedQueue = [...queue];
      updatedQueue.push(currentSong);
      
      // Set first song in queue as current and remove it from queue
      setCurrentSong(updatedQueue[0]);
      setQueue(updatedQueue.slice(1));
      
      console.log("Skipped to next track");
    }
  };

  const handleSkipPrevious = () => {
    // This would connect to Spotify previous track API in the future
    console.log("Skipped to previous track");
  };

  // Render queue item
  const renderQueueItem = ({ item }: { item: Song }) => (
    <TouchableOpacity 
      style={styles.queueItem}
      onPress={() => {
        // Move current song to queue
        const updatedQueue = [...queue.filter(song => song.id !== item.id)];
        updatedQueue.unshift(currentSong);
        
        // Set selected item as current song
        setCurrentSong(item);
        setQueue(updatedQueue);
      }}
    >
      <Image source={item.cover} style={styles.queueCover} />
      <View style={styles.queueTextContainer}>
        <Text style={styles.queueTitle}>{item.title}</Text>
        <Text style={styles.queueArtist}>{item.artist}</Text>
      </View>
    </TouchableOpacity>
  );

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="dark-content" />
      <LinearGradient
        colors={['#e9b8fe', '#fec0e7', '#ffffff']}
        style={styles.gradient}
      >
        {/* App Header */}
        <View style={styles.header}>
          <Text style={styles.appTitle}>
            <Text style={{ color: '#FFFFFF' }}>TuneSwipe</Text>
          </Text>
        </View>

        {/* Currently Playing Section */}
        <View style={styles.playingContainer}>
          <Text style={styles.playingLabel}>Currently Playing:</Text>
          <Image source={currentSong.cover} style={styles.albumCover} />
          <Text style={styles.songTitle}>{currentSong.title} - {currentSong.artist}</Text>

          {/* Player Controls */}
          <View style={styles.playerControls}>
            <Text style={styles.timeText}>{currentTime}</Text>
            
            <View style={styles.controlButtons}>
              <TouchableOpacity 
                style={styles.controlButton}
                onPress={handleSkipPrevious}
              >
                <Ionicons name="play-skip-back" size={24} color="#333" />
              </TouchableOpacity>
              
              <TouchableOpacity 
                style={styles.playButton}
                onPress={handlePlayPause}
              >
                <Ionicons 
                  name={isPlaying ? "pause" : "play"} 
                  size={28} 
                  color="#333" 
                />
              </TouchableOpacity>
              
              <TouchableOpacity 
                style={styles.controlButton}
                onPress={handleSkipNext}
              >
                <Ionicons name="play-skip-forward" size={24} color="#333" />
              </TouchableOpacity>
            </View>
            
            <Text style={styles.timeText}>{totalTime}</Text>
          </View>

          {/* Like/Dislike Buttons */}
          <View style={styles.reactionButtons}>
            <TouchableOpacity 
              style={styles.reactionButton}
              onPress={handleLike}
            >
              <Ionicons 
                name={liked ? "heart" : "heart-outline"} 
                size={32} 
                color={liked ? "#e91e63" : "#333"} 
              />
            </TouchableOpacity>
            
            <TouchableOpacity 
              style={styles.reactionButton}
              onPress={handleSkipNext}
            >
              <Ionicons name="close-circle-outline" size={32} color="#333" />
            </TouchableOpacity>
          </View>
        </View>

        {/* Queue Section */}
        <View style={styles.queueContainer}>
          <Text style={styles.queueTitle}>Queue</Text>
          <FlatList
            data={queue}
            renderItem={renderQueueItem}
            keyExtractor={(item) => item.id}
            showsVerticalScrollIndicator={false}
          />
        </View>

      </LinearGradient>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  gradient: {
    flex: 1,
  },
  header: {
    paddingTop: 10,
    paddingBottom: 10,
    alignItems: 'center',
  },
  appTitle: {
    fontSize: 28,
    fontWeight: 'bold',
  },
  playingContainer: {
    alignItems: 'center',
    paddingHorizontal: 20,
  },
  playingLabel: {
    fontSize: 16,
    fontWeight: '500',
    color: '#333',
    marginBottom: 10,
  },
  albumCover: {
    width: SCREEN_WIDTH * 0.6,
    height: SCREEN_WIDTH * 0.6,
    borderRadius: 10,
    marginVertical: 10,
  },
  songTitle: {
    fontSize: 18,
    fontWeight: '600',
    marginTop: 5,
    marginBottom: 15,
    textAlign: 'center',
  },
  playerControls: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    width: '100%',
    marginBottom: 10,
  },
  timeText: {
    fontSize: 14,
    color: '#666',
  },
  controlButtons: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  controlButton: {
    padding: 10,
  },
  playButton: {
    backgroundColor: '#fff',
    width: 50,
    height: 50,
    borderRadius: 25,
    justifyContent: 'center',
    alignItems: 'center',
    marginHorizontal: 15,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  reactionButtons: {
    flexDirection: 'row',
    justifyContent: 'center',
    width: '100%',
    marginVertical: 5,
  },
  reactionButton: {
    padding: 8,
    marginHorizontal: 20,
  },
  queueContainer: {
    flex: 1,
    backgroundColor: '#fff',
    borderTopLeftRadius: 30,
    borderTopRightRadius: 30,
    paddingHorizontal: 20,
    paddingTop: 20,
    marginTop: 10,
  },
  queueTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 15,
  },
  queueItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 8,
    borderBottomWidth: 0.5,
    borderBottomColor: '#eee',
  },
  queueCover: {
    width: 60,
    height: 60,
    borderRadius: 4,
  },
  queueTextContainer: {
    marginLeft: 15,
  },
  queueArtist: {
    fontSize: 14,
    color: '#777',
  },
  tabBar: {
    flexDirection: 'row',
    backgroundColor: '#f5f5f5',
    borderTopWidth: 1,
    borderTopColor: '#e0e0e0',
    height: 60,
  },
  tabBarButton: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  activeTab: {
    borderTopWidth: 2,
    borderTopColor: '#e91e63',
  },
  tabBarText: {
    fontSize: 12,
    marginTop: 3,
    color: '#555',
  },
  activeTabText: {
    color: '#e91e63',
    fontWeight: '500',
  },
});