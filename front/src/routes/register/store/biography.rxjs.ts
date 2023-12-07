import { useEffect, useState } from "react";
import { BehaviorSubject } from "rxjs";

let biography = "";

export const biography$ = new BehaviorSubject(biography);

export const onBiographyKeyUp = (
  e: React.KeyboardEvent<HTMLTextAreaElement>
) => {
  const target = e.currentTarget;
  if (!e.key.match(/^[\w,;:=+/.?!éèê ç"'à-]$|Backspace|Enter/)) {
    e.preventDefault();
    target.value = biography;
    return;
  }
  if (target.value !== biography) {
    biography = target.value;
    biography$.next(biography);
  }
};

export const useBiography = () => {
  const [bio, setBiography] = useState(biography);

  useEffect(() => {
    const sub = biography$.subscribe((newBio) => {
      setBiography(`${newBio}`);
    });
    return () => sub.unsubscribe();
  }, [biography$]);
  return bio;
};
