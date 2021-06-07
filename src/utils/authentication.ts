import admin from "firebase-admin";

import db, { firebaseConfig } from "./firebase";

admin.initializeApp(firebaseConfig);

/**
 * Authorizes any request by validating the authorization header from request object.
 * @param request The request object
 * @param response The response object
 * @param next The callback function which will be executed if authorization is successful.
 */
export default (request: any, response: any, next: Function) => {
  let idToken;
  if (
    request.headers.authorization &&
    request.headers.authorization.startsWith("Bearer ") &&
    request.headers.authorization.split("Bearer ").length > 1
  ) {
    idToken = request.headers.authorization.split("Bearer ")[1];
  } else {
    console.error("No token found");
    return response.status(403).json({ error: "Unauthorized" });
  }

  admin
    .auth()
    .verifyIdToken(idToken)
    .then((decodedToken) => {
      request.user = decodedToken;
      return db
        .collection("users")
        .where("userId", "==", request.user.uid)
        .limit(1)
        .get();
    })
    .then((data) => {
      request.user.username = data.docs[0]?.data()?.username;
      return next();
    })
    .catch((error) => {
      console.error("Error while verifying token: ", error);
      return response.status(403).json(error);
    });
};
