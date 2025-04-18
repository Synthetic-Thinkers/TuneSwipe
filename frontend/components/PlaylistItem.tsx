import React from 'react';
import { View, Text, Image, TouchableHighlight, StyleSheet } from 'react-native';
import AntDesign from "@expo/vector-icons/AntDesign";
import { LinearGradient } from 'expo-linear-gradient';

const PlaylistItem = ({ onPress, title, description, imageUri }: {onPress:any, title:string, description:string, imageUri:string}) => {
    return (
        <LinearGradient
            colors={['#bb52aa', '#63ff85']}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 0 }}
            style={styles.linearGradient}
        >
            <TouchableHighlight onPress={onPress} underlayColor="#70A7FF">
                <View style={styles.newPlaylistContainer}>
                    <View style={styles.newPlaylistTextContainer}>
                        <Text style={styles.newPlaylistTitle}>{title}</Text>
                        <Text style={styles.newPlaylistDescription}>{description}</Text>
                        <AntDesign name="play" size={24} color="black" />
                    </View>
                    <Image style={styles.playlistImage} source={{ uri: imageUri ? imageUri:"https://i.pinimg.com/736x/25/98/2c/25982c2af2cca84c831a37dedfd15c66.jpg" }} />
                </View>
            </TouchableHighlight>
        </LinearGradient>
    );
};

const styles = StyleSheet.create({
    newPlaylistContainer: {
        display: "flex",
        flexDirection: "row",
        padding: 16,
        backgroundColor: "#F8F8F8",
        borderRadius: 15,
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 4,
        margin: 5,
        alignItems: "center",
        gap: 5,
    },
    newPlaylistTextContainer: {
        display: "flex",
        justifyContent: "center",
        flex: 1,
        gap: 5,
    },
    newPlaylistTitle: {
        fontSize: 16,
        fontWeight: "bold",
        color: "#000",
    },
    newPlaylistDescription: {
        fontSize: 12,
        color: "#666",
        flex: 1,
    },
    playlistImage: {
        width: 80,
        height: 80,
        borderRadius: 8,
    },
    linearGradient: {
        borderRadius: 20, // <-- Outer Border Radius
        margin: 5
    },

});

export default PlaylistItem;