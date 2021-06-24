import express from "express";
import cors from "cors";

import Authorize from "./utils/authentication";

import { createPost, getPosts, getPost } from "./handlers/posts";
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
app.post("/createPost", Authorize, createPost);
app.get("/post/:postId", getPost);

// User routes
app.post("/signUp", signUp);
app.post("/login", login);
app.post("/user/image", Authorize, uploadImage);
app.post("/user/update", Authorize, updateUserDetails);
app.get("/user", Authorize, getAuthenticatedUser);

app.listen(PORT, () => console.log(`Server is up and running!`));
