import { initializeApp } from 'firebase/app';
import {
  getAuth,
  GoogleAuthProvider,
  signInWithPopup,
  signOut,
  onAuthStateChanged,
  User as FirebaseUser,
} from 'firebase/auth';
import {
  getFirestore,
  doc,
  getDoc,
  getDocFromServer,
  setDoc,
  updateDoc,
  serverTimestamp,
  onSnapshot,
} from 'firebase/firestore';
import firebaseConfig from './firebase-applet-config.json';

const app = initializeApp(firebaseConfig);
export const db = getFirestore(app, firebaseConfig.firestoreDatabaseId);
export const auth = getAuth(app);
export const googleProvider = new GoogleAuthProvider();

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
  };
}

export function handleFirestoreError(
  error: unknown,
  operationType: OperationType,
  path: string | null
) {
  const errInfo: FirestoreErrorInfo = {
    error: error instanceof Error ? error.message : String(error),
    authInfo: {
      userId: auth.currentUser?.uid,
      email: auth.currentUser?.email,
      emailVerified: auth.currentUser?.emailVerified,
      isAnonymous: auth.currentUser?.isAnonymous,
      tenantId: auth.currentUser?.tenantId,
      providerInfo:
        auth.currentUser?.providerData?.map((provider) => ({
          providerId: provider.providerId,
          email: provider.email,
        })) || [],
    },
    operationType,
    path,
  };
  console.error('Firestore Error: ', JSON.stringify(errInfo));
  throw new Error(JSON.stringify(errInfo));
}

// Validate connection to Firestore on boot
async function testConnection() {
  try {
    await getDocFromServer(doc(db, 'site_config', 'global'));
  } catch (error) {
    if (
      error instanceof Error &&
      error.message.includes('the client is offline')
    ) {
      console.error('Please check your Firebase configuration.');
    }
  }
}
testConnection();

export { onAuthStateChanged, signOut };
export type { FirebaseUser };

export async function signInWithGoogleFirebase() {
  const result = await signInWithPopup(auth, googleProvider);
  return result.user;
}

export async function syncFirebaseAuthenticatedUser(params: {
  uid: string;
  name: string;
  email: string;
  ipAddress: string;
  role: 'user' | 'co-admin';
  tokenBalance: number;
  totalTokensUsed: number;
  unlimitedTokens: boolean;
  emailVerified: boolean;
  isBlocked: boolean;
  violentChatCount: number;
}) {
  if (!auth.currentUser || auth.currentUser.uid !== params.uid) return;
  const safeUid = params.uid.replace(/[^a-zA-Z0-9_\-]/g, '').slice(0, 128);
  if (!safeUid) return;

  const userDocRef = doc(db, 'users', safeUid);
  const userPath = `users/${safeUid}`;

  try {
    const existingSnap = await getDoc(userDocRef);
    const clampedName = (params.name || 'GOT User').slice(0, 120);
    const clampedBalance = Math.max(
      0,
      Math.min(100000000, Math.floor(params.tokenBalance))
    );
    const clampedUsed = Math.max(
      0,
      Math.min(100000000, Math.floor(params.totalTokensUsed))
    );
    const clampedStrikes = Math.max(
      0,
      Math.min(1000, Math.floor(params.violentChatCount))
    );

    if (!existingSnap.exists()) {
      await setDoc(userDocRef, {
        uid: safeUid,
        name: clampedName,
        role: 'user',
        tokenBalance: Math.min(5000, clampedBalance),
        totalTokensUsed: clampedUsed,
        unlimitedTokens: false,
        emailVerified: Boolean(params.emailVerified),
        isBlocked: false,
        violentChatCount: clampedStrikes,
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp(),
      });
    } else {
      const existingData = existingSnap.data();
      const safeNextBalance = Math.min(
        typeof existingData.tokenBalance === 'number'
          ? existingData.tokenBalance
          : clampedBalance,
        clampedBalance
      );
      const safeNextUsed = Math.max(
        typeof existingData.totalTokensUsed === 'number'
          ? existingData.totalTokensUsed
          : 0,
        clampedUsed
      );
      await updateDoc(userDocRef, {
        name: clampedName,
        tokenBalance: safeNextBalance,
        totalTokensUsed: safeNextUsed,
        emailVerified: Boolean(params.emailVerified),
        violentChatCount: clampedStrikes,
        isBlocked: Boolean(params.isBlocked),
        updatedAt: serverTimestamp(),
      });
    }
  } catch (err) {
    handleFirestoreError(err, OperationType.WRITE, userPath);
  }

  // Sync isolated PII subdocument
  const privPath = `users/${safeUid}/private/info`;
  const privRef = doc(db, 'users', safeUid, 'private', 'info');
  try {
    const privSnap = await getDoc(privRef);
    const safeEmail = (params.email || 'user@gotagent.ai').slice(0, 180);
    const safeIp = (params.ipAddress || '127.0.0.1').slice(0, 64);
    if (!privSnap.exists()) {
      await setDoc(privRef, {
        uid: safeUid,
        email: safeEmail,
        ipAddress: safeIp,
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp(),
      });
    } else {
      await updateDoc(privRef, {
        email: safeEmail,
        ipAddress: safeIp,
        updatedAt: serverTimestamp(),
      });
    }
  } catch (err) {
    handleFirestoreError(err, OperationType.WRITE, privPath);
  }
}

export async function syncChatSessionToFirebase(params: {
  uid: string;
  userName: string;
  sessionId: string;
  title: string;
  messagesSummary: string;
  messageCount: number;
}) {
  if (!auth.currentUser || auth.currentUser.uid !== params.uid) return;
  const safeUid = params.uid.replace(/[^a-zA-Z0-9_\-]/g, '').slice(0, 128);
  const safeChatId = params.sessionId
    .replace(/[^a-zA-Z0-9_\-]/g, '')
    .slice(0, 128);
  if (!safeUid || !safeChatId) return;

  const chatPath = `users/${safeUid}/chats/${safeChatId}`;
  const chatRef = doc(db, 'users', safeUid, 'chats', safeChatId);

  try {
    const snap = await getDoc(chatRef);
    const safeName = (params.userName || 'GOT User').slice(0, 120);
    const safeTitle = (params.title || 'New Chat').slice(0, 200);
    const safeSummary = (params.messagesSummary || '').slice(0, 19500);
    const safeCount = Math.max(0, Math.min(5000, Math.floor(params.messageCount)));

    if (!snap.exists()) {
      await setDoc(chatRef, {
        uid: safeUid,
        userName: safeName,
        title: safeTitle,
        messagesSummary: safeSummary,
        messageCount: safeCount,
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp(),
      });
    } else {
      await updateDoc(chatRef, {
        userName: safeName,
        title: safeTitle,
        messagesSummary: safeSummary,
        messageCount: safeCount,
        updatedAt: serverTimestamp(),
      });
    }
  } catch (err) {
    handleFirestoreError(err, OperationType.WRITE, chatPath);
  }
}

export function subscribeGlobalSiteConfigFromFirebase(
  onConfig: (data: any) => void
) {
  const path = 'site_config/global';
  return onSnapshot(
    doc(db, 'site_config', 'global'),
    (snap) => {
      if (snap.exists()) {
        onConfig(snap.data());
      }
    },
    (error) => {
      handleFirestoreError(error, OperationType.GET, path);
    }
  );
}
