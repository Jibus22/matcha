import { IndexableType } from "dexie";
import { IDbUser, db } from "../db/db";
import * as Interests from "./interests";
import * as Photos from "./photos";

export interface IFullUser extends IDbUser {
  interests?: string[];
  photos?: File[];
}

export const create = async (user: IDbUser) => {
  const { firstname, lastname, email, password, username } = user;

  const idUser = await db.user.add({
    firstname,
    lastname,
    email,
    password,
    username,
  });

  return idUser;
};

export const update = async (
  newData: Partial<IFullUser>,
  uid: IndexableType
) => {
  const { id, photos, interests, ...rest } = newData;

  const createPhotos = async () => {
    if (!photos) return;
    await Photos.createMany(
      photos.map((photo, idx) => {
        return { user_id: uid, photo: photo, isAvatar: idx == 0 };
      })
    );
  };

  const createInterests = async () => {
    if (!interests) return;
    await Interests.createMany(
      uid,
      interests.map((elem) => {
        return { name: elem };
      })
    );
  };

  await Promise.all([
    db.user.update(uid, rest),
    createPhotos(),
    createInterests(),
  ]);
};

export const findById = async (
  id: IndexableType
): Promise<IFullUser | null> => {
  const user = await db.user.get(id);

  if (!user || !user.id) return null;

  const [interests, photos] = await Promise.all([
    Interests.findByUserId(user.id),
    Photos.findByUserId(user.id),
  ]);

  return { ...user, interests: interests, photos: photos };
};

export const findByUsername = async (
  username: string
): Promise<IFullUser | null> => {
  const user = await db.user.where("username").equals(username).toArray();

  if (!user.length || !user[0].id) return null;

  const [interests, photos] = await Promise.all([
    Interests.findByUserId(user[0].id),
    Photos.findByUserId(user[0].id),
  ]);

  return { ...user[0], interests: interests, photos: photos };
};
