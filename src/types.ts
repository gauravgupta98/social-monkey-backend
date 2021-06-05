import firebase from "firebase";

export type Post = {
  postId: string;
  data: firebase.firestore.DocumentData;
};
