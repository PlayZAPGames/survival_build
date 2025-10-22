// /// <reference types="vite/client" />

interface ImportMetaEnv {
  VITE_API_URL: string;
  VITE_PORT: number
  VITE_FIREBASE_API_KEY: any;
  VITE_FIREBASE_AUTH_DOMAIN: any;
  VITE_FIREBASE_PROJECT_ID: any;
  VITE_FIREBASE_STORAGE_BUCKET: any;
  VITE_FIREBASE_MESSAGING_SENDER_ID: any;
  VITE_FIREBASE_APP_ID: any;
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
}