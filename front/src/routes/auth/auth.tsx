import { Link, Outlet, redirect } from "react-router-dom";
import { GlobalStyle } from "../../style/global-style";
import { Header, PageContent } from "../styles";
import { apiGetUser } from "../../controllers/user";

export async function loader() {
  const user = apiGetUser();

  if (user) return redirect(user.registered ? "/" : "/register");

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
