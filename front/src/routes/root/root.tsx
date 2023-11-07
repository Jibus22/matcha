import { Form, Link, Outlet, redirect } from "react-router-dom";
import { GlobalStyle } from "../../style/global-style";
import { Header, PageContent } from "../styles";
import { apiGetUser } from "../utils";

export async function loader() {
  const user = apiGetUser();

  if (!user) return redirect("/auth");

  // Redirige vers root ou une étape d'enregistrement
  return redirect(user.registration);
}

export async function action() {
  // Lancer une requete "/api/signout"
  return redirect("/auth/signin");
}

export default function Root() {
  return (
    <>
      <GlobalStyle />
      <Header>
        <Link to="/">Home</Link>
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
