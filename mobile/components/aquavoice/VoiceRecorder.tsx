import React, { useState } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, ViewStyle } from 'react-native';
import { theme } from '../../utils/theme';

interface VoiceRecorderProps {
  onRecord?: (duration: number) => void;
  onTranscribe?: (text: string) => void;
  maxDuration?: number;
  style?: ViewStyle;
}

const VoiceRecorder: React.FC<VoiceRecorderProps> = ({
  onRecord,
  onTranscribe,
  maxDuration = 60,
  style,
}) => {
  const [isRecording, setIsRecording] = useState(false);
  const [duration, setDuration] = useState(0);

  const formatTime = (seconds: number): string => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  const toggleRecording = (): void => {
    if (isRecording) {
      setIsRecording(false);
      onRecord?.(duration);
      onTranscribe?.('Placeholder transcription text');
      setDuration(0);
    } else {
      setIsRecording(true);
      setDuration(0);
    }
  };

  return (
    <View style={[styles.container, style]}>
      <Text style={styles.label}>
        {isRecording ? 'Recording...' : 'Tap to record'}
      </Text>

      <Text style={styles.timer}>{formatTime(duration)}</Text>

      <View style={styles.waveform}>
        {[...Array(12)].map((_, i) => (
          <View
            key={i}
            style={[
              styles.waveBar,
              {
                height: isRecording
                  ? 20 + Math.random() * 40
                  : 8,
                opacity: isRecording ? 1 : 0.3,
              },
            ]}
          />
        ))}
      </View>

      <TouchableOpacity
        style={[
          styles.recordButton,
          isRecording && styles.recordButtonActive,
        ]}
        onPress={toggleRecording}
        activeOpacity={0.7}
      >
        <View
          style={[
            styles.recordInner,
            isRecording && styles.recordInnerActive,
          ]}
        />
      </TouchableOpacity>

      <Text style={styles.hint}>Max duration: {maxDuration}s</Text>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    paddingVertical: theme.spacing.lg,
    backgroundColor: theme.colors.white,
    borderRadius: theme.borderRadius.xl,
  },
  label: {
    fontSize: theme.fontSize.lg,
    fontWeight: '600',
    color: theme.colors.grey[800],
    marginBottom: theme.spacing.sm,
  },
  timer: {
    fontSize: theme.fontSize.h1,
    fontWeight: '300',
    color: theme.colors.grey[800],
    marginBottom: theme.spacing.xl,
    fontVariant: ['tabular-nums'],
  },
  waveform: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    height: 60,
    marginBottom: theme.spacing.lg,
    gap: 4,
  },
  waveBar: {
    width: 4,
    backgroundColor: theme.colors.danger,
    borderRadius: 2,
  },
  recordButton: {
    width: theme.layout.avatarXL,
    height: theme.layout.avatarXL,
    borderRadius: theme.layout.avatarXL / 2,
    backgroundColor: theme.colors.lightRed,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 4,
    borderColor: theme.colors.danger,
    marginBottom: theme.spacing.sm + 4,
  },
  recordButtonActive: {
    backgroundColor: theme.colors.danger + '30',
  },
  recordInner: {
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: theme.colors.danger,
  },
  recordInnerActive: {
    borderRadius: theme.borderRadius.xs,
    width: 22,
    height: 22,
  },
  hint: {
    fontSize: theme.fontSize.xs,
    color: theme.colors.grey[500],
  },
});

export default VoiceRecorder;
