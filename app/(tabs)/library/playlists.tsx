import {
  Text,
  View,
  StyleSheet,
  TouchableHighlight,
  Image,
  FlatList,
  Dimensions,
  ScrollView,
} from "react-native";
import Ionicons from "@expo/vector-icons/Ionicons";
import { SearchBar } from "@rneui/themed";
import { useState } from "react";
import PlaylistItem from "@/components/PlaylistItem";
import { Link } from "expo-router";
import { router } from "expo-router";
import { useLocalSearchParams } from "expo-router";

export default function PlaylistsScreen() {
  const params = useLocalSearchParams();
  const playlists = JSON.parse(Array.isArray(params.data) ? params.data[0] : params.data);
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
      <View style={{ padding: 16 }}>
        <Link href="/library">
          <Ionicons name="chevron-back" size={24} color="black" />
        </Link>
        <View style={styles.headerContainer}>
          <SearchBar
            placeholder="Type Here..."
            onChangeText={updateSearch}
            value={search}
            containerStyle={{ flex: 1, borderRadius: 15 }}
          />
        </View>
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
  },
});