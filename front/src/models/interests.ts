import { IndexableType } from "dexie";
import { IDbTag, IDbTagMap, db } from "../db/db";

export const findByUserId = async (uid: IndexableType) => {
  const tagMaps = await db.tagmap.where("user_id").equals(uid).toArray();

  const tags = new Array<string>();

  await Promise.all(
    tagMaps.map(async (tm) => {
      const tag = await db.tags.get(tm.tag_id);
      if (tag) tags.push(tag.name);
    })
  );

  return tags;
};

const createTag = async (name: string) => {
  const id = await db.tags.add({ name });
  return id;
};

const createTagMap = async (tagmap: IDbTagMap) => {
  const id = await db.tagmap.add(tagmap);
  return id;
};

const findTagMap = async (tagmap: IDbTagMap) => {
  const tm = await db.tagmap
    .filter((value) => {
      return value.tag_id === tagmap.tag_id && value.user_id === tagmap.user_id;
    })
    .toArray();
  return tm.length > 0 ? tm[0] : null;
};

export const findByName = async (name: string) => {
  const tag = await db.tags.where("name").equals(name).toArray();
  return tag.length > 0 ? tag[0] : null;
};

/**
 * Create a new tag without duplicate tag or tagmap
 */
export const create = async (interest: IDbTag, uid: IndexableType) => {
  const tag = await findByName(interest.name);
  let id: IndexableType;

  if (!tag || !tag.id) {
    id = await createTag(interest.name);
  } else {
    const tm = await findTagMap({ user_id: uid, tag_id: tag.id });
    if (tm) return null;
    id = tag.id;
  }

  const tm_id = await createTagMap({ user_id: uid, tag_id: id });

  return tm_id;
};

export const createMany = async (uid: IndexableType, interests: IDbTag[]) => {
  const ids = await Promise.all(
    interests.map(async (elem) => {
      await create(elem, uid);
    })
  );
  return ids;
};
