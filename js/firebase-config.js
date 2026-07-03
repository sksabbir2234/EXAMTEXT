import { initializeApp } from "https://www.gstatic.com/firebasejs/10.12.0/firebase-app.js";
import {
  getFirestore,
  collection,
  doc,
  getDoc,
  getDocs,
  addDoc,
  setDoc,
  updateDoc,
  deleteDoc,
  query,
  where,
  orderBy,
  writeBatch,
  serverTimestamp
} from "https://www.gstatic.com/firebasejs/10.12.0/firebase-firestore.js";

const firebaseConfig = {
  apiKey: "AIzaSyDhXCm3w8jRTSSvVJ3bPNnl4OWG3NjkE58",
  authDomain: "examtext-7ba5f.firebaseapp.com",
  projectId: "examtext-7ba5f",
  storageBucket: "examtext-7ba5f.firebasestorage.app",
  messagingSenderId: "640892449481",
  appId: "1:640892449481:web:7b788480cb0981a2015318"
};

const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

export {
  db,
  collection,
  doc,
  getDoc,
  getDocs,
  addDoc,
  setDoc,
  updateDoc,
  deleteDoc,
  query,
  where,
  orderBy,
  writeBatch,
  serverTimestamp
};
