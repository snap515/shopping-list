const {
  onDocumentCreated,
  onDocumentDeleted,
  onDocumentWritten,
} = require('firebase-functions/v2/firestore');
const admin = require('firebase-admin');
const { Expo } = require('expo-server-sdk');

admin.initializeApp();

const expo = new Expo();

exports.sendInviteNotification = onDocumentWritten('invites/{inviteId}', async (event) => {
  const afterSnap = event.data?.after;
  if (!afterSnap || !afterSnap.exists) {
    return;
  }

  const beforeSnap = event.data?.before;
  const beforeStatus = beforeSnap?.exists ? beforeSnap.data().status : null;
  const invite = afterSnap.data();

  if (!invite || invite.status !== 'pending' || beforeStatus === 'pending') {
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

exports.sendListDeletedNotification = onDocumentDeleted('lists/{listId}', async (event) => {
  const snapshot = event.data;
  if (!snapshot) {
    return;
  }

  const listData = snapshot.data();
  if (!listData) {
    return;
  }

  const memberUids = Array.isArray(listData.memberUids) ? listData.memberUids : [];
  const ownerUid = listData.ownerUid;
  const recipientUids = memberUids.filter((uid) => uid && uid !== ownerUid);

  if (recipientUids.length === 0) {
    return;
  }

  const userRefs = recipientUids.map((uid) =>
    admin.firestore().collection('users').doc(uid)
  );
  const userSnaps = await admin.firestore().getAll(...userRefs);
  const tokens = userSnaps
    .map((snap) => snap.data())
    .filter(Boolean)
    .flatMap((user) => user.expoPushTokens || [])
    .filter(Expo.isExpoPushToken);

  if (tokens.length === 0) {
    return;
  }

  const listLabel = listData.name || 'a list';
  const title = 'List deleted';
  const body = `The list "${listLabel}" was deleted.`;

  const messages = tokens.map((token) => ({
    to: token,
    sound: 'default',
    title,
    body,
    data: {
      listId: event.params.listId,
    },
  }));

  const chunks = expo.chunkPushNotifications(messages);
  for (const chunk of chunks) {
    try {
      await expo.sendPushNotificationsAsync(chunk);
    } catch (error) {
      console.error('List delete push failed', error);
    }
  }
});
