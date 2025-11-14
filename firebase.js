// firebase.js
import { initializeApp } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-app.js";
import { getMessaging, getToken, onMessage } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-messaging.js";

const firebaseConfig = {
  apiKey: "AIzaSyBupOR8UtVs5V_FI7Ce2FXqeRuplpkrEsU",
  authDomain: "mobile-lab-mityana.firebaseapp.com",
  projectId: "mobile-lab-mityana",
  storageBucket: "mobile-lab-mityana.firebasestorage.app",
  messagingSenderId: "770487602797",
  appId: "1:770487602797:web:784cfedde6c373b73f3964",
  measurementId: "G-LBZW2Y0ZT9"
};

const app = initializeApp(firebaseConfig);
const messaging = getMessaging(app);

// Ask for permission and get token
export async function initPush() {
  const permission = await Notification.requestPermission();

  if (permission === "granted") {
    const token = await getToken(messaging, {
      vapidKey:
        "BC9jijIAAote0XZQonTbMJQTRmv8-4Sk-3rqaKCBEbAWn0_CTF0ClgY8ZtEPK3_9rXqBA0qFfgS4J_ysLoSYtRs",
    });

    console.log("FCM Device Token:", token);
    alert("Your device token:\n" + token);

  } else {
    console.log("Notification permission denied.");
  }
}

// Handle foreground messages
onMessage(messaging, (payload) => {
  console.log("Message received in foreground:", payload);
  alert(payload.notification.title + "\n" + payload.notification.body);
});
