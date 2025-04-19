from flask import Flask, request, jsonify
from flask_sqlalchemy import SQLAlchemy
from sqlalchemy.dialects.postgresql import ARRAY
from sqlalchemy.sql.expression import func
import os
from dotenv import load_dotenv
import spotipy
from spotipy.oauth2 import SpotifyClientCredentials
from spotify_utils import fetch_and_store_spotify_tracks

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
            'release_date': song.release_date
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
            'release_date': song.release_date
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
            'release_date': song.release_date
        })
    else:
        return jsonify({'message': 'No songs found'}), 404

@app.route('/swipe-recommendations', methods=['POST'])
def get_swipe_recommendations():
    try:
        user_info = request.get_json()

        songs = Song.query.order_by(func.random()).limit(10).all()

        # Only return song IDs
        song_ids = [song.id for song in songs]

        return jsonify({"songs": song_ids}), 200
    except Exception as e:
        return jsonify({"error": str(e)}), 500
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
    try:
        user_info = request.get_json()

        songs = Song.query.order_by(func.random()).limit(30).all()

        # Only return song IDs
        song_ids = [song.id for song in songs]

        return jsonify({"songs": song_ids}), 200
    except Exception as e:
        return jsonify({"error": str(e)}), 500


if __name__ == "__main__":
   app.run(host="0.0.0.0", port=5000, debug=True)