import { useEffect, useState } from "react";
import { BehaviorSubject } from "rxjs";

let sortOption = "none";

export const sortOption$ = new BehaviorSubject(sortOption);

export const updateSortOption = (e: React.ChangeEvent<HTMLInputElement>) => {
  sortOption = e.currentTarget.value;
  sortOption$.next(sortOption);
};

export const useSortOption = () => {
  const [sortOpt, setSortOpt] = useState(sortOption);

  useEffect(() => {
    const sub = sortOption$.subscribe((newState) => setSortOpt(newState));
    return () => sub.unsubscribe();
  }, [sortOption$]);

  return sortOpt;
};
