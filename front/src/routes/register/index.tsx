import { ActionFunctionArgs } from "react-router";
import { apiGetUser } from "../../controllers/user";
import Gender from "./components/Gender";
import { useState } from "react";
import SexualPreferences from "./components/SexualPreferences";
import { Button } from "../styles";
import Biography from "./components/Biography";
import styled from "styled-components";
import Interests from "./components/Interests";
import Photos from "./components/Photos";
import Avatar from "./components/Avatar";

export async function loader() {
  const user = apiGetUser();

  // Choper le profile pour savoir ce qu'il manque / quel form à afficher

  console.log(`loader, user: ${user}`);

  return null;
}

export async function action({ request }: ActionFunctionArgs) {
  const formData = await request.formData();
  const inputs = Object.fromEntries(formData);
  console.log(inputs);
  // Requete API pour post/update les données et retour éventuel d'erreurs sinon
  // redirection vers la page suivante.
  return null;
}

export default function RegisterIndex() {
  const idxMax = 6;
  const [index, setIndex] = useState(0);
  const [gender, setGender] = useState("");
  const [sexPreference, setSexPreference] = useState(new Set<string>());
  const [biography, setBiography] = useState("");
  const [interests, setInterests] = useState(new Set<string>());
  const [photos, setPhotos] = useState(
    new Array<{ file: File; url: string; profile?: boolean }>()
  );

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
        <Gender
          nextBtn={nextButton}
          onChange={onGenderChange}
          gender={gender}
        />
      )}
      {index == 1 && (
        <SexualPreferences
          backBtn={backButton}
          nextBtn={nextButton}
          onChange={onSexPreferencesChange}
          sexPreference={sexPreference}
        />
      )}
      {index == 2 && (
        <Biography
          backBtn={backButton}
          nextBtn={nextButton}
          onChange={(e) => setBiography(e.target.value)}
          biography={biography}
        />
      )}
      {index == 3 && (
        <Interests
          backBtn={backButton}
          nextBtn={nextButton}
          onKeyUp={onInterestKeyUp}
          onClick={onClickDeleteInterest}
          interests={interests}
        />
      )}
      {index == 4 && (
        <Photos
          backBtn={backButton}
          nextBtn={nextButton}
          onChange={onChangeSetPhoto}
          onClick={onClickRemovePhoto}
          photos={photos}
        />
      )}
      {index == 5 && (
        <Avatar
          backBtn={backButton}
          nextBtn={nextButton}
          onClick={onClickChooseAvatar}
          photos={photos}
        />
      )}
    </>
  );
}

const RegisterButton = styled(Button)`
  margin: 2px 42px;
`;

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
