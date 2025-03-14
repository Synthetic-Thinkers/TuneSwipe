import supabase from './supabaseClient'; // Import the Supabase client
import AsyncStorage from '@react-native-async-storage/async-storage';

// Fetch the avatar URL from Supabase Storage
export const fetchAvatarUrl = async (userId) => {
  const { data } = await supabase
    .storage
    .from('avatars') // Your bucket name
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
    console.error('Error storing avatar URL:', error);
  }
};

// Retrieve the avatar URL from AsyncStorage
export const getStoredAvatarUrl = async (userId) => {
  try {
    return await AsyncStorage.getItem(`avatarUrl-${userId}`);
  } catch (error) {
    console.error('Error retrieving avatar URL:', error);
    return null;
  }
};

export const uploadAvatar = async (userId, fileUri) => {
  try {
    // Extract the base64 data from the URI
    const base64Data = fileUri.split(',')[1]; // Remove the "data:image/png;base64," prefix

    // Convert base64 to a Blob
    const byteCharacters = atob(base64Data); // Decode base64
    const byteArrays = [];

    for (let offset = 0; offset < byteCharacters.length; offset += 512) {
      const slice = byteCharacters.slice(offset, offset + 512);
      const byteNumbers = new Array(slice.length);
      for (let i = 0; i < slice.length; i++) {
        byteNumbers[i] = slice.charCodeAt(i);
      }
      const byteArray = new Uint8Array(byteNumbers);
      byteArrays.push(byteArray);
    }

    const blob = new Blob(byteArrays, { type: 'image/png' }); // Adjust type if needed

    // Generate a unique file name
    const fileExt = 'png'; // You can dynamically determine this if needed
    const fileName = `${userId}.${fileExt}`;

    // Upload the Blob to Supabase Storage
    const { data, error } = await supabase.storage
      .from('avatars') // Replace with your bucket name
      .upload(fileName, blob, {
        contentType: `image/${fileExt}`, // Adjust based on the file type
        upsert: true, // Replace file if it exists
      });

    if (error) {
      console.error('Error uploading avatar:', error);
      return null;
    }

    console.log('Avatar uploaded successfully:', data);
    return data;
  } catch (error) {
    console.error('Error in uploadAvatar:', error);
    return null;
  }
};