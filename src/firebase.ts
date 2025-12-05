import { initializeApp } from "firebase/app";
import { getFirestore } from "firebase/firestore";


const firebaseConfig = {
  apiKey: "AIzaSyDL2sk3551N-ya6Z7fs1udBx6gxjhDt0CA",
  authDomain: "hostelone-19110.firebaseapp.com",
  projectId: "hostelone-19110",
  storageBucket: "hostelone-19110.firebasestorage.app",
  messagingSenderId: "557180507862",
  appId: "1:557180507862:web:b50d6d6fb72dba7df09b77"
};


const app = initializeApp(firebaseConfig);


export const db = getFirestore(app);
