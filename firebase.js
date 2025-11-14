// Firebase V9+ Modular SDK

import { initializeApp } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-app.js";
import { getMessaging, getToken, onMessage } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-messaging.js";

// Your Firebase config
const firebaseConfig = {
  apiKey: "AIzaSyBupOR8UtVs5V_FI7Ce2FXqeRuplpkrEsU",
  authDomain: "mobile-lab-mityana.firebaseapp.com",
  projectId: "mobile-lab-mityana",
  storageBucket: "mobile-lab-mityana.firebasestorage.app",
  messagingSenderId: "770487602797",
  appId: "1:770487602797:web:784cfedde6c373b73f3964",
  measurementId: "G-LBZW2Y0ZT9"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const messaging = getMessaging(app);

// Request notification permission + get token
export async function requestPermission() {
  console.log("Requesting notification permission...");

  const permission = await Notification.requestPermission();
  if (permission !== "granted") {
    alert("Notifications blocked. Enable them in browser settings.");
    return;
  }

  const vapidKey = "BCqjIjiAAote0XZQonTbMJQTRmv8-4Sk-3rqaKCBEbAWn0_CTFO6IgY8ZtEPK3_9rXqBA0qFfgS4J_ysLoSYtRs";

  const token = await getToken(messaging, { vapidKey });

  if (token) {
    console.log("FCM Token:", token);
    // TODO: SEND TOKEN TO YOUR SERVER OR DATABASE
  } else {
    console.error("No registration token available");
  }
}

// Foreground listener
onMessage(messaging, (payload) => {
  console.log("Message received in foreground:", payload);

  new Notification(payload.notification.title, {
    body: payload.notification.body,
    icon: "/icon.png"
  });
});
