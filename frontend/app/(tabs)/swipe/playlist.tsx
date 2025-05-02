import React, { useState, useRef, useEffect } from "react";
import {
  View,
  Text,
  TextInput,
  StyleSheet,
  TouchableHighlight,
  TouchableOpacity,
  Image,
  ActivityIndicator,
  Alert,
} from "react-native";
import ViewShot, { captureRef } from "react-native-view-shot";
import {
  useFonts,
  Inter_400Regular,
  Inter_500Medium,
  Inter_600SemiBold,
  Inter_700Bold,
  Inter_800ExtraBold,
} from "@expo-google-fonts/inter";
import { LinearGradient } from "expo-linear-gradient";
import { useRoute } from "@react-navigation/native";
import * as ImageManipulator from "expo-image-manipulator";
import { supabase } from "@/supabase";
import { DateTime } from "luxon";
import * as FileSystem from "expo-file-system";
import "react-native-get-random-values";
import { v4 as uuidv4 } from "uuid";
import { Buffer } from "buffer";
import { createPlaylist, addTracksToPlaylist } from "@/app/utils/spotifyUtils";

type ActivityLog = {
  _id: number;
  mode: string;
  playlistId: string;
  swipeResults: Array<{
    id: string;
    liked: boolean;
  }>;
  timestamp: string;
};

type RouteParams = {
  spotifyID: string;
  mode: string;
  activityLog: ActivityLog;
};

