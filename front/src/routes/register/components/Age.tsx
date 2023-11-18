import { ReactElement } from "react";
import { Body, RegisterForm, myInputStyle } from "../../styles";
import styled from "styled-components";

export default function Age({
  onChange,
  nextBtn,
  birthdate,
}: {
  onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  nextBtn?: ReactElement;
  birthdate: string;
}) {
  return (
    <>
      <Body>
        <h2>Select your birth date</h2>
        <RegisterForm>
          <FormStyleDate
            onChange={onChange}
            type="date"
            id="birthdate"
            name="birthdate"
            required
            pattern="\d{4}-\d{2}-\d{2}"
            min="1944-01-01"
            max="2006-01-01"
            title="yyyy-mm-dd"
          ></FormStyleDate>
          {birthdate.length > 0 && nextBtn && nextBtn}
        </RegisterForm>
      </Body>
    </>
  );
}

const FormStyleDate = styled.input`
  ${myInputStyle}
  width: auto;
  margin: 1em 1em;
  border: none;
`;
