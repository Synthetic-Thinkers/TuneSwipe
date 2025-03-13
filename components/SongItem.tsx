import React from "react";
import {
  View,
  Text,
  Image,
  TouchableHighlight,
  StyleSheet,
} from "react-native";
import AntDesign from "@expo/vector-icons/AntDesign";
import Feather from "@expo/vector-icons/Feather";

const SongItem = ({ name, artist, imageUri }: {name:string, artist:string, imageUri:string}) => {
  return (
    <View>
      <View style={styles.songContainer}>
        <View
          style={{
            display: "flex",
            flexDirection: "row",
            gap: 7,
            alignItems: "center",
          }}
        >
          <Image source={{ uri: imageUri }} style={styles.image} />
          <View style={styles.songInfoContainer}>
            <Text>{name}</Text>
            <Text>{artist}</Text>
          </View>
        </View>
        <Feather name="more-horizontal" size={24} color="black" />
      </View>
    </View>
  );
};

export default SongItem;

const styles = StyleSheet.create({
  songContainer: {
    display: "flex",
    flexDirection: "row",
    alignItems: "center",
    padding: 8,
    gap: 5,
    justifyContent: "space-between",
  },
  songInfoContainer: {
    display: "flex",
  },
  image: {
    width: 40,
    height: 40,
  },
  line: {
    width: "80%",
    borderBottomWidth: 1,
    borderColor: "black",
  },
});
