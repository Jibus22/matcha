import { Link, Outlet } from "react-router-dom";
import { GlobalStyle } from "../../style/global-style";
import { Header, PageContent } from "../styles";

export async function loader() {
  // Si je suis log, rediriger vers "/app"
  return null;
}

export default function Root() {
  return (
    <>
      <GlobalStyle />
      <Header>
        <Link to="/">Home</Link>
        <Link to="/signin">Sign In</Link>
      </Header>
      <PageContent>
        <Outlet />
      </PageContent>
    </>
  );
}
