import { MaterialIcons } from "@expo/vector-icons";
import { Text, View, StyleSheet, Image, ScrollView } from "react-native";
import ArtistIcon from "@/components/profileScreen/ArtistIcon";
import { SearchBar } from "@rneui/themed";

export default function likedArtists() {
  return (
    <ScrollView>
        <View>
            <Text>Liked Artists</Text>
        </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({});
