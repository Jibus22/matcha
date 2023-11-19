import {
  ActionFunctionArgs,
  useActionData,
  useLoaderData,
} from "react-router-dom";
import { apiGetUser } from "../../controllers/user";
import { IProfile } from "../../models/profile";
import { IUser } from "../../models/user";
import UserProfileCard from "../register/components/UserProfileCard";
import { Body } from "../styles";

export async function loader() {
  const user = await apiGetUser();

  return user;
}

export async function action({ request }: ActionFunctionArgs) {
  return null;
}

export default function RootIndex() {
  const error = useActionData();
  const user = useLoaderData() as IUser & IProfile & { registered: boolean };

  console.log("user:");
  console.log(user);

  const photos = user.photos?.map((elem) => {
    const url = URL.createObjectURL(elem);
    return { url };
  });

  console.log("photos:");
  console.log(photos);

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
