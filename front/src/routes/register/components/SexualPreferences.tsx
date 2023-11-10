import { ReactElement } from "react";
import {
  Body,
  FormStyleInput,
  RegisterForm,
  boxStyle,
  myInputStyle,
} from "../../styles";
import { NavBtnContainer } from "../styles";
import styled from "styled-components";

export default function SexualPreferences({
  backBtn,
  nextBtn,
  onChange,
  sexPreference,
}: {
  backBtn?: ReactElement;
  nextBtn?: ReactElement;
  onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  sexPreference: Set<string>;
}) {
  return (
    <>
      <Body>
        <h2>Select your sexual preferences</h2>
        <RegisterForm>
          <FormStyleCheckbox
            onChange={onChange}
            type="checkbox"
            id="female"
            value="female"
            name="gender"
            defaultChecked={sexPreference && sexPreference.has("female")}
          ></FormStyleCheckbox>
          <label htmlFor="female">female</label>
          <FormStyleCheckbox
            onChange={onChange}
            type="checkbox"
            id="male"
            value="male"
            name="gender"
            defaultChecked={sexPreference && sexPreference.has("male")}
          ></FormStyleCheckbox>
          <label htmlFor="male">male</label>
          <NavBtnContainer>
            <div>{backBtn && backBtn}</div>
            <div>{sexPreference?.size > 0 && nextBtn && nextBtn}</div>
          </NavBtnContainer>
        </RegisterForm>
      </Body>
    </>
  );
}

const FormStyleCheckbox = styled.input`
  ${myInputStyle}
  ${boxStyle}
  width: auto;
  margin: 1em 1em;
`;
