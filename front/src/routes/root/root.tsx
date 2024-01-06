import {
  Form,
  Link,
  Outlet,
  redirect,
  useLoaderData,
  useLocation,
} from "react-router-dom";
import { GlobalStyle } from "../../style/global-style";
import { HeaderRoot, PageContentRoot } from "../styles";
import { apiGetInterestingUsers, apiGetMe } from "../../controllers/user";
import { apiSignout } from "../../controllers/auth";
import { isProfileFull } from "../../controllers/utils";
import { IFullUser } from "../../models/user";
import styled from "styled-components";
import { indexedDBPopulate } from "../../mockdata/mockingFactory";
import { updateUser } from "../../store/user.rxjs";
import { updateUsers } from "../../store/users.rxjs";
import {
  toggleFilterWindow,
  toggleSortingWindow,
} from "./store/rootOptionsButtons.rxjs";

export async function loader() {
  const user = await apiGetMe();

  if (!user) return redirect("/auth");

  if (!isProfileFull(user)) return redirect("/register");

  await indexedDBPopulate(); // If user's indexedDB is empty, populate it

  const users = await apiGetInterestingUsers();

  return [users, user];
}

export async function action() {
  apiSignout();
  return redirect("/auth/signin");
}

export default function Root() {
  const [users, user] = useLoaderData() as [IFullUser[], IFullUser];
  const location = useLocation();
  updateUser(user);
  updateUsers(users);

  return (
    <>
      <GlobalStyle />
      <HeaderRoot>
        <Link to="/">Home</Link>
        <Form method="post">
          <button type="submit">Sign Out</button>
        </Form>
      </HeaderRoot>
      <PageContentRoot>
        <SideNav>
          <Link to="admirers">admirers</Link>
          <Link to="stalkers">stalkers</Link>
          <Link to="profile">profile</Link>
          {location.pathname === "/" && (
            <RootOptions>
              <RootOptionsBtn onClick={toggleSortingWindow}>
                Sort
              </RootOptionsBtn>
              <RootOptionsBtn onClick={toggleFilterWindow}>
                Filter
              </RootOptionsBtn>
            </RootOptions>
          )}
        </SideNav>
        <MainElement>
          <Outlet />
        </MainElement>
      </PageContentRoot>
    </>
  );
}
const RootOptions = styled.div`
  display: flex;
  flex-direction: column;
  gap: 5px;
  margin: 20px 0px;
`;
const RootOptionsBtn = styled.button`
  padding: 0.3em;
  border-radius: 10px;
  border: none;
  background: rgb(238, 179, 255);
  font-weight: 300;
  color: rgb(108, 84, 115);

  &:hover {
    cursor: pointer;
  }
`;

const SideNav = styled.nav`
  display: flex;
  flex-direction: column;
  width: 10%;
  min-width: 120px;
  padding: 1em 1em 1em 2em;

  > a {
    text-decoration: none;
    color: rgba(110, 130, 240, 0.9);
    background: rgba(250, 245, 255, 0.3);
    margin: 0.15em 0em;
    border: 1px solid rgba(230, 220, 250, 0.4);
    border-radius: 4px;
    padding: 0em 0.2em;
  }
`;

const MainElement = styled.div`
  width: 100%;
  background: rgba(252, 252, 252, 0.9);
  border-top-left-radius: 8px;
  border: 1px solid black;
  overflow: scroll;
  height: calc(100vh - 60px);
  position: relative;
`;
