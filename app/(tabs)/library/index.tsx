import React from "react";
import { useEffect, useState, useContext } from "react";
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
import AsyncStorage from "@react-native-async-storage/async-storage";

export default function LibraryScreen() {
  const [playlists, setPlaylists] = useState<any[]>([]);
  const [user, setUser] = useState<any>(null);

  useEffect(() => {
    async function fetchData() {
      const storedId = await AsyncStorage.getItem("spotifyID");
      //Fetch user data from supabase using stored ID
      const { data: userData, error: userError } = await supabase
        .from("User")
        .select("*")
        .eq("spotifyID", storedId)
        .single();
  
      if (userError) {
        console.log(userError)
      } 
      else {
        setUser(userData);
        console.log(userData);
      }

      const { data:playlistData, error: playlistError } = await supabase.from("Playlist").select("*").eq("createdBy", userData.id);

      if (playlistError) {
        console.error("Error fetching data:", playlistError);
      } else {
        setPlaylists(playlistData);
        console.log("Fetched data:", playlistData);
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

  const renderItem = (playlist:any) => (
    <TouchableHighlight
      onPress={() => onPress(playlist)} // Pass the playlist to onPress
      underlayColor="#70A7FF"
      key={playlist.id}
      style={styles.playlistCard}
    >
      <View>
        <Image
          style={styles.playlistImage}
          source={{
            uri: playlist.image
              ? playlist.image
              : "https://i.pinimg.com/736x/25/98/2c/25982c2af2cca84c831a37dedfd15c66.jpg",
          }}
        />
        <Text style={styles.playlistTitle}>{playlist.name}</Text>
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

        <View style={styles.playlistContainer}>
          {
            playlists.map(playlist => {
              const playlistIcon = renderItem(playlist);
              return playlistIcon;
            })
          }

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
    padding: 10,
  },
  playlistContainer: {
    flexDirection: 'row', 
    flexWrap: 'wrap', 
    justifyContent: "space-evenly",
  },
  playlistImage: {
    width: 90,
    height: 90,
    borderRadius: 8,
  },
  playlistCard: {
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    margin: 5,
    padding: 8,
    maxWidth: 100,
    minWidth: 100,
    borderRadius: 8, // Optional: Add rounded corners
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
