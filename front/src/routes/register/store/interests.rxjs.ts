import { useEffect, useState } from "react";
import { BehaviorSubject } from "rxjs";

let interests = new Set<string>();

export const interests$ = new BehaviorSubject(interests);

export const onInterestKeyUp = (e: React.KeyboardEvent<HTMLInputElement>) => {
  e.preventDefault();
  const target = e.currentTarget;
  if (e.key === "Enter" && target && target.validity.valid) {
    const value = target.value;
    interests.add("#" + value);
    target.value = "";
    interests$.next(interests);
  }
};

export const onClickDeleteInterest = (
  e: React.MouseEvent<HTMLButtonElement, MouseEvent>
) => {
  const element = e.currentTarget.nextElementSibling as HTMLElement;
  const value = element.innerText;
  interests.delete(value);
  interests$.next(interests);
};

export const useInterests = () => {
  const [i, setInterests] = useState(interests);

  useEffect(() => {
    const sub = interests$.subscribe((newInterest) =>
      setInterests(new Set(newInterest))
    );
    return () => sub.unsubscribe();
  }, [interests$]);
  return i;
};
