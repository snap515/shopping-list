import { collection, doc, serverTimestamp, setDoc } from 'firebase/firestore';
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
