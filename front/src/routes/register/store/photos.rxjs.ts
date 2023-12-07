import { useEffect, useState } from "react";
import { BehaviorSubject } from "rxjs";
import { IDbPhotos } from "../../../db/db";

let photos = new Array<Omit<IDbPhotos, "id" | "user_id">>();

export const photos$ = new BehaviorSubject(photos);

export const onChangeSetPhoto = (e: React.ChangeEvent<HTMLInputElement>) => {
  const target = e.currentTarget;
  const files = target.files;

  if (!files || photos.length == 5) return;

  for (let i = 0; i < files.length && i + 1 + photos.length < 6; i++) {
    const newPhoto = {
      photo: files[i],
      path: URL.createObjectURL(files[i]),
      isAvatar: false,
    };
    photos.push(newPhoto);
  }
  photos$.next(photos);
};

export const onClickRemovePhoto = (
  e: React.MouseEvent<HTMLButtonElement, MouseEvent>
) => {
  const element = e.currentTarget.nextElementSibling as HTMLElement;
  const src = element.attributes.getNamedItem("src");
  if (!src) return;
  photos = photos.filter((value) => value.path !== src.value);
  URL.revokeObjectURL(src.value);
  photos$.next(photos);
};

export const onClickChooseAvatar = (
  e: React.MouseEvent<HTMLButtonElement, MouseEvent>
) => {
  const element = e.currentTarget.firstElementChild;
  if (!element) return;

  const src = element.attributes.getNamedItem("src");
  if (!src) return;

  const value = src.value;

  photos.map((elem) => {
    elem.isAvatar = elem.path === value;
  });

  photos$.next(photos);
};

export const usePhotos = () => {
  const [ph, setPhotos] = useState(photos);

  useEffect(() => {
    const sub = photos$.subscribe((newPh) => setPhotos([...newPh]));
    return () => sub.unsubscribe();
  }, [photos$]);
  return ph;
};
