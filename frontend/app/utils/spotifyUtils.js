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
    await getAccessToken(); // Make sure token is fresh

    const batchSize = 50;
    const allTracks = [];

    for (let i = 0; i < trackIds.length; i += batchSize) {
      const batch = trackIds.slice(i, i + batchSize);
      const response = await spotifyApi.getTracks(batch);
      allTracks.push(...response.body.tracks);
    }

    return allTracks;
  } catch (error) {
    console.error('Error fetching tracks:', error);
    return [];
  }
}


// Function to fetch artist details from Spotify
// Artist IDs are passed as an array
async function fetchArtists(artistIds) {
    try {
      await getAccessToken();
      const response = await spotifyApi.getArtists(artistIds);

      return response.body.artists.map(artist => ({
            id: artist.id,
            name: artist.name,
            imageUrl: artist.images.length > 0 ? artist.images[0].url : null, // Get the first image
            genres: artist.genres,
            popularity: artist.popularity,
        }));
    } catch (error) {
      console.error('Error fetching artist details:', error);
      return [];
    }
  }

// Function to store tracks in Supabase
async function storeTracksInSupabase(trackData) {
  await getAccessToken();
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
  await getAccessToken();
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
  await getAccessToken();
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

async function startPlaylist(accessToken, playlistId, deviceId = null) {
  await getAccessToken();
  const endpoint = 'https://api.spotify.com/v1/me/player/play';
  const playlistUri = `spotify:playlist:${playlistId}`;

  const body = {
    context_uri: playlistUri, // Example: "spotify:playlist:37i9dQZF1DXcBWIGoYBM5M"
  };

  const url = deviceId ? `${endpoint}?device_id=${deviceId}` : endpoint;

  const response = await fetch(url, {
    method: 'PUT',
    headers: {
      'Authorization': `Bearer ${accessToken}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(body),
  });

  if (response.status === 204) {
    console.log('Playback started successfully.');
  } else {
    const error = await response.json();
    console.error('Failed to start playback:', error);
  }
}

async function toggleShuffle(mode){
  await getAccessToken();
  spotifyApi.setShuffle(mode)
  .then(function() {
    console.log('Shuffle is on.');
  }, function  (err) {
    //if the user making the request is non-premium, a 403 FORBIDDEN response code will be returned
    console.log('Something went wrong!', err);
  });
}

async function removeTrackFromPlaylist(playlistId, trackID) {
  try {
    await getAccessToken();
    // Get the current snapshot_id of the playlist
    const data = await spotifyApi.getPlaylist(playlistId);
    const snapshotId = data.body.snapshot_id;

    // Prepare the track data and options with the snapshot_id
    const tracks = [{ uri: `spotify:track:${trackID}` }];
    const options = { snapshot_id: snapshotId };

    // Remove the track from the playlist using the snapshot_id
    await spotifyApi.removeTracksFromPlaylist(playlistId, tracks, options);

  } catch (err) {
    console.log('Error removing track from playlist', err);
  }
}

async function addTracksToPlaylist(playlistId, trackIDs) {
  try {
    await getAccessToken(); // Ensure access token is valid

    // Prepare the track data (Spotify URI format) for the array of track IDs
    const tracks = trackIDs.map(trackID =>  `spotify:track:${trackID}`);

    console.log("Tracks to be inserted", tracks)
    // Add the tracks to the playlist
    const data = await spotifyApi.addTracksToPlaylist(playlistId, tracks);

    console.log('Tracks added to playlist successfully!', data.body);
  } catch (err) {
    console.log('Error adding tracks to playlist!', err);
  }
}
const fetchPlaylistSongIDs = async (playlistId) => {
  //limit the number of tracks to 50
  try {
    // First, ensure access token is obtained
    await getAccessToken();

    // Fetch playlist data
    const playlistData = await spotifyApi.getPlaylistTracks(playlistId);

    // Extract track IDs from the playlist data
    const trackIds = playlistData.body.items.map(item => item.track.id)

    // Return an array of track IDs
    return trackIds;

  } catch (error) {
    console.error('Error fetching playlist:', error);
    return [];  // Return null in case of an error
  }
  // try {
  //   // First, ensure access token is obtained
  //   await getAccessToken();

  //   let trackIds = [];
  //   let offset = 0;
  //   let totalTracks = 1; // Initially set to 1 to enter the loop

  //   // Loop through the pages of tracks (each page has a max of 50 items)
  //   while (offset < totalTracks) {
  //     // Fetch playlist data with pagination using offset
  //     const playlistData = await spotifyApi.getPlaylistTracks(playlistId, { offset: offset });

  //     // Extract track IDs from the playlist data
  //     const currentTrackIds = playlistData.body.items.map(item => item.track.id);

  //     // Append the current page of track IDs to the trackIds array
  //     trackIds = trackIds.concat(currentTrackIds);

  //     // Update the offset and totalTracks
  //     offset += 50; // Move to the next page of results
  //     totalTracks = playlistData.body.total; // Total number of tracks in the playlist
  //   }

  //   // Return the full list of track IDs
  //   console.log('All Track IDs:', trackIds);
  //   return trackIds;

  // } catch (error) {
  //   console.error('Error fetching playlist:', error);
  //   return [];
  // }
};

const createPlaylist = async (name, description) => {
  try {
    await getAccessToken(); // Set token
    // Call Spotify Web API to create a new playlist for the user
    const playlistData = await spotifyApi.createPlaylist(name, {
      description: description,
      public: true, // Set to true if you want the playlist to be public
    });

    console.log('Playlist created successfully!', playlistData.body);
    return playlistData.body;
  } catch (error) {
    console.error('Error creating playlist:', error);
  }
};


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


export {addTracksToPlaylist, createPlaylist, fetchPlaylistSongIDs, removeTrackFromPlaylist, toggleShuffle, startPlaylist, fetchAndStoreTracks, fetchTracks, fetchArtists, storeTracksInSupabase, storeArtistsInSupabase, fetchUser };
