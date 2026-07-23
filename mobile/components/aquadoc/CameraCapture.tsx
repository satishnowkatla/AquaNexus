import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet, ViewStyle } from 'react-native';

interface CameraCaptureProps {
  onCapture?: (uri: string) => void;
  onPickFromGallery?: () => void;
  style?: ViewStyle;
}

const CameraCapture: React.FC<CameraCaptureProps> = ({
  onCapture,
  onPickFromGallery,
  style,
}) => {
  const handleCapture = (): void => {
    onCapture?.('placeholder://captured-image');
  };

  return (
    <View style={[styles.container, style]}>
      <View style={styles.preview}>
        <Text style={styles.icon}>📷</Text>
        <Text style={styles.placeholderText}>Camera Preview</Text>
      </View>

      <View style={styles.actions}>
        <TouchableOpacity
          style={styles.captureButton}
          onPress={handleCapture}
          activeOpacity={0.7}
        >
          <View style={styles.captureInner} />
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.galleryButton}
          onPress={onPickFromGallery}
        >
          <Text style={styles.galleryText}>Gallery</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#000000',
  },
  preview: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  icon: {
    fontSize: 64,
    marginBottom: 12,
  },
  placeholderText: {
    color: '#999999',
    fontSize: 16,
  },
  actions: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 24,
    paddingHorizontal: 16,
  },
  captureButton: {
    width: 72,
    height: 72,
    borderRadius: 36,
    borderWidth: 4,
    borderColor: '#FFFFFF',
    justifyContent: 'center',
    alignItems: 'center',
  },
  captureInner: {
    width: 58,
    height: 58,
    borderRadius: 29,
    backgroundColor: '#FFFFFF',
  },
  galleryButton: {
    position: 'absolute',
    right: 24,
    padding: 8,
  },
  galleryText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '500',
  },
});

export default CameraCapture;
