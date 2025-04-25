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
import { fetchArtists } from "../../utils/spotifyUtils";
import {
  Menu,
  MenuOptions,
  MenuOption,
  MenuTrigger,
} from "react-native-popup-menu";
import Feather from "@expo/vector-icons/Feather";
import AsyncStorage from "@react-native-async-storage/async-storage";

const addArtists = () => {
  const [search, setSearch] = useState("");
  const [results, setResults] = useState([]);
  const [artistData, setArtistData] = useState([]);

  const updateSearch = (search: string) => {
    setSearch(search);
  };

  const handleSearchSubmit = async () => {
    try {
      const response = await fetch(
        `${process.env.EXPO_PUBLIC_API_URL}/artist-search?query=${encodeURIComponent(
          search
        )}`
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

    const currentArray = userData.likedArtists || [];
    if (currentArray.includes(id)) {
      console.log("Artist already liked");
      return;
    }
    const updatedArray = [...currentArray, id];
    const { error: updateError } = await supabase
      .from("User")
      .update({ likedArtists: updatedArray })
      .eq("spotifyID", storedId);

    if (updateError) {
      console.error("Error updating liked artists:", updateError);
    } else {
      console.log("Liked artists updated!");
    }
  };

  const addToDisliked = async (id: number) => {
    const storedId = await AsyncStorage.getItem("spotifyID");

    const { data: userData, error: userError } = await supabase
      .from("User")
      .select("*")
      .eq("spotifyID", storedId)
      .single();

    const currentArray = userData.dislikedArtists || [];
    if (currentArray.includes(id)) {
      console.log("Artist already disliked");
      return;
    }
    const updatedArray = [...currentArray, id];
    const { error: updateError } = await supabase
      .from("User")
      .update({ dislikedArtists: updatedArray })
      .eq("spotifyID", storedId);

    if (updateError) {
      console.error("Error updating liked artists:", updateError);
    } else {
      console.log("Disliked artists updated!");
    }
  };

  useEffect(() => {
    const artistIds = results.map((artist: any) => artist.artist_id);
    if (artistIds.length !== 0) {
      fetchArtists(artistIds).then((data) => {
        console.log("Fetched artist data:", data);
        setArtistData(data);
      });
    }
  }, [results]);

  return (
    <View style={styles.screenContainer}>
      <View style={styles.headerContainer}>
        <View style={styles.flexRow}>
          <Pressable>
            <Link href="/profile">
              <Ionicons name="chevron-back" size={24} color="black" />
            </Link>
          </Pressable>
          <Text style={styles.header2}>Add Artists</Text>
        </View>
        <View style={styles.flexRow}></View>
      </View>
      <SearchBar
        placeholder="Search Artists"
        onChangeText={updateSearch}
        value={search}
        platform={Platform.OS === "ios" ? "ios" : "android"}
        searchIcon={<AntDesign name="search1" size={24} color="black" />}
        clearIcon={<Text />}
        showCancel={false}
        containerStyle={{ backgroundColor: "#f0f0f0" }}
        onSubmitEditing={handleSearchSubmit}
      />
      {artistData.length > 0 ? (
        <ScrollView
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
        >
          {artistData.map((artist: any) => (
            <View style={styles.artistContainer} key={artist.id}>
              <View style={styles.flexRow}>
                {artist.images && artist.images.length > 0 ? (
                  <Image
                    source={{ uri: artist.images[0].url }}
                    style={styles.artistImage}
                    resizeMode="cover"
                  />
                ) : (
                  <Image
                    source={require("../../../assets/images/default-profile-picture.png")} // path relative to this file
                    style={styles.artistImage}
                    resizeMode="cover"
                  />
                )}

                <Text>{artist.name}</Text>
              </View>
              <Menu>
                <MenuTrigger>
                  <Feather name="more-horizontal" size={24} color="black" />
                </MenuTrigger>
                <MenuOptions>
                  <MenuOption onSelect={() => addToLiked(artist.id)}>
                    <Text style={{}}>Like</Text>
                  </MenuOption>
                  <MenuOption onSelect={() => addToDisliked(artist.id)}>
                    <Text style={{}}>Dislike</Text>
                  </MenuOption>
                </MenuOptions>
              </Menu>
            </View>
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

export default addArtists;
