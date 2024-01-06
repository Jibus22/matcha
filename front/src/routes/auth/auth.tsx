import { Link, Outlet, redirect } from "react-router-dom";
import { GlobalStyle } from "../../style/global-style";
import { Header, PageContent } from "../styles";
import { apiGetMe } from "../../controllers/user";
import { isProfileFull } from "../../controllers/utils";

export async function loader() {
  const user = await apiGetMe();

  if (user) return redirect(isProfileFull(user) ? "/" : "/register");

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
