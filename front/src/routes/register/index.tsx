import { ActionFunctionArgs } from "react-router";
import { apiRegisterUserProfile } from "../../controllers/user";
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
import { redirect, useActionData } from "react-router-dom";
import Age from "./components/Age";

export async function loader() {
  return null;
}

export async function action({ request }: ActionFunctionArgs) {
  const formData = await request.formData();
  const apiResponse = await apiRegisterUserProfile(formData);

  if (apiResponse?.err) return apiResponse?.err;

  return redirect("/");
}

export default function RegisterIndex() {
  const idxMax = 7;
  const error = useActionData() as string | null;
  const [index, setIndex] = useState(0);

  if (error) {
    if (error === "biography") setIndex(3);
    else if (error === "interests") setIndex(4);
    //TODO etc... + find a mean to display error on the ui.
  }

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
      {index == 0 && <Age nextBtn={nextButton} />}
      {index == 1 && <Gender backBtn={backButton} nextBtn={nextButton} />}
      {index == 2 && (
        <SexualPreferences backBtn={backButton} nextBtn={nextButton} />
      )}
      {index == 3 && <Biography backBtn={backButton} nextBtn={nextButton} />}
      {index == 4 && <Interests backBtn={backButton} nextBtn={nextButton} />}
      {index == 5 && <Photos backBtn={backButton} nextBtn={nextButton} />}
      {index == 6 && <Avatar backBtn={backButton} nextBtn={nextButton} />}
      {index == 7 && <Validation backBtn={backButton} />}
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
