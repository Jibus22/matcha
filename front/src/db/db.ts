import Dexie, { IndexableType, Table } from "dexie";

export interface IDbUser {
  id?: IndexableType;
  firstname: string;
  lastname: string;
  email: string;
  password: string;
  username?: string;
  gender?: string;
  sexual_preference?: string;
  biography?: string;
  age?: string;
  fame_rating?: number;
}

export interface IDbPhotos {
  id?: IndexableType;
  user_id: IndexableType;
  photo: File;
  isAvatar: boolean;
}

export interface IDbTagMap {
  id?: IndexableType;
  user_id: IndexableType;
  tag_id: IndexableType;
}

export interface IDbTag {
  id?: IndexableType;
  name: string;
}

export interface IDbSession {
  uid: IndexableType;
  sid: IndexableType;
}

export class MatchaDatabase extends Dexie {
  user!: Table<IDbUser>;
  photos!: Table<IDbPhotos>;
  tagmap!: Table<IDbTagMap>;
  tags!: Table<IDbTag>;
  session!: Table<IDbSession>;

  constructor() {
    super("matchaDatabase");
    this.version(1).stores({
      user: "++id, firstname, lastname, &email, password, &username, gender, sexual_preference, biography, age, fame_rating",
      photos: "++id, user_id, photo, isAvatar",
      tagmap: "++id, user_id, tag_id",
      tags: "++id, &name",
      session: "uid, &sid",
    });
  }
}

export const db = new MatchaDatabase();
