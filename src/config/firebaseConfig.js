// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getAnalytics, isSupported as analyticsIsSupported } from "firebase/analytics";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";

// Your web app's Firebase configuration
// For Firebase JS SDK v7.20.0 and later, measurementId is optional
const firebaseConfig = {
  apiKey: "AIzaSyDTG3P0Kn63MKAIxE9WCTP3KWCmrB09Fj8",
  authDomain: "smart-parking-9c989.firebaseapp.com",
  projectId: "smart-parking-9c989",
  storageBucket: "smart-parking-9c989.firebasestorage.app",
  messagingSenderId: "281579642550",
  appId: "1:281579642550:web:28c0b380887200db1a1017",
  measurementId: "G-DVW75X9JRL",
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const db = getFirestore(app);

// Initialize Analytics safely (only in supported envs)
let analytics;
try {
  if (typeof window !== "undefined") {
    analyticsIsSupported().then((supported) => {
      if (supported) {
        analytics = getAnalytics(app);
      }
    });
  }
} catch (_) {
  // no-op
}

export { app, auth, db };