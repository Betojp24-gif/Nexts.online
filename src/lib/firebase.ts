import { initializeApp } from 'firebase/app';
import { getAuth } from 'firebase/auth';
import { 
  initializeFirestore, 
  doc, 
  getDocFromServer 
} from 'firebase/firestore';
import firebaseConfig from '../../firebase-applet-config.json';

const app = initializeApp(firebaseConfig);

// Using initializeFirestore with experimentalForceLongPolling can help 
// in environments where WebSockets are unstable or blocked.
export const db = initializeFirestore(app, {
  experimentalForceLongPolling: true,
}, firebaseConfig.firestoreDatabaseId);

export const auth = getAuth(app);

// Critical connection test with improved error reporting
async function testConnection() {
  try {
    // Wait a short moment for the environment to settle
    await new Promise(resolve => setTimeout(resolve, 2000));
    await getDocFromServer(doc(db, 'test', 'connection'));
    console.log('Firebase connection verified successfully.');
  } catch (error: any) {
    if (error?.message?.includes('the client is offline')) {
      console.warn("Firestore is operating in offline mode. Please wait or check your internet connection.");
    } else if (error?.code === 'permission-denied') {
      // Permission denied on 'test/connection' is actually a GOOD sign (it reached the server)
      console.log('Firebase reachable (Permission denied on test doc as expected).');
    } else {
      console.error("Firebase connection error:", error.message);
      console.log("If this persists, ensuring that the Firestore database is fully provisioned in the Firebase console.");
    }
  }
}
testConnection();
