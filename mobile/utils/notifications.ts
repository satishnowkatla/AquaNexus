import * as Notifications from 'expo-notifications';
import { Platform } from 'react-native';

export const requestPermission = async (): Promise<boolean> => {
  const { status: existingStatus } = await Notifications.getPermissionsAsync();
  let finalStatus = existingStatus;

  if (existingStatus !== 'granted') {
    const { status } = await Notifications.requestPermissionsAsync();
    finalStatus = status;
  }

  if (finalStatus !== 'granted') {
    return false;
  }

  if (Platform.OS === 'android') {
    await Notifications.setNotificationChannelAsync('default', {
      name: 'Default',
      importance: Notifications.AndroidImportance.HIGH,
    });
  }

  return true;
};

export const scheduleNotification = async (options: {
  title: string;
  body: string;
  data?: Record<string, unknown>;
  delaySeconds?: number;
}): Promise<string | null> => {
  const hasPermission = await requestPermission();
  if (!hasPermission) return null;

  const id = await Notifications.scheduleNotificationAsync({
    content: {
      title: options.title,
      body: options.body,
      data: options.data ?? {},
      sound: true,
    },
    trigger: options.delaySeconds
      ? { seconds: options.delaySeconds, type: Notifications.SchedulableTriggerInputTypes.TIME_INTERVAL }
      : null,
  });

  return id;
};

Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowAlert: true,
    shouldPlaySound: true,
    shouldSetBadge: false,
  }),
});
