const { onDocumentCreated } = require('firebase-functions/v2/firestore');
const admin = require('firebase-admin');
const { Expo } = require('expo-server-sdk');

admin.initializeApp();

const expo = new Expo();

exports.sendInviteNotification = onDocumentCreated('invites/{inviteId}', async (event) => {
  const snapshot = event.data;
  if (!snapshot) {
    return;
  }

  const invite = snapshot.data();
  if (!invite || invite.status !== 'pending') {
    return;
  }

  const toEmailLower = invite.toEmailLower;
  if (!toEmailLower) {
    return;
  }

  const usersSnap = await admin
    .firestore()
    .collection('users')
    .where('emailLower', '==', toEmailLower)
    .limit(1)
    .get();

  if (usersSnap.empty) {
    return;
  }

  const userData = usersSnap.docs[0].data();
  const tokens = (userData.expoPushTokens || []).filter(Expo.isExpoPushToken);

  if (tokens.length === 0) {
    return;
  }

  const title = 'New invite';
  const fromLabel = invite.fromEmailLower || 'Someone';
  const listLabel = invite.listName || 'a list';
  const body = `${fromLabel} invited you to ${listLabel}`;

  const messages = tokens.map((token) => ({
    to: token,
    sound: 'default',
    title,
    body,
    data: {
      inviteId: event.params.inviteId,
      listId: invite.listId || null,
    },
  }));

  const chunks = expo.chunkPushNotifications(messages);
  for (const chunk of chunks) {
    try {
      await expo.sendPushNotificationsAsync(chunk);
    } catch (error) {
      console.error('Invite push failed', error);
    }
  }
});
