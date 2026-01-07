importScripts("https://www.gstatic.com/firebasejs/10.7.1/firebase-app-compat.js");
importScripts("https://www.gstatic.com/firebasejs/10.7.1/firebase-messaging-compat.js");

firebase.initializeApp({
  apiKey: "AIzaSyA4II_I1weZZGzP990t9UWJCXjuK932pdY",
  authDomain: "mobile-lab-mityana-aeae2.firebaseapp.com",
  projectId: "mobile-lab-mityana-aeae2",
  messagingSenderId: "624002906588",
  appId: "1:624002906588:web:08b4259f90ffa9adad7719"
});

const messaging = firebase.messaging();

messaging.onBackgroundMessage(payload => {
  self.registration.showNotification(
    payload.notification.title,
    {
      body: payload.notification.body,
      icon: "/icon-192.png"
    }
  );
});
