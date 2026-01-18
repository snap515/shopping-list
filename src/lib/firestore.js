import {
  addDoc,
  arrayUnion,
  collection,
  deleteDoc,
  doc,
  documentId,
  getDocs,
  onSnapshot,
  query,
  serverTimestamp,
  setDoc,
  updateDoc,
  writeBatch,
  where,
} from 'firebase/firestore';
import { db } from './firebase';

export const usersCollection = collection(db, 'users');
export const listsCollection = collection(db, 'lists');
export const invitesCollection = collection(db, 'invites');

export const listItemsCollection = (listId) =>
  collection(db, 'lists', listId, 'items');

export const createUserProfile = async ({ uid, email }) => {
  const userRef = doc(db, 'users', uid);
  return setDoc(userRef, { email, createdAt: serverTimestamp() }, { merge: true });
};

export const subscribeToUserLists = (uid, onChange) => {
  const listsQuery = query(listsCollection, where('memberUids', 'array-contains', uid));
  return onSnapshot(listsQuery, (snapshot) => {
    const lists = snapshot.docs.map((docSnap) => ({
      id: docSnap.id,
      ...docSnap.data(),
    }));
    onChange(lists);
  });
};

export const createList = async ({ name, ownerUid, ownerEmail }) =>
  addDoc(listsCollection, {
    name,
    ownerUid,
    memberUids: [ownerUid],
    memberEmails: ownerEmail ? { [ownerUid]: ownerEmail } : {},
    createdAt: serverTimestamp(),
  });

export const renameList = (listId, name) =>
  updateDoc(doc(db, 'lists', listId), { name });

export const deleteList = (listId) => deleteDoc(doc(db, 'lists', listId));

export const subscribeToList = (listId, onChange) =>
  onSnapshot(doc(db, 'lists', listId), (snapshot) => {
    if (!snapshot.exists()) {
      onChange(null);
      return;
    }
    onChange({ id: snapshot.id, ...snapshot.data() });
  });

export const getUsersByIds = async (uids) => {
  const uniqueIds = Array.from(new Set(uids)).filter(Boolean);
  if (uniqueIds.length === 0) {
    return [];
  }

  const usersQuery = query(usersCollection, documentId(), 'in', uniqueIds);
  const snapshot = await getDocs(usersQuery);
  return snapshot.docs.map((docSnap) => ({
    id: docSnap.id,
    ...docSnap.data(),
  }));
};

export const createInvite = async ({ listId, listName, fromUid, fromEmail, toEmail }) =>
  addDoc(invitesCollection, {
    listId,
    listName,
    fromUid,
    fromEmailLower: fromEmail.toLowerCase(),
    toEmailLower: toEmail.toLowerCase(),
    status: 'pending',
    createdAt: serverTimestamp(),
  });

export const subscribeToIncomingInvites = (toEmailLower, onChange) => {
  const invitesQuery = query(
    invitesCollection,
    where('toEmailLower', '==', toEmailLower),
    where('status', '==', 'pending')
  );

  return onSnapshot(invitesQuery, (snapshot) => {
    const invites = snapshot.docs.map((docSnap) => ({
      id: docSnap.id,
      ...docSnap.data(),
    }));
    onChange(invites);
  });
};

export const acceptInvite = async ({ inviteId, listId, userUid, userEmail }) => {
  const batch = writeBatch(db);
  const inviteRef = doc(db, 'invites', inviteId);
  const listRef = doc(db, 'lists', listId);

  batch.update(inviteRef, { status: 'accepted' });
  batch.update(listRef, {
    memberUids: arrayUnion(userUid),
    ...(userEmail ? { [`memberEmails.${userUid}`]: userEmail } : {}),
  });

  await batch.commit();
};

export const declineInvite = (inviteId) =>
  updateDoc(doc(db, 'invites', inviteId), { status: 'declined' });

export const subscribeToListItems = (listId, onChange) => {
  const itemsQuery = query(listItemsCollection(listId));
  return onSnapshot(itemsQuery, (snapshot) => {
    const items = snapshot.docs.map((docSnap) => ({
      id: docSnap.id,
      ...docSnap.data(),
    }));
    onChange(items);
  });
};

export const addListItem = async ({ listId, text, createdByUid }) =>
  addDoc(listItemsCollection(listId), {
    text,
    done: false,
    createdAt: serverTimestamp(),
    createdByUid,
  });

export const toggleListItem = (listId, itemId, done) =>
  updateDoc(doc(db, 'lists', listId, 'items', itemId), { done });

export const deleteListItem = (listId, itemId) =>
  deleteDoc(doc(db, 'lists', listId, 'items', itemId));
