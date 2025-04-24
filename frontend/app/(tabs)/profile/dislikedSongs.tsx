import { MaterialIcons } from "@expo/vector-icons";
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
import Feather from "@expo/vector-icons/Feather";
import AntDesign from "@expo/vector-icons/AntDesign";
import { useEffect, useState } from "react";
import { Pressable } from "react-native";
import { useLocalSearchParams } from "expo-router";
import SongItem from "@/components/SongItem";
import supabase from "@/app/utils/supabaseClient";
import FontAwesome6 from "@expo/vector-icons/FontAwesome6";
import { fetchTracks } from "../../utils/spotifyUtils";

export default function dislikedSongs() {
  const { user: userString } = useLocalSearchParams() as { user: string };

  const [search, setSearch] = useState("");
  const [user, setUser] = useState(JSON.parse(userString));
  const [songData, setSongData] = useState<any[]>([]);

  
  useEffect(() => {
    const fetchLikedSongs = async () => {
      //Fetch all disliked songs
      await fetchTracks(user.dislikedSongs).then((data) => {
        console.log("Fetched liked songs: ", data);
        setSongData(data);
      });
    };

    fetchLikedSongs();
  }, []);

  const updateSearch = (search: string) => {
    setSearch(search);
  };

  const deleteDislikedSong = async (id: number) => {
    const updatedDislikedSongs = user.dislikedSongs.filter(
      (songID: number) => songID !== id
    );
    console.log("Updated songs", updatedDislikedSongs);
    const { error } = await supabase
      .from("User")
      .update({ dislikedSongs: updatedDislikedSongs })
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
            <Text style={styles.header2}>Disliked Songs</Text>
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
          clearIcon={<Text />}
          containerStyle={{ backgroundColor: "#f0f0f0" }}
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
                onDelete={() => deleteDislikedSong(song.id)}
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
