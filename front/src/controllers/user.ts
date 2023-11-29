import * as User from "../models/user";
import * as Profile from "../models/profile";
import { getCookie, isProfileFull } from "./utils";
import { IndexableType } from "dexie";

export const apiGetUser = async (): Promise<User.IFullUser | null> => {
  const id = getCookie("matcha_uid");
  if (!id) return null;
  const user = await User.findById(parseInt(id));
  return user;
};

export const apiGetUserRegistration = async () => {
  const user = await apiGetUser();
  return user ? { registered: isProfileFull(user) } : null;
};

export const apiRegisterUserProfile = async (
  form: FormData,
  id: IndexableType
) => {
  // For backend, sanitize input but for this static version it doesn't matter.
  const sanitize = true;
  let photos: File[] = [];
  let userProfile: Required<
    Omit<Profile.IProfile, "username" | "fame_rating">
  > = {
    age: "",
    gender: "",
    sexual_preference: "",
    biography: "",
    interests: [],
    photos: [],
  };

  // true sanitation should return which param is wrong to display correct view
  if (!sanitize) return { err: "biography" };
  if (id === -1) return { err: "id not found" };

  for (let [key, value] of form) {
    if (key === "age" && typeof value === "string") userProfile.age = value;
    else if (key === "gender" && typeof value === "string")
      userProfile.gender = value;
    else if (key === "sexual_preference" && typeof value === "string")
      userProfile.sexual_preference = value;
    else if (key === "biography" && typeof value === "string")
      userProfile.biography = value;
    else if (key === "interests" && typeof value === "string")
      userProfile.interests.push(value);
    else if (key === "photos" && typeof value === "object") photos.push(value);
  }

  if (photos.length > 5) photos = photos.slice(0, 5);
  userProfile.photos = photos;

  await User.update(userProfile, id);

  return {};
};
