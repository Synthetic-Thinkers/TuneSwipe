def get_spotify_tracks_and_features(track_ids, sp):
    # Spotify lets you fetch 50 tracks at once
    tracks = []
    features = {}

    for i in range(0, len(track_ids), 50):
        batch = track_ids[i:i+50]
        track_response = sp.tracks(batch)
        feature_response = sp.audio_features(batch)

        tracks.extend(track_response['tracks'])
        for f in feature_response:
            if f:  # Skip None
                features[f['id']] = f

    return tracks, features

def format_track(track, features):
    audio = features.get(track["id"], {})
    return {
        "id": track["id"],
        "name": track["name"],
        "album": track["album"]["name"],
        "artist_ids": [artist["id"] for artist in track["artists"]],
        "track_number": track["track_number"],
        "disc_number": track["disc_number"],
        "explicit": track["explicit"],
        "duration_ms": track["duration_ms"],
        "release_date": track["album"].get("release_date"),
        "year": int(track["album"].get("release_date", "0000")[:4]) if track["album"].get("release_date") else None,
        "danceability": audio.get("danceability"),
        "energy": audio.get("energy"),
        "key": audio.get("key"),
        "loudness": audio.get("loudness"),
        "mode": audio.get("mode"),
        "speechiness": audio.get("speechiness"),
        "acousticness": audio.get("acousticness"),
        "instrumentalness": audio.get("instrumentalness"),
        "liveness": audio.get("liveness"),
        "valence": audio.get("valence"),
        "tempo": audio.get("tempo"),
        "time_signature": audio.get("time_signature")
    }

def store_tracks(tracks):
    for t in tracks:
        if not Song.query.get(t["id"]):
            song = Song(**t)
            db.session.add(song)
    db.session.commit()
    
def fetch_and_store_spotify_tracks(track_ids, sp):
    raw_tracks, audio_features = get_spotify_tracks_and_features(track_ids, sp)
    formatted_tracks = [format_track(t, audio_features) for t in raw_tracks]
    store_tracks(formatted_tracks)
    return formatted_tracks

