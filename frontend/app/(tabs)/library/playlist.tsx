import {
  Text,
  View,
  StyleSheet,
  ScrollView,
  Image,
  Platform,
} from "react-native";
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
    createdBy: any;
  }

  const [playlistData, setPlaylistData] = useState<Playlist | null>(null);
  const [songsData, setSongsData] = useState<any[]>([]);
  const [artistData, setArtistData] = useState<any[]>([]);

  const deleteSong = async (id: number) => {
    const updatedSongs = playlistData?.songs.filter(
      (songID: number) => songID !== id
    );
    console.log("Updated songs", updatedSongs);
    const { error } = await supabase
      .from("Playlist")
      .update({ songs: updatedSongs })
      .eq("id", playlistData?.id);

    if (error) {
      console.error("Error deleting song:", error);
    } else {
      console.log("Song deleted successfully");
      // Update the local state to reflect the changes
      setPlaylistData({ ...playlistData, songs: updatedSongs } as Playlist);
      setSongsData(songsData.filter((song) => song.id !== id)); // Update songsData state
    }
  };

  useEffect(() => {
    async function fetchData() {
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

      // Step 3: Fetch the song data using the song IDs
      const { data: songsData, error: songsError } = await supabase
        .from("Song") // Replace with your actual table name
        .select("*")
        .in("id", songIds); // Fetch songs where the ID is in the songIds array

      const artistIDs = songsData?.flatMap((song: any) => song.artistsID);
      // // Remove duplicates (optional)
      const uniqueArtistIDs = [...new Set(artistIDs)];

      const { data: artistData } = await supabase
        .from("Artist")
        .select("*")
        .in("spotifyID", uniqueArtistIDs);

      const songDataWithArtistNames = songsData?.map((song) => {
        const artistsName = song.artistsID.map((artistID: any) => {
          return artistData?.find((artist) => artist.spotifyID === artistID)
            ?.name;
        });
        console.log(artistsName);
        return { ...song, artistsName };
      });
      setSongsData(songDataWithArtistNames ? songDataWithArtistNames : []);
    }

    fetchData();
  }, [playlistId]);

  if (!playlistData) {
    return (
      <View>
        <Text>Loading...</Text>
      </View>
    );
  }

  return (
    <ScrollView>
      <View style={{ padding: 5 }}>
        <View style={styles.headerContainer}>
          <Link href="/library">
            <Ionicons name="chevron-back" size={24} color="black" />
          </Link>
          <Feather name="more-horizontal" size={24} color="black" />
        </View>
        <View style={styles.playlistInfoContainer}>
          <View style={styles.shadowWrapper}>
            <Image
              style={styles.playlistImage}
              source={{
                uri: playlistData.image
                  ? playlistData.image
                  : "https://i.pinimg.com/736x/25/98/2c/25982c2af2cca84c831a37dedfd15c66.jpg",
              }}
            />
          </View>
          <Text style={styles.playlistTitle}>{playlistData.name}</Text>
        </View>
        <View style={styles.playbackContainer}>
          <View style={styles.playButtonContainer}>
            <AntDesign name="play" size={24} color="#FF006E" />
            <Text style={{ color: "#FF006E", fontWeight: "bold" }}>Play</Text>
          </View>
          <View style={styles.shuffleButtonContainer}>
            <Entypo name="shuffle" size={24} color="#FF006E" />
            <Text style={{ color: "#FF006E", fontWeight: "bold" }}>
              Shuffle
            </Text>
          </View>
        </View>
        <Text style={styles.playlistDescription}>
          {playlistData.description}
        </Text>
        <View style={styles.songsContainer}>
          {songsData.map((song) => {
            return (
              <SongItem
                key={song.id}
                data={song}
                onDelete={() => deleteSong(song.id)}
              />
            );
          })}
        </View>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  shadowWrapper: {
    borderRadius: 15,
    backgroundColor: "#fff", // needed to render shadow properly on iOS
    ...Platform.select({
      ios: {
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.4,
        shadowRadius: 4,
      },
      android: {
        elevation: 4,
      },
    }),
  },
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
    padding: 10,
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
    width: 200,
    height: 200,
    borderRadius: 15,
  },
  playlistDescription: {
    color: "#7E7E82",
    padding: 10,
  },
});
