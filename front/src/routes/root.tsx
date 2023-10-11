import { Link, Outlet } from "react-router-dom";
import { GlobalStyle } from "../global-style";
import styled from "styled-components";

const Header = styled.nav`
  z-index: 100;
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  display: flex;
  justify-content: space-between;
  padding: 0.5em 2em;
  font-weight: 400;
  a {
    border-radius: 1em;
    border-color: rgba(216, 209, 255, 0.2);
    border-style: solid;
    border-width: 4px;
    color: black;
    background-color: rgba(255, 19, 93, 0.9);
    padding: 0.4em;
  }
`;

const PageContent = styled.div`
  position: relative;
  height: 100vh;
  min-height: 1200px;
  padding-top: 60px;
  background: rgb(216, 248, 255);
  background: linear-gradient(
    135deg,
    rgba(216, 248, 255, 1) 0%,
    rgba(171, 156, 255, 1) 48%,
    rgba(255, 129, 194, 1) 100%
  );
`;

export default function Root() {
  return (
    <>
      <GlobalStyle />
      <Header>
        <Link to="/">Home</Link> <Link to="/signin">Sign In</Link>
      </Header>
      <PageContent>
        <Outlet />
      </PageContent>
    </>
  );
}
