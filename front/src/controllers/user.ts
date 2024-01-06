import { IDbPhotos } from "../db/db";
import * as User from "../models/user";
import { getCookie, isProfileFull } from "./utils";

export const apiGetMe = async (): Promise<User.IFullUser | null> => {
  const id = getCookie("matcha_uid");
  if (!id) return null;
  const user = await User.findById(parseInt(id));
  return user;
};

export const apiGetUserByUsername = async (
  username: string
): Promise<User.IFullUser | null> => {
  const user = await User.findByUsername(username);
  return user;
};

export const apiGetInterestingUsers = async () => {
  const me = await apiGetMe();

  if (!me) return null;

  const users = await User.findAllInteresting(me);

  return users;
};

export const apiGetUsers = async (): Promise<(User.IFullUser | null)[]> => {
  const users = await User.findAll();
  return users;
};

export const apiGetUserRegistration = async () => {
  const user = await apiGetMe();
  return user ? { registered: isProfileFull(user) } : null;
};

export const apiRegisterUserProfile = async (form: FormData) => {
  // For backend, sanitize input but for this static version it doesn't matter.
  let id: string | number | null = getCookie("matcha_uid");
  if (!id) return { err: "id not found" };
  else id = parseInt(id);

  const sanitize = true;
  let photos: Omit<IDbPhotos, "id" | "user_id">[] = [];
  let userProfile: Partial<
    Pick<
      User.IFullUser,
      | "age"
      | "gender"
      | "sexual_preference"
      | "biography"
      | "interests"
      | "photos"
    >
  > = {};

  // true sanitation should return which param is wrong to display correct view
  if (!sanitize) return { err: "biography" };

  for (let [key, value] of form) {
    if (key === "age" && typeof value === "string") userProfile.age = value;
    else if (
      key === "gender" &&
      typeof value === "string" &&
      (value == "male" || value == "female")
    )
      userProfile.gender = value;
    else if (
      key === "sexual_preference" &&
      typeof value === "string" &&
      (value == "heterosexual" || value == "bisexual" || value == "homosexual")
    )
      userProfile.sexual_preference = value;
    else if (key === "biography" && typeof value === "string")
      userProfile.biography = value;
    else if (key === "interests" && typeof value === "string") {
      if (!userProfile.interests) userProfile.interests = [];
      userProfile.interests.push(value);
    } else if (key === "photos" && typeof value === "object")
      photos.push({ path: null, photo: value, isAvatar: !photos.length });
  }

  if (photos.length > 5) photos = photos.slice(0, 5);
  userProfile.photos = photos;

  if (
    !(
      "age" in userProfile &&
      "gender" in userProfile &&
      "sexual_preference" in userProfile &&
      "biography" in userProfile &&
      "interests" in userProfile &&
      "photos" in userProfile
    )
  )
    return { err: "value missing" };

  await User.update(userProfile, id);

  return {};
};
