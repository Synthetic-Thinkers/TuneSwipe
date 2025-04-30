from flask import Flask, request, jsonify
from flask_sqlalchemy import SQLAlchemy
from sqlalchemy.dialects.postgresql import ARRAY
from sqlalchemy.sql.expression import func
import os
from dotenv import load_dotenv
import spotipy
from spotipy.oauth2 import SpotifyClientCredentials
from spotify_utils import fetch_and_store_spotify_tracks
import numpy as np
from sklearn.metrics.pairwise import cosine_similarity
import pandas as pd
from sklearn.model_selection import train_test_split
from sklearn.linear_model import LogisticRegression
from sklearn.metrics import accuracy_score, confusion_matrix, classification_report
from sklearn.preprocessing import StandardScaler
import random
import requests
from sklearn.preprocessing import StandardScaler
from sklearn.metrics.pairwise import euclidean_distances
from sklearn.cluster import KMeans
from sklearn.pipeline import Pipeline
import numpy as np
import pandas as pd
from sqlalchemy import select

load_dotenv()

auth_manager = SpotifyClientCredentials(client_id=os.getenv('SPOTIPY_CLIENT_ID'), client_secret=os.getenv('SPOTIPY_CLIENT_SECRET'))
sp = spotipy.Spotify(auth_manager=auth_manager)

app = Flask(__name__)

# Database configuration - Replace with your actual credentials
app.config['SQLALCHEMY_DATABASE_URI'] = app.config['SQLALCHEMY_DATABASE_URI'] = os.getenv('DATABASE_URL')
app.config['SQLALCHEMY_TRACK_MODIFICATIONS'] = False  # Optional: Disable modification tracking

db = SQLAlchemy(app)

class Song(db.Model):
    __tablename__ = 'songs'  # Explicitly specify the table name

    id = db.Column(db.Text, primary_key=True)
    name = db.Column(db.Text)
    album = db.Column(db.Text)
    artist_ids = db.Column(ARRAY(db.Text))
    artists = db.Column(ARRAY(db.Text))
    track_number = db.Column(db.Integer)
    disc_number = db.Column(db.Integer)
    explicit = db.Column(db.Boolean)
    danceability = db.Column(db.Float)
    energy = db.Column(db.Float)
    key = db.Column(db.Integer)
    loudness = db.Column(db.Float)
    mode = db.Column(db.Integer)
    speechiness = db.Column(db.Float)
    acousticness = db.Column(db.Float)
    instrumentalness = db.Column(db.Float)
    liveness = db.Column(db.Float)
    valence = db.Column(db.Float)
    tempo = db.Column(db.Float)
    duration_ms = db.Column(db.Integer)
    time_signature = db.Column(db.Float)
    year = db.Column(db.Integer)


    def __repr__(self):
        return f"<Song {self.name} ({self.id})>"

    def to_dict(self):
        return {c.name: getattr(self, c.name) for c in self.__table__.columns}

class Artist(db.Model):
    __tablename__ = 'artists'

    artist_id = db.Column(db.Text, primary_key=True)
    artist_name = db.Column(db.Text)

    def __repr__(self):
        return f"<Artist {self.name} ({self.id})>"

    def to_dict(self):
        return {c.name: getattr(self, c.name) for c in self.__table__.columns}

#Get song by ID
@app.route('/songs/<string:song_id>', methods=['GET'])
def get_song_by_id(song_id):
    song = Song.query.get(song_id)  # Use primary key lookup

    if song:
        return jsonify({
            'id': song.id,
            'name': song.name,
            'album': song.album,
            'artist_ids': song.artist_ids,
            'track_number': song.track_number,
            'explicit': song.explicit,
            'year': song.year,
            # Add more fields as needed
        })
    else:
        return jsonify({'error': 'Song not found'}), 404

@app.route('/songs/by-ids', methods=['POST'])
def get_songs_by_ids():
    data = request.get_json()
    ids = data.get('ids', [])

    if not ids:
        return jsonify({'error': 'No song IDs provided'}), 400

    songs = Song.query.filter(Song.id.in_(ids)).all()

    return jsonify([
        {
            'id': song.id,
            'name': song.name,
            'album': song.album,
            'artist_ids': song.artist_ids,
            'year': song.year,
        }
        for song in songs
    ])

@app.route('/random-song', methods=['GET'])
def get_random_song():
    song = Song.query.order_by(func.random()).first()  # Random row from songs table
    if song:
        return jsonify({
            'id': song.id,
            'name': song.name,
            'album': song.album,
            'artist_ids': song.artist_ids,
            'year': song.year,
        })
    else:
        return jsonify({'message': 'No songs found'}), 404

