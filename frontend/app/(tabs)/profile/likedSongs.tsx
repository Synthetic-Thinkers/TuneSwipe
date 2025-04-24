import {
  Text,
  View,
  StyleSheet,
  Image,
  ScrollView,
  Platform,
} from "react-native";
import ArtistIcon from "@/components/profileScreen/ArtistIcon";
import { SearchBar } from "@rneui/themed";
import { Link } from "expo-router";
import Ionicons from "@expo/vector-icons/Ionicons";
import { useState, useEffect } from "react";
import { Pressable } from "react-native";
import { useLocalSearchParams } from "expo-router";
import supabase from "../../utils/supabaseClient";
import SongItem from "@/components/SongItem";
import AntDesign from "@expo/vector-icons/AntDesign";
import FontAwesome6 from "@expo/vector-icons/FontAwesome6";
import { fetchTracks } from "../../utils/spotifyUtils";

export default function likedSongs() {
  const { user: userString } = useLocalSearchParams() as { user: string };

  const [search, setSearch] = useState("");
  const [user, setUser] = useState(JSON.parse(userString));
  const [songData, setSongData] = useState<any[]>([]);

  useEffect(() => {
    const fetchLikedSongs = async () => {
      //Fetch all disliked songs
      await fetchTracks(user.likedSongs).then((data) => {
        console.log("Fetched liked songs: ", data);
        setSongData(data);
      });
    };

    fetchLikedSongs();
  }, []);

  const updateSearch = (search: string) => {
    setSearch(search);
  };

  const deleteLikedSong = async (id: string) => {
    const updatedLikedSongs = user.likedSongs.filter(
      (songID: string) => songID !== id
    );
    console.log("Old SOngs", user.likedSongs);
    console.log("Updated songs", updatedLikedSongs);
    const { error } = await supabase
      .from("User")
      .update({ likedSongs: updatedLikedSongs })
      .eq("id", user?.id);

    if (error) {
      console.error("Error deleting artist:", error);
    } else {
      console.log("Song deleted successfully");
      // Update the local state to reflect the changes
      setSongData(prevData => prevData.filter(song => song.id !== id));
    }
  };

  return (
    <ScrollView>
      <View>
        <View style={styles.headerContainer}>
          <View style={styles.flexRow}>
            <Pressable>
              <Link href="/profile">
                <Ionicons name="chevron-back" size={24} color="black" />
              </Link>
            </Pressable>
            <Text style={styles.header2}>Liked Songs</Text>
          </View>
          <View style={styles.flexRow}>
            <Pressable>
              <Link
                href={{
                  pathname: "/profile/addSongs",
                }}
              >
                <FontAwesome6 name="add" size={24} color="black" />
              </Link>
            </Pressable>
          </View>
        </View>
        <SearchBar
          placeholder="Search Songs"
          onChangeText={updateSearch}
          value={search}
          platform={Platform.OS === "ios" ? "ios" : "android"}
          searchIcon={<AntDesign name="search1" size={24} color="black" />}
          showCancel={false}
          containerStyle={{ backgroundColor: "#f0f0f0" }}
          clearIcon={<Text />}
        />
        <View style={styles.songContainer}>
          {songData
            .filter((song) =>
              song.name.toLowerCase().includes(search.toLowerCase())
            )
            .map((song) => (
              <SongItem
                key={song.id}
                data={song}
                onDelete={() => deleteLikedSong(song.id)}
              />
            ))}
        </View>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  header2: {
    fontSize: 20,
  },
  songContainer: {
    flexDirection: "column",
    padding: 8,
  },
  flexRow: {
    display: "flex",
    flexDirection: "row",
    gap: 10,
    alignItems: "center",
  },
  screenContainer: {
    padding: 8,
  },
  headerContainer: {
    display: "flex",
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    padding: 10,
    paddingTop: 20,
  },
});
