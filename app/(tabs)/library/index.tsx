import React from "react";
import { useEffect, useState } from "react";
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
import MaterialIcons from "@expo/vector-icons/MaterialIcons";
import PlaylistItem from "../../../components/PlaylistItem";
import { Link, router } from "expo-router";
const { width } = Dimensions.get("window");
import supabase from "../../utils/supabaseClient";

export default function LibraryScreen() {
  const [playlists, setPlaylists] = useState<any[]>([]);
  useEffect(() => {
    async function fetchData() {
      const { data, error } = await supabase.from("Playlist").select("*");

      if (error) {
        console.error("Error fetching data:", error);
      } else {
        setPlaylists(data);
        console.log("Fetched data:", data);
      }
    }

    fetchData();
  }, []);

  const onPress = (item: any) => {
    console.log("Pressed:", item);
    router.push({
      pathname: "/library/playlist",
      params: { playlistId: item.id }, // Pass the playlist ID (or entire item) as a parameter
    });
  };

  const renderItem = ({ item }: { item: any }) => (
    <TouchableHighlight
      onPress={() => onPress(item)} // Pass the item to onPress
      underlayColor="#70A7FF"
    >
      <View style={styles.playlistContainer}>
        <Image
          style={styles.playlistImage}
          source={{
            uri: item.image
              ? item.image
              : "https://i.pinimg.com/736x/25/98/2c/25982c2af2cca84c831a37dedfd15c66.jpg",
          }}
        />
        <Text style={styles.playlistTitle}>{item.name}</Text>
      </View>
    </TouchableHighlight>
  );

  return (
    <ScrollView>
      <View style={styles.libraryContainer}>
        <View style={styles.headerContainer}>
          <Text style={styles.header2}>Recently Created Playlists</Text>
        </View>
        {playlists.slice(-2).map((playlist) => (
          <PlaylistItem
            key={playlist.id} // Assuming each playlist has a unique id
            onPress={() => onPress(playlist)}
            title={playlist.name}
            description={playlist.description}
            imageUri={playlist.image}
          />
        ))}
        <View style={styles.headerContainer}>
          <Text style={styles.header2}>Your Playlists</Text>
          <TouchableHighlight>
            <Link
              href={{
                pathname: "/library/playlists",
                params: { data: JSON.stringify(playlists) }, 
              }}
            >
              <MaterialIcons
                name="keyboard-arrow-right"
                style={styles.icon}
                size={48}
                color="black"
              />
            </Link>
          </TouchableHighlight>
        </View>

        <View>
          <FlatList
            data={playlists}
            renderItem={renderItem}
            keyExtractor={(item, index) => index.toString()}
            numColumns={3}
            showsHorizontalScrollIndicator={false}
            columnWrapperStyle={styles.row}
          />
        </View>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  header2: {
    fontSize: 24,
    padding: 10,
  },
  libraryContainer: {
    padding: 16,
  },
  playlistImage: {
    width: 80,
    height: 80,
    borderRadius: 8,
  },
  playlistContainer: {
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    justifyContent: "center",
    margin: 5,
    padding: 8,
    maxWidth: 100,
    minWidth: 100,
  },
  playlistTitle: {
    fontSize: 16,
    textAlign: "center",
  },
  headerContainer: {
    display: "flex",
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  icon: {},
  row: {
    flex: 1,
    justifyContent: "space-around",
  },
});
