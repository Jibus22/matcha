import { ActionFunctionArgs, useOutletContext } from "react-router-dom";
import { Body } from "../styles";
import { IFullUser } from "../../models/user";
import UserProfileCard from "../../components/UserProfileCard";

export async function loader() {
  return null;
}

export async function action({ request }: ActionFunctionArgs) {
  console.log(request);
  return null;
}

export default function Profile() {
  const user = useOutletContext() as IFullUser;

  //TODO: afficher le mail et bouton pour proposer de changer le profile
  return (
    <>
      <Body>
        <UserProfileCard user={user}></UserProfileCard>
      </Body>
    </>
  );
}
