
import dotenv from 'dotenv';
import SpotifyWebApi from 'spotify-web-api-node';
import fs from 'fs';
import supabase from "./supabaseClient.js"


dotenv.config();

// Set up Spotify API credentials
const spotifyApi = new SpotifyWebApi({
  clientId: process.env.SPOTIFY_ID,
  clientSecret: process.env.SPOTIFY_SECRET,
});


function saveToken(token, expiresIn) {
    const data = {
        accessToken: token,
        expiresAt: Date.now() + expiresIn * 1000 // Convert to milliseconds
    };
    fs.writeFileSync('spotify_token.json', JSON.stringify(data));
}

function loadToken() {
    if (fs.existsSync('spotify_token.json')) {
        const data = JSON.parse(fs.readFileSync('spotify_token.json'));
        if (Date.now() < data.expiresAt) {
            return data.accessToken; // Return valid token
        }
    }
    return null; // Token expired or doesn't exist
}

// Function to get access token
async function getAccessToken() {
  let token = loadToken();
  if(token != null){
    console.log("Using cached token.")
    spotifyApi.setAccessToken(token);
    return;
  }
  try {
    console.log("Fetching new token.")
    const data = await spotifyApi.clientCredentialsGrant();
    saveToken(data.body['access_token'], data.body['expires_in']);
    spotifyApi.setAccessToken(data.body['access_token']);
  } catch (error) {
    console.error('Error getting access token:', error);
  }
}
/**
 * Fetches track details from the Spotify API.
 * 
 * @param {string[]} trackIds - An array of Spotify track IDs.
 * @returns {Promise<Object>} A promise resolving to track details from Spotify.
 * @throws {Error} Throws an error if the request fails.
 */
export async function fetchTracks(trackIds) {
  try {
    await getAccessToken(); // Ensure we have a valid token
    const response = await spotifyApi.getTracks(trackIds);
    return response.body.tracks; // Returns track details
  } catch (error) {
    console.error('Error fetching tracks:', error);
  }
}

/**
 * Fetches artist details from Spotify.
 * 
 * @param {string[]} artistIds - An array of Spotify artist IDs to fetch details for.
 * @returns {Promise<Object[]>} A promise that resolves to an array of artist details.
 */
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
/**
 * Stores tracks in the Supabase database.
 * 
 * @param {Object[]} trackData - An array of track objects fetched from Spotify.
 * @returns {Promise<void>} A promise that resolves when the tracks are successfully inserted.
 */

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

/**
 * Stores artists in the Supabase database.
 * 
 * @param {Object[]} artistData - An array of artist objects fetched from Spotify.
 * @returns {Promise<void>} A promise that resolves when the artists are successfully inserted.
 */
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

