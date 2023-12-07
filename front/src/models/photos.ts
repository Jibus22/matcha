import { IndexableType } from "dexie";
import { IDbPhotos, db } from "../db/db";

export const findByUserId = async (id: IndexableType) => {
  const photos = await db.photos.where("user_id").equals(id).toArray();

  return photos.map((ph) => {
    return { path: ph.path, photo: ph.photo, isAvatar: ph.isAvatar };
  });
};

export const create = async (photo: IDbPhotos) => {
  const id = await db.photos.add(photo);
  return id;
};

export const createMany = async (photos: IDbPhotos[]) => {
  await Promise.all(
    photos.map(async (photo) => {
      await create(photo);
    })
  );
};
