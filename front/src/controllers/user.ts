import * as User from "../models/user";
import * as Session from "../models/session";
import * as Profile from "../models/profile";
import { isProfileFull } from "./utils";

export const apiGetUser = async (): Promise<
  (User.IUser & Profile.IProfile & { registered: boolean }) | null
> => {
  const user = User.get();
  const profile = await Profile.get();
  const sid = Session.get();

  if (!sid || !user || !profile) return null;

  return { ...user, ...profile, registered: isProfileFull(profile) };
};

export const apiRegisterUserProfile = async (form: FormData) => {
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

  for (let [key, value] of form) {
    console.log(`${key} = ${value}`);
    console.log(value);
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

  userProfile.photos = photos;

  await Profile.update(userProfile);

  return {};
};
