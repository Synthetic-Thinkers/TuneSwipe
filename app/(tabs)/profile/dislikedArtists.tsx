import { MaterialIcons } from "@expo/vector-icons";
import { Text, View, StyleSheet, Image, ScrollView } from "react-native";
import ArtistIcon from "@/components/profileScreen/ArtistIcon";
import { SearchBar } from "@rneui/themed";
import { Link } from "expo-router";
import Ionicons from "@expo/vector-icons/Ionicons";
import Feather from "@expo/vector-icons/Feather";
import AntDesign from "@expo/vector-icons/AntDesign";
import { useState } from "react";
import { Pressable } from "react-native";
import { useLocalSearchParams } from "expo-router";

export default function dislikedArtists() {
  const [search, setSearch] = useState("");

  const { user: userString, artistData: artistDataString } =
    useLocalSearchParams() as { user: string; artistData: string };

  const user = JSON.parse(
    Array.isArray(userString) ? userString[0] : userString
  ) as { likedArtists: number[] };
  const artistData = JSON.parse(
    Array.isArray(artistDataString) ? artistDataString[0] : artistDataString
  );

  const updateSearch = (search: string) => {
    setSearch(search);
  };

  return (
    <ScrollView>
      <View style={styles.screenContainer}>
        <View style={styles.headerContainer}>
          <View style={styles.flexRow}>
            <Pressable>
              <Link href="/profile">
                <Ionicons name="chevron-back" size={24} color="black" />
              </Link>
            </Pressable>
            <Text>Disliked Artists</Text>
          </View>
          <View style={styles.flexRow}>
            <Text>Edit</Text>
            <Feather name="more-horizontal" size={24} color="black" />
          </View>
        </View>
        <SearchBar
          placeholder="Type Here..."
          onChangeText={updateSearch}
          value={search}
          containerStyle={{ flex: 1, borderRadius: 15 }}
        />
        <View style={styles.songContainer}>
          {user.dislikedArtists.map((artistID: number) => (
            <ArtistIcon
              data={artistData.find((artist) => artist.id === artistID)}
              key={artistID}
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
    padding: 20
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
