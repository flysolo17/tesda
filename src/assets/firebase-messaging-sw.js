// firebase-messaging-sw.js
importScripts(
  "https://www.gstatic.com/firebasejs/9.22.0/firebase-app-compat.js"
);
importScripts(
  "https://www.gstatic.com/firebasejs/9.22.0/firebase-messaging-compat.js"
);

firebase.initializeApp({
  projectId: "tesda-system",
  appId: "1:123259145059:web:91f295ef5a9990fdf7e156",
  storageBucket: "tesda-system.firebasestorage.app",
  apiKey: "AIzaSyB6DWi3QOTjFnF-T1aEwUzqXEXpSVNX7Dg",
  authDomain: "tesda-system.firebaseapp.com",
  messagingSenderId: "123259145059",
  measurementId: "G-RKQXMG0N09",
  projectNumber: "123259145059",
});

const messaging = firebase.messaging();