@app.route('/swipe-recommendations', methods=['POST'])
def get_swipe_recommendations():
    try:
        user_info = request.get_json()

        songs = Song.query.order_by(func.random()).limit(20).all()

        # Only return song IDs
        song_ids = [song.id for song in songs]
        print(song_ids)
        return jsonify(song_ids), 200
    except Exception as e:
        return jsonify([]), 500
    # try:
    #     user_info = request.get_json()
    #     preference_vector = user_info.get("preference")

    #     if not preference_vector or not isinstance(preference_vector, list):
    #         recentTrackIDs = user_info.get("recentlyPlayed")
    #         top10TrackIDs = user_info.get("top10Tracks")
    #         combinedTrackIDs = list(set(recentTrackIDs + top10TrackIDs))
    #         # Check if any of the tracks are already in the database
    #         existingTrackData = Song.query.filter(Song.id.in_(combinedTrackIDs)).all()
    #         existingTrackIDs = [track.id for track in existingTrackData]
    #         missingTrackIDs = list(set(combinedTrackIDs) - set(existingTrackIDs))
    #         # Save the new tracks to the database
    #         missingTrackData = fetch_and_store_spotify_tracks(missingTrackIDs, sp)
    #         # Combine existing and new tracks
    #         combinedTrackData = existingTrackData + missingTrackData

    #     print("Existing", combinedTrackIDs)
    #     return jsonify(combinedTrackData), 200
    #     # Convert to NumPy array
    #     user_vec = np.array(preference_vector).reshape(1, -1)

    #     # Fetch all songs with valid feature vectors (or a subset for performance)
    #     songs = Song.query.limit(500).all()

    #     # Filter and collect song feature vectors
    #     valid_songs = []
    #     feature_vectors = []

    #     for song in songs:
    #         try:
    #             vec = np.array([
    #                 song.danceability,
    #                 song.energy,
    #                 song.valence,
    #                 song.tempo,
    #                 song.acousticness,
    #                 song.instrumentalness,
    #                 song.liveness,
    #                 song.speechiness
    #             ])
    #             if np.isnan(vec).any():
    #                 continue  # skip incomplete data
    #             valid_songs.append(song)
    #             feature_vectors.append(vec)
    #         except:
    #             continue

    #     if not valid_songs:
    #         return jsonify({"error": "No valid songs with features found"}), 500

    #     # Compute cosine similarity
    #     features_np = np.stack(feature_vectors)
    #     similarities = cosine_similarity(user_vec, features_np)[0]

    #     # Pair scores with songs
    #     scored_songs = list(zip(similarities, valid_songs))
    #     top_songs = sorted(scored_songs, key=lambda x: x[0], reverse=True)[:10]

    #     # Serialize result
    #     result = [song.to_dict() for _, song in top_songs]
    #     return jsonify({"recommended_songs": result}), 200

    # except Exception as e:
    #     return jsonify({"error": str(e)}), 500


@app.route('/create-playlist', methods=['POST'])
def create_playlist():
    data = request.get_json()
    activityLog = data.get('activityLog', {})  # default to empty list
    swipeResults = activityLog['swipeResults']

    liked_ids = [item['id'] for item in swipeResults if item['liked']]

    # Query liked song features
    liked_song_features = db.session.query(
        Song.id,
        Song.danceability,
        Song.energy,
        Song.key,
        Song.loudness,
        Song.speechiness,
        Song.acousticness,
        Song.instrumentalness,
        Song.liveness,
        Song.valence,
        Song.tempo,
    ).filter(Song.id.in_(liked_ids)).all()

    # Build numpy array of liked features (excluding ID)
    liked_feature_vectors = np.array([row[1:] for row in liked_song_features])

    # Compute average user profile
    if len(liked_feature_vectors) == 0:
        return {"error": "No liked songs to build user profile."}, 400

    user_profile = liked_feature_vectors.mean(axis=0).reshape(1, -1)

    # Query all songs in the database
    all_song_features = db.session.query(
        Song.id,
        Song.danceability,
        Song.energy,
        Song.key,
        Song.loudness,
        Song.speechiness,
        Song.acousticness,
        Song.instrumentalness,
        Song.liveness,
        Song.valence,
        Song.tempo,
    ).all()

    # Build array of all features (and keep track of IDs)
    all_ids = [row[0] for row in all_song_features]
    all_vectors = np.array([row[1:] for row in all_song_features])

    # Compute cosine similarity
    similarities = cosine_similarity(all_vectors, user_profile).flatten()

    # Rank top 30 songs by similarity (excluding liked songs if desired)
    ranked_indices = similarities.argsort()[::-1]

    # Optionally exclude songs already rated
    filtered_indices = [i for i in ranked_indices if all_ids[i] not in liked_ids]

    # Get top 30 recommendations
    top_30_ids = [all_ids[i] for i in filtered_indices[:30]]

    # Return or use these IDs however you like
    return jsonify(top_30_ids)

