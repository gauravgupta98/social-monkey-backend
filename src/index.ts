import express from "express";
import cors from "cors";

import Authorize from "./utils/authentication";

import {
  createPost,
  getPosts,
  getPost,
  commentOnPost,
  likePost,
  unlikePost,
  deletePost,
} from "./handlers/posts";
import {
  getAuthenticatedUser,
  login,
  signUp,
  uploadImage,
  updateUserDetails,
} from "./handlers/users";

const app = express();

app.use(cors());
app.use(express.json());

const PORT = process.env.PORT || 5000;

// Post routes
app.get("/getPosts", getPosts);
app.get("/post/:postId", getPost);

app.post("/createPost", Authorize, createPost);
app.post("/post/:postId/comment", Authorize, commentOnPost);
app.post("/post/:postId/like", Authorize, likePost);
app.post("/post/:postId/unlike", Authorize, unlikePost);

app.delete("/post/:postId", Authorize, deletePost);

// User routes
app.get("/user", Authorize, getAuthenticatedUser);

app.post("/signUp", signUp);
app.post("/login", login);
app.post("/user/image", Authorize, uploadImage);
app.post("/user/update", Authorize, updateUserDetails);

app.listen(PORT, () => console.log(`Server is up and running!`));
