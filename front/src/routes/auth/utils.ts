export const mailRegex = /^\w+([-.]\w+)*@\w+([-.]\w+)*\.\w+$/;
export const passwordRegex = /^([\w\d.,#!?$%^&*;:"'{}\/\\=`~()-<>]{7,50})$/;
export const usernameRegex = /^([a-z]+(-[a-z]+$)?){4,15}$/i;
const firstnameRegex = /^[a-z-]{2,30}$/i;
const lastnameRegex = /^([a-z]+( *[a-z]+){0,2}){3,20}$/i;

export const mailRegexPattern = "^\\w+([-.]\\w+)*@\\w+([-.]\\w+)*\\.\\w+$";
console.log(mailRegexPattern);
export const passwordRegexPattern =
  "^([\\w\\d.,#!?$%^&*;:\"'{}/\\=`~()-<>]{7,50})$";
export const usernameRegexPattern = "^([a-zA-Z]+(-[a-zA-Z]+$)?){4,15}$";
export const firstnameRegexPattern = "^[a-zA-Z-]{2,30}$";
export const lastnameRegexPattern = "^([a-zA-Z]+( *[a-zA-Z]+){0,2}){3,20}$";

export interface ISigninInput {
  password: string;
  username: string;
}

export interface ISignupInput extends ISigninInput {
  email: string;
  firstname: string;
  lastname: string;
}

export const isInstanceOfISigninInput = (
  object: any
): object is ISigninInput => {
  return "password" in object && "username" in object;
};

export const isInstanceOfISignupInput = (
  object: any
): object is ISignupInput => {
  return (
    "email" in object &&
    "firstname" in object &&
    "lastname" in object &&
    "password" in object &&
    "username" in object
  );
};

export const isInstanceOfEmailInput = (
  object: any
): object is { email: string } => {
  return "email" in object;
};

export interface ISigninFormErrors {
  password: string | null;
  username: string | null;
  err: string | null;
}

export interface ISignupFormErrors extends ISigninFormErrors {
  email: string | null;
  firstname: string | null;
  lastname: string | null;
}

export const isInstanceOfISigninFormErrors = (
  object: any
): object is ISigninFormErrors => {
  return "password" in object && "username" in object;
};

export const isInstanceOfISignupFormErrors = (
  object: any
): object is ISignupFormErrors => {
  return (
    "email" in object &&
    "firstname" in object &&
    "lastname" in object &&
    "password" in object &&
    "username" in object
  );
};

const passwordSanitize = (password: string) => {
  if (/\w/.test(password) == false)
    return "password must contain at least one alphabetical character";
  if (/\d/.test(password) == false)
    return "password must contain at least one digit";
  if (/[.,#!?$%^&*;:"'{}\/\\=`~()-<>]/.test(password) == false)
    return "password must contain at least one special character (?./+=:;,!) ...";
  if (passwordRegex.test(password) == false)
    return "password must contain 7 to 50 characters";
  return null;
};

export const signupSanitize = (inputs: { [k: string]: FormDataEntryValue }) => {
  let errors: ISignupFormErrors = {
    email: null,
    firstname: null,
    lastname: null,
    password: null,
    username: null,
    err: null,
  };

  if (isInstanceOfISignupInput(inputs)) {
    errors.email = mailRegex.test(inputs.email)
      ? null
      : "email must be of the form 'name@mailbox.domain'";
    errors.firstname = firstnameRegex.test(inputs.firstname)
      ? null
      : "firstname must contains between 2 and 30 alphabetical characters";
    errors.lastname = lastnameRegex.test(inputs.lastname)
      ? null
      : "lastname must contains between 3 and 20 alphabetical characters";
    errors.password = passwordSanitize(inputs.password);
    errors.username = usernameRegex.test(inputs.username)
      ? null
      : "username must contains between 5 and 15 alphabetical characters";
  } else {
    errors.err = "wrong data";
  }
  return errors;
};

export const signinSanitize = (inputs: { [k: string]: FormDataEntryValue }) => {
  let errors: ISigninFormErrors = {
    username: null,
    password: null,
    err: null,
  };

  if (isInstanceOfISigninInput(inputs)) {
    errors.password = passwordSanitize(inputs.password);
    errors.username = usernameRegex.test(inputs.username)
      ? null
      : "username must contains between 4 and 15 alphanumeric characters";
  } else {
    errors.err = "wrong data";
  }
  return errors;
};

export const emailSanitize = (inputs: { [k: string]: FormDataEntryValue }) => {
  let errors: { email: string | null } = {
    email: null,
  };

  if (isInstanceOfEmailInput(inputs)) {
    errors.email = mailRegex.test(inputs.email)
      ? null
      : "email must be of the form 'name@mailbox.domain'";
  } else {
    errors.email = "wrong data";
  }
  return errors;
};
