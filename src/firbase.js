
import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";
import { getStorage } from "firebase/storage";
import { getDatabase } from "firebase/database";

const firebaseConfig = {
  apiKey: "AIzaSyCZYs1WE4FLqp98vBksU3reoNZ9-VpJWTE",
  authDomain: "uniclopm.firebaseapp.com",
  projectId: "uniclopm",
  storageBucket: "uniclopm.appspot.com",
  messagingSenderId: "1057184388706",
  appId: "1:1057184388706:web:5d4dccb67574927ea8233b"
};

const firebaseApp  = initializeApp(firebaseConfig);
export const auth = getAuth(firebaseApp);
export const db = getFirestore(firebaseApp);
export const storage = getStorage(firebaseApp);
export const database = getDatabase(firebaseApp);

export default firebaseApp;