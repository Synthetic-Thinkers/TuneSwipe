import { Text, View, StyleSheet, Pressable, ImageBackground, Button } from "react-native";
import React, {useEffect, useState, useRef, useCallback} from "react";
import * as Auth from 'expo-auth-session';
import AsyncStorage from "@react-native-async-storage/async-storage";
import BottomSheet, {BottomSheetView} from "@gorhom/bottom-sheet"
import { useReducedMotion } from "react-native-reanimated";
import { GestureHandlerRootView } from "react-native-gesture-handler";
import { useRouter } from "expo-router";
import { supabase } from '../supabase';
// import {CLIENT_ID, AUTH_ENDPOINT, TOKEN_ENDPOINT, REDIRECT_URL, USER_DOMAIN} from "@env";

const discovery = {
	authorizationEndpoint: "https://accounts.spotify.com/authorize",
	tokenEndpoint: "https://accounts.spotify.com/api/token",
	// authorizationEndpoint: AUTH_ENDPOINT,
	// tokenEndpoint: TOKEN_ENDPOINT,
};

let successfulAuth = false;

export default function login() {
	const backgroundImage = require('../assets/images/TuneSwipe_Background.png');
	const router = useRouter();
	const sheetRef = useRef<BottomSheet>(null);
	const [isOpen, setIOpen] = useState(false);
	const handleSanpPress = useCallback((index: number) => {
		sheetRef.current?.snapToIndex(index);
		setIOpen(true);
	}, []);
	const snapPoints = ["50%"];

	const [request, response, promptAsync] = Auth.useAuthRequest(
	{
		responseType: Auth.ResponseType.Token,
      	clientId: "71512c4b7d2e4f71bb4c2c5130e3aa9a",
		//clientId: CLIENT_ID,
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
	  //redirectUri: REDIRECT_URL,
    },
	discovery
);

useEffect (() => {
	console.log("-- From useEffect --")
	if(response?.type == "success") {
		const {access_token}= response.params;
		console.log('accessToken = ', access_token);
    	successfulAuth = true;
		getUser(access_token);
    	router.replace("/(tabs)/library")
	}
}, [response]);

const getUser = async (token: string) => {
	console.log("-- From getUser --");
	//console.log("Token Value =", token);
	try{
		const resultFromCall = await fetch("https://api.spotify.com/v1/me", {
			method: "GET",
			headers: { 
				Authorization: `Bearer ${token}`,
				"Content-Type": "application/json",
			},
		});
		const jsonData = await resultFromCall.json();
		const spotifyID = jsonData.id;
		console.log("Signed in user UserID: ", spotifyID);

		if (!spotifyID){
			console.error("Error - Could not get Spotify ID");
			return;
		}

		// Check if spotifyID exists in User table
		let {data: User, error} = await supabase
			.from('User')
			.select('*')
			.eq('spotifyID', spotifyID)
			.single();
		
		if (User) {
			console.log("User already exists in Supabase.");
		} 
		else {
			// Insert new user
			const { data, error: insertError } = await supabase
  				.from('User')
  				.insert([
    				{ spotifyID: spotifyID},
  				])
  				.select()
			
			if (insertError) {
				console.error("ERROR - Could not insert user:", insertError.message);
			}
			else {
				console.log("New user added to Supabase!");
			}
		}
		
	} catch (error) {
		console.error("ERROR - Could not get user.")
	}
};

return (
	<GestureHandlerRootView style ={{flex:1}}>
		<ImageBackground source={backgroundImage} style = {styles.container}>
			<Text style = {{height: 80}}>Login Screen</Text>

			<View style={styles.button}>
				<Button 
					title="Start Now" 
					color= "white"
					onPress={() => handleSanpPress(0)} 
				/>
			</View>

			<BottomSheet
				ref={sheetRef}
				snapPoints={snapPoints}
				enablePanDownToClose={true}
				index={-1}
				onClose={() => setIOpen(false)}
			>
				<BottomSheetView>
					<Text style={{fontSize: 25, height:35}}> Get Started</Text>
					<Text style={{fontSize: 16, height:100}}> Login with Spofity and let the magic begin ... </Text>
				
					<View style={styles.buttonSpotify}>
						<Button 
							title= "Sign in with Spotify" 
							color= "white"
							onPress={() => promptAsync()} 
						/> 
					</View>
				</BottomSheetView>
			</BottomSheet>
		</ImageBackground>	
	</GestureHandlerRootView>
);
}

const styles = StyleSheet.create({
	container: {
		flex: 1,
		backgroundColor: '#black',
		justifyContent: 'center',
		alignItems: 'center',
	},
	text: {
		color: '#000000',
	},
	button: {
		borderRadius: 10,
		width: "30%",
		backgroundColor: "black",
	},
	buttonSpotify: {
		borderRadius: 10,
		backgroundColor: "black",
		width: "50%",
		justifyContent: 'center',
		alignItems: 'center',
	}
});
