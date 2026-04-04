import admin from "firebase-admin";

function parseServiceAccountFromEnv() {
  const rawServiceAccount = process.env.FIREBASE_SERVICE_ACCOUNT_JSON;
  if (!rawServiceAccount) {
    return null;
  }

  try {
    return JSON.parse(rawServiceAccount);
  } catch {
    throw new Error("FIREBASE_SERVICE_ACCOUNT_JSON is not valid JSON.");
  }
}

function initializeFirebaseApp() {
  // Reuse the app during hot reloads or repeated imports.
  if (admin.apps.length > 0) {
    return admin.app();
  }

  const storageBucket = process.env.FIREBASE_STORAGE_BUCKET || undefined;
  const serviceAccount = parseServiceAccountFromEnv();

  if (serviceAccount) {
    return admin.initializeApp({
      credential: admin.credential.cert(serviceAccount),
      ...(storageBucket ? { storageBucket } : {}),
    });
  }

  // In most deployed environments, this will pick up existing credentials.
  // If not available, the final fallback below supports emulator/local setups.
  try {
    return admin.initializeApp({
      credential: admin.credential.applicationDefault(),
      ...(storageBucket ? { storageBucket } : {}),
    });
  } catch {
    return admin.initializeApp({
      ...(storageBucket ? { storageBucket } : {}),
    });
  }
}

const firebaseApp = initializeFirebaseApp();
const db = admin.firestore(firebaseApp);
const storage = admin.storage(firebaseApp);

export { admin, firebaseApp, db, storage };
