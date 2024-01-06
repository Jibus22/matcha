import { IDbPhotos, IDbTag, IDbTagMap, IDbUser, db } from "../db/db";
import users from "./users.json";
import photos from "./photos.json";
import tags from "./tags.json";
import tagmaps from "./tagmaps.json";

const userModelCreate = async (user: IDbUser) => {
  try {
    const id = await db.user.put(user);
    return id;
  } catch (e) {
    console.log(`userModelCreate error: ${e}`);
    return 0;
  }
};

const photoModelCreate = async (photo: IDbPhotos) => {
  try {
    const id = await db.photos.put(photo);
    return id;
  } catch (e) {
    console.log(`photoModelCreate error: ${e}`);
    return 0;
  }
};

const tagModelCreate = async (tag: IDbTag) => {
  try {
    const id = await db.tags.put(tag);
    return id;
  } catch (e) {
    console.log(`tagModelCreate error: ${e}`);
    return 0;
  }
};

const tagmapModelCreate = async (tagmap: IDbTagMap) => {
  try {
    const id = await db.tagmap.put(tagmap);
    return id;
  } catch (e) {
    console.log(`tagMapModelCreate error: ${e}`);
    return 0;
  }
};

const populateUsers = async () => {
  const cnt = await db.user.count();
  if (cnt < 20)
    await Promise.all(
      users.map((user) => {
        let g: "male" | "female" | null;
        let sp: "homosexual" | "heterosexual" | "bisexual" | null;
        if (
          (user.gender === "male" || user.gender === "female") &&
          (user.sexual_preference == "homosexual" ||
            user.sexual_preference === "heterosexual" ||
            user.sexual_preference === "bisexual")
        ) {
          g = user.gender;
          sp = user.sexual_preference;
          userModelCreate({ ...user, gender: g, sexual_preference: sp });
        }
      })
    );
};

const populatePhotos = async () => {
  const cnt = await db.photos.count();
  if (cnt < 20)
    await Promise.all(
      photos.map((photo) => {
        photoModelCreate(photo);
      })
    );
};

const populateTags = async () => {
  const cnt = await db.tags.count();
  if (cnt < 20)
    await Promise.all(
      tags.map((tag) => {
        tagModelCreate(tag);
      })
    );
};

const populateTagMap = async () => {
  const cnt = await db.tagmap.count();
  if (cnt < 20)
    await Promise.all(
      tagmaps.map((tagmap) => {
        tagmapModelCreate(tagmap);
      })
    );
};

export const indexedDBPopulate = async () => {
  const cnt = await db.user.count();
  if (cnt > 20) return;

  await Promise.all([
    populateUsers(),
    populatePhotos(),
    populateTags(),
    populateTagMap(),
  ]);
};
