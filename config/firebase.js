const admin = require('firebase-admin');

let isInitialized = false;

if (process.env.FIREBASE_SERVICE_ACCOUNT_KEY) {
  try {
    let serviceAccount;
    // Check if it's a base64 encoded string or a direct JSON string
    if (process.env.FIREBASE_SERVICE_ACCOUNT_KEY.trim().startsWith('{')) {
      serviceAccount = JSON.parse(process.env.FIREBASE_SERVICE_ACCOUNT_KEY);
    } else if (process.env.FIREBASE_SERVICE_ACCOUNT_KEY !== 'your_firebase_service_account_key_json_string_here') {
      const buff = Buffer.from(process.env.FIREBASE_SERVICE_ACCOUNT_KEY, 'base64');
      serviceAccount = JSON.parse(buff.toString('utf-8'));
    }

    if (serviceAccount) {
      admin.initializeApp({
        credential: admin.credential.cert(serviceAccount),
        storageBucket: process.env.FIREBASE_STORAGE_BUCKET || "your-app.appspot.com"
      });
      console.log('Firebase Admin SDK initialized successfully.');
      isInitialized = true;
    }
  } catch (error) {
    console.error('Firebase initialization error:', error.message);
  }
}

if (!isInitialized) {
  console.warn('Firebase Admin SDK is NOT initialized. Please configure FIREBASE_SERVICE_ACCOUNT_KEY correctly in .env.');
}

module.exports = admin;
