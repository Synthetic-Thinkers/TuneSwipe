import {
  Text,
  View,
  StyleSheet,
  ScrollView,
  Image,
  Platform,
  Pressable,
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
import {
  fetchTracks,
  startPlaylist,
  toggleShuffle,
  removeTrackFromPlaylist,
} from "../../utils/spotifyUtils";
import AsyncStorage from "@react-native-async-storage/async-storage";
import {
  Menu,
  MenuOptions,
  MenuOption,
  MenuTrigger,
} from "react-native-popup-menu";

export default function PlaylistScreen() {
  const { playlistId } = useLocalSearchParams(); // Retrieve the playlistId from navigation params

  interface Playlist {
    id: number;
    name: string;
    description: string;
    image: string;
    songs: number[];
    createdBy: any;
    spotifyIdPlaylist: string;
  }

  const [playlistData, setPlaylistData] = useState<Playlist | null>(null);
  const [songsData, setSongsData] = useState<any[]>([]);
  const [artistData, setArtistData] = useState<any[]>([]);

  const onPlay = async (playlistID: string) => {
    console.log("Play button pressed", playlistID);
    const accessToken = await AsyncStorage.getItem("accessToken");
    await toggleShuffle(false);
    await startPlaylist(accessToken, playlistID);
  };

  const onShuffle = async (playlistID: string) => {
    console.log("Shuffle button pressed");
    const accessToken = await AsyncStorage.getItem("accessToken");
    await toggleShuffle(true);
    await startPlaylist(accessToken, playlistID);
  };

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
      // Update the local state to reflect the changes
      setPlaylistData({ ...playlistData, songs: updatedSongs } as Playlist);
      setSongsData(songsData.filter((song) => song.id !== id)); // Update songsData state
      //Remove track from Spotify playlist
      await removeTrackFromPlaylist(playlistData?.spotifyIdPlaylist, id);
      console.log("Song deleted successfully");
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
      if (songIds.length !== 0) {
        fetchTracks(songIds).then((data) => {
          setSongsData(data);
        });
      }
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
      <View style={{ padding: 8 }}>
        <View style={styles.headerContainer}>
          <Link href="/library">
            <Ionicons name="chevron-back" size={24} color="black" />
          </Link>
          <Menu>
            <MenuTrigger>
              <Feather name="more-horizontal" size={24} color="black" />
            </MenuTrigger>
            <MenuOptions>
              <MenuOption
                onSelect={() => {
                  alert("Change Theme");
                }}
              >
                <Text style={{ color: "black" }}>Edit</Text>
              </MenuOption>
              <MenuOption
                onSelect={() => {
                  alert("Change Theme");
                }}
              >
                <Text style={{ color: "black" }}>Sort</Text>
              </MenuOption>
            </MenuOptions>
          </Menu>
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
          <Link href="/" asChild>
            <Pressable
              style={({ pressed }) => [
                {
                  transform: pressed
                    ? [{ translateY: 2 }]
                    : [{ translateY: 0 }],
                  opacity: pressed ? 0.8 : 1,
                },
              ]}
              onPress={() => onPlay(playlistData.spotifyIdPlaylist)}
            >
              <View style={styles.playButtonContainer}>
                <AntDesign name="play" size={24} color="#FF006E" />
                <Text style={{ color: "#FF006E", fontWeight: "bold" }}>
                  Play
                </Text>
              </View>
            </Pressable>
          </Link>
          <Link href="/" asChild>
            <Pressable
              style={({ pressed }) => [
                {
                  transform: pressed
                    ? [{ translateY: 2 }]
                    : [{ translateY: 0 }],
                  opacity: pressed ? 0.8 : 1,
                },
              ]}
              onPress={() => onShuffle(playlistData.spotifyIdPlaylist)}
            >
              <View style={styles.shuffleButtonContainer}>
                <Entypo name="shuffle" size={24} color="#FF006E" />
                <Text style={{ color: "#FF006E", fontWeight: "bold" }}>
                  Shuffle
                </Text>
              </View>
            </Pressable>
          </Link>
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
