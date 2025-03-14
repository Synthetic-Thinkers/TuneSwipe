import { Text, View, StyleSheet, ScrollView, Image } from "react-native";
import { useLocalSearchParams } from "expo-router";
import { useEffect, useState } from "react";
import Ionicons from "@expo/vector-icons/Ionicons";
import Feather from "@expo/vector-icons/Feather";
import AntDesign from "@expo/vector-icons/AntDesign";
import Entypo from "@expo/vector-icons/Entypo";
import { Link } from "expo-router";
import SongItem from "@/components/SongItem";
import supabase from "@/app/utils/supabaseClient";

export default function PlaylistScreen() {
  const { playlistId } = useLocalSearchParams(); // Retrieve the playlistId from navigation params
  interface Playlist {
    id: number;
    name: string;
    description: string;
    image: string;
    songs: number[];
    timeCreated: string;
    createdBy: number;
  }

  const [playlistData, setPlaylistData] = useState<Playlist | null>(null);
  const [songsData, setSongsData] = useState<any[]>([]);
  // useEffect(() => {
  //   async function fetchPlaylist() {
  //     const { data, error } = await supabase
  //       .from("Playlist")
  //       .select("*")
  //       .eq("id", playlistId)
  //       .single();

  //     if (error) {
  //       console.error("Error fetching playlist:", error);
  //     } else {
  //       setPlaylistData(data);
  //       console.log("Fetched playlist:", data);
  //     }
  //   }

  //   fetchPlaylist();
  // }, [playlistId]);
  useEffect(() => {
    async function fetchPlaylistAndSongs() {
      // Step 1: Fetch the playlist data
      const { data: playlistData, error: playlistError } = await supabase
        .from("Playlist")
        .select("*")
        .eq("id", playlistId)
        .single();
  
      if (playlistError) {
        console.error("Error fetching playlist:", playlistError);
        return;
      }
      setPlaylistData(playlistData);
  
      // Step 2: Extract song IDs from the playlist data
      const songIds = playlistData.songs; // Assuming `songs` is an array of song IDs
      if (songIds && songIds.length > 0) {
        // Step 3: Fetch the song data using the song IDs
        const { data: songsData, error: songsError } = await supabase
          .from("Song") // Replace with your actual table name
          .select("*")
          .in("id", songIds); // Fetch songs where the ID is in the songIds array
  
        if (songsError) {
          console.error("Error fetching songs:", songsError);
        } else {
          console.log("Fetched songs:", songsData);
          setSongsData(songsData); // Assuming you have a state to store songs data
        }
      } else {
        console.log("No songs found in the playlist.");
        setSongsData([]); // Clear the songs data if no songs are found
      }
    }
  
    fetchPlaylistAndSongs();
  }, [playlistId]);

  if(!playlistData){
    return <View><Text>Loading...</Text></View>
  }
  return (
    <ScrollView>
      <View style={{ padding: 16 }}>
        <View style={styles.headerContainer}>
          <Link href="/library">
            <Ionicons name="chevron-back" size={24} color="black" />
          </Link>
          <Feather name="more-horizontal" size={24} color="black" />
        </View>
        <View style={styles.playlistInfoContainer}>
          <Image
            style={styles.playlistImage}
            source={{
              uri: playlistData.image
                ? playlistData.image
                : "https://i.pinimg.com/736x/25/98/2c/25982c2af2cca84c831a37dedfd15c66.jpg",
            }}
          />
          <Text style={styles.playlistTitle}>{playlistData.name}</Text>
        </View>
        <View style={styles.playbackContainer}>
          <View style={styles.playButtonContainer}>
            <AntDesign name="play" size={24} color="#FF006E" />
            <Text style={{ color: "#FF006E" }}>Play</Text>
          </View>
          <View style={styles.shuffleButtonContainer}>
            <Entypo name="shuffle" size={24} color="#FF006E" />
            <Text style={{ color: "#FF006E" }}>Shuffle</Text>
          </View>
        </View>
        <Text style={styles.playlistDescription}>{playlistData.description}</Text>
        <View style={styles.songsContainer}>
          {songsData.map((song) => (
            <SongItem
              key={song.id}
              name={song.title} // Replace with actual song name from fetched data
              artist={song.artistID} // Replace with actual artist name from fetched data
              imageUri="https://i.pinimg.com/736x/25/98/2c/25982c2af2cca84c831a37dedfd15c66.jpg" // Replace with actual song image from fetched data
            />
          ))}
        </View>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  headerContainer: {
    display: "flex",
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    padding: 10,
  },
  playbackContainer: {
    display: "flex",
    flexDirection: "row",
    justifyContent: "space-evenly",
    padding: 10
  },
  playlistInfoContainer: {
    display: "flex",
    alignItems: "center",
    gap: 10,
  },
  songsContainer: {
    display: "flex",
  },
  playButtonContainer: {
    display: "flex",
    flexDirection: "row",
    gap: 7,
    borderRadius: 15,
    backgroundColor: "#C4C4C4A6",
    padding: 10,
    width: 120,
    alignItems: "center",
    justifyContent: "center",
  },
  shuffleButtonContainer: {
    display: "flex",
    flexDirection: "row",
    gap: 7,
    borderRadius: 15,
    backgroundColor: "#C4C4C4A6",
    padding: 10,
    width: 120,
    alignItems: "center",
    justifyContent: "center",
  },
  text: {
    color: "#fff",
  },
  playlistTitle: {
    fontSize: 24,
    fontWeight: 700,

  },
  playlistImage: {
    width: 150,
    height: 150,
    borderRadius: 15,
  },
  playlistDescription: {
    color: "#7E7E82",
    padding: 10
  }
});
