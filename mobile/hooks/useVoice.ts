import { useState, useCallback, useRef } from 'react';
import { useAudioRecorder, RecordingPresets, requestRecordingPermissionsAsync, setAudioModeAsync } from 'expo-audio';

interface UseVoiceReturn {
  isRecording: boolean;
  duration: number;
  startRecording: () => Promise<string | null>;
  stopRecording: () => Promise<string | null>;
  cancelRecording: () => Promise<void>;
}

export const useVoice = (): UseVoiceReturn => {
  const [isRecording, setIsRecording] = useState(false);
  const [duration, setDuration] = useState(0);
  const recorder = useAudioRecorder(RecordingPresets.HIGH_QUALITY);
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const startRecording = useCallback(async (): Promise<string | null> => {
    try {
      const { granted } = await requestRecordingPermissionsAsync();
      if (!granted) return null;

      await setAudioModeAsync({ allowsRecording: true, playsInSilentMode: true });
      await recorder.prepareToRecordAsync();
      recorder.record();
      setIsRecording(true);
      setDuration(0);

      timerRef.current = setInterval(() => {
        setDuration((prev) => prev + 1);
      }, 1000);

      return null;
    } catch (error) {
      console.error('Failed to start recording:', error);
      return null;
    }
  }, [recorder]);

  const stopRecording = useCallback(async (): Promise<string | null> => {
    try {
      if (timerRef.current) {
        clearInterval(timerRef.current);
        timerRef.current = null;
      }

      recorder.stop();
      const uri = recorder.uri;

      await setAudioModeAsync({ allowsRecording: false });
      setIsRecording(false);
      setDuration(0);

      return uri ?? null;
    } catch (error) {
      console.error('Failed to stop recording:', error);
      return null;
    }
  }, [recorder]);

  const cancelRecording = useCallback(async (): Promise<void> => {
    try {
      if (timerRef.current) {
        clearInterval(timerRef.current);
        timerRef.current = null;
      }

      recorder.stop();
      await setAudioModeAsync({ allowsRecording: false });
      setIsRecording(false);
      setDuration(0);
    } catch (error) {
      console.error('Failed to cancel recording:', error);
    }
  }, [recorder]);

  return {
    isRecording,
    duration,
    startRecording,
    stopRecording,
    cancelRecording,
  };
};
