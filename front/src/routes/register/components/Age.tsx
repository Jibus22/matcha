import { ReactElement } from "react";
import { Body, RegisterForm, myInputStyle } from "../../styles";
import styled from "styled-components";
import { onBirthDateChange, useBirthdate } from "../store/birthdate.rxjs";

export default function Age({ nextBtn }: { nextBtn?: ReactElement }) {
  const birthdate = useBirthdate();

  return (
    <>
      <Body>
        <h2>Select your birth date</h2>
        <RegisterForm>
          <FormStyleDate
            onChange={onBirthDateChange}
            value={birthdate ? birthdate : ""}
            type="date"
            id="birthdate"
            name="birthdate"
            required
            pattern="\\d{4}-\\d{2}-\\d{2}"
            min="1944-01-01"
            max="2006-01-01"
            title="yyyy-mm-dd"
          ></FormStyleDate>
          {birthdate?.length > 0 &&
            birthdate.match(/(19[3-9]\d)|(20[0-1]\d)-\d{2}-\d{2}/) &&
            nextBtn &&
            nextBtn}
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
