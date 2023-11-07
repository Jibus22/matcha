import { redirect } from "react-router-dom";
import { apiGetUser } from "../controllers/user";

export const registrationLoader = (reg: RegExp) => {
  return async () => {
    const user = apiGetUser();

    if (!user.registration.match(reg)) return redirect(user.registration);

    return null;
  };
};
