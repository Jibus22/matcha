export interface IUser {
  firstname: string;
  lastname: string;
  email: string;
  password: string;
}

export const create = (user: IUser) => {
  sessionStorage.setItem("user", JSON.stringify(user));
};

export const get = (): IUser | null => {
  const user = sessionStorage.user;
  return user ? JSON.parse(user) : null;
};
