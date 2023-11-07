import { Link, Outlet } from "react-router-dom";
import { GlobalStyle } from "../../style/global-style";
import { Header, PageContent } from "../styles";

export async function loader() {
  // Si je suis log, rediriger vers "/"
  return null;
}

export default function Auth() {
  return (
    <>
      <GlobalStyle />
      <Header>
        <Link to="/auth">Home</Link>
        <Link to="/auth/signin">Sign In</Link>
      </Header>
      <PageContent>
        <Outlet />
      </PageContent>
    </>
  );
}
