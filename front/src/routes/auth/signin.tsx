import {
  ActionFunctionArgs,
  Link,
  redirect,
  useActionData,
} from "react-router-dom";
import styled from "styled-components";
import {
  ISigninFormErrors,
  ISigninInput,
  isInstanceOfISigninFormErrors,
  isInstanceOfISigninInput,
  signinSanitize,
} from "./utils";
import {
  BgImage,
  Body,
  Button,
  CustomForm,
  FormError,
  FormStyleInput,
} from "../styles";

const wrongData = {
  username: null,
  password: null,
  err: "wrong data",
};

const apiSignin = (inputs: ISigninInput) => {
  // TODO envoyer une requête à l'API qui va sanitize de son côté
  // const ret = fetch(POST, "/api/signin", {inputs});
  const err = { username: null, password: null, err: "authentication error" };

  let user = sessionStorage.user;
  if (!user) {
    return { err: err };
  } else {
    user = JSON.parse(user);
  }
  if (inputs.username !== user.username || inputs.password !== user.password)
    return { err: err };

  // mimic session cookie from server
  sessionStorage.setItem("session_id", "false_session_id_0123456789");
  // registration contient le stade d'enregistrement du user (la route)
  return { registration: user.registration };
};

export async function loader() {
  // API check si je suis pas déjà signed in, si oui, rediriger là ou il faut
  return null;
}

export async function action({ request }: ActionFunctionArgs) {
  const formData = await request.formData();
  const inputs = Object.fromEntries(formData);

  if (!isInstanceOfISigninInput(inputs)) return wrongData;

  const errors = signinSanitize(inputs);
  const err = Object.values(errors).filter((elem) => elem !== null);

  if (err.length > 0) return errors;

  const apiResponse = apiSignin(inputs);

  if (apiResponse?.err) return apiResponse?.err;

  return redirect(apiResponse.registration);
}

export default function Signin() {
  const error = useActionData();
  let errors: ISigninFormErrors | null = null;

  if (error && isInstanceOfISigninFormErrors(error)) errors = error;

  return (
    <>
      <BgImage>
        <img src="/bg-love.png"></img>
      </BgImage>
      <Body>
        <CustomForm method="post" id="login-form">
          <FormStyleInput
            $errors={errors?.username ? true : false}
            type="text"
            id="username"
            name="username"
            placeholder="username"
            required
          ></FormStyleInput>
          {errors?.username && <FormError>{errors.username}</FormError>}
          <FormStyleInput
            $errors={errors?.password ? true : false}
            type="password"
            id="password"
            name="password"
            placeholder="password"
            required
          ></FormStyleInput>
          {errors?.password && <FormError>{errors.password}</FormError>}
          <Button type="submit">Sign In</Button>
          {errors?.err && <FormError>{errors.err}</FormError>}
        </CustomForm>
        <Help>
          <ButtonLink to="/auth/passwordreset">Forgot password ?</ButtonLink>
          <ButtonLink to="/auth/signup">No user account ? Sign up</ButtonLink>
        </Help>
      </Body>
    </>
  );
}

const ButtonLink = styled(Link)`
  border-radius: 6px;
  border: 1px solid rgba(98, 91, 102, 0.2);
  padding: 5px 12px;
  font-size: 0.8em;
  background-color: #005eeb;
  color: #dadae5;
`;

const Help = styled.div`
  margin-top: 2em;
  background-color: rgba(218, 167, 250, 0.1);
  backdrop-filter: blur(10px);
  border-radius: 10px;
  display: inline-grid;
  gap: 8px;
`;
