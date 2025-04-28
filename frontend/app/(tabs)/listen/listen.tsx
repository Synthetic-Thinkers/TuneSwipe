import { Text, View, StyleSheet, Image, TouchableOpacity, FlatList, SafeAreaView, StatusBar, Dimensions, ActivityIndicator, Alert } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from "@expo/vector-icons";
import React, { useState, useEffect } from 'react';
import { supabase } from "../../../supabase";
import AsyncStorage from "@react-native-async-storage/async-storage";

// Types
interface Song {
  id: string;
  title: string;
  artist: string;
  cover: any;
  spotify_uri?: string;
}

interface SpotifyArtist {
  id: string;
  name: string;
}

interface SpotifyTrack {
  id: string;
  name: string;
  uri: string;
  artists: SpotifyArtist[];
  album: {
    id: string;
    name: string;
    images: Array<{
      url: string;
      height: number;
      width: number;
    }>;
  };
  duration_ms: number;
}

interface SpotifyCurrentlyPlaying {
  item: SpotifyTrack;
  is_playing: boolean;
  progress_ms: number;
}

const SCREEN_WIDTH = Dimensions.get('window').width;


export default function ListenScreen() {
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
  const [currentTime, setCurrentTime] = useState('0:00');
  const [totalTime, setTotalTime] = useState('0:00');
  const [liked, setLiked] = useState(false);
  const [spotifyToken, setSpotifyToken] = useState<string | null>(null);
  const [spotifyID, setSpotifyID] = useState<string | null>(null);

  // Default fallback image
  const DEFAULT_IMAGE = require('../../../assets/images/defaultImage.png');

  const debugAsyncStorage = async () => {
    try {
      const keys = await AsyncStorage.getAllKeys();
      console.log("All AsyncStorage keys:", keys);
      
      for (const key of keys) {
        const value = await AsyncStorage.getItem(key);
        console.log(`Key: ${key}, Value exists: ${!!value}, Value length: ${value ? value.length : 0}`);
      }
    } catch (e) {
      console.error("AsyncStorage debug error:", e);
    }
  };

  // Get Spotify ID and token from AsyncStorage
  useEffect(() => {

    debugAsyncStorage();
    
    const getSpotifyDetails = async () => {
      try {
        // Get spotifyID and token
        const id = await AsyncStorage.getItem('spotifyID');
        const token = await AsyncStorage.getItem('accessToken');

        console.log("Token from AsyncStorage:", token);
        console.log("Token type:", typeof token);
        console.log("Token length:", token ? token.length : 0);
        
        if (id) {
          setSpotifyID(id);
          console.log("Retrieved Spotify ID:", id);
        }
        
        if (token) {
          setSpotifyToken(token);
          console.log("Retrieved Spotify token");
        }
      } catch (err) {
        console.error("Error retrieving Spotify credentials:", err);
      }
    };

    getSpotifyDetails();
    
  }, []);

  // Convert Spotify track to our app's Song format
  const convertSpotifyTrackToSong = (track: SpotifyTrack): Song => {
    return {
      id: track.id,
      title: track.name,
      artist: track.artists.map(artist => artist.name).join(", "),
      cover: track.album.images[0]?.url 
        ? { uri: track.album.images[0].url } 
        : DEFAULT_IMAGE,
      spotify_uri: track.uri
    };
  };

  // Get currently playing song from Spotify
  const fetchCurrentlyPlaying = async () => {
    if (!spotifyToken) {
      console.log("No Spotify token available");
      //setError("Spotify token not available");
      return;
    }

    try {
      console.log("Fetching currently playing song...");
      const response = await fetch('https://api.spotify.com/v1/me/player/currently-playing', {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${spotifyToken}`
        }
      });

      // 204 means no content (nothing playing)
      if (response.status === 204) {
        console.log("No track currently playing");
        setError("No song currently playing");
        setLoading(false);
        return;
      }

      if (!response.ok) {
        throw new Error(`Error fetching currently playing: ${response.status}`);
      }

      const data: SpotifyCurrentlyPlaying = await response.json();
      
      if (data && data.item) {
        console.log("Currently playing track:", data.item.name);
        
        // Convert to Song and update state
        const song = convertSpotifyTrackToSong(data.item);
        setCurrentSong(song);
        setIsPlaying(data.is_playing);
        
        // Format time values
        const progressMinutes = Math.floor(data.progress_ms / 60000);
        const progressSeconds = Math.floor((data.progress_ms % 60000) / 1000);
        setCurrentTime(`${progressMinutes}:${progressSeconds.toString().padStart(2, '0')}`);
        
        const durationMinutes = Math.floor(data.item.duration_ms / 60000);
        const durationSeconds = Math.floor((data.item.duration_ms % 60000) / 1000);
        setTotalTime(`${durationMinutes}:${durationSeconds.toString().padStart(2, '0')}`);
        
        // Check if the song is in the user's liked songs
        checkIfSongIsLiked(data.item.id);
        
        // Fetch queue
        fetchQueue();
      }
    } catch (err: any) {
      console.error("Error fetching currently playing:", err);
      setError("Failed to fetch currently playing song");
    } finally {
      setLoading(false);
    }
  };

  // Fetch queue from Spotify
  const fetchQueue = async () => {
    if (!spotifyToken) {
      // console.log("No Spotify token available");
      return;
    }

    try {
      console.log("Fetching queue...");
      const response = await fetch('https://api.spotify.com/v1/me/player/queue', {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${spotifyToken}`
        }
      });

      if (!response.ok) {
        console.error(`Error ${response.status}: ${response.statusText}`);
        throw new Error(`Error fetching queue: ${response.status}`);
      }

      const data = await response.json();
      
      if (data && data.queue) {
        console.log(`Queue contains ${data.queue.length} songs`);
        
        // Convert queue tracks to Song format
        const queueSongs = data.queue.map((track: SpotifyTrack) => 
          convertSpotifyTrackToSong(track)
        );
        
        setQueue(queueSongs);
      }
    } catch (err) {
      console.error("Error fetching queue:", err);
    }
  };

  // Check if song is in user's liked songs
  const checkIfSongIsLiked = async (trackId: string) => {
    if (!spotifyToken) {
      console.log("No Spotify token available");
      return;
    }

    try {
      const response = await fetch(`https://api.spotify.com/v1/me/tracks/contains?ids=${trackId}`, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${spotifyToken}`
        }
      });

      if (!response.ok) {
        throw new Error(`Error checking if track is saved: ${response.status}`);
      }

      const data = await response.json();
      
      if (data && data.length > 0) {
        setLiked(data[0]);
      }
    } catch (err) {
      console.error("Error checking if track is liked:", err);
    }
  };

  useEffect(() => {
    console.log("Spotify Token: ", spotifyToken);
    
    // Define an async function inside useEffect
    const getTokenAndFetchData = async () => {
      try {
        // Get token from AsyncStorage
        const token = await AsyncStorage.getItem('accessToken');
        console.log("Token from AsyncStorage:", token);
        
        if (token) {
          // Set the token in state if needed
          if (!spotifyToken) {
            setSpotifyToken(token);
          }
          
          // Fetch data using the token
          fetchCurrentlyPlaying();
          
          // Set up polling to refresh data
          const intervalId = setInterval(() => {
            fetchCurrentlyPlaying();
          }, 10000); // Every 10 seconds
          
          // Return the cleanup function
          return () => clearInterval(intervalId);
        } else {
          console.log("No token found, falling back to Supabase data");
          // Fall back to Supabase data if no Spotify token
          fetchSongsFromSupabase();
        }
      } catch (error) {
        console.error("Error getting token from AsyncStorage:", error);
        fetchSongsFromSupabase();
      }
    };
    
    // Call the async function
    getTokenAndFetchData();
    
    // Note: we return nothing here since the cleanup is handled in getTokenAndFetchData
  }, [spotifyToken]);

  // Fetch data on component mount and when token changes
  // useEffect(() => {
  //   console.log("Spotify Token: ", spotifyToken);
  //   const token = await AsyncStorage.getItem('accessToken');
  //   if (token) {
  //     fetchCurrentlyPlaying();
      
  //     // Set up polling to refresh data
  //     const intervalId = setInterval(() => {
  //       fetchCurrentlyPlaying();
  //     }, 10000); // Every 10 seconds
      
  //     return () => clearInterval(intervalId);
  //   } else {
  //     // Fall back to Supabase data if no Spotify token
  //     fetchSongsFromSupabase();
  //   }
  // }, [spotifyToken]);

  // Fallback: Fetch songs from Supabase
  const fetchSongsFromSupabase = async () => {
    try {
      setLoading(true);
      
      const { data, error } = await supabase
        .from('Song')
        .select('*')
        .limit(10);
      
      if (error) {
        throw error;
      }
      
      if (data && data.length > 0) {
        console.log("Fetched songs from Supabase:", data.length);
        
        // For each song, fetch artist info
        const songsWithArtists = await Promise.all(data.map(async (song) => {
          if (song.artistsID && Array.isArray(song.artistsID)) {
            const { data: artistData } = await supabase
              .from('Artist')
              .select('*')
              .in('spotifyID', song.artistsID);
            
            const artistNames = artistData
              ?.map(artist => artist.name)
              .filter(Boolean)
              .join(', ');
            
            return {
              ...song,
              artistName: artistNames || 'Unknown Artist'
            };
          }
          return song;
        }));
        
        // Set current song
        const currentSongData = songsWithArtists[0];
        setCurrentSong({
          id: currentSongData.id,
          title: currentSongData.title,
          artist: currentSongData.artistName || 'Unknown Artist',
          cover: currentSongData.image 
            ? { uri: currentSongData.image } 
            : DEFAULT_IMAGE,
          spotify_uri: currentSongData.spotifyURL
        });
        
        // Set queue
        const queueSongs = songsWithArtists.slice(1).map(song => ({
          id: song.id,
          title: song.title,
          artist: song.artistName || 'Unknown Artist',
          cover: song.image 
            ? { uri: song.image } 
            : DEFAULT_IMAGE,
          spotify_uri: song.spotifyURL
        }));
        
        setQueue(queueSongs);
      } else {
        // Fallback data
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
      console.error('Error fetching songs from Supabase:', err);
      setError('Failed to load songs. Please try again later.');
      
      // Fallback data
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

  // Spotify API control functions
  const controlPlayback = async (action: 'play' | 'pause') => {
    if (!spotifyToken) return false;
    
    try {
      const response = await fetch(`https://api.spotify.com/v1/me/player/${action}`, {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${spotifyToken}`
        }
      });
      
      return response.ok;
    } catch (err) {
      console.error(`Error ${action}ing playback:`, err);
      return false;
    }
  };

  const skipToNext = async () => {
    if (!spotifyToken) return false;
    
    try {
      const response = await fetch('https://api.spotify.com/v1/me/player/next', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${spotifyToken}`
        }
      });
      
      return response.ok;
    } catch (err) {
      console.error('Error skipping to next track:', err);
      return false;
    }
  };

  const skipToPrevious = async () => {
    if (!spotifyToken) return false;
    
    try {
      const response = await fetch('https://api.spotify.com/v1/me/player/previous', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${spotifyToken}`
        }
      });
      
      return response.ok;
    } catch (err) {
      console.error('Error skipping to previous track:', err);
      return false;
    }
  };

  const toggleSaveTrack = async (trackId: string, shouldSave: boolean) => {
    if (!spotifyToken) return false;
    
    try {
      const response = await fetch(`https://api.spotify.com/v1/me/tracks?ids=${trackId}`, {
        method: shouldSave ? 'PUT' : 'DELETE',
        headers: {
          'Authorization': `Bearer ${spotifyToken}`
        }
      });
      
      return response.ok;
    } catch (err) {
      console.error(`Error ${shouldSave ? 'saving' : 'removing'} track:`, err);
      return false;
    }
  };

  // Player control functions
  const handlePlayPause = async (): Promise<void> => {
    if (spotifyToken) {
      // Update UI immediately for responsiveness
      const newPlayingState = !isPlaying;
      setIsPlaying(newPlayingState);
      
      // Call Spotify API
      const success = await controlPlayback(newPlayingState ? 'play' : 'pause');
      
      if (!success) {
        // Revert if API call failed
        setIsPlaying(!newPlayingState);
        Alert.alert("Playback Error", "Failed to control playback. Please try again.");
      }
    } else {
      // Local state only if no Spotify integration
      setIsPlaying(!isPlaying);
    }
    
    console.log("Play/Pause toggled");
  };

  const handleLike = async (): Promise<void> => {
    if (!currentSong) return;
    
    const newLikedStatus = !liked;
    setLiked(newLikedStatus);
    
    if (spotifyToken) {
      // Update in Spotify
      const success = await toggleSaveTrack(currentSong.id, newLikedStatus);
      
      if (!success) {
        // Revert if API call failed
        setLiked(!newLikedStatus);
        Alert.alert("Error", `Failed to ${newLikedStatus ? 'like' : 'unlike'} this track.`);
      }
    } else if (spotifyID) {
      // Update in Supabase if no Spotify token
      try {
        // Get current user data
        const { data: userData, error: fetchError } = await supabase
          .from('User')
          .select('likedSongs')
          .eq('spotifyID', spotifyID)
          .single();
        
        if (fetchError) {
          console.error('Error fetching user data:', fetchError);
          return;
        }
        
        // Update likedSongs array
        let likedSongs = userData?.likedSongs || [];
        
        if (newLikedStatus) {
          if (!likedSongs.includes(currentSong.id)) {
            likedSongs.push(currentSong.id);
          }
        } else {
          likedSongs = likedSongs.filter((id: string) => id !== currentSong.id);
        }
        
        // Update database
        const { error: updateError } = await supabase
          .from('User')
          .update({ likedSongs: likedSongs })
          .eq('spotifyID', spotifyID);
        
        if (updateError) {
          console.error('Error updating liked songs:', updateError);
          setLiked(!newLikedStatus); // Revert state
        }
      } catch (err) {
        console.error('Error in like/unlike operation:', err);
        setLiked(!newLikedStatus); // Revert state
      }
    }
    
    console.log("Like toggled for track:", currentSong.id);
  };

  const handleSkipNext = async (): Promise<void> => {
    if (!currentSong || queue.length === 0) return;
    
    if (spotifyToken) {
      // Call Spotify API
      const success = await skipToNext();
      
      if (success) {
        // Add current to history
        setHistory(prevHistory => [currentSong, ...prevHistory]);
        
        // Fetch updated now playing after a short delay
        setTimeout(() => fetchCurrentlyPlaying(), 1000);
      } else {
        Alert.alert("Playback Error", "Failed to skip to next track. Please try again.");
      }
    } else {
      // Local queue management if no Spotify integration
      setHistory(prevHistory => [currentSong, ...prevHistory]);
      setCurrentSong(queue[0]);
      setQueue(queue.slice(1));
      setLiked(false);
    }
    
    console.log("Skipped to next track");
  };

  const handleSkipPrevious = async (): Promise<void> => {
    if (!currentSong || history.length === 0) {
      console.log("No previous tracks available");
      return;
    }
    
    if (spotifyToken) {
      // Call Spotify API
      const success = await skipToPrevious();
      
      if (success) {
        const previousSong = history[0];
        setHistory(history.slice(1));
        
        // Fetch updated now playing after a short delay
        setTimeout(() => fetchCurrentlyPlaying(), 1000);
      } else {
        Alert.alert("Playback Error", "Failed to go to previous track. Please try again.");
      }
    } else {
      // Local history management if no Spotify integration
      const previousSong = history[0];
      setHistory(history.slice(1));
      setQueue(prevQueue => [currentSong!, ...prevQueue]);
      setCurrentSong(previousSong);
      setLiked(false);
    }
    
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
          {spotifyToken && (
            <TouchableOpacity 
              style={styles.spotifyButton}
              onPress={() => fetchCurrentlyPlaying()}
            >
              <Text style={styles.spotifyButtonText}>Check Spotify</Text>
            </TouchableOpacity>
          )}
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
          {spotifyToken && (
            <View style={styles.spotifyConnected}>
              <Ionicons name="musical-notes" size={16} color="#1DB954" />
              <Text style={styles.spotifyText}>Spotify Connected</Text>
            </View>
          )}
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
  spotifyConnected: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 5,
  },
  spotifyText: {
    fontSize: 12,
    color: '#1DB954',
    marginLeft: 4,
  },
  spotifyButton: {
    backgroundColor: '#1DB954',
    paddingVertical: 10,
    paddingHorizontal: 20,
    borderRadius: 20,
    marginTop: 15,
  },
  spotifyButtonText: {
    color: 'white',
    fontWeight: '600',
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
    width: SCREEN_WIDTH * 0.4,
    height: SCREEN_WIDTH * 0.4,
    borderRadius: 10,
    marginVertical: 5,
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
    flex: 2,
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