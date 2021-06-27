import e, { Request, Response } from "express";

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
    userImage: request.user.imageUrl,
    createdAt: new Date().toISOString(),
    likeCount: 0,
    commentCount: 0,
  };

  if (newPost.body === undefined || newPost.body.trim() === "") {
    return response
      .status(400)
      .json({ body: "Body of post must not be empty" });
  }

  db.collection("posts")
    .add(newPost)
    .then((doc) => {
      return response.status(200).json({ postId: doc.id, ...newPost });
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
      postData.postId = doc.id;

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
    imageUrl: request.user.imageUrl,
  };

  db.doc(`/posts/${request.params?.postId}`)
    .get()
    .then((doc) => {
      if (!doc.exists) {
        response.status(404).json({ error: "Post not found" });
      }
      return doc.ref.update({
        commentCount: doc?.data()?.commentCount + 1,
      });
    })
    .then(() => {
      return db.collection("comments").add(newComment);
    })
    .then(() => {
      return response.json(newComment);
    })
    .catch((err) => {
      console.log(err);
      response.status(500).json({ error: "Something went wrong" });
    });
};

/**
 * Handles liking a post.
 * @param request The request object
 * @param response The response object
 */
export const likePost = (request: Request, response: Response) => {
  return handleLikeUnlike(request, response, true);
};

/**
 * Handles unliking a post.
 * @param request The request object
 * @param response The response object
 */
export const unlikePost = (request: Request, response: Response) => {
  return handleLikeUnlike(request, response, false);
};

/**
 * Handles liking and unliking a post.
 * @param request The request object
 * @param response The response object
 * @param likePost Pass true if liking a post, else false
 */
const handleLikeUnlike = (
  request: Request,
  response: Response,
  likePost: boolean
) => {
  const likeDocument = db
    .collection("likes")
    .where("username", "==", request.user.username)
    .where("postId", "==", request.params.postId)
    .limit(1);

  const postDocument = db.doc(`/posts/${request.params.postId}`);

  let postData: any;

  postDocument
    .get()
    .then((doc) => {
      if (doc.exists) {
        postData = doc.data();
        postData.postId = doc.id;
        return likeDocument.get();
      } else {
        response.status(404).json({ error: "Post not found" });
      }
    })
    .then((data) => {
      if (likePost) {
        // Like a post
        if (data?.empty) {
          return db
            .collection("likes")
            .add({
              postId: request.params.postId,
              username: request.user.username,
            })
            .then(() => {
              postData.likeCount++;
              return postDocument.update({ likeCount: postData.likeCount });
            })
            .then(() => response.json(postData));
        } else {
          response.status(400).json({ error: "Post already liked" });
        }
      } else {
        // Unlike a post
        if (data?.empty) {
          response.status(400).json({ error: "Post not liked" });
        } else {
          return db
            .doc(`/likes/${data?.docs[0].id}`)
            .delete()
            .then(() => {
              postData.likeCount--;
              return postDocument.update({ likeCount: postData.likeCount });
            })
            .then(() => response.json(postData));
        }
      }
    })
    .catch((error) => {
      console.error(error);
      response.status(500).json({ error: error.code });
    });
};

/**
 * Handles deleting a post.
 * @param request The request object
 * @param response The response object
 */
export const deletePost = (request: Request, response: Response) => {
  const document = db.doc(`/posts/${request.params.postId}`);

  document
    .get()
    .then((doc) => {
      if (!doc?.exists) {
        response.status(404).json({ error: "Post not found" });
      }

      if (doc?.data()?.username !== request.user.username) {
        response.status(403).json({ error: "Unauthorized" });
      } else {
        return document.delete();
      }
    })
    .then(() => response.json({ message: "Post deleted successfully" }))
    .catch((error) => {
      console.error(error);
      return response.status(500).json({ error: error.code });
    });
};
