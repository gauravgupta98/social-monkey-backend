import { User } from "../types";

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

/**
 * Validates the data which is passed by user for signing up
 * @param data The user data object
 * @returns Object with two values: erros (object) - containg all the errors found and valid (boolean) - whether the data is valid or not.
 */
const validateSignupData = (data: User) => {
  let errors: any = {};

  if (isEmpty(data.email)) {
    errors.email = valueIsEmpty;
  } else if (!isEmail(data.email)) {
    errors.email = "Must be a valid Email Address";
  }

  if (isEmpty(data.username)) errors.username = valueIsEmpty;
  if (isEmpty(data.password)) errors.password = valueIsEmpty;
  if (data.password !== data.confirmPassword)
    errors.confirmPassword = "Passwords must match";

  return {
    errors,
    valid: Object.keys(errors).length === 0,
  };
};

export { validateSignupData };
