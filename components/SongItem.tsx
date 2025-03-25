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

const SongItem = ({
  data,
  edit,
  onDelete,
}: {
  data: any;
  edit?: boolean;
  onDelete: Function;
}) => {
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
          <Image
            source={
              data.imageUrl
                ? { uri: data.imageUrl } // If imageUrl exists, use it
                : require("../assets/images/vinyl.jpg") // Fallback to local image
            }
            style={styles.image}
          />
          <View style={styles.songInfoContainer}>
            <Text>{data.title}</Text>
            <Text style={{ color: "#7E7E82" ,fontSize: 12}}>
              {data.artist ? data.artist : "Artist"}
            </Text>
          </View>
        </View>
        <Menu>
          <MenuTrigger>
            <Feather name="more-horizontal" size={24} color="black" />
          </MenuTrigger>
          <MenuOptions>
            <MenuOption onSelect={() => onDelete()}>
              <Text style={{ color: "red" }}>Delete</Text>
            </MenuOption>
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
