import { Text, View, StyleSheet } from 'react-native';

export default function LibraryScreen() {
  return (
    <View style = {styles.container}>
      <Text style = {styles.text}>Library Screen</Text>
      <Text style = {styles.text}> + Activity Screen</Text>
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
