import { MaterialIcons } from "@expo/vector-icons";
import {
  Text,
  View,
  StyleSheet,
  Image,
  ScrollView,
  TouchableOpacity,
  Pressable,
} from "react-native";
import { useEffect, useState } from "react";
import ArtistIcon from "@/components/profileScreen/ArtistIcon";
import {
  fetchAvatarUrl,
  getStoredAvatarUrl,
  storeAvatarUrl,
  uploadAvatar,
  convertImageToPNG,
} from "../../utils/avatarsUtils"; // Import the utility functions
import Feather from "@expo/vector-icons/Feather";
import {
  Menu,
  MenuOptions,
  MenuOption,
  MenuTrigger,
} from "react-native-popup-menu";
import * as ImagePicker from "expo-image-picker";
import supabase from "@/app/utils/supabaseClient";
import { Link, router } from "expo-router";

export default function ProfileScreen() {
  const [avatarUrl, setAvatarUrl] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [isPressed, setIsPressed] = useState(false);
  const [user, setUser] = useState<any>(null);
  const [artistData, setArtistData] = useState<any[]>([]);
  const userId = "2"; // Replace with the user's ID

  //Load avatar from supbase
  useEffect(() => {
    async function fetchData() {
      try {
        // Fetch the avatar URL from Supabase
        const url = await fetchAvatarUrl(userId);
        if (url) {
          setAvatarUrl(url);
          await storeAvatarUrl(userId, url); // Store the URL locally
        }

        const { data: userData, error: userError } = await supabase
          .from("User")
          .select("*")
          .eq("id", userId)
          .single();
        if (userError) {
          throw userError;
        } else {
          setUser(userData);
          console.log(userData);
        }
        //Fetch artist data using the IDs from the user data
        const artistIds = [
          ...userData.likedArtists,
          ...userData.dislikedArtists,
        ];
        const { data: artistData, error: songError } = await supabase
          .from("Artist")
          .select("*")
          .in("id", artistIds);
        if (songError) {
          throw songError;
        } else {
          setArtistData(artistData);
        }
      } catch (error) {
        console.error("Error fetching data:", error);
      }
      setLoading(false);
    }
    fetchData();
  }, []);

  // //Fetch user profile and liked/disliked artists
  // useEffect(() => {
  //   async function fetchData() {
  //     try {
  //       const { data: userData, error: userError } = await supabase
  //         .from("User")
  //         .select("*")
  //         .eq("id", userId)
  //         .single();
  //       if (userError) {
  //         throw userError;
  //       } else {
  //         setUser(userData);
  //         console.log(userData)
  //       }
  //       //Fetch artist data using the IDs from the user data
  //       const artistIds = [
  //         ...userData.likedArtists,
  //         ...userData.dislikedArtists,
  //       ];
  //       const { data: artistData, error: songError } = await supabase
  //         .from("Artist")
  //         .select("*")
  //         .in("id", artistIds);
  //       if (songError) {
  //         throw songError;
  //       } else {
  //         setArtistData(artistData);
  //       }
  //     } catch (error) {
  //       console.error("Error fetching data:", error);
  //     }
  //   }
  //   fetchData();
  //   setLoading(false);
  // }, []);

  const pickImage = async () => {
    try {
      // No permissions request is necessary for launching the image library
      let result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ["images", "videos"],
        allowsEditing: true,
        aspect: [4, 3],
        quality: 1,
      });
      if (!result.canceled) {
        // Ensure all images are stored as png
        const png = await convertImageToPNG(result.assets[0].uri);
        const pngBase64 = png!.base64;
        const data = await uploadAvatar(userId, pngBase64);
        if (data) {
          const url = await fetchAvatarUrl(userId);
          setAvatarUrl(url);
        }
      }
    } catch (error) {
      console.error("Error picking or uploading image: ", error);
      // You can also display an error message to the user if needed
    }
    setIsPressed(false);
    console.log(isPressed);
  };
  if (loading) {
    return (
      <View>
        <Text>Loading...</Text>
      </View>
    );
  }

  return (
    <ScrollView>
      <View>
        <View style={styles.profileInfoContainer}>
          <Pressable onPress={() => setIsPressed(!isPressed)}>
            <View style={styles.imageContainer}>
              <Image
                style={styles.profileImage}
                source={{ uri: avatarUrl ?? "" }}
              />
              {isPressed && (
                <View style={styles.iconOverlay}>
                  <Menu>
                    <MenuTrigger>
                      <Feather name="edit-2" size={50} color="white" />
                    </MenuTrigger>
                    <MenuOptions>
                      <MenuOption
                        onSelect={() => {
                          alert("Change Background");
                          setIsPressed(false);
                        }}
                      >
                        <Text style={{ color: "black" }}>
                          Change Background
                        </Text>
                      </MenuOption>
                      <MenuOption onSelect={() => pickImage()}>
                        <Text style={{ color: "black" }}>
                          Change Profile Picture
                        </Text>
                      </MenuOption>
                    </MenuOptions>
                  </Menu>
                </View>
              )}
            </View>
          </Pressable>
          <Text style={styles.profileName}>{user.userName}</Text>
        </View>
        <View style={styles.rowContainer}>
          <Text style={styles.header2}>Liked Artists</Text>
          <Pressable>
            <Link href={{ pathname: "/profile/likedArtists" }}>
              <MaterialIcons
                name="keyboard-arrow-right"
                style={styles.icon}
                size={48}
                color="#C4C4C4"
              />
            </Link>
          </Pressable>
        </View>
        <View style={styles.artistContainer}>
          <ScrollView horizontal={true} showsHorizontalScrollIndicator={false}>
            {user.likedArtists.map((artistID: number) => (
              <ArtistIcon
                data={artistData.find((artist) => artist.id === artistID)}
                key={artistID}
              />
            ))}
          </ScrollView>
        </View>
        <View style={styles.rowContainer}>
          <Text style={styles.header2}>Disliked Artists</Text>
          <Pressable>
            <Link href={{ pathname: "/profile/dislikedArtists" }}>
              <MaterialIcons
                name="keyboard-arrow-right"
                style={styles.icon}
                size={48}
                color="#C4C4C4"
              />
            </Link>
          </Pressable>
        </View>
        <View style={styles.artistContainer}>
          <ScrollView horizontal={true} showsHorizontalScrollIndicator={false}>
            {user.dislikedArtists.map((artistID: number) => (
              <ArtistIcon
                data={artistData.find((artist) => artist.id === artistID)}
                key={artistID}
              />
            ))}
          </ScrollView>
        </View>
        <View style={styles.rowContainer}>
          <Text style={styles.header2}>Liked Songs</Text>
          <MaterialIcons
            name="keyboard-arrow-right"
            style={styles.icon}
            size={48}
            color="#C4C4C4"
          />
        </View>
        <View style={styles.rowContainer}>
          <Text style={styles.header2}>Disliked Songs</Text>
          <MaterialIcons
            name="keyboard-arrow-right"
            style={styles.icon}
            size={48}
            color="#C4C4C4"
          />
        </View>
        <View style={styles.rowContainer}>
          <Text style={styles.header2}>Settings</Text>
          <MaterialIcons
            name="keyboard-arrow-right"
            style={styles.icon}
            size={48}
            color="#C4C4C4"
          />
        </View>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  profileInfoContainer: {
    display: "flex",
    alignItems: "center",
    gap: 10,
    padding: 10,
    paddingTop: 30,
  },
  artistContainer: {
    display: "flex",
    flexDirection: "row",
    gap: 10,
    marginLeft: 10,
    marginRight: 10,
  },
  rowContainer: {
    display: "flex",
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    padding: 10,
  },
  header2: {
    fontSize: 16,
  },
  icon: {},
  profileImage: {
    width: 200,
    height: 200,
    borderRadius: 100,
  },
  artistImage: {
    width: 100,
    height: 100,
    borderRadius: 50,
  },
  profileName: {
    fontSize: 18,
    fontWeight: 600,
  },
  imageContainer: {
    position: "relative",
  },
  image: {
    width: 150,
    height: 150,
    borderRadius: 75,
  },
  iconOverlay: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    justifyContent: "center",
    alignItems: "center",
    borderRadius: 75,
  },
});
