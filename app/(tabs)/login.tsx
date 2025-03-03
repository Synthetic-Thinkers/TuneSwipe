import { Text, View, StyleSheet, Pressable, FlatList, Button } from "react-native";
import React, {useEffect, useState, useRef, useCallback} from "react";
import * as Auth from 'expo-auth-session';
import AsyncStorage from "@react-native-async-storage/async-storage";
import BottomSheet, {BottomSheetView} from "@gorhom/bottom-sheet"
import { useReducedMotion } from "react-native-reanimated";
import { GestureHandlerRootView } from "react-native-gesture-handler";

const discovery = {
	authorizationEndpoint: "https://accounts.spotify.com/authorize",
	tokenEndpoint: "https://accounts.spotify.com/api/token",
};

export default function login() {
	//Array of top five artists
	const [topArtists, setTopArtists] = useState([]);
	const sheetRef = useRef<BottomSheet>(null);
	const [isOpen, setIOpen] = useState(true);
	const handleSanpPress = useCallback((index: number) => {
		sheetRef.current?.snapToIndex(index);
		setIOpen(true);
	}, []);
	const snapPoints = ["50%"];

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
	<GestureHandlerRootView style ={{flex:1}}>
		<View style = {styles.container}>
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

		</View>	
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

{/* <View style={styles.button}>
			<Button 
				title="Sign in with Spotify" 
				color= "white"
				onPress={() => promptAsync()} 
			/>  */}