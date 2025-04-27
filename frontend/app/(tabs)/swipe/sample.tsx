import { useRoute } from "@react-navigation/native";
import { View, Text, StyleSheet } from "react-native";
import { WebView } from "react-native-webview";
export default function SampleScreen() {
  const route = useRoute();
  const { spotifyID } = route.params as { spotifyID: string };

  return (
    <View style={styles.container}>
      <WebView
        source={{
          uri: `https://open.spotify.com/embed/track/${spotifyID}?utm_source=generator`,
        }}
        style={styles.webview}
        allowsInlineMediaPlayback
        mediaPlaybackRequiresUserAction={false}
      />
    </View>
  );
}

const styles = StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: "#25292e",
      justifyContent: "center", // Center content vertically
    
    },
    button: {
      fontSize: 20,
      textDecorationLine: "underline",
      color: "#fff",
    },
    webview: {
        width: "100%", // Set custom width
        height: 300, // Set custom height
        borderRadius: 10, // optional, looks nicer
      },
  });
  