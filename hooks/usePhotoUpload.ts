import { useState } from 'react';
import { Alert } from 'react-native';
import * as ImagePicker from 'expo-image-picker';

export const usePhotoUpload = () => {
  const [selectedPhotos, setSelectedPhotos] = useState<string[]>([]);
  const [uploadModalVisible, setUploadModalVisible] = useState(false);

  const handleTakePhoto = async () => {
    const { status } = await ImagePicker.requestCameraPermissionsAsync();
    if (status !== "granted") {
      Alert.alert("Permission required", "Camera permission is needed.");
      return;
    }
    
    const result = await ImagePicker.launchCameraAsync({
      allowsEditing: true,
      aspect: [4, 3],
      quality: 1,
    });
    
    if (!result.canceled) {
      setSelectedPhotos([...selectedPhotos, result.assets[0].uri]);
    }
  };

  const handleChoosePhoto = async () => {
    const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (status !== "granted") {
      Alert.alert("Permission required", "Gallery permission is needed.");
      return;
    }
    
    const result = await ImagePicker.launchImageLibraryAsync({
      allowsEditing: true,
      aspect: [4, 3],
      quality: 1,
    });
    
    if (!result.canceled) {
      const newPhotos = result.assets.map((a) => a.uri);
      setSelectedPhotos([...selectedPhotos, ...newPhotos]);
    }
  };

  const openUploadModal = () => {
    setUploadModalVisible(true);
  };

  const closeUploadModal = () => {
    setUploadModalVisible(false);
  };

  const clearSelectedPhotos = () => {
    setSelectedPhotos([]);
  };

  return {
    selectedPhotos,
    uploadModalVisible,
    handleTakePhoto,
    handleChoosePhoto,
    openUploadModal,
    closeUploadModal,
    clearSelectedPhotos,
  };
}; 