@app.route('/logregression', methods=['GET'])
def logregression():
    results = db.session.query(
        Song.id,
        Song.danceability,
        Song.energy,
        Song.key,
        Song.loudness,
        Song.speechiness,
        Song.acousticness,
        Song.instrumentalness,
        Song.liveness,
        Song.valence,
        Song.tempo,
        Song.time_signature
    ).all()
    # Define the ID you're looking for
    target_ids = ["0qOnSQQF0yzuPWsXrQ9paz", "3bfqkspKABT4pPicm6wC9F"]
    indices = [i for i, t in enumerate(results) if t[0] in target_ids]

    print("Indices:", indices)

    matrix_data = [
    song[1:]  # Exclude the first element (the 'id' column)
    for song in results
    ]
    data_matrix = np.array(matrix_data)
    columns = [
    'danceability',
    'energy',
    'key',
    'loudness',
    'speechiness',
    'acousticness',
    'instrumentalness',
    'liveness',
    'valence',
    'tempo',
    'time_signature'
    ]

    # Create DataFrame
    df = pd.DataFrame(data_matrix, columns=columns)
    selected_rows = df.iloc[indices]
    # Optionally exclude already selected rows from top 28
    extra_rows = df.head(1)
    X_train = pd.concat([selected_rows, extra_rows], ignore_index=True)
    n = 3
    target = [1, 1] + [0] * (n - 2)
    y_train = pd.DataFrame({'target': target})

    model = LogisticRegression()
    # Train the model
    model.fit(X_train, y_train)
    y_pred = model.predict_proba(data_matrix)
    probs_class_1 = y_pred[:, 1]
    top_30_indices = np.argsort(probs_class_1)[-30:][::-1]

    top_30_ids = [results[i][0] for i in top_30_indices]

    return jsonify({"message": top_30_ids})

@app.route('/artist-search', methods=['GET'])
def get_artist_by_name():
    query = request.args.get('query', '').lower()
    if not query:
        return jsonify({"error": "Query parameter is required"}), 400

    artists = Artist.query.filter(Artist.artist_name.ilike(f'%{query}%')).limit(50).all()

    if artists:
        return jsonify([artist.to_dict() for artist in artists]), 200
    return jsonify([]), 200

@app.route('/song-search', methods=['GET'])
def get_song_by_name():
    query = request.args.get('query', '').lower()
    if not query:
        return jsonify({"error": "Query parameter is required"}), 400

    songs = Song.query.filter(Song.name.ilike(f'%{query}%')).limit(50).all()

    if songs:
        return jsonify([song.to_dict() for song in songs]), 200
    return jsonify([]), 200


@app.route('/test', methods=['GET'])
def get_random_artist():
    artist = Artist.query.order_by(func.random()).first()
    if artist:
        return jsonify(artist.to_dict()), 200
    return jsonify({"error": "No artist found"}), 404

# Global variable to store the similar artists data
similar_artists_data = {}

# Get Recent Tracks From A User
@app.route('/recent-tracks', methods=['POST'])
def get_recent_tracks():
  # Get data from the request
  data = request.get_json()
  user_id = data.get('user_id')
  artists = data.get('artists')

  if not user_id or not artists:
      return {"error": "Missing user_id or artists"}, 400

  # Process the user_id and artists
  print("User ID:", user_id)
  print("Artists:", artists)

  print("message: Data received successfully")

  # Store the result in the global variable
  global similar_artists_data
  similar_artists_data[user_id] = artists

  return jsonify(artists), 200

#Get Similar Artists with LastFM API
def get_similar_artists(artist_name):
  if not artist_name:
      return {"error": "Missing artist_name"}, 400

  # Process the artist_name
  # print("Artist Name:", artist_name)

  # Call LastFM API to get similar artists
  api_key = os.getenv('LASTFM_API_KEY')
  url = "http://ws.audioscrobbler.com/2.0/"
  params = {
        "method": "artist.getsimilar",
        "artist": artist_name,
        "api_key": api_key,
        "format": "json",
        "limit": 10
  }

  response = requests.get(url, params=params)

  if response.status_code == 200:
      similar_artists = response.json()
      return similar_artists
  else:
      return {"error": "Failed to fetch similar artists"}, response.status_code

