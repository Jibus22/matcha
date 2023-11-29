import {
  ActionFunctionArgs,
  useActionData,
  useOutletContext,
} from "react-router-dom";
import UserProfileCard from "../register/components/UserProfileCard";
import { Body } from "../styles";
import { IFullUser } from "../../models/user";

export async function loader() {
  return null;
}

export async function action({ request }: ActionFunctionArgs) {
  console.log(request);
  return null;
}

export default function RootIndex() {
  const error = useActionData();
  const user = useOutletContext() as IFullUser;
  const photos = user.photos?.map((elem) => {
    const url = URL.createObjectURL(elem);
    return { url };
  });

  console.log(error);
  console.log("user from outlet context:");
  console.log(user);
  return (
    <>
      <Body>
        <h2>ROOT</h2>
        <UserProfileCard
          user={user}
          photos={photos || [{ url: "" }]}
        ></UserProfileCard>
      </Body>
    </>
  );
}
