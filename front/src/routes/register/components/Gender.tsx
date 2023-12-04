import { ReactElement } from "react";
import { Body, RegisterForm, boxStyle, myInputStyle } from "../../styles";
import styled from "styled-components";
import { NavBtnContainer } from "../styles";

export default function Gender({
  backBtn,
  onChange,
  nextBtn,
  gender,
}: {
  backBtn?: ReactElement;
  onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  nextBtn?: ReactElement;
  gender: string;
}) {
  return (
    <>
      <Body>
        <h2>Select your gender</h2>
        <RegisterForm>
          <FormStyleRadio
            onChange={onChange}
            type="radio"
            id="female"
            value="female"
            name="gender"
            defaultChecked={gender == "female" ? true : false}
            required
          ></FormStyleRadio>
          <label htmlFor="female">female</label>
          <FormStyleRadio
            onChange={onChange}
            type="radio"
            id="male"
            value="male"
            name="gender"
            defaultChecked={gender == "male" ? true : false}
            required
          ></FormStyleRadio>
          <label htmlFor="male">male</label>
          <NavBtnContainer>
            <div>{backBtn && backBtn}</div>
            <div>{gender.length > 0 && nextBtn && nextBtn}</div>
          </NavBtnContainer>
        </RegisterForm>
      </Body>
    </>
  );
}

const FormStyleRadio = styled.input`
  ${myInputStyle}
  ${boxStyle}
  width: auto;
  margin: 1em 1em;
`;
