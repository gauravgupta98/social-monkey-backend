import express from "express";
import cors from "cors";

import db, { auth } from "./utils/firebase";
import { Post, UserDataSignUp, UserDataLogin } from "./types";
import { validateLoginData, validateSignupData } from "./utils/validator";
import Authorize from "./utils/authentication";

const app = express();

app.use(cors());
app.use(express.json());

const PORT = process.env.PORT || 5000;

app.get("/", (_request, response) =>
  response.status(200).send("Hello Social Monkeys :)")
);

app.get("/getPosts", (_request, response) => {
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
});

app.post("/createPost", Authorize, (request, response) => {
  const newPost = {
    body: request.body.body,
    username: request.user.username,
    createdAt: new Date().toISOString(),
  };

  if (newPost.body === undefined || newPost.body.trim() === "")
    return response
      .status(400)
      .json({ body: "Body of post must not be empty" });

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
});

app.post("/signUp", (request, response) => {
  const newUser: UserDataSignUp = {
    email: request.body.email,
    password: request.body.password,
    confirmPassword: request.body.confirmPassword,
    username: request.body.username,
  };

  const { valid, errors } = validateSignupData(newUser);

  if (!valid) return response.status(400).json(errors);

  let token: string | undefined, userId: string | undefined;

  db.doc(`/users/${newUser.username}`)
    .get()
    .then((doc) => {
      if (doc?.exists) {
        response
          .status(400)
          .json({ username: `This username is already taken` });
      } else {
        return auth.createUserWithEmailAndPassword(
          newUser.email,
          newUser.password
        );
      }
    })
    .then((data) => {
      userId = data?.user?.uid;
      return data?.user?.getIdToken();
    })
    .then((idToken) => {
      token = idToken;
      const userCredentials = {
        username: newUser.username,
        email: newUser.email,
        createdAt: new Date().toISOString(),
        userId,
      };
      return db.doc(`/users/${newUser.username}`).set(userCredentials);
    })
    .then(() => response.status(201).json({ token }))
    .catch((error) => {
      console.error(error);
      if (error.code === "auth/email-already-in-use") {
        return response.status(400).json({ email: "Email is already in use" });
      } else {
        response
          .status(500)
          .json({ error: "Something went wrong, please try again later" });
      }
    });
});

app.post("/login", (request, response) => {
  const user: UserDataLogin = {
    email: request.body.email,
    password: request.body.password,
  };

  const { valid, errors } = validateLoginData(user);

  if (!valid) return response.status(400).json(errors);

  auth
    .signInWithEmailAndPassword(user.email, user.password)
    .then((data) => {
      return data.user?.getIdToken();
    })
    .then((token) => {
      return response.json({ token });
    })
    .catch((error) => {
      console.error(error);
      return response.status(403).json({
        error: "Wrong credentials, please try again with valid credentials",
      });
    });
});

app.listen(PORT, () => {
  return console.log(`server is up and running!`);
});
