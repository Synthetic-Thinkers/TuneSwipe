import { Text, View, StyleSheet } from 'react-native';

export default function SwipeScreen() {
  return (
    <View style = {styles.container}>
      <Text style = {styles.text}>Swipe Screen</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#25292e',
    justifyContent: 'center',
    alignItems: 'center',
  },
  text: {
    color: '#fff',
  },
});
