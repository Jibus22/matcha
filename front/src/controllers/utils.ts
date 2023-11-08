import { IProfile } from "../models/profile";

export const isProfileFull = (profile: IProfile) => {
  return !(
    !profile.username ||
    !profile?.gender ||
    !profile?.sexual_preference ||
    !profile?.biography
  );
};
