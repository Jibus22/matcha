import { ReactElement } from "react";
import { Body, RegisterForm } from "../../styles";
import { NavBtnContainer } from "../styles";
import styled from "styled-components";

export default function Avatar({
  backBtn,
  nextBtn,
  onClick,
  photos,
}: {
  backBtn?: ReactElement;
  nextBtn?: ReactElement;
  onClick: (e: React.MouseEvent<HTMLButtonElement, MouseEvent>) => void;
  photos: Array<{ file: File; url: string; profile?: boolean }>;
}) {
  return (
    <>
      <Body>
        <h2>Select one photo to be your profile picture</h2>
        <PhotosForm onSubmit={(e) => e.preventDefault()}>
          {photos.length > 0 && (
            <PhotoPrez>
              {photos.map((elem, idx) => {
                return (
                  <PhotoPreview
                    key={idx}
                    type="button"
                    $selected={elem.profile === true}
                    onClick={onClick}
                  >
                    <img src={elem.url}></img>
                  </PhotoPreview>
                );
              })}
            </PhotoPrez>
          )}
          <NavBtnContainer>
            <div>{backBtn && backBtn}</div>
            <div>
              {photos.filter((elem) => elem.profile === true).length > 0 &&
                nextBtn &&
                nextBtn}
            </div>
          </NavBtnContainer>
        </PhotosForm>
      </Body>
    </>
  );
}

const PhotoPrez = styled.div`
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 6px;
`;

const PhotoPreview = styled.button<{ $selected?: boolean }>`
  border: none;
  border-radius: 0.5rem;
  background-color: rgba(250, 227, 255, 0.07);
  backdrop-filter: blur(9px);
  box-shadow: 0 15px 30px -10px rgba(0, 0, 0, 0.25);

  > img {
    width: 100%;
    border-radius: 0.5rem;
    box-shadow: ${(p) =>
      p?.$selected ? "0 0 0 3px rgba(30, 230, 30, 0.6)" : "none"};
  }

  &:hover {
    cursor: pointer;
  }
`;

const PhotosForm = styled(RegisterForm)`
  label {
    border-radius: 6px;
    border: 1px solid rgba(98, 91, 102, 0.2);
    padding: 5px 12px;
    font-size: 1em;
    background-color: #ff1a5e;
    color: #dadae5;
    &:hover {
      cursor: pointer;
    }
  }

  > div {
    input[type="file"] {
      display: none;
    }
  }
`;
