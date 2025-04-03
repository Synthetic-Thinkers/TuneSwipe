import { Text, View, StyleSheet, Image, ScrollView } from "react-native";
import ArtistIcon from "@/components/profileScreen/ArtistIcon";
import { SearchBar } from "@rneui/themed";
import { Link } from "expo-router";
import Ionicons from "@expo/vector-icons/Ionicons";
import { useState, useEffect } from "react";
import { Pressable } from "react-native";
import { useLocalSearchParams } from "expo-router";
import supabase from "../../utils/supabaseClient";
import SongItem from "@/components/SongItem";

export default function likedSongs() {
  const { user: userString } = useLocalSearchParams() as { user: string };

  const [search, setSearch] = useState("");
  const [user, setUser] = useState(JSON.parse(userString));
  const [songData, setSongData] = useState<any[]>([]);

  useEffect(() => {
    const fetchLikedSongs = async () => {
      //Fetch all disliked songs
      const { data: songData } = await supabase
        .from("Song")
        .select("*")
        .in("id", user.likedSongs);

      console.log("Disliked Songs: ", songData);

      const artistIDs = songData?.flatMap((song: any) => song.artistsID);
      // // Remove duplicates (optional)
      const uniqueArtistIDs = [...new Set(artistIDs)];

      console.log("Disliked Song Screen: - Artist Ids", uniqueArtistIDs);

      const { data: artistData } = await supabase
        .from("Artist")
        .select("*")
        .in("spotifyID", uniqueArtistIDs);

      const songDataWithArtistNames = songData?.map((song) => {
        const artistsName = song.artistsID.map((artistID:any)=> {
          return artistData?.find((artist) => artist.spotifyID === artistID)
            ?.name;
        });
        console.log(artistsName);
        return { ...song, artistsName };
      });
      setSongData(songDataWithArtistNames ? songDataWithArtistNames : []);
    };

    fetchLikedSongs();
  }, []);

  const updateSearch = (search: string) => {
    setSearch(search);
  };

  const deleteLikedSong = async (id: number) => {
    const updatedLikedSongs = user.likedSongs.filter(
      (songID: number) => songID !== id
    );
    console.log("Updated songs", updatedLikedSongs);
    const { error } = await supabase
      .from("User")
      .update({ likedSongs: updatedLikedSongs })
      .eq("id", user?.id);

    if (error) {
      console.error("Error deleting artist:", error);
    } else {
      console.log("Song deleted successfully");
      // Update the local state to reflect the changes
      setUser({ ...user, likedSongs: updatedLikedSongs });
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
            <Text>Liked Songs</Text>
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
        <View style={styles.songContainer}>{songData.map(song => {
          return (
            <SongItem
              key={song.id}
              data={song}
              onDelete={() => deleteLikedSong(song.id)}
            />
          );
        })}</View>
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
