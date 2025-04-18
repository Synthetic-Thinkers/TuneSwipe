import { Text, View, StyleSheet, Image, ScrollView } from "react-native";
import ArtistIcon from "@/components/profileScreen/ArtistIcon";
import { SearchBar } from "@rneui/themed";
import { Link } from "expo-router";
import Ionicons from "@expo/vector-icons/Ionicons";
import { useState, useEffect } from "react";
import { Pressable } from "react-native";
import { useLocalSearchParams } from "expo-router";
import supabase from "../../utils/supabaseClient";

type Artist = {
  id: number;
  name: string;
};

export default function likedArtists() {
  
  const { user: userString, artistData: artistDataString } =
    useLocalSearchParams() as { user: string; artistData: string };


  const [search, setSearch] = useState("");
  const [isEditing, setIsEditing] = useState(false);
  const [user, setUser] = useState(JSON.parse(userString));
  const [artistData, setArtistData] = useState(JSON.parse(artistDataString));

  const updateSearch = (search: string) => {
    setSearch(search);
  };

  const deleteLikedArtist = async (id: number) => {
    const updatedLikedArtists = user.likedArtists.filter(
      (artistID: number) => artistID !== id
    );
    console.log(updatedLikedArtists)
    const { error } = await supabase
      .from("User")
      .update({ likedArtists: updatedLikedArtists })
      .eq("id", user?.id);

    if (error) {
      console.error("Error deleting artist:", error);
    } else {
      console.log("Artist deleted successfully");
      // Update the local state to reflect the changes
      setUser({...user, likedArtists:updatedLikedArtists})
    }
  };

  console.log(isEditing);

  return (
    <ScrollView>
      <View style={styles.screenContainer}>
        <View style={styles.headerContainer}>
          <View style={styles.flexRow}>
            <Link href="/profile">
              <Ionicons name="chevron-back" size={24} color="black" />
            </Link>
            <Text>Liked Artists</Text>
          </View>
          <View style={styles.flexRow}>
            <Pressable onPress={() => setIsEditing(!isEditing)}>
            {!isEditing ? <Text>Edit</Text> : <Text style={{color:"#FF006E"}}>Done</Text>}
            </Pressable>
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
          {user.likedArtists.map((artistID: number) => (
            <ArtistIcon
              data={artistData.find((artist: Artist) => artist.id === artistID)}
              key={artistID}
              edit={isEditing}
              onDelete={() => deleteLikedArtist(artistID)}
            />
          ))}
        </View>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  songContainer: {
    flexDirection: "row",
    flexWrap: "wrap",
    justifyContent: "space-around",
    padding: 20,
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
