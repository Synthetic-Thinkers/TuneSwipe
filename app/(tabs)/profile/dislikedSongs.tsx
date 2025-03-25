import { MaterialIcons } from "@expo/vector-icons";
import { Text, View, StyleSheet, Image, ScrollView } from "react-native";
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

export default function dislikedSongs() {
    const { user: userString, songData: songDataString } =
    useLocalSearchParams() as { user: string; songData: string };

  const [search, setSearch] = useState("");
  const [user, setUser] = useState(JSON.parse(userString));
  const [songData, setSongData] = useState(JSON.parse(songDataString));
  const [artistData, setArtistData] = useState({});
  //Fetch associated artist data for all liked songs
  useEffect(() => {
    const fetchArtistData = async () => {
      const artistIDs = songData.map((song: any) => song.artistID);
      console.log(artistIDs)
      const { data, error } = await supabase
        .from("Artist")
        .select("*")
        .in("id", artistIDs);

      if (error) {
        console.error("Error fetching artist data:", error);
      } else {
        console.log("Data", data)
      }
    };

    fetchArtistData();
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
      setUser({ ...user, dislikedSongs: updatedDislikedSongs });
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
            <Text>Disliked Songs</Text>
          </View>
          <View style={styles.flexRow}>
            <Ionicons name="filter-circle-outline" size={24} color="black" />
          </View>
        </View>
        <SearchBar
          placeholder="Type Here..."
          onChangeText={updateSearch}
          value={search}
          containerStyle={{ flex: 1, borderRadius: 15 }}
        />
        <View style={styles.songContainer}>
          {user.dislikedSongs.map((songID: number) => (
            <SongItem
              data={songData.find((song: any) => song.id === songID)}
              key={songID}
              onDelete={() => deleteDislikedSong(songID)}
            />
          ))}
        </View>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
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
  },
});
