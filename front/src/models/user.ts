import { IndexableType } from "dexie";
import { IDbPhotos, IDbUser, db } from "../db/db";
import * as Interests from "./interests";
import * as Photos from "./photos";
import { calculateUserAge } from "../utils/utils";

export interface IFullUser extends IDbUser {
  interests?: string[];
  photos?: Omit<IDbPhotos, "id" | "user_id">[];
}

export class FullUser implements IFullUser {
  firstname = "";
  lastname = "";
  email = "";
  password = "";
  username = "";
  gender = "" as "" | "female" | "male";
  sexual_preference = "" as "" | "homosexual" | "heterosexual" | "bisexual";
  biography = "";
  age = "";
  fame_rating = 5;
  interests = [];
  photos = [];
}

export const signUpCreate = async (
  user: Pick<
    IDbUser,
    "firstname" | "lastname" | "email" | "password" | "username"
  >
) => {
  const { firstname, lastname, email, password, username } = user;

  const idUser = await db.user.add({
    firstname,
    lastname,
    email,
    password,
    username,
    gender: "",
    sexual_preference: "",
    biography: "",
    age: "",
    fame_rating: 5,
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
      photos.map((photo) => {
        return {
          user_id: uid,
          photo: photo.photo,
          isAvatar: photo.isAvatar,
          path: photo.path,
        };
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

const userJoinTables = async (user: IDbUser) => {
  if (!user || !user.id) return null;

  const [interests, photos] = await Promise.all([
    Interests.findByUserId(user.id),
    Photos.findByUserId(user.id),
  ]);

  return {
    ...user,
    interests: interests,
    photos: photos.map((elem, idx) => {
      if (idx === 0) elem.isAvatar = true;
      else elem.isAvatar = false;
      return elem;
    }),
  };
};

export const findByUsername = async (
  username: string
): Promise<IFullUser | null> => {
  const user = await db.user.where("username").equals(username).toArray();

  const fullUser = await userJoinTables((user && user[0]) || null);
  return fullUser;
};

const getCompleteUser = async (
  users: IFullUser[]
): Promise<(IFullUser | null)[]> => {
  const completedUsers = await Promise.all(
    users.map(async (user) => {
      const fullUser = await userJoinTables((user && user) || null);
      if (!fullUser) return null;
      const { id, ...rest } = fullUser;
      return rest;
    })
  );
  return completedUsers;
};

export const findAll = async () => {
  const users = await db.user.toArray();
  const completedUsers = await getCompleteUser(users);

  return completedUsers.filter((user) => user !== null);
};

const getUserGenderPreference = (user: IFullUser) => {
  return ["female", "male"].filter(
    (elem) =>
      user.sexual_preference === "bisexual" ||
      (user.sexual_preference === "homosexual" && elem === user.gender) ||
      (user.sexual_preference === "heterosexual" && elem !== user.gender)
  );
};

export const findAllInteresting = async (me: IFullUser) => {
  const myAge = calculateUserAge(me);
  const myGenderPref = getUserGenderPreference(me);

  const users = await db.user
    .where("username")
    .notEqual(me.username)
    .filter((user) => {
      const diff = calculateUserAge(user) - myAge;
      const userGenderPref = getUserGenderPreference(user);

      return (
        Math.abs(diff) <= 5 &&
        myGenderPref.includes(user.gender) &&
        userGenderPref.includes(me.gender)
      );
    })
    .toArray();

  const completedUsers = await getCompleteUser(users);
  const filteredUsers = completedUsers
    .filter((user) => user !== null)
    .map((user) => {
      if (!user) return null;
      const { firstname, lastname, email, password, biography, ...rest } = user;
      return rest;
    });

  return filteredUsers;
};
