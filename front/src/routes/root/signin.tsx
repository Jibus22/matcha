import {
  ActionFunctionArgs,
  Link,
  redirect,
  useActionData,
} from "react-router-dom";
import styled from "styled-components";
import {
  ISigninFormErrors,
  isInstanceOfISigninFormErrors,
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

export async function loader() {
  // API check si je suis pas déjà signed in, si oui, rediriger là ou il faut
  return null;
}

export async function action({ request }: ActionFunctionArgs) {
  const formData = await request.formData();
  const inputs = Object.fromEntries(formData);

  const errors = signinSanitize(inputs);
  const err = Object.values(errors).filter((elem) => elem !== null);

  if (err.length > 0) return errors;

  // TODO envoyer une requête à l'API qui va sanitize de son côté
  // const ret = fetch(POST, "/api/signin", {inputs});
  // if (ret.err) return ret.err;

  //TODO: rediriger vers "/app" si profile complet, sinon "/register"
  return redirect("/register");
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
        </CustomForm>
        <Help>
          <ButtonLink to="/passwordreset">Forgot password ?</ButtonLink>
          <ButtonLink to="/signup">No user account ? Sign up</ButtonLink>
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
