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
  isInstanceOfISignupFormErrors,
  signupSanitize,
} from "./utils";

export async function loader() {
  // API check si je suis pas déjà signed in, si oui, rediriger là ou il faut
  return null;
}

export async function action({ request }: ActionFunctionArgs) {
  const formData = await request.formData();
  const inputs = Object.fromEntries(formData);

  const errors = signupSanitize(inputs);
  const err = Object.values(errors).filter((elem) => elem !== null);

  if (err.length > 0) return errors;

  // TODO envoyer une requête à l'API qui va sanitize de son côté
  // const ret = fetch(POST, "/api/signup", {inputs});
  // if (ret.err) return ret.err;

  return redirect("/signin");
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
              required
            ></FormStyleInput>
            {errors?.password && <FormError>{errors.password}</FormError>}
          </div>
          <Button id="signup-btn" type="submit">
            Sign Up
          </Button>
        </SignUpForm>
      </Body>
    </>
  );
}

const SignUpForm = styled(CustomForm)`
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
