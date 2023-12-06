import { ActionFunctionArgs, useLoaderData } from "react-router-dom";
import { Body } from "../styles";
import { IFullUser } from "../../models/user";
import { apiGetUsers } from "../../controllers/user";

export async function loader() {
  const users = await apiGetUsers();
  return users;
}

export async function action({ request }: ActionFunctionArgs) {
  console.log(request);
  return null;
}

export default function RootIndex() {
  const allUsers = useLoaderData() as IFullUser[];
  // const {users, loadUsers} = useOutletContext();
  // const { query } = useLoaderData();
  // useEffect(() => {
  //   loadUsers();
  //   // ->> user est un state managé avec rxjs et loadUsers est un user setter
  //   // qui va appeler une api avec une pipeline de rate limiting
  // }, [query]);

  return (
    <>
      <Body>
        <h2>ROOT</h2>
        <ul>
          {allUsers.map((user, idx) => {
            return <li key={idx}>{user.username}</li>;
          })}
        </ul>
      </Body>
    </>
  );
}
