import { ActionFunctionArgs } from "react-router";
import { apiGetUser, apiRegisterUserProfile } from "../../controllers/user";
import Gender from "./components/Gender";
import { useState } from "react";
import SexualPreferences from "./components/SexualPreferences";
import { RegisterButton } from "../styles";
import Biography from "./components/Biography";
import styled from "styled-components";
import Interests from "./components/Interests";
import Photos from "./components/Photos";
import Avatar from "./components/Avatar";
import Validation from "./components/Validation";
import { redirect, useActionData, useLoaderData } from "react-router-dom";
import { IUser } from "../../models/user";
import { IProfile } from "../../models/profile";
import Age from "./components/Age";

export async function loader() {
  const user = await apiGetUser();

  console.log(`loader, user: `);
  console.log(user);

  return user;
}

export async function action({ request }: ActionFunctionArgs) {
  const formData = await request.formData();
  console.log("action register index");
  console.log(formData);
  // Requete API pour post/update les données et retour éventuel d'erreurs sinon
  // redirection vers la page suivante.

  const apiResponse = await apiRegisterUserProfile(formData);

  if (apiResponse?.err) return apiResponse?.err;

  return redirect("/");
  // return null;
}

export default function RegisterIndex() {
  const idxMax = 7;
  const error = useActionData() as string | null;
  const user = useLoaderData() as IUser & IProfile & { registered: boolean };
  const [birthdate, setBirthdate] = useState("");
  const [index, setIndex] = useState(0);
  const [gender, setGender] = useState("");
  const [sexPreference, setSexPreference] = useState(new Set<string>());
  const [biography, setBiography] = useState("");
  const [interests, setInterests] = useState(new Set<string>());
  const [photos, setPhotos] = useState(
    new Array<{ file: File; url: string; profile?: boolean }>()
  );

  if (error) {
    if (error === "biography") setIndex(3);
    else if (error === "interests") setIndex(4);
    //TODO etc... + find a mean to display error on the ui.
  }

  const onBirthDateChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const currentTarget = e.currentTarget;

    if (currentTarget.validity.valid) {
      setBirthdate(currentTarget.value);
    } else {
      setBirthdate("");
    }
  };

  const onGenderChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setGender(e.target.value);
  };

  const onSexPreferencesChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.checked)
      setSexPreference((prev) => new Set(prev).add(e.target.value));
    else
      setSexPreference((prev) => {
        const newSet = new Set(prev);
        newSet.delete(e.target.value);
        return newSet;
      });
  };

  const onBiographyKeyUp = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    const target = e.currentTarget;
    if (!e.key.match(/^[\w,;:=+/.?!éèê ç"'à-]$|Backspace|Enter/)) {
      e.preventDefault();
      target.value = biography;
      return;
    }
    if (target.value !== biography) setBiography(target.value);
  };

  const onInterestKeyUp = (e: React.KeyboardEvent<HTMLInputElement>) => {
    e.preventDefault();
    const target = e.currentTarget;
    if (e.key === "Enter" && target && target.validity.valid) {
      const value = target.value;
      setInterests((prev) => {
        return new Set(prev).add("#" + value);
      });
      target.value = "";
    }
  };

  const onClickDeleteInterest = (
    e: React.MouseEvent<HTMLButtonElement, MouseEvent>
  ) => {
    const element = e.currentTarget.nextElementSibling as HTMLElement;
    const value = element.innerText;
    setInterests((prev) => {
      const newSet = new Set(prev);
      newSet.delete(value);
      return newSet;
    });
  };

  const onChangeSetPhoto = (e: React.ChangeEvent<HTMLInputElement>) => {
    const target = e.currentTarget;
    const files = target.files;
    let inputPhotos = new Array<{ file: File; url: string }>();

    if (!files || photos.length == 5) return;

    for (let i = 0; i < files.length && i + 1 + photos.length < 6; i++) {
      const newPhoto = { file: files[i], url: URL.createObjectURL(files[i]) };
      inputPhotos.push(newPhoto);
    }
    setPhotos([...photos, ...inputPhotos]);
  };

  const onClickRemovePhoto = (
    e: React.MouseEvent<HTMLButtonElement, MouseEvent>
  ) => {
    const element = e.currentTarget.nextElementSibling as HTMLElement;
    const src = element.attributes.getNamedItem("src");
    if (!src) return;
    setPhotos(photos.filter((value) => value.url !== src.value));
    URL.revokeObjectURL(src.value);
  };

  const onClickChooseAvatar = (
    e: React.MouseEvent<HTMLButtonElement, MouseEvent>
  ) => {
    const element = e.currentTarget.firstElementChild;
    if (!element) return;

    const src = element.attributes.getNamedItem("src");
    if (!src) return;

    const value = src.value;

    setPhotos(
      photos.map((elem) => {
        const newElem = elem;
        newElem.profile = elem.url === value;
        return newElem;
      })
    );
  };

  const backButton = (
    <RegisterButton type="button" onClick={() => setIndex(index - 1)}>
      Back
    </RegisterButton>
  );

  const nextButton = (
    <RegisterButton type="button" onClick={() => setIndex(index + 1)}>
      Next
    </RegisterButton>
  );

  return (
    <>
      <ProgressBar>
        <progress max="100" value={(index / idxMax) * 100}></progress>
      </ProgressBar>
      {index == 0 && (
        <Age
          nextBtn={nextButton}
          onChange={onBirthDateChange}
          birthdate={birthdate}
        />
      )}
      {index == 1 && (
        <Gender
          backBtn={backButton}
          nextBtn={nextButton}
          onChange={onGenderChange}
          gender={gender}
        />
      )}
      {index == 2 && (
        <SexualPreferences
          backBtn={backButton}
          nextBtn={nextButton}
          onChange={onSexPreferencesChange}
          sexPreference={sexPreference}
        />
      )}
      {index == 3 && (
        <Biography
          backBtn={backButton}
          nextBtn={nextButton}
          onKeyUp={onBiographyKeyUp}
          biography={biography}
        />
      )}
      {index == 4 && (
        <Interests
          backBtn={backButton}
          nextBtn={nextButton}
          onKeyUp={onInterestKeyUp}
          onClick={onClickDeleteInterest}
          interests={interests}
        />
      )}
      {index == 5 && (
        <Photos
          backBtn={backButton}
          nextBtn={nextButton}
          onChange={onChangeSetPhoto}
          onClick={onClickRemovePhoto}
          photos={photos}
        />
      )}
      {index == 6 && (
        <Avatar
          backBtn={backButton}
          nextBtn={nextButton}
          onClick={onClickChooseAvatar}
          photos={photos}
        />
      )}
      {index == 7 && (
        <Validation
          age={birthdate}
          gender={gender}
          sexPreference={sexPreference}
          biography={biography}
          interests={interests}
          photos={photos}
          user={user}
          backBtn={backButton}
        />
      )}
    </>
  );
}

