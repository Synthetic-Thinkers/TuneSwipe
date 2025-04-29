from flask import Flask, request, jsonify
from flask_sqlalchemy import SQLAlchemy
from sqlalchemy.dialects.postgresql import ARRAY
from sqlalchemy.sql.expression import func
import os
from dotenv import load_dotenv
import spotipy
from spotipy.oauth2 import SpotifyClientCredentials
from sklearn.cluster import KMeans
import numpy as np
import matplotlib.pyplot as plt
from sklearn.decomposition import PCA

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
    release_date = db.Column(db.Text)

    def __repr__(self):
        return f"<Song {self.name} ({self.id})>"

    def to_dict(self):
        return {c.name: getattr(self, c.name) for c in self.__table__.columns}

@app.route('/recommend-by-artist', methods=['GET'])
def recommend_by_artist():
    # Step 1: Hardcoded song_id
    song_id = "5rpx047aanR0h9Rfp1wgBB"
    song = Song.query.get(song_id)

    if not song:
        return jsonify({"error": "Song not found"}), 404

    # Step 2: Extract artist ID from the artist_ids array
    artist_ids = song.artist_ids
    if not artist_ids:
        return jsonify({"error": "No artist_ids found in song"}), 404

    target_artist_id = artist_ids[0].strip("'")  # remove quotes around ID

    # Step 3: Query all songs where this artist ID appears in artist_ids
    songs_with_artist = Song.query.filter(Song.artist_ids.any(target_artist_id)).all()

    if len(songs_with_artist) < 2:
        return jsonify({"error": "Not enough songs for clustering"}), 404

    # Step 4: Extract features from all songs in the DB for clustering
    all_songs = Song.query.all()
    features = []
    song_map = []

    for s in all_songs:
        if s.danceability is not None and s.energy is not None and s.valence is not None:
            features.append([s.danceability, s.energy, s.valence])
            song_map.append(s)

    features_np = np.array(features)

    # Step 5: Apply K-Means clustering
    k = 5  # choose number of clusters
    kmeans = KMeans(n_clusters=k, random_state=42, n_init=10)
    kmeans.fit(features_np)

    # Step 6: Find the cluster(s) for songs with this artist
    artist_song_indices = [i for i, s in enumerate(song_map) if target_artist_id in s.artist_ids]
    artist_clusters = set(kmeans.labels_[i] for i in artist_song_indices)

    # Step 7: Recommend other songs from same clusters
    recommendations = []
    for i, label in enumerate(kmeans.labels_):
        if label in artist_clusters and target_artist_id not in song_map[i].artist_ids:
            recommendations.append(song_map[i].to_dict())

    return jsonify({
        "target_artist": target_artist_id,
        "recommended_songs": recommendations[:10]  # Limit to top 10
    })

