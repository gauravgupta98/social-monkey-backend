import express from "express";
import cors from "cors";

import Authorize from "./utils/authentication";

import { createPost, getPosts } from "./handlers/posts";
import { login, signUp, uploadImage } from "./handlers/users";

const app = express();

app.use(cors());
app.use(express.json());

const PORT = process.env.PORT || 5000;

// Post routes
app.get("/getPosts", getPosts);
app.post("/createPost", Authorize, createPost);

// User routes
app.post("/signUp", signUp);
app.post("/login", login);
app.post("/user/image", Authorize, uploadImage);

app.listen(PORT, () => console.log(`Server is up and running!`));
