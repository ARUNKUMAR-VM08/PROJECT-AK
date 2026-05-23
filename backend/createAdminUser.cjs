const admin = require('firebase-admin');
const logger = console; // fallback logger
const dotenv = require('dotenv');

dotenv.config({ path: './backend/.env' });

const { FIREBASE_PROJECT_ID, FIREBASE_CLIENT_EMAIL, FIREBASE_PRIVATE_KEY } = process.env;

if (!FIREBASE_PROJECT_ID || !FIREBASE_CLIENT_EMAIL || !FIREBASE_PRIVATE_KEY) {
  console.error('Missing required Firebase env vars in backend/.env');
  process.exit(1);
}

admin.initializeApp({
  credential: admin.credential.cert({
    projectId: FIREBASE_PROJECT_ID,
    clientEmail: FIREBASE_CLIENT_EMAIL,
    privateKey: FIREBASE_PRIVATE_KEY.replace(/\\n/g, '\n'),
  }),
});

const auth = admin.auth();
const db = admin.firestore();

const email = process.argv[2];
const password = process.argv[3];
if (!email || !password) {
  console.error('Usage: node backend/createAdminUser.cjs <email> <password>');
  process.exit(1);
}

(async () => {
  try {
    const user = await auth.createUser({ email, password });
    console.log('✅ Auth user created – UID:', user.uid);
    await db.doc(`users/${user.uid}`).set({ role: 'ADMIN' }, { merge: true });
    console.log('✅ Firestore: role set to ADMIN');
    await auth.setCustomUserClaims(user.uid, { admin: true });
    console.log('✅ Custom claim admin:true set');
  } catch (err) {
    console.error('❌ Error creating admin user:', err);
    process.exit(1);
  }
})();
