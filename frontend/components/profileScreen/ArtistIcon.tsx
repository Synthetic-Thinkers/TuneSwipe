import React from "react";
import {
  View,
  Text,
  Image,
  TouchableHighlight,
  StyleSheet,
  Pressable,
} from "react-native";
import AntDesign from "@expo/vector-icons/AntDesign";
import {
  Menu,
  MenuOptions,
  MenuOption,
  MenuTrigger,
} from "react-native-popup-menu";
import Ionicons from "@expo/vector-icons/Ionicons";

const ArtistIcon = ({
  data,
  edit,
  onDelete,
}: {
  data: any;
  edit?: boolean;
  onDelete?: Function;
}) => {
  return (
    <View style={styles.container}>
      {data.images && data.images.length > 0 ? (
        <Image
          source={{ uri: data.images[0].url }}
          style={styles.artistImage}
          resizeMode="cover"
        />
      ) : (
        <Image
          source={require("../../assets/images/default-profile-picture.png")} // path relative to this file
          style={styles.artistImage}
          resizeMode="cover"
        />
      )}
      {edit && onDelete && (
        <View style={styles.iconOverlay}>
          <Pressable onPress={() => onDelete()}>
            <Ionicons name="close-circle-outline" size={28} color="red" />
          </Pressable>
        </View>
      )}
      <Text numberOfLines={1} ellipsizeMode="tail" style={styles.artistName}>
        {data.name}
      </Text>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    maxWidth: 100,
    minWidth: 100,
    position: "relative",
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
  iconOverlay: {
    position: "absolute",
    top: 0,
    right: 10,
    borderRadius: 12,
  },
});

export default ArtistIcon;
