import { Text, View, StyleSheet, Image, TouchableOpacity, FlatList, SafeAreaView, StatusBar, Dimensions, ActivityIndicator } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from "@expo/vector-icons";
import React, { useState, useEffect } from 'react';
import supabase from "../../utils/supabaseClient"; // Fix the path to match your project structure

// Types
interface Song {
  id: string;
  title: string;
  artist: string;
  cover: any;
  cover_url?: string;
}

interface Artist {
    id: number;
    name: string;
    image?: string;
}

interface SupabaseSong {
  id: string;
  title: string;
  artist: string;
  cover_url?: string;
}

interface LikedSong {
  song_id: string;
  user_id: string;
  liked: boolean;
}

const SCREEN_WIDTH = Dimensions.get('window').width;

export default function ActivityScreen() {
  // Current playing song state
  const [currentSong, setCurrentSong] = useState<Song | null>(null);

  // Queue state
  const [queue, setQueue] = useState<Song[]>([]);

  // Loading and error states
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Player state
  const [isPlaying, setIsPlaying] = useState(true);
  const [currentTime, setCurrentTime] = useState('0:36');
  const [totalTime, setTotalTime] = useState('3:40');
  const [liked, setLiked] = useState(false);

  // Convert a Supabase song to our app's Song format
  const convertToSong = (supabaseSong: SupabaseSong): Song => {
    return {
      id: supabaseSong.id,
      title: supabaseSong.title,
      artist: supabaseSong.artist,
      cover: supabaseSong.cover_url 
        ? { uri: supabaseSong.cover_url } 
        : require('./assets/placeholder.jpg'), // Fallback to local image
      cover_url: supabaseSong.cover_url
    };
  };

  // Fetch songs from Supabase
  useEffect(() => {
    const fetchSongs = async (): Promise<void> => {
      try {
        setLoading(true);
        
        // Fetch songs from your Supabase table
        const { data, error } = await supabase
          .from('Song')
          .select('*')
          .limit(10);
        
        if (error) {
          throw error;
        }
        
        if (data && data.length > 0) {
          // Set the first song as current
          setCurrentSong(convertToSong(data[0]));
          
          // Set the rest as queue
          const queueSongs = data.slice(1).map((song: SupabaseSong) => convertToSong(song));
          
          setQueue(queueSongs);
        } else {
          // If no data from Supabase, use fallback data
          setCurrentSong({
            id: '1',
            title: 'Good 4 U',
            artist: 'Olivia Rodrigo',
            cover: require('./assets/olivia.jpeg'),
          });
          
          setQueue([
            { id: '2', title: 'Sexy To Someone', artist: 'Clairo', cover: require('./assets/clairo_charm.jpeg') },
            { id: '3', title: 'Video Games', artist: 'Lana Del Rey', cover: require('./assets/lana.jpeg') },
            { id: '4', title: 'Die For You', artist: 'The Weeknd', cover: require('./assets/theweeknd.jpeg') },
            { id: '5', title: 'R U Mine?', artist: 'Arctic Monkeys', cover: require('./assets/articmonkeys.jpeg') },
            { id: '6', title: 'Stargazing', artist: 'The Neighbourhood', cover: require('./assets/theneighborhood.jpg') },
            { id: '7', title: 'Telepatia', artist: 'Kali Uchis', cover: require('./assets/kaliuchis.jpeg') },
            { id: '8', title: 'No One Noticed', artist: 'The Marias', cover: require('./assets/themarias.jpeg') },
          ]);
        }
      } catch (err: any) {
        console.error('Error fetching songs:', err);
        setError('Failed to load songs. Please try again later.');
        
        // Set fallback data
        setCurrentSong({
          id: '1',
          title: 'Good 4 U',
          artist: 'Olivia Rodrigo',
          cover: require('./assets/olivia.jpeg'),
        });
        
        setQueue([
          { id: '2', title: 'Sexy To Someone', artist: 'Clairo', cover: require('./assets/clairo_charm.jpeg') },
          { id: '3', title: 'Video Games', artist: 'Lana Del Rey', cover: require('./assets/lana.jpeg') },
          { id: '4', title: 'Die For You', artist: 'The Weeknd', cover: require('./assets/theweeknd.jpeg') },
          { id: '5', title: 'R U Mine?', artist: 'Arctic Monkeys', cover: require('./assets/articmonkeys.jpeg') },
          { id: '6', title: 'Stargazing', artist: 'The Neighbourhood', cover: require('./assets/theneighborhood.jpg') },
          { id: '7', title: 'Telepatia', artist: 'Kali Uchis', cover: require('./assets/kaliuchis.jpeg') },
          { id: '8', title: 'No One Noticed', artist: 'The Marias', cover: require('./assets/themarias.jpeg') },
        ]);
      } finally {
        setLoading(false);
      }
    };
    
    fetchSongs();
  }, []);

  // Track liked status in Supabase
  const updateLikedStatus = async (songId: string, liked: boolean): Promise<void> => {
    try {
      const { error } = await supabase
        .from('liked_songs')
        .upsert({ 
          song_id: songId,
          user_id: 'current-user-id',
          liked: liked
        } as LikedSong);
      
      if (error) {
        console.error('Error updating liked status:', error);
      }
    } catch (err: any) {
      console.error('Error in like/unlike operation:', err);
    }
  };

  // Player control functions
  const handlePlayPause = (): void => {
    setIsPlaying(!isPlaying);
    // Will connect to Spotify play/pause API in the future
    console.log("Play/Pause toggled");
  };

  const handleLike = (): void => {
    if (!currentSong) return;
    
    const newLikedStatus = !liked;
    setLiked(newLikedStatus);
    
    // Update liked status in Supabase
    updateLikedStatus(currentSong.id, newLikedStatus);
    
    console.log("Like toggled for track:", currentSong.id);
  };

  const handleSkipNext = (): void => {
    if (!currentSong || queue.length === 0) return;
    
    // Move current song to end of queue
    const updatedQueue = [...queue];
    updatedQueue.push(currentSong);
    
    // Set first song in queue as current and remove it from queue
    setCurrentSong(updatedQueue[0]);
    setQueue(updatedQueue.slice(1));
    
    // Reset liked status for new song (should fetch from server in real implementation)
    setLiked(false);
    
    console.log("Skipped to next track");
  };

  const handleSkipPrevious = (): void => {
    // This would connect to Spotify previous track API in the future
    console.log("Skipped to previous track");
  };

  // Handle queue item click
  const handleQueueItemClick = (item: Song): void => {
    if (!currentSong) return;
    
    // Move current song to queue
    const updatedQueue = [...queue.filter((song: Song) => song.id !== item.id)];
    updatedQueue.unshift(currentSong);
    
    // Set selected item as current song
    setCurrentSong(item);
    setQueue(updatedQueue);
    
    // Reset liked status for new song (should fetch from server in real implementation)
    setLiked(false);
  };

  // Render queue item
  const renderQueueItem = ({ item }: { item: Song }): React.ReactElement => (
    <TouchableOpacity 
      style={styles.queueItem}
      onPress={() => handleQueueItemClick(item)}
    >
      <Image source={item.cover} style={styles.queueCover} />
      <View style={styles.queueTextContainer}>
        <Text style={styles.queueTitle}>{item.title}</Text>
        <Text style={styles.queueArtist}>{item.artist}</Text>
      </View>
    </TouchableOpacity>
  );

  if (loading) {
    return (
      <SafeAreaView style={styles.container}>
        <LinearGradient
          colors={['#e9b8fe', '#fec0e7', '#ffffff']}
          style={[styles.gradient, styles.loadingContainer]}
        >
          <ActivityIndicator size="large" color="#333" />
          <Text style={styles.loadingText}>Loading your music...</Text>
        </LinearGradient>
      </SafeAreaView>
    );
  }

  if (!currentSong) {
    return (
      <SafeAreaView style={styles.container}>
        <LinearGradient
          colors={['#e9b8fe', '#fec0e7', '#ffffff']}
          style={[styles.gradient, styles.loadingContainer]}
        >
          <Text style={styles.errorText}>No songs available.</Text>
        </LinearGradient>
      </SafeAreaView>
    );
  }

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

        {error && (
          <View style={styles.errorContainer}>
            <Text style={styles.errorText}>{error}</Text>
          </View>
        )}

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
          {queue.length > 0 ? (
            <FlatList
              data={queue}
              renderItem={renderQueueItem}
              keyExtractor={(item: Song) => item.id}
              showsVerticalScrollIndicator={false}
            />
          ) : (
            <Text style={styles.emptyQueueText}>Your queue is empty</Text>
          )}
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
  loadingContainer: {
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    marginTop: 15,
    fontSize: 16,
    color: '#333',
  },
  errorContainer: {
    backgroundColor: 'rgba(255, 87, 87, 0.1)',
    padding: 12,
    margin: 12,
    borderRadius: 8,
  },
  errorText: {
    color: '#d32f2f',
    textAlign: 'center',
    fontSize: 16,
  },
  emptyQueueText: {
    textAlign: 'center',
    color: '#777',
    fontSize: 16,
    fontStyle: 'italic',
    marginTop: 30,
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