import Dexie, { Table } from "dexie";

export interface Photos {
  id?: number;
  username: string;
  photos: File[];
}

export class DexiePhotos extends Dexie {
  // 'friends' is added by dexie when declaring the stores()
  // We just tell the typing system this is the case
  userPhotos!: Table<Photos>;

  constructor() {
    super("matchaDatabase");
    this.version(1).stores({
      userPhotos: "++id, username, photos", // Primary key and indexed props
    });
  }
}

export const db = new DexiePhotos();
