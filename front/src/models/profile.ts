export interface IProfile {
  username: string;
  gender?: string;
  sexual_preference?: string;
  biography?: string;
  fame_rating?: number;
}

export const get = () => {
  const profile = sessionStorage.profile;
  return profile ? JSON.parse(profile) : null;
};

export const create = (profile: IProfile) => {
  sessionStorage.setItem("profile", JSON.stringify(profile));
};
