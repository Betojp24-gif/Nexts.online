import { initializeApp } from 'firebase/app';
import { getAuth } from 'firebase/auth';
import { 
  initializeFirestore, 
  doc, 
  getDocFromServer 
} from 'firebase/firestore';
import firebaseConfig from '../../firebase-applet-config.json';

// Detect if we are running in the production environment (Vercel or custom domain)
const isProductionDomain = typeof window !== 'undefined' && (
  window.location.hostname.includes('nexts.online') || 
  window.location.hostname.includes('vercel.app')
);

// Check for optional Vite environment variables
const envConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY,
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN,
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID,
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID,
  appId: import.meta.env.VITE_FIREBASE_APP_ID,
  firestoreDatabaseId: import.meta.env.VITE_FIREBASE_DATABASE_ID,
};

const hasEnvConfig = !!(envConfig.apiKey && envConfig.projectId);

// Production Firebase Configuration supplied by the user
const userProdConfig = {
  apiKey: "AIzaSyBHC2YH6RjvP37koaw6MAAz9sANjrN52Xg",
  authDomain: "nexts-online-prod.firebaseapp.com",
  projectId: "nexts-online-prod",
  storageBucket: "nexts-online-prod.firebasestorage.app",
  messagingSenderId: "110676729683",
  appId: "1:110676729683:web:eb323d70d5d744ee860ba6",
  firestoreDatabaseId: undefined, // Standard Firebase projects use the (default) database
};

// Select the correct configuration
let activeConfig: any;
if (hasEnvConfig) {
  activeConfig = {
    apiKey: envConfig.apiKey,
    authDomain: envConfig.authDomain,
    projectId: envConfig.projectId,
    storageBucket: envConfig.storageBucket,
    messagingSenderId: envConfig.messagingSenderId,
    appId: envConfig.appId,
    firestoreDatabaseId: envConfig.firestoreDatabaseId || undefined,
  };
} else if (isProductionDomain) {
  activeConfig = userProdConfig;
} else {
  activeConfig = {
    ...firebaseConfig,
    firestoreDatabaseId: firebaseConfig.firestoreDatabaseId || undefined,
  };
}

const app = initializeApp(activeConfig);

// Using initializeFirestore with experimentalForceLongPolling can help 
// in environments where WebSockets are unstable or blocked.
export const db = initializeFirestore(app, {
  experimentalForceLongPolling: true,
}, activeConfig.firestoreDatabaseId);

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

export enum OperationType {
  CREATE = 'create',
  UPDATE = 'update',
  DELETE = 'delete',
  LIST = 'list',
  GET = 'get',
  WRITE = 'write',
}

export interface FirestoreErrorInfo {
  error: string;
  operationType: OperationType;
  path: string | null;
  authInfo: {
    userId?: string | null;
    email?: string | null;
    emailVerified?: boolean | null;
    isAnonymous?: boolean | null;
    tenantId?: string | null;
    providerInfo?: {
      providerId?: string | null;
      email?: string | null;
    }[];
  }
}

export function handleFirestoreError(error: unknown, operationType: OperationType, path: string | null) {
  const errInfo: FirestoreErrorInfo = {
    error: error instanceof Error ? error.message : String(error),
    authInfo: {
      userId: auth.currentUser?.uid,
      email: auth.currentUser?.email,
      emailVerified: auth.currentUser?.emailVerified,
      isAnonymous: auth.currentUser?.isAnonymous,
      tenantId: auth.currentUser?.tenantId,
      providerInfo: auth.currentUser?.providerData?.map(provider => ({
        providerId: provider.providerId,
        email: provider.email,
      })) || []
    },
    operationType,
    path
  };
  console.error('Firestore Error: ', JSON.stringify(errInfo));
  throw new Error(JSON.stringify(errInfo));
}

