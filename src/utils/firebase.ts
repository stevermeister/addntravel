import { initializeApp, FirebaseApp } from 'firebase/app';
import { getDatabase, Database } from 'firebase/database';
import {
  getAuth,
  GoogleAuthProvider,
  signInWithPopup,
  signOut,
  Auth,
  User,
  UserCredential,
} from 'firebase/auth';
import { firebaseConfig } from '../config/firebase.config';

// Initialize Firebase
const app: FirebaseApp = initializeApp(firebaseConfig);
const database: Database = getDatabase(app);
const auth: Auth = getAuth(app);
const googleProvider: GoogleAuthProvider = new GoogleAuthProvider();

// Add additional scopes for Google provider
googleProvider.addScope('profile');
googleProvider.addScope('email');

// Authentication functions
export const signInWithGoogle = async (): Promise<User> => {
  try {
    const result: UserCredential = await signInWithPopup(auth, googleProvider);
    console.log('Google Sign In Result:', {
      user: {
        displayName: result.user.displayName,
        email: result.user.email,
        photoURL: result.user.photoURL,
        uid: result.user.uid,
      },
    });
    return result.user;
  } catch (error) {
    console.error('Error signing in with Google:', error);
    throw error;
  }
};

export const signOutUser = async (): Promise<void> => {
  try {
    await signOut(auth);
  } catch (error) {
    console.error('Error signing out:', error);
    throw error;
  }
};

// Add auth state change listener
auth.onAuthStateChanged((user: User | null) => {
  if (user) {
    console.log('User is signed in:', {
      displayName: user.displayName,
      email: user.email,
      photoURL: user.photoURL,
      uid: user.uid,
    });
  } else {
    console.log('User is signed out');
  }
});

export { database, auth };
