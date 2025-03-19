import React from "react";
import {
  View,
  Text,
  Image,
  TouchableHighlight,
  StyleSheet,
} from "react-native";
import AntDesign from "@expo/vector-icons/AntDesign";

const ArtistIcon = ({ data }: {data: any}) => {
  return (
    <View style={styles.container}>
      <Image
        source={{uri: data.imageUrl}}
        style={styles.artistImage}
      />
      <Text numberOfLines={1} ellipsizeMode='head' style={styles.artistName}>{data.name}</Text>
    </View>
  );
};

const styles = StyleSheet.create({
  container:{
    maxWidth:100,
    minWidth:100,
  },
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
