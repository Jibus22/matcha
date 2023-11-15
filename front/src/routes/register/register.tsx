import { Form, Outlet, redirect } from "react-router-dom";
import { GlobalStyle } from "../../style/global-style";
import { Header, PageContent } from "../styles";
import { apiGetUser } from "../../controllers/user";
import { apiSignout } from "../../controllers/auth";

export async function loader() {
  const user = apiGetUser();

  if (!user) return redirect("/auth");

  if (user.registered) return redirect("/");

  return null;
}

export async function action() {
  apiSignout();
  return redirect("/auth/signin");
}

export default function Register() {
  return (
    <>
      <GlobalStyle />
      <Header>
        <Form method="post">
          <button type="submit">Sign Out</button>
        </Form>
      </Header>
      <PageContent>
        <Outlet />
      </PageContent>
    </>
  );
}
