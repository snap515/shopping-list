import React, { useEffect, useState } from 'react';
import { ActivityIndicator, StyleSheet, View } from 'react-native';
import { onAuthStateChanged } from 'firebase/auth';
import { auth } from '../lib/firebase';
import AuthStack from './AuthStack';
import AppStack from './AppStack';
import { ensureUserEmailLower } from '../lib/firestore';
import { registerForPushNotificationsAsync, saveUserPushToken } from '../lib/notifications';

export default function RootNavigator() {
  const [user, setUser] = useState(null);
  const [isInitializing, setIsInitializing] = useState(true);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (nextUser) => {
      setUser(nextUser);
      setIsInitializing(false);
    });

    return unsubscribe;
  }, []);

  useEffect(() => {
    if (!user) {
      return undefined;
    }

    let isActive = true;

    const registerPush = async () => {
      await ensureUserEmailLower({ uid: user.uid, email: user.email });
      const token = await registerForPushNotificationsAsync();
      if (isActive && token) {
        await saveUserPushToken({ uid: user.uid, token });
      }
    };

    registerPush();

    return () => {
      isActive = false;
    };
  }, [user?.uid]);

  if (isInitializing) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" />
      </View>
    );
  }

  return user ? <AppStack /> : <AuthStack />;
}

const styles = StyleSheet.create({
  loadingContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
});
