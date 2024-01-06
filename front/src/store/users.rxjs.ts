import { useEffect, useState } from "react";
import { IFullUser } from "../models/user";
import { BehaviorSubject } from "rxjs";

let users: IFullUser[] = [];

export const users$ = new BehaviorSubject<IFullUser[]>(users);

export const updateUsers = (newUsers: IFullUser[]) => {
  useEffect(() => {
    users = newUsers;
    users$.next(users);
  }, [users$]);
};

export const useUsers = () => {
  const [allUsers, setAllUsers] = useState(users);

  useEffect(() => {
    const sub = users$.subscribe((newUsers) => {
      setAllUsers([...newUsers]);
    });

    return sub.unsubscribe();
  }, [users$]);

  return allUsers;
};
