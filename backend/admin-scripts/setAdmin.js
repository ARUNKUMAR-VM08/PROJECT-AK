import admin from 'firebase-admin';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Load environment variables from .env in backend/
dotenv.config({ path: path.join(__dirname, '../.env') });

const projectId = process.env.FIREBASE_PROJECT_ID;
const clientEmail = process.env.FIREBASE_CLIENT_EMAIL;
const privateKey = process.env.FIREBASE_PRIVATE_KEY?.replace(/\\n/g, '\n');

if (!projectId || !clientEmail || !privateKey) {
  console.error('❌ Error: Missing required environment variables in backend/.env');
  console.log('Please make sure backend/.env exists and contains FIREBASE_PROJECT_ID, FIREBASE_CLIENT_EMAIL, and FIREBASE_PRIVATE_KEY.');
  process.exit(1);
}

admin.initializeApp({
  credential: admin.credential.cert({
    projectId,
    clientEmail,
    privateKey,
  }),
});

const db = admin.firestore();
const auth = admin.auth();

async function setAdminRole(emailOrUid, makeAdmin = true) {
  try {
    let userRecord;
    if (emailOrUid.includes('@')) {
      userRecord = await auth.getUserByEmail(emailOrUid);
    } else {
      userRecord = await auth.getUser(emailOrUid);
    }

    const uid = userRecord.uid;
    const roleValue = makeAdmin ? 'admin' : 'customer';

    // 1. Set custom user claims for security rules / token validations
    await auth.setCustomUserClaims(uid, { admin: makeAdmin });
    console.log(`🔑 Custom claims updated: set { admin: ${makeAdmin} } for user ${userRecord.email} (${uid})`);

    // 2. Update Firestore user document
    const userDocRef = db.collection('users').doc(uid);
    const userDoc = await userDocRef.get();

    if (!userDoc.exists) {
      // Create user document if it doesn't exist
      await userDocRef.set({
        email: userRecord.email || '',
        displayName: userRecord.displayName || '',
        role: roleValue,
        createdAt: admin.firestore.FieldValue.serverTimestamp(),
      });
      console.log(`📝 Created Firestore user document with role: '${roleValue}'`);
    } else {
      // Update existing document
      await userDocRef.update({
        role: roleValue,
        updatedAt: admin.firestore.FieldValue.serverTimestamp(),
      });
      console.log(`📝 Updated Firestore user document for UID: ${uid} with role: '${roleValue}'`);
    }

    console.log(`🎉 SUCCESS: User ${userRecord.email} is now configured with role: '${roleValue}'!`);
  } catch (error) {
    console.error('❌ Failed to set admin role:', error);
  } finally {
    process.exit(0);
  }
}

// Get args from command line
const args = process.argv.slice(2);
if (args.length < 1) {
  console.log('Usage: npm run set-admin <email_or_uid> [true|false]');
  console.log('Example: npm run set-admin admin@example.com true');
  process.exit(1);
}

const targetUser = args[0];
const shouldBeAdmin = args[1] !== 'false'; // Defaults to true unless explicitly 'false'

console.log(`Setting admin role to ${shouldBeAdmin} for user: ${targetUser}...`);
setAdminRole(targetUser, shouldBeAdmin);
