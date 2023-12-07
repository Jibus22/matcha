import { ReactElement } from "react";
import { Body, RegisterButton } from "../../styles";
import styled from "styled-components";
import { useSubmit } from "react-router-dom";
import UserProfileCard from "../../../components/UserProfileCard";
import { getUser } from "../../../store/user.rxjs";

export default function Validation({ backBtn }: { backBtn?: ReactElement }) {
  const submit = useSubmit();
  const user = getUser();
  const sendData = () => {
    let formData = new FormData();
    formData.append("age", user.age);
    formData.append("gender", user.gender);
    formData.append("sexual_preference", user.sexual_preference);
    formData.append("biography", user.biography);
    [...user.interests].forEach((elem) => formData.append("interests", elem));
    user.photos.forEach((elem) => {
      if (elem && elem.photo) formData.append("photos", elem.photo);
    });

    submit(formData, { method: "post", encType: "multipart/form-data" });
  };

  return (
    <>
      <Body>
        <h2>Validation</h2>
        <CardCtnr>
          <UserProfileCard user={user}></UserProfileCard>
        </CardCtnr>
        {backBtn && backBtn}
        <RegisterButton type="button" onClick={sendData}>
          Confirm Registration
        </RegisterButton>
      </Body>
    </>
  );
}

const CardCtnr = styled.div`
  margin: 1em;
  box-shadow: 0 15px 30px -10px rgba(0, 0, 0, 0.25);
  margin-inline-start: auto;
  margin-inline-end: auto;
  max-width: 550px;
`;
