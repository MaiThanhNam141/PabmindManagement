import { initializeApp } from "firebase/app";
import { getAnalytics } from "firebase/analytics";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";
import { getStorage } from "@firebase/storage";

const firebaseConfig = {
  apiKey: "AIzaSyB-kk9AEz2vol8HUAsPZTCIBaca83EvwcU",
  authDomain: "pabcare-9633d.firebaseapp.com",
  projectId: "pabcare-9633d",
  storageBucket: "pabcare-9633d.appspot.com",
  messagingSenderId: "361686552357",
  appId: "1:361686552357:web:aa460d0f6c58d9fa6c54cc",
  measurementId: "G-3H6555DCVK"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);

const auth = getAuth(app);
const db = getFirestore(app);
const analytics = getAnalytics(app);
const storage = getStorage(app);

export { auth, db, storage, analytics }