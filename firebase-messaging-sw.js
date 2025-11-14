importScripts("https://www.gstatic.com/firebasejs/10.7.1/firebase-app-compat.js");
importScripts("https://www.gstatic.com/firebasejs/10.7.1/firebase-messaging-compat.js");

// Firebase config
firebase.initializeApp({
  apiKey: "AIzaSyBupOR8UtVs5V_FI7Ce2FXqeRuplpkrEsU",
  authDomain: "mobile-lab-mityana.firebaseapp.com",
  projectId: "mobile-lab-mityana",
  storageBucket: "mobile-lab-mityana.firebasestorage.app",
  messagingSenderId: "770487602797",
  appId: "1:770487602797:web:784cfedde6c373b73f3964",
  measurementId: "G-LBZW2Y0ZT9"
});

// Retrieve Firebase Messaging object
const messaging = firebase.messaging();

// Background notifications
messaging.onBackgroundMessage(function(payload) {
  console.log("Received background message: ", payload);

  self.registration.showNotification(payload.notification.title, {
    body: payload.notification.body,
    icon: "/icon.png"
  });
});
