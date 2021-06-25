import { Request, Response } from "express";

import db from "../utils/firebase";
import { Post } from "../types";

/**
 * Gets all the posts from the database. Returns the Posts array containing all the posts.
 * @param request The request object
 * @param response The response object
 */
export const getPosts = (_request: Request, response: Response) => {
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

/**
 * Handles creation of a new post. User must pass body message of the post.
 * @param request The request object
 * @param response The response object
 */
export const createPost = (request: Request, response: Response) => {
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

/**
 * Gets post by postId.
 * @param request The request object
 * @param response The response object
 */
export const getPost = (request: Request, response: Response) => {
  let postData: any = {};

  db.doc(`/posts/${request.params.postId}`)
    .get()
    .then((doc) => {
      if (!doc.exists) {
        response.status(404).json({ error: "Post not found" });
      }

      postData = doc.data();
      postData.screamId = doc.id;

      return db
        .collection("comments")
        .orderBy("createdAt", "desc")
        .where("postId", "==", request.params.postId)
        .get();
    })
    .then((data) => {
      postData.comments = [];
      data?.forEach((doc) => postData.comments.push(doc.data()));
      return response.status(200).json(postData);
    })
    .catch((error) => {
      console.error(error);
      response.status(500).json({ error: error.code });
    });
};

/**
 * Handles commenting on a post.
 * @param request The request object
 * @param response The response object
 */
export const commentOnPost = (request: Request, response: Response) => {
  if (request.body?.body?.trim() === "")
    return response.status(400).json({ comment: "Must not be empty" });

  const newComment = {
    body: request.body.body,
    createdAt: new Date().toISOString(),
    postId: request.params.postId,
    username: request.user.username,
  };
};
