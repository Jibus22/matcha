import styled from "styled-components";
import { BgImage, Body, Button, CustomForm } from "./styles";

const SignUpForm = styled(CustomForm)`
  grid-template-areas:
    "firstname firstname lastname lastname"
    "email email email email"
    "button username username username"
    "button password password password";

  grid-template-columns: 1fr 1fr 1fr 1fr;

  width: 80%;

  #firstname {
    grid-area: firstname;
  }
  #lastname {
    grid-area: lastname;
  }
  #username {
    grid-area: username;
  }
  #email {
    grid-area: email;
  }
  #password {
    grid-area: password;
  }
  #signup-btn {
    grid-area: button;
  }

  @media (max-width: 870px) {
    width: 100%;
  }
`;

export default function Signup() {
  return (
    <>
      <BgImage>
        <img src="/candy-love.png"></img>
      </BgImage>
      <Body>
        <SignUpForm method="post" id="login-form">
          <input
            type="text"
            id="firstname"
            name="firstname"
            placeholder="firstname"
            required
          />
          <input
            type="text"
            id="lastname"
            name="lastname"
            placeholder="lastname"
            required
          />
          <input
            type="email"
            id="email"
            name="email"
            placeholder="email"
            required
          />
          <input
            type="text"
            id="username"
            name="username"
            placeholder="username"
            required
          />
          <input
            type="password"
            id="password"
            name="password"
            placeholder="password"
            required
          />
          <Button id="signup-btn" type="submit">
            Sign Up
          </Button>
        </SignUpForm>
      </Body>
    </>
  );
}
