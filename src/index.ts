import express from "express";
import cors from "cors";

const app = express();

app.use(cors());
app.use(express.json());

const PORT = process.env.PORT || 5000;

app.get("/", (_request, response) =>
  response.status(200).send("Hello Social Monkeys :)")
);

app.listen(PORT, () => {
  return console.log(`server is up and running!`);
});
