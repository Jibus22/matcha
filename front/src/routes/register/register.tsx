import { Form, Outlet, redirect } from "react-router-dom";
import { GlobalStyle } from "../../style/global-style";
import { Header, PageContent } from "../styles";

export async function loader() {
  // Si je ne suis pas log, rediriger vers "/signin"
  // Si le remplissage du profile n'est pas terminé, renvoyer vers "/register/XX"
  // Où 'XX' correspond au stade de remplissage. Sinon renvoyer vers "/app"
  return null;
}

export async function action() {
  // Lancer une requete "/api/signout"
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
