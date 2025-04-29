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

if __name__ == "__main__":
   app.run(host="0.0.0.0", port=5000, debug=True)