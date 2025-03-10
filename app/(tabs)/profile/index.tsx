import { MaterialIcons } from "@expo/vector-icons";
import { Text, View, StyleSheet, Image, ScrollView } from "react-native";
import ArtistIcon from "@/components/profileScreen/ArtistIcon";
export default function ProfileScreen() {
  return (
    <ScrollView>
      <View>
        <View style={styles.profileInfoContainer}>
          <Image
            source={require("../../../assets/images/michaelScott.jpg")}
            style={styles.profileImage}
          />
          <Text style={styles.profileName}>User Name</Text>
        </View>
        <View style={styles.rowContainer}>
          <Text style={styles.header2}>Liked Artists</Text>
          <MaterialIcons
            name="keyboard-arrow-right"
            style={styles.icon}
            size={48}
            color="#C4C4C4"
          />
        </View>
        <View style={styles.artistContainer}>
          <ArtistIcon name="Artist Name" />
          <ArtistIcon name="Artist Name" />
          <ArtistIcon name="Artist Name" />

        </View>
        <View style={styles.rowContainer}>
          <Text style={styles.header2}>Disliked Artists</Text>
          <MaterialIcons
            name="keyboard-arrow-right"
            style={styles.icon}
            size={48}
            color="#C4C4C4"
          />
        </View>
        <View style={styles.artistContainer}>
          <ArtistIcon name="Artist Name" />
          <ArtistIcon name="Artist Name" />
          <ArtistIcon name="Artist Name" />
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
    borderRadius: 50,
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
});
