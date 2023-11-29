import { Form, Outlet, redirect, useLoaderData } from "react-router-dom";
import { GlobalStyle } from "../../style/global-style";
import { Header, PageContent } from "../styles";
import { apiGetUser } from "../../controllers/user";
import { apiSignout } from "../../controllers/auth";
import { isProfileFull } from "../../controllers/utils";
import { IFullUser } from "../../models/user";

export async function loader() {
  const user = await apiGetUser();

  if (!user) return redirect("/auth");

  if (isProfileFull(user)) return redirect("/");

  return user;
}

export async function action() {
  apiSignout();
  return redirect("/auth/signin");
}

export default function Register() {
  const user = useLoaderData() as IFullUser;

  return (
    <>
      <GlobalStyle />
      <Header>
        <Form method="post">
          <button type="submit">Sign Out</button>
        </Form>
      </Header>
      <PageContent>
        <Outlet context={user} />
      </PageContent>
    </>
  );
}
