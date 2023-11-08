import { ActionFunctionArgs } from "react-router";
import { Body, Button, CustomForm, FormStyleInput } from "../styles";
import { registrationLoader } from "./utils";

export const loader = registrationLoader(/\/register\/gender\/?/);

export async function action({ request }: ActionFunctionArgs) {
  const formData = await request.formData();
  const inputs = Object.fromEntries(formData);
  console.log(inputs);
  // Requete API pour post/update les données et retour éventuel d'erreurs sinon
  // redirection vers la page suivante.
  return null;
}

// 1st
export default function Gender() {
  return (
    <>
      <Body>
        <h2>Select your gender</h2>
        <CustomForm method="post">
          <FormStyleInput
            type="radio"
            id="female"
            value="female"
            name="gender"
            required
          ></FormStyleInput>
          <label htmlFor="female">female</label>
          <FormStyleInput
            type="radio"
            id="male"
            value="male"
            name="gender"
            required
          ></FormStyleInput>
          <label htmlFor="male">male</label>
          <Button type="submit">Next</Button>
        </CustomForm>
      </Body>
    </>
  );
}
