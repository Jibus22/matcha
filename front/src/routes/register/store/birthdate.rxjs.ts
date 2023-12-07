import { useEffect, useState } from "react";
import { BehaviorSubject } from "rxjs";

let birthdate = "";

export const birthdate$ = new BehaviorSubject(birthdate);

export const onBirthDateChange = (e: React.ChangeEvent<HTMLInputElement>) => {
  const currentTarget = e.currentTarget;
  birthdate = currentTarget.value;
  birthdate$.next(birthdate);
};

export const useBirthdate = () => {
  const [bd, setBirthdate] = useState(birthdate);

  useEffect(() => {
    const sub = birthdate$.subscribe((newBd) => {
      setBirthdate(`${newBd}`);
    });
    return () => sub.unsubscribe();
  }, [birthdate$]);
  return bd;
};
