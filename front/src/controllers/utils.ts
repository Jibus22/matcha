import { IProfile } from "../models/profile";

export const isProfileFull = (profile: IProfile) => {
  return !(
    !profile.username ||
    !profile.age ||
    !profile?.gender ||
    !profile?.sexual_preference ||
    !profile?.biography ||
    !profile?.interests
  );
};
