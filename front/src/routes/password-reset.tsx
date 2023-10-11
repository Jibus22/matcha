import { BgImage, Body, Button, CustomForm } from "./styles";

export default function PasswordReset() {
  return (
    <>
      <BgImage>
        <img src="/sexy-candy.png"></img>
      </BgImage>
      <Body>
        <CustomForm method="post" id="login-form">
          <input
            type="email"
            id="email"
            name="email"
            placeholder="email"
            required
          />
          <Button type="submit">Send a new password</Button>
        </CustomForm>
      </Body>
    </>
  );
}
