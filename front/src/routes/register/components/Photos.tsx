import { ReactElement } from "react";
import { Body, RegisterForm } from "../../styles";
import { NavBtnContainer } from "../styles";
import styled from "styled-components";

export default function Photos({
  backBtn,
  nextBtn,
  onChange,
  onClick,
  photos,
}: {
  backBtn?: ReactElement;
  nextBtn?: ReactElement;
  onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  onClick: (e: React.MouseEvent<HTMLButtonElement, MouseEvent>) => void;
  photos: Array<{ file: File; url: string }>;
}) {
  return (
    <>
      <Body>
        <h2>Upload 1 to 5 photos of you</h2>
        <PhotosForm onSubmit={(e) => e.preventDefault()}>
          {photos.length > 0 && (
            <PhotoPrez>
              {photos.map((elem, idx) => {
                return (
                  <PhotoPreview key={idx}>
                    <button type="button" onClick={onClick}>
                      X
                    </button>
                    <img src={elem.url}></img>
                  </PhotoPreview>
                );
              })}
            </PhotoPrez>
          )}
          <div>
            <label htmlFor="photos">Upload</label>
            <input
              onChange={onChange}
              id="photos"
              type="file"
              accept="image/png, image/jpeg, image/jpg"
              multiple
            ></input>
          </div>
          <NavBtnContainer>
            <div>{backBtn && backBtn}</div>
            <div>{photos.length > 0 && nextBtn && nextBtn}</div>
          </NavBtnContainer>
        </PhotosForm>
      </Body>
    </>
  );
}

const PhotoPrez = styled.div`
  max-height: 500px;
  overflow: scroll;
  border-radius: 8px;
  box-shadow: 0 15px 30px -10px rgba(0, 0, 0, 0.25);
`;

const PhotoPreview = styled.div`
  position: relative;
  width: fit-content;
  height: fit-content;
  > img {
    width: 100%;
    border-radius: 8px;
  }
  > button {
    position: absolute;
    background-color: rgba(250, 250, 250, 0.7);
    left: 2px;
    top: 2px;
    padding: 4px;
    border: 1px solid black;
    width: 20px;
    height: 20px;
    border-radius: 20px;
  }
  > button:hover {
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
