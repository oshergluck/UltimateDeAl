// src/firebaseConfig.js
import { initializeApp } from "firebase/app";
import { getAuth, signInAnonymously } from "firebase/auth";
import { getDatabase, ref, push, onValue } from "firebase/database";

const firebaseConfig = {
  apiKey: "YOUR_API_KEY",
  authDomain: "YOUR_AUTH_DOMAIN",
  projectId: "YOUR_PROJECT_ID",
  storageBucket: "YOUR_STORAGE_BUCKET",
  messagingSenderId: "YOUR_MESSAGING_SENDER_ID",
  appId: "YOUR_APP_ID",
  databaseURL: "YOUR_DATABASE_URL"  // Ensure Realtime Database URL is set
};

const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);
export const database = getDatabase(app);

// Authenticate anonymously
export const signInAnonymouslyUser = () => signInAnonymously(auth);
export const messagesRef = (url) => ref(database, `chat/${url}`);
export const addMessage = (url, message) => push(messagesRef(url), message);
