import { ActionFunctionArgs, useOutletContext } from "react-router-dom";
import { Body } from "../styles";
import { IFullUser } from "../../models/user";

export async function loader() {
  return null;
}

export async function action({ request }: ActionFunctionArgs) {
  console.log(request);
  return null;
}

export default function Stalkers() {
  const user = useOutletContext() as IFullUser;

  console.log(user);

  return (
    <>
      <Body>
        <h2>STALKERS</h2>
      </Body>
    </>
  );
}
