import { Form, Link, Outlet, redirect, useLoaderData } from "react-router-dom";
import { GlobalStyle } from "../../style/global-style";
import { HeaderRoot, PageContentRoot } from "../styles";
import { apiGetUser } from "../../controllers/user";
import { apiSignout } from "../../controllers/auth";
import { isProfileFull } from "../../controllers/utils";
import { IFullUser } from "../../models/user";
import styled from "styled-components";
import { indexedDBPopulate } from "../../mockdata/mockingFactory";

export async function loader() {
  const user = await apiGetUser();

  if (!user) return redirect("/auth");

  if (!isProfileFull(user)) return redirect("/register");

  await indexedDBPopulate(); // If user's indexedDB is empty, populate it

  return user;
}

export async function action() {
  apiSignout();
  return redirect("/auth/signin");
}

export default function Root() {
  const user = useLoaderData() as IFullUser;

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
        </SideNav>
        <MainElement>
          <Outlet context={user} />
        </MainElement>
      </PageContentRoot>
    </>
  );
}

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
`;