# Batch Similar Artists into a single request
def batch_similar_artists(artists):
    artists = artists.get('artists')

    if not artists:
        return {"error": "Missing artists list"}, 400

    all_similar = {}

    for artist_entry in artists:
        if isinstance(artist_entry, list):
            artist_name = artist_entry[0]  # Take first name of list
        else:
            artist_name = artist_entry

        similar_result = get_similar_artists(artist_name)
        if similar_result:
            # Extract just the names of the similar artists
            similar_artists_names = [artist['name'] for artist in similar_result.get('similarartists', {}).get('artist', [])]
            all_similar[artist_name] = similar_artists_names  # Store just the names
        else:
            all_similar[artist_name] = {"error": "Failed to fetch similar artists"}

    print("All similar artists:", all_similar)

    return all_similar

def check_songs(similar_artists, disliked_artists):
    if not similar_artists:
        return {"error": "No similar artists provided"}, 400

    artist_names = []  # To store artist names
    artist_ids = []  # To store artist IDs

    for artist, similar_list in similar_artists.items():
        # Filter out disliked artists from the similar list

        filtered_similar_list = []
        for artist_name in similar_list:
            # Query the database to get the artist ID for the current artist name
            artist_entry = Artist.query.filter_by(artist_name=artist_name).first()
            if artist_entry and artist_entry.artist_id not in disliked_artists:
                filtered_similar_list.append(artist_name)

        for similar_artist in filtered_similar_list:
            # Query the database to check if the artist exists
            song = Song.query.filter(Song.artists.any(similar_artist)).first()

            if song is not None:
                artist_names.append(similar_artist)  # Add the artist name to the list
                try:
                    # Find the matching index
                    idx = song.artists.index(similar_artist)
                    # Use the same index to get the artist ID
                    artist_id = song.artist_ids[idx]
                    artist_ids.append(artist_id)
                except ValueError:
                    # If somehow artist not found, skip it
                    continue

    # Remove duplicates from the artist IDs
    unique_artist_ids = list(set(artist_ids))
    print("Unique artist names found in the database:", artist_names)
    # print("Unique artist IDs found in the database:", unique_artist_ids)
    return unique_artist_ids

def select_random_artists(all_artists):
    if not all_artists:
        return {"error": "No artists provided"}, 400
    if len(all_artists) > 15:
        random_artists = random.sample(all_artists, 15)
    return random_artists

@app.route('/random-artists', methods=['POST'])
def get_random_artists():
    global similar_artists_data

    # Extract user_id (Spotify ID) from query parameters
    data = request.get_json()
    user_id = data.get('user_id')
    disliked_artists = data.get('disliked_artists', [])
    if not user_id:
        return {"error": "Missing user_id in the request"}, 400

    print(f"Disliked artists for user_id {user_id}: {disliked_artists}")

    # Check if the user_id exists in similar_artists_data
    if user_id not in similar_artists_data:
        return {"error": f"No data available for user_id: {user_id}"}, 400

     # Fetch the artists for the user
    artists = similar_artists_data[user_id]
    print(f"Fetched artists for user_id {user_id}: {artists}")

    # Batch similar artists into a dictionary
    similar_artists = batch_similar_artists({"artists": artists})
    if isinstance(similar_artists, dict) and "error" in similar_artists:
        return similar_artists, 400

    # Process the similar artists to get songs and artist IDs
    db_artists = check_songs(similar_artists, disliked_artists)
    if isinstance(db_artists, dict) and "error" in db_artists:
        return db_artists, 400

    # Select 10 random artists
    random_artists = select_random_artists(db_artists)
    if isinstance(random_artists, dict) and "error" in random_artists:
        return random_artists, 400

    print(f"10 Random artists for user_id {user_id}: {random_artists}")
    return jsonify(random_artists), 200

# ---------------- K-Means Clustering ------------------
# Define features and metadata columns
features = ['valence', 'year', 'acousticness', 'danceability', 'duration_ms',
            'energy', 'explicit', 'instrumentalness', 'key', 'liveness',
            'loudness', 'mode', 'speechiness', 'tempo']
metadata_cols = ['year', 'name']

# Initialize the K-Means pipeline
song_cluster_pipeline = Pipeline([
    ('scaler', StandardScaler()),
    ('kmeans', KMeans(n_clusters=8, verbose=2))
])

