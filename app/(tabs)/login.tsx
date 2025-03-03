import { Text, View, StyleSheet, Pressable, FlatList, Button } from "react-native";
import React, {useEffect, useState} from "react";
import * as Auth from 'expo-auth-session';
import AsyncStorage from "@react-native-async-storage/async-storage";

const discovery = {
	authorizationEndpoint: "https://accounts.spotify.com/authorize",
	tokenEndpoint: "https://accounts.spotify.com/api/token",
};

export default function login() {
	//Array of top five artists
	const [topArtists, setTopArtists] = useState([]);

	const [request, response, promptAsync] = Auth.useAuthRequest(
	{
		responseType: Auth.ResponseType.Token,
      	clientId: "71512c4b7d2e4f71bb4c2c5130e3aa9a",
      	scopes: [
        	"user-read-currently-playing",
        	"user-read-recently-played",
        	"user-read-playback-state",
			"user-library-read",
        	"user-top-read",
        	"user-modify-playback-state",
        	"streaming",
        	"user-read-email",
        	"user-read-private",
      ],
      usePKCE: false,
      redirectUri: "exp://127.0.0.1:19000/",
    },
	discovery
);

useEffect (() => {
	console.log("-- From useEffect --")
	if(response?.type == "success") {
		const {access_token}= response.params;
		console.log('accessToken = ', access_token);
		getTopArtists(access_token);
	}
}, [response]);

const getTopArtists = async (token: string) => {
	console.log("-- From getTopArtists --");
	//console.log("Token Value =", token);
	try{
		const resultFromCall = await fetch("https://api.spotify.com/v1/me/top/artists?limit=5", {
			method: "GET",
			headers: { 
				Authorization: `Bearer ${token}`,
				"Content-Type": "application/json",
			},
});
	const jsonData = await resultFromCall.json();
	const artists = jsonData.items.map((artist) => artist.name);
	console.log("Top 5 artists:", artists);
	setTopArtists(artists);

	} catch (error) {
		console.error("ERROR - Could not get top artists.")
	}
};

return (
	<View style = {styles.container}>
		<Text style = {{height: 80}}>Login Screen</Text>
		
		<View style={styles.button}>
		<Button 
			title="Sign in with Spotify" 
			color= "white"
			onPress={() => promptAsync()} 
		/> 
		</View>
	</View>	
);
}

const styles = StyleSheet.create({
	container: {
		flex: 1,
		backgroundColor: '#f0f8ff',
		justifyContent: 'center',
		alignItems: 'center',
	},
	text: {
		color: '#000000',
	},
	button: {
		borderRadius: 10,
		backgroundColor: "black"
	}
});