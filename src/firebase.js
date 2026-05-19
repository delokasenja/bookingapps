import { initializeApp } from 'firebase/app';
import { getFirestore, doc } from 'firebase/firestore';
import { getStorage } from 'firebase/storage';

const firebaseConfig = {
  apiKey: "AIzaSyCtHUi7ry-uHcr7Mjy03yYteFXlFr4p7v0",
  authDomain: "delokahomestay.firebaseapp.com",
  projectId: "delokahomestay",
  storageBucket: "delokahomestay.firebasestorage.app",
  messagingSenderId: "876046396398",
  appId: "1:876046396398:web:2aa99e5225862a9e8d3cff"
};

const app = initializeApp(firebaseConfig);
export const db = getFirestore(app);
export const STATE_DOC = doc(db, 'deloka', 'state');
export const storage = getStorage(app);