const ProgressBar = styled.div`
  display: flex;
  justify-content: center;

  progress[value] {
    -webkit-appearance: none;
    appearance: none;

    width: 250px;
    height: 20px;
    background-color: rgba(240, 150, 150, 0.15);
    border-radius: 12px;
    border: none;
    box-shadow: 0 2px 5px rgba(0, 0, 0, 0.25) inset;
  }

  progress[value]::-moz-progress-bar {
    background-color: rgb(206, 254, 255);
    background-image: linear-gradient(
      135deg,
      rgba(206, 254, 255, 0.8673670151654411) 0%,
      rgba(116, 255, 159, 1) 100%
    );
    border-radius: 12px;
  }

  progress[value]::-webkit-progress-bar {
    background-color: rgba(240, 150, 150, 0.15);
    border-radius: 12px;
    border: none;
    box-shadow: 0 2px 5px rgba(0, 0, 0, 0.25) inset;
  }

  progress[value]::-webkit-progress-value {
    transition: all 0.2s ease-in-out;
    background-color: rgb(206, 254, 255);
    background-image: linear-gradient(
      135deg,
      rgba(206, 254, 255, 0.8673670151654411) 0%,
      rgba(116, 255, 159, 1) 100%
    );
    border-radius: 12px;
  }
`;
