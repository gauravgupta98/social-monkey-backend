import db from "../utils/firebase";
import { Post } from "../types";

export const getPosts = (_request: any, response: any) => {
  db.collection("posts")
    .orderBy("createdAt", "desc")
    .get()
    .then((data) => {
      let posts: Post[] = [];
      data.forEach((doc) => {
        posts.push({ postId: doc.id, data: doc.data() });
      });
      return response.status(200).json(posts);
    })
    .catch((error) => console.error(error));
};

export const createPost = (request: any, response: any) => {
  const newPost = {
    body: request.body.body,
    username: request.user.username,
    createdAt: new Date().toISOString(),
  };

  if (newPost.body === undefined || newPost.body.trim() === "") {
    return response
      .status(400)
      .json({ body: "Body of post must not be empty" });
  }

  db.collection("posts")
    .add(newPost)
    .then((doc) => {
      return response
        .status(200)
        .json({ message: `Post ${doc.id} created successfully` });
    })
    .catch((error) => {
      console.error(error);
      return response
        .status(500)
        .json({ error: `Something went wrong. Error: ${error.code}` });
    });
};
