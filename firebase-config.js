// ── SHARED FIREBASE CONFIGURATION ──
// Single source of truth for all Firebase config across the app.
// Every HTML page should load this script BEFORE the Firebase SDK scripts.

const firebaseConfig = {
  apiKey: "AIzaSyA4II_I1weZZGzP990t9UWJCXjuK932pdY",
  authDomain: "mobile-lab-mityana-aeae2.firebaseapp.com",
  projectId: "mobile-lab-mityana-aeae2",
  storageBucket: "mobile-lab-mityana-aeae2.firebasestorage.app",
  messagingSenderId: "624002906588",
  appId: "1:624002906588:web:08b4259f90ffa9adad7719"
};

if (!firebase.apps.length) {
  firebase.initializeApp(firebaseConfig);
}
