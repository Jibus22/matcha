import * as User from "../models/user";
import * as Session from "../models/session";
import * as Profile from "../models/profile";
import { isProfileFull } from "./utils";

export const apiGetUser = ():
  | (User.IUser & Profile.IProfile & { registered: boolean })
  | null => {
  const user = User.get();
  const profile = Profile.get();
  const sid = Session.get();

  if (!sid || !user || !profile) return null;

  return { ...user, ...profile, registered: isProfileFull(profile) };
};
