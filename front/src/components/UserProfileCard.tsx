import styled, { css } from "styled-components";
import { useMemo, useState } from "react";
import { IFullUser } from "../models/user";
import { calculateUserAge, isMobileDevice } from "../utils/utils";

export default function UserProfileCard({ user }: { user: IFullUser }) {
  const [index, setIndex] = useState(0);
  const [hover, setHover] = useState(false);
  const [overlay, setOverlay] = useState(false);

  const orderedPhotos = useMemo(() => {
    const profile = user.photos?.find((photo) => photo.isAvatar === true);
    let result = profile ? [profile] : [];

    if (user.photos) {
      result = [
        ...result,
        ...user.photos.filter((ph) => ph.isAvatar === false),
      ];
      result = result.map((photo) => {
        if (!photo.path && photo.photo) {
          photo.path = URL.createObjectURL(photo.photo);
        }
        return photo;
      });
    }
    return result;
  }, [user]);

  const nextPhoto = () => setIndex(index + 1);
  const prevPhoto = () => setIndex(index - 1);
  const toggleOverlay = () => setOverlay(!overlay);

  const buttonLeft = (
    <ButtonLeft type="button" onClick={prevPhoto}>
      L
    </ButtonLeft>
  );
  const buttonRight = (
    <ButtonRight type="button" onClick={nextPhoto}>
      R
    </ButtonRight>
  );

  return (
    <>
      {overlay && (
        <OverLay
          onMouseEnter={() => setHover(true)}
          onMouseLeave={() => setHover(false)}
        >
          <img
            src={orderedPhotos[index]?.path || undefined}
            onClick={toggleOverlay}
          ></img>
          {(hover || isMobileDevice()) && index > 0 && buttonLeft}
          {(hover || isMobileDevice()) &&
            index + 1 < orderedPhotos.length &&
            buttonRight}
        </OverLay>
      )}
      {!overlay && (
        <Card>
          <AvatarCtnr
            onMouseEnter={() => setHover(true)}
            onMouseLeave={() => setHover(false)}
          >
            <img
              src={orderedPhotos[index]?.path || undefined}
              onClick={toggleOverlay}
            ></img>
            {(hover || isMobileDevice()) && index > 0 && buttonLeft}
            {(hover || isMobileDevice()) &&
              index + 1 < orderedPhotos.length &&
              buttonRight}
          </AvatarCtnr>
          <InfosCtnr>
            <Username>{user.username}</Username>
            <Infos>
              <ProfileName>
                {user.firstname} {user.lastname}
              </ProfileName>
              {user.gender?.match(/^male$/) ? (
                <ProfileGender>&#9794;</ProfileGender>
              ) : (
                <ProfileGender>&#9792;</ProfileGender>
              )}
              <ProfileAge>{calculateUserAge(user)}</ProfileAge>
              <ProfileSexPref>{user.sexual_preference}</ProfileSexPref>
            </Infos>
            <DisplayBiography>{user?.biography}</DisplayBiography>
            <DisplayInterests>
              {user.interests?.map((elem, idx) => (
                <span key={idx}>{elem}</span>
              ))}
            </DisplayInterests>
          </InfosCtnr>
        </Card>
      )}
    </>
  );
}

const photoNavBtn = css`
  position: absolute;
  border: none;
  padding: 0.6em;
  width: 2em;
  height: 2em;
  border-radius: 2em;
  top: 45%;
  background-color: rgba(255, 255, 255, 0.8);
  color: rgba(20, 20, 20, 0.8);
  border: 1px solid rgba(20, 20, 20, 0.8);
  cursor: pointer;
`;

const OverLay = styled.div`
  width: 100%;
  height: calc(100vh - 60px);
  background-color: rgba(10, 10, 10, 0.8);
  position: absolute;
  z-index: 1;
  border-radius: 2px;
  top: 0;
  left: 0;

  &:hover {
    cursor: pointer;
  }

  > img {
    object-fit: contain;
    width: 100%;
    height: 100%;
  }

  > button {
    ${photoNavBtn}
  }
`;

const ButtonLeft = styled.button`
  left: 4px;
`;
const ButtonRight = styled.button`
  right: 4px;
`;

const DisplayInterests = styled.div`
  display: flex;
  flex-wrap: wrap;
  line-height: 1;
  font-size: 0.8em;
  justify-content: center;

  > span {
    border-radius: 8px;
    background-color: rgba(250, 30, 150, 0.2);
    border: 1px solid rgba(240, 60, 110, 0.3);
    color: #ff135d;
    padding: 0.2em 0.4em;
    margin: 0.1em 0.1em;
  }
`;

const ProfileName = styled.p`
  text-align: left;
  font-style: italic;
`;
const ProfileGender = styled.p`
  text-align: right;
`;
const ProfileAge = styled.p`
  text-align: left;
`;
const ProfileSexPref = styled.p`
  text-align: right;
`;
const Infos = styled.div`
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 2px;
  line-height: 1;
  font-size: 0.8em;
  align-items: center;
  > p {
    padding: 0.2em 0.4em;
    border-radius: 6px;
    background-color: rgba(240, 240, 240, 0.8);
  }
`;

const Card = styled.div`
  background-color: rgba(230, 230, 230, 0.8);
  border-radius: 8px;
  color: #161a82;
`;

const InfosCtnr = styled.div`
  padding: 1em;
`;

const AvatarCtnr = styled.div`
  position: relative;

  &:hover {
    cursor: pointer;
  }

  > img {
    border-top-left-radius: 8px;
    border-top-right-radius: 8px;
    width: 100%;
    height: 350px;
    object-fit: cover;
  }

  > button {
    ${photoNavBtn}
  }
`;

const Username = styled.p`
  font-weight: 500;
  font-size: calc(0.4vw + 1em);
  margin-bottom: 0.3em;
`;

const DisplayBiography = styled.p`
  margin: 0.8em 0;
  padding: 0.5em 0.5em;
  border-radius: 6px;
  line-height: 1.2;
  font-size: 0.92em;
  background-color: rgba(240, 240, 240, 0.8);
  border: 1px solid rgba(240, 240, 240, 0.4);
  text-align: left;
  word-wrap: break-word;
`;
