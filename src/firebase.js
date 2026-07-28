import { initializeApp } from "firebase/app";
import { getFirestore } from "firebase/firestore";

const firebaseConfig = {
  apiKey: "AIzaSyDAhzJzY7rk57sYBpuuNBfTqNQQMaYPnPU",
  authDomain: "your-own-pt.firebaseapp.com",
  projectId: "your-own-pt",
  storageBucket: "your-own-pt.firebasestorage.app",
  messagingSenderId: "979928095149",
  appId: "1:979928095149:web:c6cbaa5633c5d95cbde924",
  measurementId: "G-0DV3774K7K"
};

const app = initializeApp(firebaseConfig);
export const db = getFirestore(app);
