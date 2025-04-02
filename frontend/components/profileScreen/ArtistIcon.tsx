import React from "react";
import {
  View,
  Text,
  Image,
  TouchableHighlight,
  StyleSheet,
} from "react-native";
import AntDesign from "@expo/vector-icons/AntDesign";

const ArtistIcon = ({ name }: {name: string}) => {
  return (
    <View>
      <Image
        source={require("../../assets/images/michaelScott.jpg")}
        style={styles.artistImage}
      />
      <Text style={styles.artistName}>{name}</Text>
    </View>
  );
};

const styles = StyleSheet.create({
  artistImage: {
    width: 80,
    height: 80,
    borderRadius: 50,
    margin: 5,
  },
  artistName: {
    textAlign: "center",
    fontSize: 16,
    fontWeight: "bold",
  },
});

export default ArtistIcon;
