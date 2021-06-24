import firebase from "firebase";

export type Post = {
  postId: string;
  data: firebase.firestore.DocumentData;
};

export interface UserDataSignUp {
  email: string;
  password: string;
  confirmPassword: string;
  username: string;
}

export interface UserDataLogin {
  email: string;
  password: string;
}

export interface AdditionalUserData {
  bio?: string | undefined;
  website?: string | undefined;
  location?: string | undefined;
}

export interface User {
  username: string;
  email: string;
}
