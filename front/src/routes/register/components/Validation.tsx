import { ReactElement } from "react";
import { Body } from "../../styles";
import { IUser } from "../../../models/user";
import { IProfile } from "../../../models/profile";
import UserProfileCard from "./UserProfileCard";

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
        {backBtn && backBtn}
      </Body>
    </>
  );
}
