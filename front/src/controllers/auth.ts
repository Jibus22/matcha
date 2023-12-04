import * as User from "../models/user";
import * as Session from "../models/session";
import { ISigninInput, ISignupInput } from "../routes/auth/utils";
import { getCookie, isProfileFull } from "./utils";

export const apiSignup = import.meta.env.VITE_STATIC_GH_PAGE
  ? async (inputs: ISignupInput) => {
      await User.signUpCreate(inputs);

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

      const user = await User.findByUsername(inputs.username);

      if (!user || !user.id || inputs.password !== user.password)
        return { err: err };

      const session = await Session.create(user.id);

      if (!session) return { err: err };

      document.cookie = `matcha_sid=${session.sid}; SameSite=strict;`;
      document.cookie = `matcha_uid=${session.uid}; SameSite=strict;`;

      return { registered: isProfileFull(user) };
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
      const id = getCookie("matcha_uid");

      if (!id) return null;

      Session.remove(parseInt(id));

      document.cookie = `matcha_sid=; SameSite=strict;`;
      document.cookie = `matcha_uid=; SameSite=strict;`;
    }
  : () => {
      // requete API fetch(POST, "/api/signout", {});
    };
