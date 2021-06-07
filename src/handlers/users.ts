import { UserDataLogin, UserDataSignUp } from "../types";
import db, { auth } from "../utils/firebase";
import { validateLoginData, validateSignupData } from "../utils/validator";

export const signUp = (request: any, response: any) => {
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
};

export const login = (request: any, response: any) => {
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
};
