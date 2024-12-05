// firebaseConfig.ts
import { initializeApp , getApps, getApp} from 'firebase/app';
import { getFirestore } from 'firebase/firestore';
import { getAuth } from "firebase/auth";

const firebaseConfig = {
  appName:"PostingApp",
  apiKey: "AIzaSyCFsidgjseTD9mNNAusyMonsbqcyw2u5NQ",
  authDomain: "postingapp-68624.firebaseapp.com",
  projectId: "postingapp-68624",
  storageBucket: "postingapp-68624.appspot.com",
  messagingSenderId: "583807431400",
  appId: "1:583807431400:android:f0dbb08e5378ce5e9acf5d"
};

// Initialize Firebase
// const app = initializeApp(firebaseConfig);

const app = !getApps().length ? initializeApp(firebaseConfig) : getApp();
const db = getFirestore(app);
const auth = getAuth(app);

export { db, app, auth };
