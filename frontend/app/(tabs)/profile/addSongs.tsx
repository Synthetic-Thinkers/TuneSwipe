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
import AntDesign from "@expo/vector-icons/AntDesign";
import FontAwesome6 from "@expo/vector-icons/FontAwesome6";
import { fetchTracks } from "../../utils/spotifyUtils";
import {
  Menu,
  MenuOptions,
  MenuOption,
  MenuTrigger,
} from "react-native-popup-menu";
import Feather from "@expo/vector-icons/Feather";
import AsyncStorage from "@react-native-async-storage/async-storage";
import SongItem from "@/components/SongItem";

const addSongs = () => {
  const [search, setSearch] = useState("");
  const [results, setResults] = useState([]);
  const [songData, setSongData] = useState<any[]>([]);

  const updateSearch = (search: string) => {
    setSearch(search);
  };

  const handleSearchSubmit = async () => {
    try {
      const response = await fetch(
        `${
          process.env.EXPO_PUBLIC_API_URL
        }/song-search?query=${encodeURIComponent(search)}`
      );
      const data = await response.json();
      console.log(data);
      setResults(data); // update results state
    } catch (error) {
      console.error("Error fetching search results:", error);
    }
  };
  const addToLiked = async (id: string) => {
    const storedId = await AsyncStorage.getItem("spotifyID");

    const { data: userData, error: userError } = await supabase
      .from("User")
      .select("*")
      .eq("spotifyID", storedId)
      .single();

    const currentArray = userData.likedSongs || [];
    if (currentArray.includes(id)) {
      console.log("Song already liked");
      return;
    }
    const updatedArray = [...currentArray, id];
    const { error: updateError } = await supabase
      .from("User")
      .update({ likedSongs: updatedArray })
      .eq("spotifyID", storedId);

    if (updateError) {
      console.error("Error updating liked songs:", updateError);
    } else {
      console.log("Liked songs updated!");
    }
  };

  const addToDisliked = async (id: number) => {
    const storedId = await AsyncStorage.getItem("spotifyID");

    const { data: userData, error: userError } = await supabase
      .from("User")
      .select("*")
      .eq("spotifyID", storedId)
      .single();

    const currentArray = userData.dislikedSongs || [];
    if (currentArray.includes(id)) {
      console.log("Song already disliked");
      return;
    }
    const updatedArray = [...currentArray, id];
    const { error: updateError } = await supabase
      .from("User")
      .update({ dislikedSongs: updatedArray })
      .eq("spotifyID", storedId);

    if (updateError) {
      console.error("Error updating liked songs:", updateError);
    } else {
      console.log("Disliked songs updated!");
    }
  };

  useEffect(() => {
    const songIds = results.map((song: any) => song.id);
    if (songIds.length !== 0) {
      fetchTracks(songIds).then((data) => {
        console.log("Fetched songIds data:", data);
        setSongData(data);
      });
    }
  }, [results]);

  return (
    <View style={styles.screenContainer}>
      <View style={styles.headerContainer}>
        <View style={styles.flexRow}>
          <Pressable>
            <Link href="profile">
              <Ionicons name="chevron-back" size={24} color="black" />
            </Link>
          </Pressable>
          <Text style={styles.header2}>Add Songs</Text>
        </View>
        <View style={styles.flexRow}></View>
      </View>
      <SearchBar
        placeholder="Search Songs"
        onChangeText={updateSearch}
        value={search}
        platform={Platform.OS === "ios" ? "ios" : "android"}
        searchIcon={<AntDesign name="search1" size={24} color="black" />}
        clearIcon={<Text />}
        showCancel={false}
        containerStyle={{ backgroundColor: "#f0f0f0" }}
        onSubmitEditing={handleSearchSubmit}
      />
      {songData.length > 0 ? (
        <ScrollView
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
        >
          {songData.map((song: any) => (
            <SongItem
              key={song.id}
              data={song}
              onLike={() => addToLiked(song.id)}
              onDislike={() => addToDisliked(song.id)}
            />
            //   <View style={styles.artistContainer} key={song.id}>
            //     <View style={styles.flexRow}>
            //       {song.album.images && song.album.images.length > 0 ? (
            //         <Image
            //           source={{ uri: song.album.images[0].url }}
            //           style={styles.artistImage}
            //           resizeMode="cover"
            //         />
            //       ) : (
            //         <Image
            //           source={require("../../../assets/images/default-profile-picture.png")} // path relative to this file
            //           style={styles.artistImage}
            //           resizeMode="cover"
            //         />
            //       )}
            //       <Text>{song.name}</Text>
            //     </View>
            //     <Menu>
            //       <MenuTrigger>
            //         <Feather name="more-horizontal" size={24} color="black" />
            //       </MenuTrigger>
            //       <MenuOptions>
            //         <MenuOption onSelect={() => addToLiked(song.id)}>
            //           <Text style={{}}>Like</Text>
            //         </MenuOption>
            //         <MenuOption onSelect={() => addToDisliked(song.id)}>
            //           <Text style={{}}>Dislike</Text>
            //         </MenuOption>
            //       </MenuOptions>
            //     </Menu>
            //   </View>
          ))}
        </ScrollView>
      ) : (
        <Text style={{ textAlign: "center", marginTop: 20 }}>
          No results found
        </Text>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  header2: {
    fontSize: 20,
  },
  artistContainer: {
    flexDirection: "row",
    flexWrap: "wrap",
    alignItems: "center",
    justifyContent: "space-between",
    minHeight: 50,
    padding: 5,
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
  scrollContent: {
    paddingBottom: 200, // adjust based on tab height
    paddingTop: 0,
  },
  artistImage: {
    width: 50,
    height: 50,
    borderRadius: 50,
  },
});

export default addSongs;
