import { ReactElement, useState } from "react";
import { Body, CustomForm } from "../../styles";
import { IUser } from "../../../models/user";
import { IProfile } from "../../../models/profile";
import UserProfileCard from "./UserProfileCard";
import styled from "styled-components";
import { useSubmit } from "react-router-dom";

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
  gender: string;
  sexPreference: Set<string>;
  biography: string;
  interests: Set<string>;
  photos: Array<{ file: File; url: string; profile?: boolean }>;
  user: IUser & IProfile & { registered: boolean };
}) {
  const submit = useSubmit();
  const sendData = () => {
    let formData = new FormData();
    formData.append("age", age);
    formData.append("gender", gender);
    [...sexPreference].forEach((elem) =>
      formData.append("sexpreference", elem)
    );
    formData.append("biography", biography);
    [...interests].forEach((elem) => formData.append("interests", elem));

    const orderedPhotos = [
      photos.find((photo) => photo.profile === true),
      ...photos.filter((photo) => photo.profile === false),
    ];

    orderedPhotos.forEach((elem) => {
      if (elem) formData.append("photos", elem.file);
    });

    submit(formData, { method: "post", encType: "multipart/form-data" });
  };
  const sexPref =
    sexPreference.size === 1
      ? [...sexPreference][0] === gender
        ? "homosexual"
        : "heterosexual"
      : "bisexual";

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
            }}
            photos={photos}
          ></UserProfileCard>
        </CardCtnr>
        {backBtn && backBtn}
        <button type="button" onClick={sendData}>
          Confirm Registration
        </button>
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
