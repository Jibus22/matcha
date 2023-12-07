import { IFullUser } from "../models/user";

export const getCookie = (name: string) => {
  const regex = new RegExp(`${name}=([\\w-]+)`);
  const value = document.cookie.match(regex);

  if (!value || value.length < 2) return null;

  return value[1];
};

export const isProfileFull = (profile: IFullUser) => {
  return !(
    !profile.username ||
    !profile.age ||
    !profile.gender ||
    !profile.sexual_preference ||
    !profile.biography ||
    !profile.interests ||
    !profile.interests.length ||
    !profile.photos ||
    !profile.photos.length
  );
};
