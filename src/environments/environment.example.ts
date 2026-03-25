import { FirebaseConfig } from '../app/core/config/firebase.config';

export interface Environment {
  production: boolean;
  firebase: FirebaseConfig;
}

// Copy this file to environment.ts and fill in your Firebase project values.
// Find them at: Firebase Console → Project Settings → Your apps → SDK setup.
export const environment: Environment = {
  production: false,
  firebase: {
    apiKey: 'YOUR_API_KEY',
    authDomain: 'YOUR_PROJECT_ID.firebaseapp.com',
    projectId: 'YOUR_PROJECT_ID',
    storageBucket: 'YOUR_PROJECT_ID.firebasestorage.app',
    messagingSenderId: 'YOUR_MESSAGING_SENDER_ID',
    appId: 'YOUR_APP_ID',
  },
};
