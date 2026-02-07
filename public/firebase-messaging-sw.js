importScripts("https://www.gstatic.com/firebasejs/10.7.0/firebase-app-compat.js");
importScripts("https://www.gstatic.com/firebasejs/10.7.0/firebase-messaging-compat.js");

firebase.initializeApp({
  apiKey: "AIzaSyBIwDP9Bx-DjKZodMYYBz3mQUaHxqUK7_k",
  authDomain: "sipenduk.firebaseapp.com",
  projectId: "sipenduk",
  storageBucket: "sipenduk.firebasestorage.app",
  messagingSenderId: "802404144559",
  appId: "1:802404144559:web:8946a888305aed148d4b5a"
});

const messaging = firebase.messaging();

messaging.onBackgroundMessage((payload) => {
  console.log("BG message", payload);

  const notificationTitle = payload.notification?.title || "Notifikasi";
  const notificationOptions = {
    body: payload.notification?.body,
    icon: "/icon-192.png",
  };

  self.registration.showNotification(notificationTitle, notificationOptions);
});

