// backend/createAdminUser.js
// ------------------------------------------------
// Usage:  node backend/createAdminUser.js <email> <password>
// ------------------------------------------------
// This script creates a Firebase Authentication user, writes a Firestore
// document with role "ADMIN", and (optionally) sets a custom claim
// `admin:true`.  It is intended for one‑time admin account creation.
// ------------------------------------------------
const admin = require('firebase-admin');
require('dotenv').config({ path: './backend/.env' });

// Initialise the Admin SDK – you must provide a service‑account JSON key
// via the environment variable FIREBASE_PRIVATE_KEY (the key can be
// multiline, the replace handles escaped newlines).
admin.initializeApp({
  credential: admin.credential.cert(
    JSON.parse(process.env.FIREBASE_PRIVATE_KEY.replace(/\\n/g, '\n'))
  ),
});

const email = process.argv[2];
const password = process.argv[3];

if (!email || !password) {
  console.error('Usage: node backend/createAdminUser.js <email> <password>');
  process.exit(1);
}

(async () => {
  try {
    // 1️⃣ Create the auth user
    const userRecord = await admin.auth().createUser({ email, password });
    const uid = userRecord.uid;
    console.log(`✅ Auth user created – UID: ${uid}`);

    // 2️⃣ Write Firestore role document
    const db = admin.firestore();
    await db.doc(`users/${uid}`).set({ role: 'ADMIN' }, { merge: true });
    console.log('✅ Firestore: role set to ADMIN');

    // 3️⃣ (Optional) set a custom claim – useful for security rules
    await admin.auth().setCustomUserClaims(uid, { admin: true });
    console.log('✅ Custom claim admin:true set');
  } catch (err) {
    console.error('❌ Error during admin user creation:', err);
    process.exit(1);
  }
})();
