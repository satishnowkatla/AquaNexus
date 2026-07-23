import { useState, useCallback, useRef } from 'react';
import { CameraView, useCameraPermissions } from 'expo-camera';
import * as ImagePicker from 'expo-image-picker';
import { Platform } from 'react-native';

interface UseCameraReturn {
  hasPermission: boolean | null;
  requestPermission: () => Promise<boolean>;
  takePhoto: () => Promise<string | null>;
  pickFromGallery: () => Promise<string | null>;
  isProcessing: boolean;
}

export const useCamera = (): UseCameraReturn => {
  const [permission, requestPermission] = useCameraPermissions();
  const [isProcessing, setIsProcessing] = useState(false);
  const cameraRef = useRef<CameraView | null>(null);

  const requestCameraPermission = useCallback(async (): Promise<boolean> => {
    if (permission?.granted) return true;
    const result = await requestPermission();
    return result.granted;
  }, [permission, requestPermission]);

  const takePhoto = useCallback(async (): Promise<string | null> => {
    if (!cameraRef.current) return null;

    try {
      setIsProcessing(true);
      const photo = await cameraRef.current.takePictureAsync({
        quality: 0.8,
        skipProcessing: false,
      });
      return photo?.uri ?? null;
    } catch (error) {
      console.error('Failed to take photo:', error);
      return null;
    } finally {
      setIsProcessing(false);
    }
  }, []);

  const pickFromGallery = useCallback(async (): Promise<string | null> => {
    try {
      setIsProcessing(true);
      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ['images'],
        quality: 0.8,
        allowsEditing: true,
      });

      if (result.canceled) return null;
      return result.assets[0]?.uri ?? null;
    } catch (error) {
      console.error('Failed to pick image:', error);
      return null;
    } finally {
      setIsProcessing(false);
    }
  }, []);

  return {
    hasPermission: permission?.granted ?? null,
    requestPermission: requestCameraPermission,
    takePhoto,
    pickFromGallery,
    isProcessing,
  };
};
