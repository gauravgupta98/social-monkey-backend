/// <reference lib="dom" />
import * as firebase from "firebase";

export const firebaseConfig = {
  apiKey: "AIzaSyDgkWn5izw3H9eMDWTUYQadacWrwsrhQFI",
  authDomain: "socialmonkeysss.firebaseapp.com",
  projectId: "socialmonkeysss",
  storageBucket: "socialmonkeysss.appspot.com",
  messagingSenderId: "733973400570",
  appId: "1:733973400570:web:58fd72f030dbca09167243",
};

const firebaseApp = firebase.default.initializeApp(firebaseConfig);
const db = firebaseApp.firestore();

const auth = firebase.default.auth();

export { auth };
export default db;
