import { ReactElement } from "react";
import { Body, RegisterButton } from "../../styles";
import { IFullUser } from "../../../models/user";
import styled from "styled-components";
import { useSubmit } from "react-router-dom";
import UserProfileCard from "../../../components/UserProfileCard";
import { IDbPhotos } from "../../../db/db";

export default function Validation({
  backBtn,
  age,
  gender,
  sexPreference,
  biography,
  interests,
  photos,
  user,
}: {
  backBtn?: ReactElement;
  age: string;
  gender: "male" | "female";
  sexPreference: Set<string>;
  biography: string;
  interests: Set<string>;
  photos: Omit<IDbPhotos, "id" | "user_id">[];
  user: IFullUser;
}) {
  const submit = useSubmit();
  const sexPref =
    sexPreference.size === 1
      ? [...sexPreference][0] === gender
        ? "homosexual"
        : "heterosexual"
      : "bisexual";
  const sendData = () => {
    let formData = new FormData();
    formData.append("age", age);
    formData.append("gender", gender);
    formData.append("sexual_preference", sexPref);
    formData.append("biography", biography);
    [...interests].forEach((elem) => formData.append("interests", elem));

    const orderedPhotos = [
      photos.find((photo) => photo.isAvatar === true),
      ...photos.filter((photo) => photo.isAvatar === false),
    ];

    orderedPhotos.forEach((elem) => {
      if (elem && elem.photo) formData.append("photos", elem.photo);
    });

    submit(formData, { method: "post", encType: "multipart/form-data" });
  };

  return (
    <>
      <Body>
        <h2>Validation</h2>
        <CardCtnr>
          <UserProfileCard
            user={{
              ...user,
              biography,
              age,
              gender,
              sexual_preference: sexPref,
              interests: [...interests],
              photos: photos,
            }}
          ></UserProfileCard>
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
