import { Text, View, StyleSheet, Pressable } from "react-native";
import React, {useEffect} from "react";
// import { makeRedirectUri, useAuthRequest } from 'expo-auth-session';
import * as AppAuth from 'expo-auth-session';
// import * as AppAuth from "expo-app-auth";
import AsyncStorage from "@react-native-async-storage/async-storage";

const discovery = {
	authorizationEndpoint: "https://accounts.spotify.com/authorize",
	tokenEndpoint: "https://accounts.spotify.com/api/token",
};

export default function login() {
	console.log("btn pressed!")

	const [request, response, promptAsync] = AppAuth.useAuthRequest(
	{
		responseType: AppAuth.ResponseType.Token,
      	clientId: "71512c4b7d2e4f71bb4c2c5130e3aa9a",
      	//clientSecret: "44f84f859364402a97c183f6259a288a",
      	scopes: [
        	"user-read-currently-playing",
        	"user-read-recently-played",
        	"user-read-playback-state",
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
		console.log('accessToken = ', access_token)
	}
}, [response]);

	return (
		<View style = {styles.container}>
			<Text style = {styles.text}>Login Screen</Text>
		
		<View style={{height: 80}} />
		<Pressable
		onPress={() => promptAsync()}
			style={{
				backgroundColor: "#32cd32",
				width: 350,
				alignItems: "center",
			}}
		>
			<Text>Sign in with Spotify</Text>
		</Pressable>
		</View>
	);
}
  
const styles = StyleSheet.create({
	container: {
		flex: 1,
		backgroundColor: '#25292e',
		justifyContent: 'center',
		alignItems: 'center',
	},
	text: {
		color: '#fff',
	},
});