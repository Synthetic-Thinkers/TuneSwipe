import {
  Text,
  View,
  StyleSheet,
  TouchableHighlight,
  Image,
  FlatList,
  Dimensions,
  ScrollView,
  Platform,
} from "react-native";
import Ionicons from "@expo/vector-icons/Ionicons";
import { SearchBar } from "@rneui/themed";
import { useState } from "react";
import PlaylistItem from "@/components/PlaylistItem";
import { Link } from "expo-router";
import { router } from "expo-router";
import { useLocalSearchParams } from "expo-router";
import AntDesign from "@expo/vector-icons/AntDesign";

export default function PlaylistsScreen() {
  const params = useLocalSearchParams();
  const playlists = JSON.parse(
    Array.isArray(params.data) ? params.data[0] : params.data
  );
  const [search, setSearch] = useState("");

  const updateSearch = (search: string) => {
    setSearch(search);
  };

  const onPress = (item: any) => {
    console.log("Pressed:", item);
    router.push({
      pathname: "/library/playlist",
      params: { playlistId: item.id }, // Pass the playlist ID (or entire item) as a parameter
    });
  };

  // Filter playlists based on the search term
  const filteredPlaylists = playlists.filter((playlist: any) =>
    playlist.name.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <ScrollView>
      <View style={{ padding: 5 }}>
        <View style={styles.headerContainer}>
          <Link href="/library">
            <Ionicons name="chevron-back" size={24} color="black" />
          </Link>
          <Text style={styles.header2}>My Playlists</Text>
        </View>

        <SearchBar
          placeholder="Search Playlist"
          onChangeText={updateSearch}
          value={search}
          platform={Platform.OS === "ios" ? "ios" : "android"}
          searchIcon={<AntDesign name="search1" size={24} color="black" />}
          clearIcon={<Text/>}
          showCancel={false}
          containerStyle={{backgroundColor: '#f0f0f0'}}
          showLoading={false}

        />
        <View>
          {filteredPlaylists.map((playlist: any) => (
            <PlaylistItem
              key={playlist.id} // Assuming each playlist has a unique id
              onPress={() => onPress(playlist)}
              title={playlist.name}
              description={playlist.description}
              imageUri={playlist.image}
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
    alignItems: "center",
    padding: 10,
    gap:10
  },
  header2: {
    fontSize: 20,
  },
});
