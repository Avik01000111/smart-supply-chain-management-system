const admin = require("firebase-admin");
const fs = require("fs");
const path = require("path");

let realtimeDB = null;

function initializeFirebaseAdmin() {
  try {
    // Return already initialized DB instance
    if (realtimeDB) {
      return realtimeDB;
    }

    const databaseURL = process.env.FIREBASE_DATABASE_URL;

    if (!databaseURL) {
      throw new Error("FIREBASE_DATABASE_URL is missing in .env file");
    }

    const serviceAccountPath = path.join(__dirname, "../serviceAccountKey.json");

    if (!fs.existsSync(serviceAccountPath)) {
      throw new Error(`Firebase service account file not found at: ${serviceAccountPath}`);
    }

    const serviceAccount = JSON.parse(fs.readFileSync(serviceAccountPath, "utf8"));

    if (!admin.apps.length) {
      admin.initializeApp({
        credential: admin.credential.cert(serviceAccount),
        databaseURL: databaseURL
      });

      console.log("✅ Firebase Admin Initialized Successfully");
    }

    realtimeDB = admin.database();

    return realtimeDB;

  } catch (error) {
    console.error("❌ Firebase Initialization Failed:", error.message);
    process.exit(1);
  }
}

module.exports = initializeFirebaseAdmin();