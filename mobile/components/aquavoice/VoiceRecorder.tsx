import React, { useState } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, ViewStyle } from 'react-native';

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
    paddingVertical: 24,
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
  },
  label: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333333',
    marginBottom: 8,
  },
  timer: {
    fontSize: 32,
    fontWeight: '300',
    color: '#333333',
    marginBottom: 20,
    fontVariant: ['tabular-nums'],
  },
  waveform: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    height: 60,
    marginBottom: 24,
    gap: 4,
  },
  waveBar: {
    width: 4,
    backgroundColor: '#E53935',
    borderRadius: 2,
  },
  recordButton: {
    width: 72,
    height: 72,
    borderRadius: 36,
    backgroundColor: '#FFEBEE',
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 4,
    borderColor: '#E53935',
    marginBottom: 12,
  },
  recordButtonActive: {
    backgroundColor: '#FFCDD2',
  },
  recordInner: {
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: '#E53935',
  },
  recordInnerActive: {
    borderRadius: 4,
    width: 22,
    height: 22,
  },
  hint: {
    fontSize: 12,
    color: '#999999',
  },
});

export default VoiceRecorder;
