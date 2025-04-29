import requests

API_KEY = '7a62ec2c5a32cf3411177c13c5e278dd'  # Your Last.fm API Key

def find_similar_artists(artist_name):
    url = "http://ws.audioscrobbler.com/2.0/"
    params = {
        "method": "artist.getsimilar",
        "artist": artist_name,
        "api_key": API_KEY,
        "format": "json",
        "limit": 10
    }

    response = requests.get(url, params=params)

    if response.status_code == 200:
        similar_artists = response.json().get('similarartists', {}).get('artist', [])
        if similar_artists:
            print(f"\nArtists similar to '{artist_name}':\n")
            for artist in similar_artists:
                print(f"- {artist['name']}")
        else:
            print(f"No similar artists found for '{artist_name}'.")
    else:
        print(f"Error: {response.status_code} - {response.text}")

def main():
    print("🎵 Find Similar Artists 🎵")
    while True:
        artist_name = input("\nEnter an artist name (or 'quit' to exit): ")
        if artist_name.lower() == 'quit':
            print("Goodbye!")
            break
        find_similar_artists(artist_name)

if __name__ == "__main__":
    main()
