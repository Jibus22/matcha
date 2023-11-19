import * as User from "../models/user";
import * as Profile from "../models/profile";
import * as Session from "../models/session";
import { ISigninInput, ISignupInput } from "../routes/auth/utils";
import { isProfileFull } from "./utils";

export const apiSignup = import.meta.env.VITE_STATIC_GH_PAGE
  ? (inputs: ISignupInput) => {
      const { firstname, lastname, username, email, password } = inputs;

      User.create({ firstname, lastname, email, password });
      Profile.create({ username });

      return null;
    }
  : (inputs: ISignupInput) => {
      console.log(inputs);
      // TODO envoyer une requête à l'API qui va sanitize de son côté
      // const ret = fetch(POST, "/api/signup", {inputs});
      return null;
    };

export const apiSignin = import.meta.env.VITE_STATIC_GH_PAGE
  ? async (
      inputs: ISigninInput
    ): Promise<{ err?: {}; registered?: boolean }> => {
      const err = {
        username: null,
        password: null,
        err: "authentication error",
      };

      const user = User.get();
      const profile = await Profile.get();

      if (!user || !profile) return { err: err };
      if (
        inputs.username !== profile.username ||
        inputs.password !== user.password
      )
        return { err: err };

      // mimic session cookie from server
      Session.create();

      return { registered: isProfileFull(profile) };
    }
  : (inputs: ISigninInput) => {
      // TODO envoyer une requête à l'API qui va sanitize de son côté
      // const ret = fetch(POST, "/api/signin", {inputs});

      // ! This if statement and its return is only used to shutdown a
      // typescript error in signin.tsx
      if (!inputs)
        return {
          err: {
            username: null,
            password: null,
            err: "authentication error",
          },
        };

      return { registered: true };
    };

export const apiSignout = import.meta.env.VITE_STATIC_GH_PAGE
  ? () => {
      Session.remove();
    }
  : () => {
      // requete API fetch(POST, "/api/signout", {});
    };
