import express, { request, response } from "express";
import cors from "cors";
import firebase from "firebase";

import db from "./utils/firebase";

const app = express();

app.use(cors());
app.use(express.json());

const PORT = process.env.PORT || 5000;

app.get("/", (_request, response) =>
  response.status(200).send("Hello Social Monkeys :)")
);

app.get("/getPosts", (_request, response) => {
  db.collection("posts")
    .get()
    .then((data) => {
      let posts: firebase.firestore.DocumentData[] = [];
      data.forEach((doc) => {
        posts.push(doc.data());
      });
      return response.status(200).json(posts);
    })
    .catch((error) => console.error(error));
});

app.post("/createPost", (request, response) => {
  const newPost = {
    body: request.body.body,
    username: request.body.username,
    createdAt: firebase.firestore.Timestamp.fromDate(new Date()),
  };

  db.collection("posts")
    .add(newPost)
    .then((doc) => {
      response
        .status(200)
        .json({ message: `Post ${doc.id} created successfully` });
    })
    .catch((error) => {
      response.status(500).json({ error: "Something went wrong" });
      console.error(error);
    });
});

app.listen(PORT, () => {
  return console.log(`server is up and running!`);
});
