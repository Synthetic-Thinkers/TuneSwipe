from flask import Flask, request, jsonify
from dotenv import load_dotenv
import os
import requests
from flask_sqlalchemy import SQLAlchemy
from sqlalchemy.dialects.postgresql import ARRAY
from sqlalchemy import func
import random
from sklearn.preprocessing import StandardScaler
from sklearn.metrics.pairwise import euclidean_distances
from sklearn.cluster import KMeans
from sklearn.pipeline import Pipeline
import numpy as np
import pandas as pd
from sqlalchemy import select

load_dotenv()
app = Flask(__name__)

#Database configuration using the DATABASE_URL from .env
app.config['SQLALCHEMY_DATABASE_URI'] = os.getenv('DATABASE_URL')
app.config['SQLALCHEMY_TRACK_MODIFICATIONS'] = False  # Optional: Disable modification tracking

# Initialize the SQLAlchemy object
db = SQLAlchemy(app)

class Song(db.Model):
    __tablename__ = 'songs'  # Explicitly specify the table name

    id = db.Column(db.Text, primary_key=True)
    name = db.Column(db.Text)
    album = db.Column(db.Text)
    album_id = db.Column(db.Text)
    artists = db.Column(ARRAY(db.Text))
    artist_ids = db.Column(ARRAY(db.Text))  # PostgreSQL-specific ARRAY type
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
    # release_date = db.Column(db.Text)

    def __repr__(self):
        return f"<Song {self.name} ({self.id})>"

    def to_dict(self):
        return {c.name: getattr(self, c.name) for c in self.__table__.columns}


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
  print("Artist Name:", artist_name)

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

def check_songs(similar_artists):
    if not similar_artists:
        return {"error": "No similar artists provided"}, 400

    artist_names = []  # To store artist names
    artist_ids = []  # To store artist IDs

    for artist, similar_list in similar_artists.items():
        # print("Checking similar artists for:", artist)
        # print("Similar Artists:", similar_list)

        for similar_artist in similar_list:
            # Query the database to check if the artist exists
            song = Song.query.filter(Song.artists.any(similar_artist)).first()
            # print('Song for current artist:', song)

            if song != None:
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
    print("Unique artist IDs found in the database:", unique_artist_ids)
    return unique_artist_ids

def select_random_artists(all_artists):
    if not all_artists:
        return {"error": "No artists provided"}, 400
    if len(all_artists) > 10:
        random_artists = random.sample(all_artists, 10)
    return random_artists

@app.route('/random-artists', methods=['GET'])
def get_random_artists():
    global similar_artists_data

    # Extract user_id (Spotify ID) from query parameters
    user_id = request.args.get('user_id')
    if not user_id:
        return {"error": "Missing user_id in the request"}, 400

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
    db_artists = check_songs(similar_artists)
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

# print("DataFrame shape:", df.shape)
# print("DataFrame columns:", df.columns)

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

def music_recommender_by_artist(liked_artists, dataset, song_cluster_pipeline, features, metadata_cols, n_songs=30):
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
        if name not in seen_names:
            unique_recs.append(song)
            seen_names.add(name)


    # Get song center vector for artist
    # song_center = input_preprocessor_by_artist(artist_id, dataset, features)

    # if song_center is None:
    #     return pd.DataFrame()

    # # Scale full dataset + the artist vector
    # scaler = song_cluster_pipeline.steps[0][1]
    # scaled_data = scaler.transform(dataset[features])
    # scaled_center = scaler.transform(song_center.reshape(1, -1))

    # # Compute distances
    # distances = euclidean_distances(scaled_center, scaled_data)
    # sorted_indices = np.argsort(distances[0])

    # # Collect unique songs only
    # seen_names = set()
    # unique_recs = []

    # # Allocate half of the playlist to songs by the liked artists
    # liked_artist_quota = n_songs // 2
    # per_artist_quota = max(1, liked_artist_quota // len(liked_artists))

    # # Step 1: Collect all songs by the liked artist
    # artist_songs = dataset[dataset['artist_ids'].apply(lambda ids: artist_id in ids if ids else False)]
    # if not artist_songs.empty:
    #     # Randomly select songs from the liked artist's songs
    #     liked_artist_songs = artist_songs.sample(min(len(artist_songs), liked_artist_quota))
    #     for _, song in liked_artist_songs.iterrows():
    #         if song['name'] not in seen_names:
    #             unique_recs.append(song)
    #             seen_names.add(song['name'])

    # # Step 2: Fill remaining slots with similar songs
    # for idx in sorted_indices:
    #     if len(unique_recs) == n_songs:
    #         break
    #     song = dataset.iloc[idx]
    #     name = song['name']
    #     if name not in seen_names:
    #         unique_recs.append(song)
    #         seen_names.add(name)

    # for idx in sorted_indices:
    #     song = dataset.iloc[idx]
    #     name = song['name']
    #     if name not in seen_names:
    #         unique_recs.append(song)
    #         seen_names.add(name)
    #     if len(unique_recs) == n_songs:
    #         break

    #   # Add more songs by the liked artist
    # artist_songs = dataset[dataset['artist_ids'].apply(lambda ids: artist_id in ids if ids else False)]
    # if not artist_songs.empty:
    #     for _, song in artist_songs.iterrows():
    #         if song['name'] not in seen_names:
    #             unique_recs.append(song)
    #             seen_names.add(song['name'])
    #         if len(unique_recs) == n_songs:
    #             break

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

    if not liked_artists:
        return {"error": "No liked artists provided"}, 400

    print("Liked Artists:", liked_artists)

    # Generate recommendations for all liked artists
    recommendations = music_recommender_by_artist(
        liked_artists=liked_artists,
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

    print("Generated Playlist:", playlist)
    return jsonify(song_ids), 200

    # # Generate recommendations for each liked artist
    # all_recommendations = []
    # for artist_id in liked_artists:
    #     recommendations = music_recommender_by_artist(
    #         artist_id=artist_id,
    #         dataset=df,
    #         song_cluster_pipeline=song_cluster_pipeline,
    #         features=features,
    #         metadata_cols=metadata_cols,
    #         n_songs=30  # Adjust the number of songs per artist if needed
    #     )
    #     if not recommendations.empty:
    #         all_recommendations.append(recommendations)

    # # Combine all recommendations into a single DataFrame
    # if all_recommendations:
    #     final_recommendations = pd.concat(all_recommendations).drop_duplicates(subset='id').head(30)
    # else:
    #     return {"error": "No recommendations could be generated"}, 400

    # # Convert the recommendations to a list of dictionaries
    # playlist = final_recommendations.to_dict(orient='records')

    #  # Store only the song IDs in a separate variable
    # song_ids = final_recommendations['id'].tolist()

    # print("Generated Playlist:", playlist)
    # return jsonify(song_ids), 200



if __name__ == '__main__':
  app.run(host="0.0.0.0", port=5000, debug=True)
