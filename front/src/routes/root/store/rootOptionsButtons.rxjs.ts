import { useEffect, useState } from "react";
import { BehaviorSubject } from "rxjs";

let openFilters = false;
let openSorting = false;

const openFilters$ = new BehaviorSubject(openFilters);
const openSorting$ = new BehaviorSubject(openSorting);

export const toggleFilterWindow = () => {
  openFilters = !openFilters;

  if (openFilters && openSorting) toggleSortingWindow();

  openFilters$.next(openFilters);
};

export const toggleSortingWindow = () => {
  openSorting = !openSorting;

  if (openFilters && openSorting) toggleFilterWindow();

  openSorting$.next(openSorting);
};

export const resetFineTunings = () => {
  if (openFilters) toggleFilterWindow();
  if (openSorting) toggleSortingWindow();
};

export const useOpenFilter = () => {
  const [isFilterOpen, setFilter] = useState(openFilters);

  useEffect(() => {
    const sub = openFilters$.subscribe((newState) => setFilter(newState));
    return () => sub.unsubscribe();
  }, [openFilters$]);

  return isFilterOpen;
};

export const useOpenSorting = () => {
  const [isSortingOpen, setSorting] = useState(openFilters);

  useEffect(() => {
    const sub = openSorting$.subscribe((newState) => setSorting(newState));
    return () => sub.unsubscribe();
  }, [openSorting$]);

  return isSortingOpen;
};
