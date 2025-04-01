import { Text, View, StyleSheet, Image, TouchableOpacity, FlatList, SafeAreaView, StatusBar, Dimensions, ActivityIndicator, Alert } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from "@expo/vector-icons";
import React, { useState, useEffect } from 'react';
import { supabase } from "../../../supabase";
import AsyncStorage from "@react-native-async-storage/async-storage";
import * as Auth from 'expo-auth-session';

// Types
interface Song {
  id: string;
  title: string;
  artist: string;
  cover: any;
  spotify_uri?: string;
}

interface SupabaseSong {
  id: string;
  title: string;
  artistID: string | number;
  spotifyURL?: string;
  image?: string;
}

const SCREEN_WIDTH = Dimensions.get('window').width;

export default function ActivityScreen() {
  // Current playing song state
  const [currentSong, setCurrentSong] = useState<Song | null>(null);

  // Queue state
  const [queue, setQueue] = useState<Song[]>([]);
  
  // History state to keep track of previously played songs
  const [history, setHistory] = useState<Song[]>([]);

  // Loading and error states
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Player state
  const [isPlaying, setIsPlaying] = useState(true);
  const [currentTime, setCurrentTime] = useState('0:36');
  const [totalTime, setTotalTime] = useState('3:40');
  const [liked, setLiked] = useState(false);
  const [spotifyToken, setSpotifyToken] = useState<string | null>(null);
  const [spotifyID, setSpotifyID] = useState<string | null>(null);

  // Default fallback image
  const DEFAULT_IMAGE = require('../../../assets/images/placeholder/placeholder.jpg');

  // Get Spotify ID from AsyncStorage - using your existing approach
  useEffect(() => {
    const getSpotifyDetails = async () => {
      try {
        // Get spotifyID that you're storing in your login page
        const id = await AsyncStorage.getItem('spotifyID');
        if (id) {
          setSpotifyID(id);
          console.log("Retrieved Spotify ID:", id);
        }
      } catch (err) {
        console.error("Error retrieving Spotify ID:", err);
      }
    };

    getSpotifyDetails();
  }, []);

  // Convert a Supabase song to our app's Song format
  const convertToSong = (supabaseSong: SupabaseSong): Song => {
    return {
      id: supabaseSong.id,
      title: supabaseSong.title,
      artist: typeof supabaseSong.artistID === 'string' ? supabaseSong.artistID : `Artist ${supabaseSong.artistID}`,
      cover: supabaseSong.image 
        ? { uri: supabaseSong.image } 
        : DEFAULT_IMAGE,
      spotify_uri: supabaseSong.spotifyURL || undefined
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
            cover: DEFAULT_IMAGE,
          });
          
          setQueue([
            { id: '2', title: 'Sexy To Someone', artist: 'Clairo', cover: DEFAULT_IMAGE },
            { id: '3', title: 'Video Games', artist: 'Lana Del Rey', cover: DEFAULT_IMAGE },
            { id: '4', title: 'Die For You', artist: 'The Weeknd', cover: DEFAULT_IMAGE },
            { id: '5', title: 'R U Mine?', artist: 'Arctic Monkeys', cover: DEFAULT_IMAGE },
            { id: '6', title: 'Stargazing', artist: 'The Neighbourhood', cover: DEFAULT_IMAGE },
            { id: '7', title: 'Telepatia', artist: 'Kali Uchis', cover: DEFAULT_IMAGE },
            { id: '8', title: 'No One Noticed', artist: 'The Marias', cover: DEFAULT_IMAGE },
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
            cover: DEFAULT_IMAGE,
          });
          
          setQueue([
            { id: '2', title: 'Sexy To Someone', artist: 'Clairo', cover: DEFAULT_IMAGE },
            { id: '3', title: 'Video Games', artist: 'Lana Del Rey', cover: DEFAULT_IMAGE },
            { id: '4', title: 'Die For You', artist: 'The Weeknd', cover: DEFAULT_IMAGE },
            { id: '5', title: 'R U Mine?', artist: 'Arctic Monkeys', cover: DEFAULT_IMAGE },
            { id: '6', title: 'Stargazing', artist: 'The Neighbourhood', cover: DEFAULT_IMAGE },
            { id: '7', title: 'Telepatia', artist: 'Kali Uchis', cover: DEFAULT_IMAGE },
            { id: '8', title: 'No One Noticed', artist: 'The Marias', cover: DEFAULT_IMAGE },
          ]);
      } finally {
        setLoading(false);
      }
    };
    
    fetchSongs();
  }, []);

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
    if (spotifyID) {
      updateLikedStatus(currentSong.id, newLikedStatus);
    }
    
    console.log("Like toggled for track:", currentSong.id);
  };

  // Track liked status in Supabase
  const updateLikedStatus = async (songId: string, liked: boolean): Promise<void> => {
    if (!spotifyID) return;
    
    try {
      // Store liked songs in Supabase
      const { error } = await supabase
        .from('liked_songs')
        .upsert({ 
          song_id: songId,
          user_id: spotifyID,
          liked: liked
        });
      
      if (error) {
        console.error('Error updating liked status:', error);
      }
    } catch (err: any) {
      console.error('Error in like/unlike operation:', err);
    }
  };

  const handleSkipNext = (): void => {
    if (!currentSong || queue.length === 0) return;
    
    // Add current song to history
    setHistory(prevHistory => [currentSong, ...prevHistory]);
    
    // Set first song in queue as current and remove it from queue
    setCurrentSong(queue[0]);
    setQueue(queue.slice(1));
    
    // Reset liked status for new song
    setLiked(false);
    
    console.log("Skipped to next track");
  };

  const handleSkipPrevious = (): void => {
    if (!currentSong || history.length === 0) {
      console.log("No previous tracks available");
      return;
    }
    
    // Get the most recent song from history
    const previousSong = history[0];
    
    // Remove it from history
    const newHistory = history.slice(1);
    setHistory(newHistory);
    
    // Add current song to beginning of queue
    setQueue(prevQueue => [currentSong!, ...prevQueue]);
    
    // Set previous song as current
    setCurrentSong(previousSong);
    
    // Reset liked status for new song
    setLiked(false);
    
    console.log("Went back to previous track");
  };

  // Handle queue item click
  const handleQueueItemClick = (item: Song): void => {
    if (!currentSong) return;
    
    // Add current song to history
    setHistory(prevHistory => [currentSong, ...prevHistory]);
    
    // Remove the selected song from queue
    const newQueue = queue.filter(song => song.id !== item.id);
    
    // Set selected item as current song
    setCurrentSong(item);
    setQueue(newQueue);
    
    // Reset liked status for new song
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

  // Render history item
  const renderHistoryItem = ({ item }: { item: Song }): React.ReactElement => (
    <TouchableOpacity 
      style={[styles.queueItem, styles.historyItem]}
      onPress={() => {
        // Add current song to history
        setHistory(prevHistory => [currentSong!, ...prevHistory.filter(song => song.id !== item.id)]);
        
        // Set selected history item as current song
        setCurrentSong(item);
        
        // Reset liked status for new song
        setLiked(false);
      }}
    >
      <Image source={item.cover} style={styles.queueCover} />
      <View style={styles.queueTextContainer}>
        <Text style={styles.queueTitle}>{item.title}</Text>
        <Text style={styles.queueArtist}>{item.artist}</Text>
      </View>
      <Ionicons name="time-outline" size={18} color="#777" style={styles.historyIcon} />
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
                style={[styles.controlButton, history.length === 0 ? styles.disabledButton : null]}
                onPress={handleSkipPrevious}
                disabled={history.length === 0}
              >
                <Ionicons 
                  name="play-skip-back" 
                  size={24} 
                  color={history.length === 0 ? "#aaa" : "#333"} 
                />
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
                style={[styles.controlButton, queue.length === 0 ? styles.disabledButton : null]}
                onPress={handleSkipNext}
                disabled={queue.length === 0}
              >
                <Ionicons 
                  name="play-skip-forward" 
                  size={24} 
                  color={queue.length === 0 ? "#aaa" : "#333"} 
                />
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
              disabled={queue.length === 0}
            >
              <Ionicons name="close-circle-outline" size={32} color={queue.length === 0 ? "#aaa" : "#333"} />
            </TouchableOpacity>
          </View>
        </View>

        {/* Queue and History Section */}
        <View style={styles.queueContainer}>
          <View style={styles.tabsContainer}>
            <Text style={styles.queueTitle}>Queue</Text>
            {history.length > 0 && (
              <TouchableOpacity 
                style={styles.historyButton}
                onPress={() => Alert.alert(
                  "History", 
                  "You have " + history.length + " songs in your history",
                  [
                    {
                      text: "Close",
                      style: "cancel"
                    }
                  ]
                )}
              >
                <Text style={styles.historyButtonText}>{history.length} in history</Text>
              </TouchableOpacity>
            )}
          </View>
          
          {queue.length > 0 ? (
            <FlatList
              data={queue}
              renderItem={renderQueueItem}
              keyExtractor={(item: Song) => item.id}
              showsVerticalScrollIndicator={false}
              ListHeaderComponent={history.length > 0 ? (
                  <View style={styles.historySection}>
                  <Text style={styles.historySectionTitle}>Recently Played</Text>
                  <FlatList
                    data={history.slice(0, 3)} // Show only the 3 most recent
                    renderItem={renderHistoryItem}
                    keyExtractor={(item: Song) => `history-${item.id}`}
                    scrollEnabled={false}
                  />
                  {history.length > 3 && (
                    <TouchableOpacity
                      style={styles.showMoreButton}
                      onPress={() => Alert.alert(
                        "History",
                        "You have " + history.length + " songs in your history",
                        [
                          {
                            text: "Close",
                            style: "cancel"
                          }
                        ]
                      )}
                    >
                      <Text style={styles.showMoreText}>Show more...</Text>
                    </TouchableOpacity>
                  )}
                </View>
              ) : null}
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
  disabledButton: {
    opacity: 0.5,
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
  tabsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 15,
  },
  historyButton: {
    backgroundColor: '#f1f1f1',
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 15,
  },
  historyButtonText: {
    fontSize: 12,
    color: '#666',
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
    flex: 1,
  },
  queueArtist: {
    fontSize: 14,
    color: '#777',
  },
  historySection: {
    marginBottom: 20,
    paddingBottom: 10,
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
  },
  historySectionTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
    marginBottom: 10,
  },
  historyItem: {
    backgroundColor: '#f9f9f9',
  },
  historyIcon: {
    marginLeft: 10,
  },
  showMoreButton: {
    alignItems: 'center',
    padding: 8,
  },
  showMoreText: {
    color: '#3a86ff',
    fontSize: 14,
  }
});