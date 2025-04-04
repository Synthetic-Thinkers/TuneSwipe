import SpotifyWebApi from 'spotify-web-api-node';
import supabase from "./supabaseClient.js"
import AsyncStorage from "@react-native-async-storage/async-storage";

// function saveToken(token, expiresIn) {
//     const data = {
//         accessToken: token,
//         expiresAt: Date.now() + expiresIn * 1000 // Convert to milliseconds
//     };
//     fs.writeFileSync('spotify_token.json', JSON.stringify(data));
// }

// function loadToken() {
//     if (fs.existsSync('spotify_token.json')) {
//         const data = JSON.parse(fs.readFileSync('spotify_token.json'));
//         if (Date.now() < data.expiresAt) {
//             return data.accessToken; // Return valid token
//         }
//     }
//     return null; // Token expired or doesn't exist
// }
const spotifyApi = new SpotifyWebApi();

// Function to get access token
async function getAccessToken() {
  let token = await AsyncStorage.getItem('accessToken');
  if(token != null){
    console.log("Using cached token.")
    spotifyApi.setAccessToken(token);
    return;
  }
  // try {
  //   console.log("Fetching new token.")
  //   const data = await spotifyApi.clientCredentialsGrant();
  //   spotifyApi.setAccessToken(data.body['access_token']);
  // } catch (error) {
  //   console.error('Error getting access token:', error);
  // }
}

// Function to fetch track details
// Track IDs are passed as an array
async function fetchTracks(trackIds) {
  try {
    await getAccessToken(); // Ensure we have a valid token
    const response = await spotifyApi.getTracks(trackIds);
    return response.body.tracks; // Returns track details
  } catch (error) {
    console.error('Error fetching tracks:', error);
  }
}

// Function to fetch artist details from Spotify
// Artist IDs are passed as an array
async function fetchArtists(artistIds) {
    try {
      await getAccessToken();
      const response = await spotifyApi.getArtists(artistIds);
      
      return response.body.artists;
    } catch (error) {
      console.error('Error fetching artist details:', error);
      return [];
    }
  }

// Function to store tracks in Supabase
async function storeTracksInSupabase(trackData) {
  const song = trackData.map(track => ({
    title: track.name || null,
    spotifyURL: track.external_urls.spotify || null,
    imageUrl: track.album.images.length > 0 ? track.album.images[0].url : null,
    genres: [], // Spotify API doesn't return genres for tracks, only for artists
    spotifyID: track.id,
    artistsID: track.artists.map(artist => artist.id)
  }));
  
  try {
    const { data, error } = await supabase.from('Song').insert(song);

    if (error) {
      console.error('Error inserting into Supabase:', error);
    } else {
      console.log('Tracks inserted successfully:');
    }
  } catch (error) {
    console.error('Error storing tracks in Supabase:', error);
  }
}

// Function to store artists in Supabase
async function storeArtistsInSupabase(artistData) {
    const artists = artistData.map(artist => ({
        name: artist.name,
        genres: artist.genres || [],
        popularity: artist.popularity,
        spotifyUrl: artist.external_urls.spotify || null,
        imageUrl: artist.images.length > 0 ? artist.images[0].url : null,
        spotifyID: artist.id
      }));

    try {
      const { data, error } = await supabase.from('Artist').insert(artists);
  
      if (error) {
        console.error('Error inserting artists into Supabase:', error);
      } else {
        console.log('Artists inserted successfully:');
      }
    } catch (error) {
      console.error('Error storing artists in Supabase:', error);
    }
}


// Function to fetch and store tracks and their artists
async function fetchAndStoreTracks(trackIds) {
  const trackData = await fetchTracks(trackIds);
  if (trackData.length > 0) {
    await storeTracksInSupabase(trackData);
    
    // Extract unique artist IDs
    const artistIds = [...new Set(trackData.flatMap(track => track.artists.map(artist => artist.id)))];

    console.log("Artist IDs", artistIds);
    const artistData = await fetchArtists(artistIds);
    if (artistData.length > 0) {
      await storeArtistsInSupabase(artistData);
    }
  }
}


/**
 * Fetches Spotify user profile using an access token.
 * @param {string} accessToken - Spotify OAuth access token.
 * @returns {Promise<object>} - User profile data.
 */
async function fetchUser() {
  try {
      await getAccessToken(); // Set token
      const data = await spotifyApi.getMe(); // Fetch user profile
      return data.body;
  } catch (error) {
      console.error("Error fetching Spotify user profile:", error.message);
      return null;
  }
}

export { fetchAndStoreTracks, fetchTracks, fetchArtists, storeTracksInSupabase, storeArtistsInSupabase, fetchUser };