@app.route('/artist-recommendations', methods=['POST'])
def recommend_similar_artists():
    try:
        data = request.get_json()
        song_id = data.get("song_id")

        if not song_id:
            return jsonify({"error": "Missing song_id"}), 400

        song = Song.query.get(song_id)
        print(f"Song ID: {song_id}")
        if not song or not song.artist_ids or len(song.artist_ids) == 0:
            return jsonify({"error": "Artist not found for given song"}), 404

        # Clean the first artist_id (removing single quotes if needed)
        raw_artist_id = song.artist_ids[0]
        target_artist_id = raw_artist_id.strip("'")
        print( f"Target Artist ID: {target_artist_id}")

        # Prepare all songs for clustering
        all_songs = Song.query.all()
        feature_vectors = []
        song_ids = []
        song_to_artist_id = {}

        for s in all_songs:
            if not s.artist_ids or len(s.artist_ids) == 0:
                continue
            clean_artist_id = s.artist_ids[0].strip("'")
            vec = np.array([
                s.danceability,
                s.energy,
                s.valence,
                s.tempo,
                s.acousticness,
                s.instrumentalness,
                s.liveness,
                s.speechiness
            ])
            if not np.isnan(vec).any():
                feature_vectors.append(vec)
                song_ids.append(s.id)
                song_to_artist_id[s.id] = clean_artist_id

        if len(feature_vectors) < 5:
            return jsonify({"error": "Not enough data for clustering"}), 500

        # Perform K-Means clustering
        features_np = np.array(feature_vectors)
        n_clusters = min(10, len(features_np) // 2)
        kmeans = KMeans(n_clusters=n_clusters, random_state=42, n_init=10)
        cluster_labels = kmeans.fit_predict(features_np)

        song_id_to_cluster = dict(zip(song_ids, cluster_labels))

        # Find the target song's cluster
        target_cluster = song_id_to_cluster.get(song_id)
        if target_cluster is None:
            return jsonify({"error": "Song not found in clustering"}), 404

        # Get songs in the same cluster (allow songs from other artists)
        similar_song_ids = [
            sid for sid in song_ids
            if song_id_to_cluster[sid] == target_cluster and sid != song_id
        ]

        # Get the similar songs from the database
        similar_songs = Song.query.filter(Song.id.in_(similar_song_ids)).limit(100).all()
        print(f"Found {len(similar_songs)} similar songs in the cluster.")

        # Prepare the response
        return jsonify({
            "target_artist_id": target_artist_id,
            "similar_songs": [song.to_dict() for song in similar_songs]
        })

    except Exception as e:
        return jsonify({"error": str(e)}), 500


# @app.route('/artist-recommendations', methods=['POST'])
# def recommend_similar_artists():
#     try:
#         data = request.get_json()
#         target_artist_id = data.get("artist_id")

#         if not target_artist_id:
#             return jsonify({"error": "Missing artist_id"}), 400

#         # Fetch all artists with valid features
#         all_artists = Song.query.all()
#         feature_vectors = []
#         artist_ids = []

#         for artist in all_artists:
#             vec = np.array([
#                 artist.danceability,
#                 artist.energy,
#                 artist.valence,
#                 artist.tempo,
#                 artist.acousticness,
#                 artist.instrumentalness,
#                 artist.liveness,
#                 artist.speechiness
#             ])
#             if not np.isnan(vec).any():
#                 feature_vectors.append(vec)
#                 artist_ids.append(artist.id)

#         # Return error if too few valid artists
#         if len(feature_vectors) < 5:
#             return jsonify({"error": "Not enough artist data for clustering"}), 500

#         features_np = np.array(feature_vectors)

#         # Run KMeans clustering
#         n_clusters = min(10, len(features_np) // 2)
#         kmeans = KMeans(n_clusters=n_clusters, random_state=42, n_init=10)
#         cluster_labels = kmeans.fit_predict(features_np)

#         # Map artist IDs to cluster labels
#         artist_id_to_cluster = dict(zip(artist_ids, cluster_labels))

#         # Get target artist's cluster
#         if target_artist_id not in artist_id_to_cluster:
#             return jsonify({"error": "Artist not found in dataset"}), 404

#         target_cluster = artist_id_to_cluster[target_artist_id]

#         # Get similar artist IDs from same cluster (exclude self)
#         similar_artist_ids = [
#             artist_id for artist_id, cluster in artist_id_to_cluster.items()
#             if cluster == target_cluster and artist_id != target_artist_id
#         ]

#         # Query database for full artist info
#         similar_artists = Song.query.filter(Song.id.in_(similar_artist_ids)).limit(10).all()

#         return jsonify({
#             "target_artist_id": target_artist_id,
#             "similar_artists": [artist.to_dict() for artist in similar_artists]
#         })

#     except Exception as e:
#         return jsonify({"error": str(e)}), 500

@app.route('/random-artist', methods=['GET'])
def get_artist():
    # The specific song ID you want to query by
    song_id = '5rpx047aanR0h9Rfp1wgBB'

    # Query the Song table for that song ID
    song = Song.query.get(song_id)

    if song:
        # Retrieve the artist_ids for that song
        raw_artist_id = song.artist_ids[0]
        clean_artist_id = raw_artist_id.strip("'")

        # Return the artist_ids as a JSON response
        return jsonify({
            'song_id': song.id,
            'artist_ids': clean_artist_id
        })
    else:
        return jsonify({"error": "Song not found"}), 404
# def get_random_artist():
#     artist = Song.query.order_by(func.random()).first()
#     return jsonify(artist.to_dict()) if artist else jsonify({"error": "No artists found"}), 404



if __name__ == "__main__":
  app.run(host="0.0.0.0", port=5000, debug=True)
