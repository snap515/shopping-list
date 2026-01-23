import { Platform } from 'react-native';
import * as Notifications from 'expo-notifications';
import { arrayUnion, doc, serverTimestamp, setDoc } from 'firebase/firestore';
import { db } from './firebase';

Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowAlert: true,
    shouldPlaySound: false,
    shouldSetBadge: false,
  }),
});

export const registerForPushNotificationsAsync = async () => {
  if (Platform.OS === 'web') {
    return null;
  }

  const { status: existingStatus } = await Notifications.getPermissionsAsync();
  let finalStatus = existingStatus;
  if (existingStatus !== 'granted') {
    const { status } = await Notifications.requestPermissionsAsync();
    finalStatus = status;
  }

  if (finalStatus !== 'granted') {
    return null;
  }

  if (Platform.OS === 'android') {
    await Notifications.setNotificationChannelAsync('default', {
      name: 'default',
      importance: Notifications.AndroidImportance.DEFAULT,
    });
  }

  const tokenResponse = await Notifications.getExpoPushTokenAsync();
  return tokenResponse?.data || null;
};

export const saveUserPushToken = async ({ uid, token }) => {
  if (!uid || !token) {
    return;
  }

  const userRef = doc(db, 'users', uid);
  await setDoc(
    userRef,
    {
      expoPushTokens: arrayUnion(token),
      pushTokenUpdatedAt: serverTimestamp(),
    },
    { merge: true }
  );
};
