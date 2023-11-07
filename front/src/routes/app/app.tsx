import { Form, Link, Outlet, redirect } from "react-router-dom";
import { GlobalStyle } from "../../style/global-style";
import { Header, PageContent } from "../styles";

export async function loader() {
  // Si je ne suis pas log, rediriger vers "/signin"
  // Si le remplissage du profile n'est pas terminé, renvoyer vers "/register"
  return null;
}

export async function action() {
  // Lancer une requete "/api/signout"
  return redirect("/signin");
}

export default function App() {
  return (
    <>
      <GlobalStyle />
      <Header>
        <Link to="/app">Home</Link>
        <Form method="post" action="/">
          <button type="submit">Sign Out</button>
        </Form>
      </Header>
      <PageContent>
        <Outlet />
      </PageContent>
    </>
  );
}
