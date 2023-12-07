import { IndexableType } from "dexie";
import { db } from "../db/db";

export const get = async (id: IndexableType) => {
  const session = await db.session.get(id);
  return session;
};

export const create = async (uid: IndexableType) => {
  const id = await db.session.add({ uid: uid, sid: self.crypto.randomUUID() });
  return await get(id);
};

export const remove = async (id: IndexableType) => {
  db.session.delete(id);
};
