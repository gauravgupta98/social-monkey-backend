import { AdditionalUserData, UserDataLogin, UserDataSignUp } from "../types";

/**
 * Validates the email
 * @param email The email string
 * @returns Returns true, if string is email, else false
 */
const isEmail = (email: string): boolean => {
  const regEx =
    /^(([^<>()\[\]\\.,;:\s@"]+(\.[^<>()\[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;
  if (email.match(regEx)) return true;
  else return false;
};

/**
 * Checks if the string is empty
 * @param string This string value
 * @returns Returns true, if string is empty, else false
 */
const isEmpty = (string: string): boolean => {
  if (string.trim() === "") return true;
  else return false;
};

const valueIsEmpty: string = "Must not be empty";
const invalidRequestBody: string =
  "Fatal! Parameters in request body are missing. Please provide all the required parameters to continue";

/**
 * Validates the data which is passed by user for signing up
 * @param data The user data object
 * @returns Object with two values: errors (object) - containg all the errors found and valid (boolean) - whether the data is valid or not.
 */
const validateSignupData = (data: UserDataSignUp) => {
  let errors: any = {};

  if (
    data.email === undefined ||
    data.password === undefined ||
    data.confirmPassword === undefined ||
    data.username === undefined
  ) {
    errors.error = invalidRequestBody;
  } else {
    if (isEmpty(data.email)) {
      errors.email = valueIsEmpty;
    } else if (!isEmail(data.email)) {
      errors.email = "Must be a valid Email Address";
    }

    if (isEmpty(data.username)) errors.username = valueIsEmpty;
    if (isEmpty(data.password)) errors.password = valueIsEmpty;
    if (data.password !== data.confirmPassword)
      errors.confirmPassword = "Passwords must match";
  }

  return {
    errors,
    valid: Object.keys(errors).length === 0,
  };
};

/**
 * Validates the data which is passed by user for logging in
 * @param data The user data object
 * @returns Object with two values: errors (object) - containg all the errors found and valid (boolean) - whether the data is valid or not.
 */
const validateLoginData = (data: UserDataLogin) => {
  let errors: any = {};

  if (data.email === undefined || data.password === undefined) {
    errors.error = invalidRequestBody;
  } else {
    if (isEmpty(data.email)) errors.email = valueIsEmpty;
    if (isEmpty(data.password)) errors.password = valueIsEmpty;
  }

  return {
    errors,
    valid: Object.keys(errors).length === 0,
  };
};

/**
 * Extracts the non mandatory user details from the data passed.
 * @param data The user data object
 * @returns Object with user details - bio, website, location.
 */
const reduceUserDetails = (data: AdditionalUserData) => {
  let userDetails: AdditionalUserData = {
    bio: data?.bio?.trim(),
    website: data?.website?.trim(),
    location: data?.location?.trim(),
  };

  if (userDetails.website?.substring(0, 4) !== "http") {
    userDetails.website = `http://${data.website}`;
  }

  return userDetails;
};

export { reduceUserDetails, validateSignupData, validateLoginData };
