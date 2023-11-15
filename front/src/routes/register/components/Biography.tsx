import { ReactElement } from "react";
import { Body, RegisterForm, myInputStyle } from "../../styles";
import { NavBtnContainer } from "../styles";
import styled from "styled-components";

export default function Biography({
  backBtn,
  nextBtn,
  onChange,
  biography,
}: {
  backBtn?: ReactElement;
  nextBtn?: ReactElement;
  onChange: (e: React.ChangeEvent<HTMLTextAreaElement>) => void;
  biography: string;
}) {
  return (
    <>
      <Body>
        <h2>Add you biography</h2>
        <BiographyForm>
          <label htmlFor="biography">between 20 and 500 characters</label>
          <FormStyleTextArea
            onChange={onChange}
            id="biography"
            name="biography"
            defaultValue={biography}
            autoFocus
            maxLength={500}
            minLength={20}
            rows={10}
            cols={50}
          ></FormStyleTextArea>
          <p>{biography.length}/500 characters</p>
          <NavBtnContainer>
            <div>{backBtn && backBtn}</div>
            <div>{biography.length >= 20 && nextBtn && nextBtn}</div>
          </NavBtnContainer>
        </BiographyForm>
      </Body>
    </>
  );
}

const BiographyForm = styled(RegisterForm)`
  label,
  p {
    font-size: calc(0.85rem + 0.1vw);
  }
`;

const FormStyleTextArea = styled.textarea`
  ${myInputStyle}
  background-color: rgba(230, 230, 230, 0.2);
  border: none;
  resize: none;
`;
