import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet, ViewStyle } from 'react-native';
import { theme } from '../../utils/theme';

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
    backgroundColor: theme.colors.black,
  },
  preview: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  icon: {
    fontSize: 64,
    marginBottom: theme.spacing.sm + 4,
  },
  placeholderText: {
    color: theme.colors.grey[500],
    fontSize: theme.fontSize.lg,
  },
  actions: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: theme.spacing.lg,
    paddingHorizontal: theme.spacing.md,
  },
  captureButton: {
    width: theme.layout.avatarXL,
    height: theme.layout.avatarXL,
    borderRadius: theme.layout.avatarXL / 2,
    borderWidth: 4,
    borderColor: theme.colors.white,
    justifyContent: 'center',
    alignItems: 'center',
  },
  captureInner: {
    width: 58,
    height: 58,
    borderRadius: 29,
    backgroundColor: theme.colors.white,
  },
  galleryButton: {
    position: 'absolute',
    right: 24,
    padding: theme.spacing.sm,
  },
  galleryText: {
    color: theme.colors.white,
    fontSize: theme.fontSize.lg,
    fontWeight: '500',
  },
});

export default CameraCapture;
