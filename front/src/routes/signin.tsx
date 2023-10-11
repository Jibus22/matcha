import { Link } from "react-router-dom";
import styled from "styled-components";
import { BgImage, Body, Button, CustomForm } from "./styles";

const ButtonLink = styled(Link)`
  border-radius: 6px;
  border: 1px solid rgba(98, 91, 102, 0.2);
  padding: 5px 12px;
  font-size: 0.8em;
  background-color: #005eeb;
  color: #dadae5;
`;

const Help = styled.div`
  margin-top: 2em;
  background-color: rgba(218, 167, 250, 0.1);
  backdrop-filter: blur(10px);
  border-radius: 10px;
  display: inline-grid;
  gap: 8px;
`;

export default function Signin() {
  return (
    <>
      <BgImage>
        <img src="/bg-love.png"></img>
      </BgImage>
      <Body>
        <CustomForm method="post" id="login-form">
          <input
            type="text"
            id="username"
            name="username"
            placeholder="Username"
            required
          />
          <input
            type="password"
            id="password"
            name="password"
            placeholder="Password"
            required
          />
          <Button type="submit">Sign In</Button>
        </CustomForm>
        <Help>
          <ButtonLink to="/passwordreset">Forgot password ?</ButtonLink>
          <ButtonLink to="/signup">No user account ? Sign up</ButtonLink>
        </Help>
      </Body>
    </>
  );
}
