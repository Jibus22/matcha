import { useEffect, useState } from "react";
import { IFullUser } from "../models/user";
import { BehaviorSubject } from "rxjs";
import { sortOption$ } from "../routes/root/store/sortOptions.rxjs";
import { calculateUserAge } from "../utils/utils";
import { getUser } from "./user.rxjs";

let users: IFullUser[] = [];

let usersSave: IFullUser[] = [];

export const users$ = new BehaviorSubject<IFullUser[]>(users);

export const updateUsers = (newUsers: IFullUser[]) => {
  useEffect(() => {
    users = newUsers;
    users$.next(users);
  }, [users$]);
};

const getIntersection = (arr1: any[] | undefined, arr2: any[] | undefined) => {
  return arr1?.filter((elem1) => arr2?.find((elem2) => elem2 === elem1));
};

sortOption$.subscribe((newVal) => {
  if (newVal === "age") {
    if (!usersSave.length) usersSave = [...users]; // maybe tenter un subscribe + save + unsubscribe;
    users.sort((a, b) => calculateUserAge(b) - calculateUserAge(a));
    users$.next(users);
  } else if (newVal === "tags") {
    if (!usersSave.length) usersSave = [...users];
    const me = getUser();
    users.sort((a, b) => {
      const intersectionA =
        getIntersection(a.interests, me.interests)?.length || 0;
      const intersectionB =
        getIntersection(b.interests, me.interests)?.length || 0;
      return intersectionB - intersectionA;
    });
    users$.next(users);
  } else if (newVal === "none") {
    users = [...usersSave];
    users$.next(users);
  }
});

export const useUsers = () => {
  const [allUsers, setAllUsers] = useState(users);

  useEffect(() => {
    const sub = users$.subscribe((newUsers) => {
      setAllUsers([...newUsers]);
    });

    return () => sub.unsubscribe();
  }, [users$]);

  return allUsers;
};
