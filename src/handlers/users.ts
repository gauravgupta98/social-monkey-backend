import { Request, Response } from "express";
import Busboy from "busboy";
import path from "path";
import fs from "fs";
import os from "os";
import { v4 as uuidv4 } from "uuid";

import db, { admin, auth, firebaseConfig } from "../utils/firebase";
import { UserDataLogin, UserDataSignUp } from "../types";
import {
  reduceUserDetails,
  validateLoginData,
  validateSignupData,
} from "../utils/validator";

/**
 * Implements the signing up of new user. Returns an authorization token if user is signed up successfully.
 * @param request The request object
 * @param response The response object
 */
export const signUp = (request: Request, response: Response) => {
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
        imageUrl: `https://firebasestorage.googleapis.com/v0/b/${firebaseConfig.storageBucket}/o/no-img.png?alt=media`,
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

/**
 * Handles the login of any existing user. Returns an authorization token if user exists and credentials are correct, otherwise returns error.
 * @param request The request object
 * @param response The response object
 */
export const login = (request: Request, response: Response) => {
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

/**
 * Handles the upload of profile picture using busboy.
 * @param request The request object
 * @param response The response object
 */
export const uploadImage = (request: Request, response: Response) => {
  let imageFileName: string, imageToBeUploaded: any;
  const busboy = new Busboy({ headers: request.headers });
  let generatedToken = uuidv4();

  busboy.on(
    "file",
    (
      fieldname: string,
      file: NodeJS.ReadableStream,
      filename: string,
      encoding: string,
      mimetype: string
    ) => {
      if (mimetype !== "image/jpeg" && mimetype !== "image/png") {
        return response
          .status(400)
          .json({ error: "Wrong file type submitted" });
      }

      const imageFileNameParts = filename.split(".");
      const imageExtension = imageFileNameParts[imageFileNameParts.length - 1];

      // 2532453453400.jpg
      imageFileName = `${Math.round(
        Math.random() * 1000000000000
      ).toString()}.${imageExtension}`;

      const filePath = path.join(os.tmpdir(), imageFileName);
      imageToBeUploaded = { filePath, mimetype };
      file.pipe(fs.createWriteStream(filePath));
    }
  );

  busboy.on("finish", () => {
    admin
      .storage()
      .bucket()
      .upload(imageToBeUploaded.filePath, {
        resumable: false,
        metadata: {
          metadata: {
            contentType: imageToBeUploaded.mimeType,
            firebaseStorageDownloadTokens: generatedToken,
          },
        },
      })
      .then(() => {
        const imageUrl = `https://firebasestorage.googleapis.com/v0/b/${firebaseConfig.storageBucket}/o/${imageFileName}?alt=media&token=${generatedToken}`;
        return db.doc(`/users/${request.user.username}`).update({ imageUrl });
      })
      .then(() => {
        return response.status(200).json({
          message: "Profile picture uploaded successfully",
        });
      })
      .catch((error) => {
        console.error(error);
        return response
          .status(500)
          .json({ error: "Something went wrong. Please try again" });
      });
  });

  request.pipe(busboy);
};

/**
 * Handles any updates related to user details.
 * @param request The request object
 * @param response The response object
 */
export const addUserDetails = (request: Request, response: Response) => {
  let userDetails = reduceUserDetails(request.body);

  db.doc(`/users/${request.user.username}`)
    .update(userDetails)
    .then(() => response.json({ message: "Details updated successfully" }))
    .catch((error) => {
      console.error(error);
      return response.status(500).json({ error: error.code });
    });
};
