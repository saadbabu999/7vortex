import { initializeApp } from 'firebase/app';
import { getAuth, GoogleAuthProvider, signInWithPopup, onAuthStateChanged, User, createUserWithEmailAndPassword, signInWithEmailAndPassword, updateProfile, sendPasswordResetEmail } from 'firebase/auth';
import { getFirestore, collection, addDoc, getDocs, onSnapshot, query, orderBy, doc, getDocFromServer, Timestamp, serverTimestamp, setDoc, getDoc, updateDoc, where, limit } from 'firebase/firestore';
import { getStorage, ref, uploadBytes, getDownloadURL } from 'firebase/storage';

// Import the real configuration
import firebaseConfig from '../../firebase-applet-config.json';

const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);
// Use firestoreDatabaseId from the config
export const db = getFirestore(app, (firebaseConfig as any).firestoreDatabaseId);
export const storage = getStorage(app);
export const googleProvider = new GoogleAuthProvider();

export { onAuthStateChanged, serverTimestamp, createUserWithEmailAndPassword, signInWithEmailAndPassword, updateProfile, sendPasswordResetEmail };
export type { User };

export const signInWithGoogle = async () => {
  const result = await signInWithPopup(auth, googleProvider);
  if (!result.user.email?.endsWith('@gmail.com')) {
    await auth.signOut();
    throw new Error("Only @gmail.com accounts are allowed.");
  }
  return result;
};

// OTP Helpers (Securely stored in Firestore)
export const sendOTP = async (email: string) => {
  if (!email.endsWith('@gmail.com')) {
    throw new Error("Only @gmail.com accounts are allowed.");
  }
  const otp = Math.floor(100000 + Math.random() * 900000).toString();
  const otpRef = doc(db, "otps", email);
  await setDoc(otpRef, {
    otp,
    expiresAt: Date.now() + 5 * 60 * 1000 // 5 minutes
  });
  console.log(`[Auth] Verification code generated for ${email}`);
  return otp;
};

export const verifyOTP = async (email: string, otp: string) => {
  const otpRef = doc(db, "otps", email);
  const snap = await getDoc(otpRef);
  if (!snap.exists()) throw new Error("OTP expired or not found.");
  const data = snap.data();
  if (data.otp !== otp) throw new Error("Invalid OTP.");
  if (Date.now() > data.expiresAt) throw new Error("OTP expired.");
  return true;
};

// Connection test
async function testConnection() {
  try {
    await getDocFromServer(doc(db, 'test', 'connection'));
  } catch (error) {
    if (error instanceof Error && error.message.includes('the client is offline')) {
      console.error("Please check your Firebase configuration.");
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
    userId: string | undefined;
    email: string | null | undefined;
    emailVerified: boolean | undefined;
    isAnonymous: boolean | undefined;
    tenantId: string | null | undefined;
    providerInfo: any[];
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
      providerInfo: auth.currentUser?.providerData.map(provider => ({
        providerId: provider.providerId,
        displayName: provider.displayName,
        email: provider.email,
        photoUrl: provider.photoURL
      })) || []
    },
    operationType,
    path
  }
  console.error('Firestore Error: ', JSON.stringify(errInfo));
  throw new Error(JSON.stringify(errInfo));
}
