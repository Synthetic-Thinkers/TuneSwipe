import supabase from "./supabaseClient"; // Import the Supabase client
import AsyncStorage from "@react-native-async-storage/async-storage";
import { decode } from 'base64-arraybuffer'
import {
  SaveFormat,
  ImageManipulator,
} from "expo-image-manipulator";

export const deleteLikedArtist = async (id) => {
    const updatedLikedArtists = user.likedArtists.filter(artistID => artistID !== id);
    const { error } = await supabase
      .from('users')
      .update({ likedArtists: updatedLikedArtists })
      .eq('id', user.id);

    if (error) {
      console.error('Error deleting artist:', error);
    } else {
      console.log('Artist deleted successfully');
      // Update the local state to reflect the changes
      user.likedArtists = updatedLikedArtists;
    }
}
