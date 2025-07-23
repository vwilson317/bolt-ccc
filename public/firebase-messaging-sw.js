// [START initialize_firebase_in_sw]
importScripts('https://www.gstatic.com/firebasejs/10.12.2/firebase-app-compat.js');
importScripts('https://www.gstatic.com/firebasejs/10.12.2/firebase-messaging-compat.js');

firebase.initializeApp({
  apiKey: self.VITE_FIREBASE_API_KEY,
  authDomain: self.VITE_FIREBASE_AUTH_DOMAIN,
  projectId: self.VITE_FIREBASE_PROJECT_ID,
  storageBucket: self.VITE_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: self.VITE_FIREBASE_MESSAGING_SENDER_ID,
  appId: self.VITE_FIREBASE_APP_ID,
  measurementId: self.VITE_FIREBASE_MEASUREMENT_ID,
});

const messaging = firebase.messaging();

messaging.onBackgroundMessage(function(payload) {
  console.log('[firebase-messaging-sw.js] Received background message ', payload);
  const notificationTitle = payload.notification.title;
  const notificationOptions = {
    body: payload.notification.body,
    icon: '/logo-icon-color.png',
  };

  self.registration.showNotification(notificationTitle, notificationOptions);
});
// [END initialize_firebase_in_sw] 