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

    //Store avatar URL for respective user
    const avatarURL = "https://ierqhxlamotfahrwcsdz.supabase.co/storage/v1/object/public/avatars/" + data.path;
    console.log("Avatar uploaded successfully:", avatarURL);
    const { data: userData, error: userError } = await supabase
      .from('User')
      .update({ avatarURL: avatarURL }) 
      .eq('id', userId); 

    return data;
  } catch (error) {
    console.error("Error in uploadAvatar:", error);
    return null;
  }
};



const avatarUtils = {
  convertImageToPNG,
  fetchAvatarUrl,
  uploadAvatar,

};

export default avatarUtils;