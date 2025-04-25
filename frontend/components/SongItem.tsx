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
import {
  Menu,
  MenuOptions,
  MenuOption,
  MenuTrigger,
} from "react-native-popup-menu";

type Artist = {
  name: string;
};

type Album = {
  images: { url: string }[];
};

type SongData = {
  name: string;
  artists: Artist[];
  album: Album;
};

type SongItemProps =
  | {
      data: SongData;
      onDelete: () => void;
      onLike?: never;
      onDislike?: never;
    }
  | {
      data: SongData;
      onDelete?: never;
      onLike: () => void;
      onDislike: () => void;
    };

const SongItem = ({ data, onDelete, onLike, onDislike }: SongItemProps) => {
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
          {data.album.images && data.album.images.length > 0 ? (
            <Image
              source={{ uri: data.album.images[0].url }}
              style={styles.image}
              resizeMode="cover"
            />
          ) : (
            <Image
              source={require("../assets/images/vinyl.jpg")} // path relative to this file
              style={styles.image}
              resizeMode="cover"
            />
          )}

          <View style={styles.songInfoContainer}>
            <Text ellipsizeMode="tail" numberOfLines={1} style={{ width: 200 }}>
              {data.name}
            </Text>
            <Text
              ellipsizeMode="tail"
              numberOfLines={2}
              style={{ color: "#7E7E82", fontSize: 12, width: 200 }}
            >
              {data.artists.map(a => a.name).join(", ")}
            </Text>
          </View>
        </View>
        <Menu>
          <MenuTrigger>
            <Feather name="more-horizontal" size={24} color="black" />
          </MenuTrigger>

          <MenuOptions>
            {onDelete ? (
              <MenuOption onSelect={() => onDelete()}>
                <Text style={{ color: "red" }}>Delete</Text>
              </MenuOption>
            ) : (
              <>
                <MenuOption onSelect={() => onLike()}>
                  <Text style={{ color: "green" }}>Like</Text>
                </MenuOption>
                <MenuOption onSelect={() => onDislike()}>
                  <Text style={{ color: "orange" }}>Dislike</Text>
                </MenuOption>
              </>
            )}
          </MenuOptions>
        </Menu>
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
    padding: 5,
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
