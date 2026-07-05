// Firebase 초기화 (모듈 9 클라우드 DB 체험용)
// 환경변수는 .env의 VITE_FIREBASE_* 값을 사용합니다.
// Firebase 웹 구성값(apiKey 등)은 공개되어도 안전한 값입니다 — 접근 제어는
// Firestore 보안 규칙과 Anonymous Auth가 담당합니다.
import { initializeApp, getApps, getApp, type FirebaseApp } from "firebase/app";
import { getAuth, type Auth } from "firebase/auth";
import { getFirestore, type Firestore } from "firebase/firestore";

const REQUIRED_KEYS = [
  "VITE_FIREBASE_API_KEY",
  "VITE_FIREBASE_AUTH_DOMAIN",
  "VITE_FIREBASE_PROJECT_ID",
  "VITE_FIREBASE_STORAGE_BUCKET",
  "VITE_FIREBASE_MESSAGING_SENDER_ID",
  "VITE_FIREBASE_APP_ID",
] as const;

function readConfig() {
  const env = import.meta.env as Record<string, string | undefined>;
  const missing = REQUIRED_KEYS.filter((k) => !env[k]);
  if (missing.length > 0) {
    throw new Error(
      `Firebase 환경변수가 설정되지 않았습니다: ${missing.join(", ")}. .env 파일에 Firebase 콘솔의 웹 앱 구성값을 입력해 주세요.`,
    );
  }
  return {
    apiKey: env.VITE_FIREBASE_API_KEY!,
    authDomain: env.VITE_FIREBASE_AUTH_DOMAIN!,
    projectId: env.VITE_FIREBASE_PROJECT_ID!,
    storageBucket: env.VITE_FIREBASE_STORAGE_BUCKET!,
    messagingSenderId: env.VITE_FIREBASE_MESSAGING_SENDER_ID!,
    appId: env.VITE_FIREBASE_APP_ID!,
  };
}

let _app: FirebaseApp | undefined;
let _auth: Auth | undefined;
let _db: Firestore | undefined;

export function getFirebaseApp(): FirebaseApp {
  if (!_app) {
    _app = getApps().length > 0 ? getApp() : initializeApp(readConfig());
  }
  return _app;
}

export function getFirebaseAuth(): Auth {
  if (!_auth) _auth = getAuth(getFirebaseApp());
  return _auth;
}

export function getFirebaseDb(): Firestore {
  if (!_db) _db = getFirestore(getFirebaseApp());
  return _db;
}
