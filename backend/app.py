from flask import Flask, request, jsonify
from flask_sqlalchemy import SQLAlchemy
from sqlalchemy.dialects.postgresql import ARRAY
from sqlalchemy.sql.expression import func
import os
from dotenv import load_dotenv

load_dotenv()

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
        # Get 10 random songs
        songs = Song.query.order_by(func.random()).limit(10).all()

        # Convert each song to a dictionary
        song_list = [song.to_dict() for song in songs]

        return jsonify({"recommended_songs": song_list}), 200
    except Exception as e:
        return jsonify({"error": str(e)}), 500


@app.route('/create-playlist', methods=['POST'])
def create_playlist():
    try:
        user_info = request.get_json()

        # Get 10 random songs
        songs = Song.query.order_by(func.random()).limit(30).all()

        # Convert each song to a dictionary 
        song_list = [song.to_dict() for song in songs]

        return jsonify({"recommended_songs": song_list}), 200
    except Exception as e:
        return jsonify({"error": str(e)}), 500


if __name__ == '__main__':
    app.run(debug=True)