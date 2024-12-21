import { initializeApp } from 'firebase/app';
import { getDatabase } from 'firebase/database';
import { getAuth, GoogleAuthProvider, signInWithPopup, signOut } from 'firebase/auth';

const firebaseConfig = {
  apiKey: "AIzaSyCpD4cu08SG6GRpI9p0-YHCvsjpRBIhhGs",
  authDomain: "addntravel.firebaseapp.com",
  databaseURL: "https://addntravel-default-rtdb.europe-west1.firebasedatabase.app",
  projectId: "addntravel",
  storageBucket: "addntravel.firebasestorage.app",
  messagingSenderId: "26158801594",
  appId: "1:26158801594:web:f1cbce8577c6bcb4a8d883"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const database = getDatabase(app);
const auth = getAuth(app);
const googleProvider = new GoogleAuthProvider();

// Add additional scopes for Google provider
googleProvider.addScope('profile');
googleProvider.addScope('email');

// Authentication functions
export const signInWithGoogle = async () => {
  try {
    const result = await signInWithPopup(auth, googleProvider);
    console.log('Google Sign In Result:', {
      user: {
        displayName: result.user.displayName,
        email: result.user.email,
        photoURL: result.user.photoURL,
        uid: result.user.uid
      },
      credentials: result.credential
    });
    return result.user;
  } catch (error) {
    console.error('Error signing in with Google:', error);
    throw error;
  }
};

export const signOutUser = async () => {
  try {
    await signOut(auth);
  } catch (error) {
    console.error('Error signing out:', error);
    throw error;
  }
};

// Add auth state change listener
auth.onAuthStateChanged((user) => {
  if (user) {
    console.log('User is signed in:', {
      displayName: user.displayName,
      email: user.email,
      photoURL: user.photoURL,
      uid: user.uid
    });
  } else {
    console.log('User is signed out');
  }
});

export { database, auth };
