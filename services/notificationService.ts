import { Platform } from 'react-native';

// Lazy-load expo-notifications to avoid crash in Expo Go (SDK 53+)
let Notifications: typeof import('expo-notifications') | null = null;

async function getNotifications() {
  if (Notifications) return Notifications;
  if (Platform.OS === 'web') return null;
  try {
    Notifications = await import('expo-notifications');
    return Notifications;
  } catch {
    console.warn('expo-notifications not available');
    return null;
  }
}

export const notificationService = {
  async registerForPushNotificationsAsync() {
    if (Platform.OS === 'web') return;

    const Notif = await getNotifications();
    if (!Notif) return;

    const { status: existingStatus } = await Notif.getPermissionsAsync();
    let finalStatus = existingStatus;
    if (existingStatus !== 'granted') {
      const { status } = await Notif.requestPermissionsAsync();
      finalStatus = status;
    }
    if (finalStatus !== 'granted') {
      console.log('Failed to get push token for push notification!');
      return;
    }

    const token = (await Notif.getExpoPushTokenAsync()).data;
    console.log(token);

    if (Platform.OS === 'android') {
      Notif.setNotificationChannelAsync('default', {
        name: 'default',
        importance: Notif.AndroidImportance.MAX,
        vibrationPattern: [0, 250, 250, 250],
        lightColor: '#FF231F7C',
      });
    }

    return token;
  },

  async sendLocalNotification(title: string, body: string, data: Record<string, unknown> = {}) {
    const Notif = await getNotifications();
    if (!Notif) return;

    try {
      await Notif.scheduleNotificationAsync({
        content: { title, body, data },
        trigger: null,
      });
    } catch {
      console.warn('Local notification failed');
    }
  },
};
