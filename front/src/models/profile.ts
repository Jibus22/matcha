import { Photos, db } from "../db/db";

export interface IProfile {
  username: string;
  age?: string;
  gender?: string;
  sexual_preference?: string;
  biography?: string;
  fame_rating?: number;
  interests?: string[];
  photos?: File[];
}

export const get = async (): Promise<IProfile | null> => {
  const storedProfile = sessionStorage.profile;
  const profile = storedProfile
    ? (JSON.parse(storedProfile) as IProfile)
    : null;
  let queryphotos: Photos[];

  if (!profile) return null;

  if (profile.username) {
    try {
      queryphotos = await db.userPhotos
        .where("username")
        .equals(profile.username)
        .toArray();

      profile.photos = queryphotos[0].photos;
    } catch (e) {
      console.log(`failed to query photos from ${profile.username}`);
    }
  }

  return profile;
};

export const create = (profile: IProfile) => {
  sessionStorage.setItem("profile", JSON.stringify(profile));
};

export const update = async (profile: Partial<IProfile>) => {
  const currentProfile = (await get()) || {};

  // remove photos bc indexedDB handle photos, not sessionstorage
  if ("photos" in currentProfile) delete currentProfile.photos;

  if ("photos" in profile) {
    if (profile.username && profile.photos) {
      // Store photos in indexedDB;
      try {
        console.log(`adding ${profile.username} photos.`);
        console.log(profile.photos);
        await db.userPhotos.add({
          username: profile.username,
          photos: profile.photos,
        });
      } catch (error) {
        console.log(`Failed to add ${profile.username} photos: ${error}`);
      }
    }
    delete profile.photos;
  }

  sessionStorage.setItem(
    "profile",
    JSON.stringify({ ...currentProfile, ...profile })
  );
};
