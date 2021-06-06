import firebase from "firebase";

export type Post = {
  postId: string;
  data: firebase.firestore.DocumentData;
};

export interface User {
  email: string;
  password: string;
  confirmPassword: string;
  username: string;
}
