import { ReactElement } from "react";
import { Body, RegisterForm, boxStyle, myInputStyle } from "../../styles";
import styled from "styled-components";

export default function Gender({
  onChange,
  nextBtn,
  gender,
}: {
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
            defaultChecked={gender.length ? true : false}
            required
          ></FormStyleRadio>
          <label htmlFor="female">female</label>
          <FormStyleRadio
            onChange={onChange}
            type="radio"
            id="male"
            value="male"
            name="gender"
            defaultChecked={gender.length ? true : false}
            required
          ></FormStyleRadio>
          <label htmlFor="male">male</label>
          {gender.length > 0 && nextBtn && nextBtn}
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