export default function PlaylistScreen({ navigation }) {
  const route = useRoute();
   const { likedCards, spotifyID, mode, activityLog, sessionID, dislikedArtists } = route.params;
  const [text, setText] = useState("");
  const inputRef = React.useRef(null);
  const [gifLoaded, setGifLoaded] = useState(false);
  const [gifError, setGifError] = useState(false);
  const [playlistSongs, setPlaylistSongs] = useState([])
  const [loading, setIsLoading] = useState(true)

  const [fontsLoaded] = useFonts({
    Inter_400Regular,
    Inter_500Medium,
    Inter_600SemiBold,
    Inter_700Bold,
    Inter_800ExtraBold,
  });

  useEffect(() => {
    console.log("Received in playlist.tsx:", route.params?.likedCards);
  }, []);

  useEffect(() => {
    const markSessionAsCompleted = async () => {
      const { data, error } = await supabase
        .from("User")
        .select("activityLog")
        .eq("spotifyID", spotifyID)
        .single();

      if (error) {
        console.error("Error fetching user's activity log:", error.message);
        return;
      }

      const updatedActivityLog = data?.activityLog?.map((log) =>
        log._id === sessionID
          ? {
              ...log,
              completedAt: DateTime.now()
                .setZone("America/Los_Angeles")
                .toISO(),
            }
          : log
      );

      const { error: updateError } = await supabase
        .from("User")
        .update({ activityLog: updatedActivityLog })
        .eq("spotifyID", spotifyID);

      if (updateError) {
        console.error(
          "Error updating activityLog with completedAt:",
          updateError.message
        );
      } else {
        console.log("Successfully updated completedAt for activity log!");
      }
    };

    markSessionAsCompleted();
  }, []);

  //Get playlist recommendation
  useEffect(() => {
    async function getRecommendations() {
      if (mode === "songs") {
        try {
          const response = await fetch(`${process.env.EXPO_PUBLIC_API_URL}/create-playlist`, {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({
              activityLog: activityLog[activityLog.length - 1]
            }), //send recent swipe results
          });
          if (response.ok) {
            const songIDs = await response.json();
            console.log('Song IDs for the new playlist:', songIDs);
            setPlaylistSongs(songIDs)
            setIsLoading(false)
          } else {
            // If the response is not successful, log the error
            const errorData = await response.json();
            console.error('Error creating playlist:', errorData.error);
            throw new Error(errorData.error);
          }
        } catch (error) {
          console.log(error)
        }
      } else if (mode === "artists") {
        try{
          const response = await fetch(`${process.env.EXPO_PUBLIC_API_URL}/generate-playlist`, {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({
              liked_artists: likedCards,
              disliked_artists: dislikedArtists,
            }), //send recent swipe results
          });
          if (response.ok) {
            const songIDs = await response.json();
            console.log('Song IDs for the new playlist:', songIDs);

            if (!songIDs || songIDs.length === 0) {
            console.error("No songs were returned from the backend.");
            return;
            }

            setPlaylistSongs(songIDs)
            setIsLoading(false)
          } else {
            // If the response is not successful, log the error
            const errorData = await response.json();
            console.error('Error creating playlist:', errorData.error);
            throw new Error(errorData.error);
          }
        }catch(error){
          console.log(error)
        }
      }
    }

    getRecommendations()
  },[])

  const uploadCoverToSupabase = async (uri: string, userID: string) => {
    try {
      const fileExt = uri.split(".").pop();
      const fileName = `${uuidv4()}.${fileExt}`;
      const path = `${userID}/${fileName}`;
      const file = await FileSystem.readAsStringAsync(uri, {
        encoding: FileSystem.EncodingType.Base64,
      });
      const { error } = await supabase.storage
        .from("playlistImage")
        .upload(path, Buffer.from(file, "base64"), {
          contentType: "image/jpeg",
          upsert: false,
        });

      if (error) throw error;

      return `https://ierqhxlamotfahrwcsdz.supabase.co/storage/v1/object/public/playlistImage/${path}`;
    } catch (error) {
      console.error("Upload failed: ", error.message);
      return null;
    }
  };

  const onPressCreate = async () => {
    if (text.trim() === "") {
      Alert.alert(
        "Playlist name required",
        "Please enter a name for your playlist."
      );
      setText("");
      return;
    }
    //Fetch user id
    const { data: user, error } = await supabase
      .from("User")
      .select("id")
      .eq("spotifyID", spotifyID)
      .single();
    if (error) {
      console.error("Error fetching user:", error);
      return;
    }
    const createdBy = user.id;

    let description = ""
    //Create playlist on spotify
    const response = await createPlaylist(text, description)
    const spotifyPlaylistID = response.id
    let coverUri =
      "https://ierqhxlamotfahrwcsdz.supabase.co/storage/v1/object/public/playlistImage//DefaultPlaylistCover.png";
    //Add songs to newly create playlist (TO DO)
    addTracksToPlaylist(spotifyPlaylistID, playlistSongs)

    let uploadedImageUrl = coverUri;
    if (coverUri && coverUri.startsWith("file")) {
      await uploadCoverToSupabase(coverUri, spotifyID);
    }

    const { data: insertedPlaylist, error: playlistError } = await supabase
      .from("Playlist")
      .insert({
        name: text,
        createdBy: createdBy,
        songs: null,
        timeCreated: DateTime.now().setZone("America/Los_Angeles").toISO(),
        description: "",
        image:
          uploadedImageUrl ??
          "https://ierqhxlamotfahrwcsdz.supabase.co/storage/v1/object/public/playlistImage//DefaultPlaylistCover.png",
        privacy: "public",
        spotifyIdPlaylist: spotifyPlaylistID,
      })
      .select()
      .single();

    if (playlistError) {
      console.error("Error inserting playlist into Supabase:", playlistError);
      return;
    }

    console.log("Inserted Playlist:", insertedPlaylist);

    const { data: userWithLog, error: fetchError } = await supabase
      .from("User")
      .select("activityLog")
      .eq("spotifyID", spotifyID)
      .single();

    if (fetchError) {
      console.error(
        "Error fetching user activityLog for playlistId update:",
        fetchError.message
      );
      return;
    }

    const updatedLog = userWithLog.activityLog.map((log) =>
      log._id === sessionID ? { ...log, playlistId: insertedPlaylist.id } : log
    );

    const { error: logUpdateError } = await supabase
      .from("User")
      .update({ activityLog: updatedLog })
      .eq("spotifyID", spotifyID);

    if (logUpdateError) {
      console.error(
        "Error updating playlistId in activityLog:",
        logUpdateError.message
      );
    } else {
      console.log("Successfully updated playlistId in activityLog!");
    }

    navigation.navigate("PlaylistPreview", {
      playlistName: text,
      playlistCover: coverUri,
    });
  };

  if (!fontsLoaded || loading) {
    return (
      <View style={styles.loadingContainer}>
        <Text style={styles.text}>
          Loading your next vibe check... almost there!
        </Text>
        {!gifLoaded && (
          <ActivityIndicator
            size="large"
            color="#fff"
            style={{ marginBottom: 20 }}
          />
        )}

        {gifError ? (
          <Image
            style={styles.turntableIcon}
            source={require("../../../assets/images/TurnTable.png")}
          />
        ) : (
          <Image
            style={styles.turntableIcon}
            source={{
              uri: "https://ierqhxlamotfahrwcsdz.supabase.co/storage/v1/object/public/assests//turntable.gif",
            }}
            onLoad={() => setGifLoaded(true)}
            onError={() => {
              setGifLoaded(true);
              setGifError(true);
            }}
          />
        )}
      </View>
    );
  }

  // For Artists Mode or Genre Mode, or if not enough cards for Songs Mode , use the deafult playlist image
  const playlistCover = (
    <Image
      source={{
        uri: "https://ierqhxlamotfahrwcsdz.supabase.co/storage/v1/object/public/playlistImage//DefaultPlaylistCover.png",
      }}
      style={styles.coverImage}
    />
  );

  return (
    <View style={styles.container}>
      <Text style={styles.text}>Give your playlist a name!</Text>
      <View style={styles.shadowContainer}>
        {/* Render the playlist cover */}
        {playlistCover}
      </View>
      <TouchableOpacity
        style={styles.underlineContainer}
        onPress={() => inputRef.current.focus()}
        activeOpacity={1} // Prevents opacity effect
      >
        <TextInput
          ref={inputRef}
          style={styles.input}
          placeholder="Tap to type..."
          placeholderTextColor="gray"
          value={text}
          onChangeText={setText}
          keyboardType="default"
          maxLength={100}
          multiline={true}
          numberOfLines={2}
          blurOnSubmit={true}
        />
      </TouchableOpacity>

      {/* Underline */}
      <View style={styles.underline} />
      <TouchableHighlight
        style={styles.button}
        onPress={onPressCreate}
        underlayColor="#70A7FF"
      >
        <LinearGradient
          colors={["#3A86FF", "#FF1493", "#A134BE"]}
          start={{ x: 0, y: 0 }} // Gradient starts from top-left
          end={{ x: 1, y: 1 }} // Gradient ends at bottom-right
          style={styles.gradientBackground}
          locations={[0, 0.5, 1]}
        >
          <Text style={styles.buttonText}>Create</Text>
        </LinearGradient>
      </TouchableHighlight>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: "flex-start",
    alignItems: "center",
  },
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "white",
  },
  text: {
    fontFamily: "Inter_500Medium",
    fontSize: 20,
    color: "black",
    marginTop: 30,
  },
  turntableIcon: {
    flex: 1,
    width: 100,
    maxHeight: 102,
    resizeMode: "contain",
  },
  coverImage: {
    width: 300,
    height: 300,
    marginTop: 20,
    borderRadius: 15,
  },
  collageContainer: {
    width: 300,
    height: 300,
    flexDirection: "row",
    flexWrap: "wrap",
    marginTop: 20,
    borderRadius: 15,
    overflow: "hidden",
  },
  shadowContainer: {
    width: 300,
    height: 300,
    borderRadius: 15,
    shadowColor: "rgba(0, 0, 0, 0.3)",
    shadowOffset: { width: 0, height: 10 },
    shadowRadius: 7,
    elevation: 7,
    shadowOpacity: 1,
  },
  collageImage: {
    width: 150,
    height: 150,
  },
  gradient: {
    width: 75,
    height: 75,
    borderRadius: 75 / 2,
  },
  button: {
    flexShrink: 0,
    borderRadius: 30,
    justifyContent: "center",
    alignItems: "center",
    margin: 13,
  },
  buttonText: {
    color: "#ffff",
    fontFamily: "Inter_500Medium",
    fontSize: 16,
  },
  gradientBackground: {
    width: 121,
    height: 50,
    justifyContent: "center",
    alignItems: "center",
    borderRadius: 30,
    opacity: 0.95,
  },
  underlineContainer: {
    paddingVertical: 10,
    marginTop: 30,
  },
  input: {
    fontSize: 20,
    color: "black",
    paddingHorizontal: 10,
    textAlignVertical: "top",
    textAlign: "center",
  },
  underline: {
    height: 3,
    backgroundColor: "black",
    width: 250,
  },
});
