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
  console.log("root index loader:start:");
  const user = await apiGetUser();
  console.log("root index loader user:");
  console.log(user);
  console.log("root index loader:end:");

  return user;
}

export async function action({ request }: ActionFunctionArgs) {
  console.log(request);
  return null;
}

export default function RootIndex() {
  const error = useActionData();
  const user = useLoaderData() as IUser & IProfile & { registered: boolean };
  const photos = user.photos?.map((elem) => {
    const url = URL.createObjectURL(elem);
    return { url };
  });

  console.log(error);
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
