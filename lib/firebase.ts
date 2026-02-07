import { initializeApp } from "firebase/app";
import { getMessaging, isSupported } from "firebase/messaging";

const firebaseConfig = {
  apiKey: "AIzaSyBIwDP9Bx-DjKZodMYYBz3mQUaHxqUK7_k",
  authDomain: "sipenduk.firebaseapp.com",
  projectId: "sipenduk",
  messagingSenderId: "802404144559",
  appId: "1:802404144559:web:8946a888305aed148d4b5a"
};

export const app = initializeApp(firebaseConfig);

export const getFirebaseMessaging = async () => {
  if (typeof window === "undefined") return null;
  const supported = await isSupported();
  if (!supported) return null;
  return getMessaging(app);
};



