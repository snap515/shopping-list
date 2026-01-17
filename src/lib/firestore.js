import {
  addDoc,
  collection,
  deleteDoc,
  doc,
  onSnapshot,
  query,
  serverTimestamp,
  setDoc,
  updateDoc,
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

export const createList = async ({ name, ownerUid }) =>
  addDoc(listsCollection, {
    name,
    ownerUid,
    memberUids: [ownerUid],
    createdAt: serverTimestamp(),
  });

export const renameList = (listId, name) =>
  updateDoc(doc(db, 'lists', listId), { name });

export const deleteList = (listId) => deleteDoc(doc(db, 'lists', listId));
