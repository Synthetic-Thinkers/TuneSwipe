import supabase from "./supabaseClient"; // Import the Supabase client
import AsyncStorage from "@react-native-async-storage/async-storage";
import { decode } from 'base64-arraybuffer'
import {
  SaveFormat,
  ImageManipulator,
} from "expo-image-manipulator";

export const convertImageToPNG = async (imageUri) => {
  try {
    const context = ImageManipulator.manipulate(imageUri);
    const image = await context.renderAsync();
    const result = await image.saveAsync({ format: SaveFormat.PNG, base64: true });
    return result;
  } catch (error) {
    console.error("Error converting image:", error);
    return null;
  }
};

// Fetch the avatar URL from Supabase Storage
export const fetchAvatarUrl = async (userId) => {
  const { data } = await supabase.storage
    .from("avatars") // Your bucket name
    .getPublicUrl(`${userId}.png`); // Assuming the avatar is named after the user ID

  // Append a cache-busting query parameter
  const imageUrl = `${data.publicUrl}?v=${Date.now()}`;
  return imageUrl;
};

// Store the avatar URL in AsyncStorage
export const storeAvatarUrl = async (userId, avatarUrl) => {
  try {
    await AsyncStorage.setItem(`avatarUrl-${userId}`, avatarUrl);
  } catch (error) {
    console.error("Error storing avatar URL:", error);
  }
};

// Retrieve the avatar URL from AsyncStorage
export const getStoredAvatarUrl = async (userId) => {
  try {
    return await AsyncStorage.getItem(`avatarUrl-${userId}`);
  } catch (error) {
    console.error("Error retrieving avatar URL:", error);
    return null;
  }
};

export const uploadAvatar = async (userId, file) => {
  try {
    // Generate a unique file name
    const fileExt = "png";
    const fileName = `${userId}.${fileExt}`;

    const { data, error } = await supabase.storage
      .from("avatars") 
      .upload(fileName, decode(file), {
        contentType: `image/${fileExt}`,
        upsert: true, 
      });

    if (error) {
      console.error("Error uploading avatar:", error);
      return null;
    }

    console.log("Avatar uploaded successfully:", data);
    return data;
  } catch (error) {
    console.error("Error in uploadAvatar:", error);
    return null;
  }
};

const avatarUtils = {
  convertImageToPNG,
  fetchAvatarUrl,
  storeAvatarUrl,
  getStoredAvatarUrl,
  uploadAvatar,
};

export default avatarUtils;