// firebase.ts
import { initializeApp } from "firebase/app";
// 1. Import fungsi persistence khusus React Native
import { 
  initializeAuth,
  // @ts-ignore 
  getReactNativePersistence, // <--- INI KUNCINYA
  signInAnonymously, 
  onAuthStateChanged,
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signOut 
} from "firebase/auth";
import {
  getFirestore,
  collection,
  addDoc,
  serverTimestamp,
  query,
  orderBy,
  onSnapshot,
  CollectionReference,
  DocumentData,
} from "firebase/firestore";

// 2. Import AsyncStorage yang udah lo install sebelumnya
import ReactNativeAsyncStorage from '@react-native-async-storage/async-storage';

const firebaseConfig = {
  apiKey: "AIzaSyAeGXwV6geqrcKpgO113LO6lxogxHWOGRo",
  authDomain: "chatapp-58f7a.firebaseapp.com",
  projectId: "chatapp-58f7a",
  storageBucket: "chatapp-58f7a.firebasestorage.app",
  messagingSenderId: "316262888844",
  appId: "1:316262888844:web:28814575b0329e63c8d2a9"
};

const app = initializeApp(firebaseConfig);

// 3. GANTI BAGIAN INI
// Dulu: const auth = getAuth(app);
// Sekarang: Kita paksa Auth pake AsyncStorage biar ingatan kuat!
const auth = initializeAuth(app, {
  persistence: getReactNativePersistence(ReactNativeAsyncStorage)
});

const db = getFirestore(app);
const messagesCollection = collection(db, "messages") as CollectionReference<DocumentData>;

export {
  auth,
  db,
  messagesCollection,
  signInAnonymously,
  onAuthStateChanged,
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signOut,
  addDoc,
  serverTimestamp,
  query,
  orderBy,
  onSnapshot
};