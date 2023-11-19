import styled from "styled-components";
import {
  BgImage,
  Body,
  Button,
  CustomForm,
  FormError,
  FormStyleInput,
} from "../styles";
import { ActionFunctionArgs, redirect, useActionData } from "react-router-dom";
import {
  ISignupFormErrors,
  firstnameRegexPattern,
  isInstanceOfISignupFormErrors,
  isInstanceOfISignupInput,
  lastnameRegexPattern,
  mailRegexPattern,
  passwordRegexPattern,
  signupSanitize,
  usernameRegexPattern,
} from "./utils";
import { apiSignup } from "../../controllers/auth";

const wrongData = {
  email: null,
  firstname: null,
  lastname: null,
  password: null,
  username: null,
  err: "wrong data",
};

export async function loader() {
  // API check si je suis pas déjà signed in, si oui, rediriger là ou il faut
  return null;
}

export async function action({ request }: ActionFunctionArgs) {
  const formData = await request.formData();
  const inputs = Object.fromEntries(formData);

  if (!isInstanceOfISignupInput(inputs)) return wrongData;

  const errors = signupSanitize(inputs);
  const err = Object.values(errors).filter((elem) => elem !== null);

  if (err.length > 0) return errors;

  const apiResponse = apiSignup(inputs);

  if (apiResponse) return apiResponse;

  return redirect("/auth/signin");
}

export default function Signup() {
  const error = useActionData();
  let errors: ISignupFormErrors | null = null;

  if (error && isInstanceOfISignupFormErrors(error)) errors = error;

  return (
    <>
      <BgImage>
        <img src="/candy-love.png"></img>
      </BgImage>
      <Body>
        <SignUpForm method="post" id="login-form">
          <div id="firstname-ctnr">
            <FormStyleInput
              $errors={errors?.firstname ? true : false}
              type="text"
              id="firstname"
              name="firstname"
              placeholder="firstname"
              title="firstname must contains between 2 and 30 alphabetical characters"
              required
            ></FormStyleInput>
            {errors?.firstname && <FormError>{errors.firstname}</FormError>}
          </div>
          <div id="lastname-ctnr">
            <FormStyleInput
              $errors={errors?.lastname ? true : false}
              type="text"
              id="lastname"
              name="lastname"
              placeholder="lastname"
              pattern={lastnameRegexPattern}
              title="lastname must contains between 3 and 20 alphabetical characters"
              required
            ></FormStyleInput>
            {errors?.lastname && <FormError>{errors.lastname}</FormError>}
          </div>
          <div id="email-ctnr">
            <FormStyleInput
              $errors={errors?.email ? true : false}
              type="email"
              id="email"
              name="email"
              placeholder="email"
              title="email must be of the form 'name@mailbox.domain'"
              required
            ></FormStyleInput>
            {errors?.email && <FormError>{errors.email}</FormError>}
          </div>
          <div id="username-ctnr">
            <FormStyleInput
              $errors={errors?.username ? true : false}
              type="text"
              id="username"
              name="username"
              placeholder="username"
              minLength={4}
              maxLength={15}
              pattern={usernameRegexPattern}
              title="4 to 15 characters [a-z] and one surrounded dash allowed"
              required
            ></FormStyleInput>
            {errors?.username && <FormError>{errors.username}</FormError>}
          </div>
          <div id="password-ctnr">
            <FormStyleInput
              $errors={errors?.password ? true : false}
              type="password"
              id="password"
              name="password"
              placeholder="password"
              minLength={7}
              maxLength={50}
              title="7 to 50 alphanumeric and special characters allowed"
              required
            ></FormStyleInput>
            {errors?.password && <FormError>{errors.password}</FormError>}
          </div>
          <Button id="signup-btn" type="submit">
            Sign Up
          </Button>
        </SignUpForm>
        {errors?.err && <FormError>{errors.err}</FormError>}
      </Body>
    </>
  );
}

const SignUpForm = styled(CustomForm)`
  input:valid {
    border: 2px solid rgb(114, 219, 88);
  }

  grid-template-areas:
    "firstname firstname lastname lastname"
    "email email email email"
    "button username username username"
    "button password password password";

  grid-template-columns: 1fr 1fr 1fr 1fr;

  width: 80%;

  #firstname-ctnr {
    grid-area: firstname;
  }
  #lastname-ctnr {
    grid-area: lastname;
  }
  #username-ctnr {
    grid-area: username;
  }
  #email-ctnr {
    grid-area: email;
  }
  #password-ctnr {
    grid-area: password;
  }
  #signup-btn {
    grid-area: button;
  }

  @media (max-width: 870px) {
    width: 100%;
  }
`;
