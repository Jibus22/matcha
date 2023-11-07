import { ActionFunctionArgs, useActionData } from "react-router-dom";
import {
  BgImage,
  Body,
  Button,
  CustomForm,
  FormError,
  FormStyleInput,
  FormValidMsg,
} from "../styles";
import { emailSanitize, isInstanceOfEmailInput } from "./utils";

export async function loader() {
  // API check si je suis pas déjà signed in, si oui, rediriger là ou il faut
  // (On reset le pwd via cette page que si on est logged out)
  return null;
}

export async function action({ request }: ActionFunctionArgs) {
  const formData = await request.formData();
  const inputs = Object.fromEntries(formData);

  const errors = emailSanitize(inputs);
  const err = Object.values(errors).filter((elem) => elem !== null);

  if (err.length > 0) return errors;

  // TODO envoyer une requête à l'API qui va sanitize de son côté
  // const ret = fetch(POST, "/api/pwdreset", {inputs});
  // if (ret.err) return ret.err;

  //TODO: Si l'API renvoie pas d'err, il faut afficher au user un msg qui lui
  // dit de checker ses mails pour confirmer le chgmt de pwd.
  return `Please check your mails to confirm your password reset`;
}

export default function PasswordReset() {
  const ret = useActionData();
  let errors: { email: string | null } | null = null;
  let confirmation: string | null = null;

  if (ret && typeof ret === "string") {
    confirmation = ret;
  } else if (ret && isInstanceOfEmailInput(ret)) {
    errors = ret;
  }

  return (
    <>
      <BgImage>{<img src="/sexy-candy.png"></img>}</BgImage>
      <Body>
        <CustomForm method="post" id="login-form">
          <FormStyleInput
            $errors={errors?.email ? true : false}
            type="email"
            id="email"
            name="email"
            placeholder="email"
            required
          ></FormStyleInput>
          {errors?.email && <FormError>{errors.email}</FormError>}
          {confirmation ? (
            <FormValidMsg>{confirmation}</FormValidMsg>
          ) : (
            <Button type="submit">Send a new password</Button>
          )}
        </CustomForm>
      </Body>
    </>
  );
}
