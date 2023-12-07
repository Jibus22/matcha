import { useEffect, useState } from "react";
import { BehaviorSubject } from "rxjs";

export type Gender = "male" | "female" | "";

let gender: Gender = "";

export const gender$ = new BehaviorSubject<Gender>(gender);

export const onGenderChange = (e: React.ChangeEvent<HTMLInputElement>) => {
  const value = e.currentTarget.value;
  if (value === "male" || value === "female") {
    gender = value;
    gender$.next(gender);
  }
};

export const useGender = () => {
  const [g, setGender] = useState(gender);

  useEffect(() => {
    const sub = gender$.subscribe((newGender) => setGender(`${newGender}`));
    return () => sub.unsubscribe();
  }, [gender$]);
  return g;
};