# Load songs from the database into a Pandas DataFrame
with app.app_context():
    songs_query = db.session.query(Song)
    df = pd.read_sql(str(songs_query.statement), db.engine)


# Fit the pipeline to the dataset
if not df.empty:
    X = df[features]
    song_cluster_pipeline.fit(X)

def input_preprocessor_by_artist(artist_id, dataset, features):
    # Match the artist_id exactly
    artist_songs = dataset[dataset['artist_ids'].apply(lambda ids: artist_id in ids if ids else False)]

    if artist_songs.empty:
        print(f"No songs found for artist ID: {artist_id}")
        return None

    song_vectors = artist_songs[features].values
    return np.mean(song_vectors, axis=0)  # 1D vector

def music_recommender_by_artist(liked_artists, disliked_artists, dataset, song_cluster_pipeline, features, metadata_cols, n_songs=30):
    # Shuffle the liked artists to ensure randomness
    random.shuffle(liked_artists)

    # Allocate half of the playlist to songs by the liked artists
    liked_artist_quota = n_songs // 2
    per_artist_quota = max(1, liked_artist_quota // len(liked_artists))  # Divide quota among liked artists

    # Collect unique songs only
    seen_names = set()
    unique_recs = []

    # Step 1: Collect songs from all liked artists
    for artist_id in liked_artists:
        artist_songs = dataset[dataset['artist_ids'].apply(lambda ids: artist_id in ids if ids else False)]
        if not artist_songs.empty:
            # Randomly select songs from the liked artist's songs
            liked_artist_songs = artist_songs.sample(min(len(artist_songs), per_artist_quota))
            for _, song in liked_artist_songs.iterrows():
                if song['name'] not in seen_names:
                    unique_recs.append(song)
                    seen_names.add(song['name'])
                if len(unique_recs) == liked_artist_quota:
                    break
        if len(unique_recs) == liked_artist_quota:
            break

    # Step 2: Fill remaining slots with similar songs
    # Get song center vector for all liked artists
    song_centers = []
    for artist_id in liked_artists:
        song_center = input_preprocessor_by_artist(artist_id, dataset, features)
        if song_center is not None:
            song_centers.append(song_center)

    if not song_centers:
        return pd.DataFrame()

    # Compute the average center for all liked artists
    avg_song_center = np.mean(song_centers, axis=0)

    # Scale full dataset + the average artist vector
    scaler = song_cluster_pipeline.steps[0][1]
    scaled_data = scaler.transform(dataset[features])
    scaled_center = scaler.transform(avg_song_center.reshape(1, -1))

    # Compute distances
    distances = euclidean_distances(scaled_center, scaled_data)
    sorted_indices = np.argsort(distances[0])

    # Fill remaining slots with the best-fit similar songs
    for idx in sorted_indices:
        if len(unique_recs) == n_songs:
            break
        song = dataset.iloc[idx]
        name = song['name']
        # Filter out songs with disliked artists
        if name not in seen_names and not any(disliked_id in song['artist_ids'] for disliked_id in disliked_artists):
            unique_recs.append(song)
            seen_names.add(name)

     # Convert list of Series back to DataFrame
    recs_df = pd.DataFrame(unique_recs)

    return recs_df[metadata_cols + ['artist_ids', 'id']]

# ----------------------------------------------------------

@app.route('/generate-playlist', methods=['POST'])
def generate_playlist():
    global df, song_cluster_pipeline

    # Get the list of liked artist IDs from the request
    data = request.get_json()
    liked_artists = data.get('liked_artists')
    disliked_artists = data.get('disliked_artists', [])

    if not liked_artists:
        return {"error": "No liked artists provided"}, 400

    print("Liked Artists:", liked_artists)

    # Generate recommendations for all liked artists
    recommendations = music_recommender_by_artist(
        liked_artists=liked_artists,
        disliked_artists=disliked_artists,
        dataset=df,
        song_cluster_pipeline=song_cluster_pipeline,
        features=features,
        metadata_cols=metadata_cols,
        n_songs=30  # Adjust the number of songs per playlist
    )

    if recommendations.empty:
        return {"error": "No recommendations could be generated"}, 400

    # Convert the recommendations to a list of dictionaries
    playlist = recommendations.to_dict(orient='records')

    # Store only the song IDs in a separate variable
    song_ids = recommendations['id'].tolist()

    # Shuffle the song IDs
    random.shuffle(song_ids)

    print("Generated Playlist:", playlist)
    return jsonify(song_ids), 200

if __name__ == "__main__":
   app.run(host="0.0.0.0", port=5000, debug=True)
